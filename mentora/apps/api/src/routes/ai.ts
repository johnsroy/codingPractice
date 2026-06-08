/**
 * AI routes — dispatch LLM tasks and Server-Sent Events (SSE) tutor stream.
 *   POST /ai              — invoke any AI task (aiRequestSchema)
 *   POST /ai/research     — agentic web-research → ResearchBriefing (researchRequestSchema)
 *   GET  /ai/tutor/stream — SSE stream for real-time tutor chat
 */

import { Router, Request, Response } from 'express';
import { aiRequestSchema, researchRequestSchema } from '@mentora/shared';
import { prisma } from '../lib/prisma';
import { badRequest, notFound } from '../lib/errors';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import { getLlmAdapter } from '../adapters/llm';
import type { TutorMessage } from '../adapters/llm';

export const aiRouter = Router();

// POST /ai — dispatch any AI task
aiRouter.post(
  '/',
  authenticate,
  validate(aiRequestSchema),
  asyncHandler(async (req, res) => {
    const { task, materialId, prompt, gradeId, subjectId, context, numQuestions, topic } =
      req.body as {
        task: string;
        materialId?: string;
        prompt?: string;
        gradeId?: string;
        subjectId?: string;
        context?: string;
        numQuestions?: number;
        topic?: string;
      };

    const llm = getLlmAdapter();

    // Helper to fetch material text (for summarize_material / explain_simply)
    async function getMaterialText(): Promise<string> {
      if (!materialId) throw badRequest('materialId is required for this task.');
      const material = await prisma.material.findUnique({ where: { id: materialId } });
      if (!material) throw notFound('Material');
      if (!material.extractedText) {
        throw badRequest(
          'This material has not been processed yet. Please wait for OCR to complete.',
        );
      }
      return material.extractedText;
    }

    switch (task) {
      case 'summarize_material': {
        const text = context ?? (await getMaterialText());
        const summary = await llm.summarize(text, { gradeId, maxSentences: 6 });
        return res.json({ task, result: summary });
      }

      case 'generate_quiz': {
        const text = context ?? (materialId ? await getMaterialText() : prompt ?? '');
        if (!text) throw badRequest('Provide a materialId, context, or prompt for quiz generation.');
        const questions = await llm.generateQuiz({
          text,
          numQuestions: numQuestions ?? 5,
          gradeId,
          subjectId,
        });
        return res.json({ task, result: questions });
      }

      case 'explain_simply': {
        const text = context ?? (materialId ? await getMaterialText() : prompt);
        if (!text) throw badRequest('Provide text via context, materialId, or prompt.');
        const explanation = await llm.explainSimply(text, gradeId);
        return res.json({ task, result: explanation });
      }

      case 'lesson_plan': {
        if (!subjectId || !gradeId) {
          throw badRequest('subjectId and gradeId are required for lesson plan generation.');
        }
        const topic = prompt ?? context ?? 'General introduction';
        const plan = await llm.lessonPlan({
          subject: subjectId,
          gradeId,
          topic,
          durationMinutes: 60,
        });
        return res.json({ task, result: plan });
      }

      case 'tutor_chat': {
        if (!prompt) throw badRequest('A prompt (message) is required for tutor chat.');
        const messages: TutorMessage[] = [{ role: 'user', content: prompt }];
        const reply = await llm.tutorReply(messages);
        return res.json({ task, result: reply });
      }

      case 'grade_answer': {
        // Expect: prompt = student's answer, context = question, subjectId = expected answer
        if (!prompt || !context) {
          throw badRequest('Provide context (question+expected) and prompt (student answer).');
        }
        const graded = await llm.gradeAnswer({
          question: context,
          expected: subjectId ?? '',
          studentAnswer: prompt,
          gradeId,
        });
        return res.json({ task, result: graded });
      }

      case 'research_topic': {
        const researchTopic = topic ?? prompt;
        if (!researchTopic) {
          throw badRequest('A topic is required for the research_topic task. Provide it via the "topic" or "prompt" field.');
        }
        const briefing = await llm.researchTopic({
          topic: researchTopic,
          gradeId,
          subjectId,
        });
        return res.json({ task, result: briefing });
      }

      default:
        throw badRequest(`Unknown AI task: ${task}`);
    }
  }),
);

// POST /ai/research — dedicated agentic web-research endpoint
// Body: researchRequestSchema { topic, gradeId?, subjectId? }
// Returns: ResearchBriefing directly (not wrapped in { task, result })
aiRouter.post(
  '/research',
  authenticate,
  validate(researchRequestSchema),
  asyncHandler(async (req, res) => {
    const { topic, gradeId, subjectId } = req.body as {
      topic: string;
      gradeId?: string;
      subjectId?: string;
    };

    const llm = getLlmAdapter();
    const briefing = await llm.researchTopic({ topic, gradeId, subjectId });
    return res.json(briefing);
  }),
);

// GET /ai/tutor/stream — Server-Sent Events streaming tutor reply
// Query params: ?message=<url-encoded user message>
// OR body can carry a JSON array of messages (for multi-turn).
aiRouter.get(
  '/tutor/stream',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
    res.flushHeaders();

    const userMessage = req.query['message'] as string | undefined;
    if (!userMessage) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'message query param is required' })}\n\n`);
      res.end();
      return;
    }

    const messages: TutorMessage[] = [{ role: 'user', content: userMessage }];
    const llm = getLlmAdapter();

    try {
      for await (const chunk of llm.streamTutorReply(messages)) {
        // SSE data must be a single line; escape newlines
        const safe = JSON.stringify(chunk);
        res.write(`data: ${safe}\n\n`);
        // Flush to client immediately (works with res.flush if compression is applied)
        if (typeof (res as unknown as { flush?: () => void }).flush === 'function') {
          (res as unknown as { flush: () => void }).flush();
        }
      }
      // Signal stream end
      res.write('event: done\ndata: {}\n\n');
    } catch (err) {
      console.error('[ai] stream error:', err);
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'AI service error' })}\n\n`);
    } finally {
      res.end();
    }
  },
);

// POST /ai/tutor/stream — multi-turn SSE (body: { messages: TutorMessage[] })
aiRouter.post(
  '/tutor/stream',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const { messages } = req.body as { messages?: TutorMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'messages array is required' })}\n\n`);
      res.end();
      return;
    }

    const llm = getLlmAdapter();

    try {
      for await (const chunk of llm.streamTutorReply(messages)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        if (typeof (res as unknown as { flush?: () => void }).flush === 'function') {
          (res as unknown as { flush: () => void }).flush();
        }
      }
      res.write('event: done\ndata: {}\n\n');
    } catch (err) {
      console.error('[ai] stream error:', err);
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'AI service error' })}\n\n`);
    } finally {
      res.end();
    }
  },
);
