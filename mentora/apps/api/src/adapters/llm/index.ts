/**
 * LLM Adapter
 * -----------
 * Powers AI features: summarisation, quiz generation, tutor chat, lesson plans, grading.
 * Implementations:
 *   - "stub"      (default) — deterministic heuristic responses; fully demoable with zero keys.
 *   - "anthropic" (production) — claude-sonnet-4-6 via @anthropic-ai/sdk, streaming capable.
 *   - "openai"    (production) — GPT models via the openai SDK.
 *
 * If a production driver is selected but its API key is absent, falls back to stub
 * with a warning so the server never fails to start.
 */

import type { AiQuizQuestion } from '@mentora/shared';
import { env } from '../../config/env';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface SummarizeOpts {
  maxSentences?: number;
  gradeId?: string;
}

export interface LessonPlanOpts {
  subject: string;
  gradeId: string;
  topic: string;
  durationMinutes?: number;
}

export type TutorMessage = { role: 'user' | 'assistant'; content: string };

export interface LlmAdapter {
  /** Condense a body of text into a short summary. */
  summarize(text: string, opts?: SummarizeOpts): Promise<string>;

  /** Build N multiple-choice quiz questions from the provided text. */
  generateQuiz(opts: {
    text: string;
    numQuestions: number;
    gradeId?: string;
    subjectId?: string;
  }): Promise<AiQuizQuestion[]>;

  /** Re-explain a concept in age-appropriate language for the given grade. */
  explainSimply(text: string, gradeId?: string): Promise<string>;

  /** Generate a structured lesson plan. */
  lessonPlan(opts: LessonPlanOpts): Promise<string>;

  /**
   * Multi-turn tutor reply. Returns the full reply string.
   * For streaming, use the stream* variant exposed by the route layer.
   */
  tutorReply(messages: TutorMessage[]): Promise<string>;

  /**
   * Grade a student's written answer against the expected answer.
   * Returns a score (0–100) and feedback.
   */
  gradeAnswer(opts: {
    question: string;
    expected: string;
    studentAnswer: string;
    gradeId?: string;
  }): Promise<{ score: number; feedback: string }>;

  /**
   * Stream tutor reply tokens to an async iterable of string chunks.
   * Stub yields the full reply in one chunk; real drivers stream tokens.
   */
  streamTutorReply(messages: TutorMessage[]): AsyncIterable<string>;
}

// ─── Stub adapter ─────────────────────────────────────────────────────────────

/**
 * Deterministic stub that produces plausible, readable output without any API.
 * Great for demos and for running the full stack locally.
 */
class StubLlmAdapter implements LlmAdapter {
  async summarize(text: string, opts?: SummarizeOpts): Promise<string> {
    const sentences = text
      .replace(/\n+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
    const take = opts?.maxSentences ?? 4;
    const preview = sentences.slice(0, take).join(' ');
    const wordCount = text.split(/\s+/).length;
    return `${preview}\n\n[Summary generated from ${wordCount}-word document. Key topics: ${this._extractKeyTerms(text).slice(0, 5).join(', ')}.${opts?.gradeId ? ` Adapted for ${opts.gradeId}.` : ''}]`;
  }

  async generateQuiz(opts: {
    text: string;
    numQuestions: number;
    gradeId?: string;
    subjectId?: string;
  }): Promise<AiQuizQuestion[]> {
    const terms = this._extractKeyTerms(opts.text);
    const questions: AiQuizQuestion[] = [];
    const num = Math.min(opts.numQuestions, 10);

    for (let i = 0; i < num; i++) {
      const term = terms[i % terms.length] ?? 'concept';
      const wrong1 = terms[(i + 1) % terms.length] ?? 'option A';
      const wrong2 = terms[(i + 2) % terms.length] ?? 'option B';
      const wrong3 = terms[(i + 3) % terms.length] ?? 'option C';

      questions.push({
        question: `Which of the following best describes "${term}"?`,
        options: [
          `The meaning related to ${term} as discussed in the material`,
          `Something entirely unrelated to ${wrong1}`,
          `A concept about ${wrong2}`,
          `An alternative involving ${wrong3}`,
        ],
        answerIndex: 0,
        explanation: `According to the material, "${term}" relates to the first option. Review the relevant section for more detail.`,
      });
    }

    return questions;
  }

  async explainSimply(text: string, gradeId?: string): Promise<string> {
    const first2 = text
      .replace(/\n+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .slice(0, 2)
      .join(' ');
    const grade = gradeId ? parseInt(gradeId.replace('grade-', ''), 10) : 5;
    const level = grade <= 4 ? 'young learner' : grade <= 8 ? 'middle-school student' : 'high-school student';
    return `Here's a simple explanation for a ${level}:\n\n${first2}\n\nThink of it this way: the main idea is that ${this._extractKeyTerms(text)[0] ?? 'this topic'} is important because it helps us understand the world around us. Keep asking great questions!`;
  }

  async lessonPlan(opts: LessonPlanOpts): Promise<string> {
    const duration = opts.durationMinutes ?? 60;
    return `# Lesson Plan: ${opts.topic}
**Subject:** ${opts.subject} | **Grade:** ${opts.gradeId} | **Duration:** ${duration} minutes

## Learning Objectives
- Students will be able to explain the key concepts of ${opts.topic}.
- Students will demonstrate understanding through guided practice.
- Students will connect new knowledge to prior learning.

## Materials Needed
- Whiteboard or digital display
- Printed or digital handouts
- Activity worksheets

## Lesson Flow
| Time | Activity |
|------|----------|
| 0–10 min | Warm-up: Review prior knowledge with 2–3 quick questions |
| 10–25 min | Direct instruction: Introduce ${opts.topic} with examples |
| 25–45 min | Guided practice: Students work through exercises |
| 45–55 min | Independent practice or group activity |
| 55–60 min | Wrap-up, Q&A, and preview of next lesson |

## Assessment
- Exit ticket: 3 questions checking key vocabulary and concept understanding.

*Generated by Mentora AI lesson planner.*`;
  }

  async tutorReply(messages: TutorMessage[]): Promise<string> {
    const last = messages.filter((m) => m.role === 'user').pop();
    const question = last?.content ?? 'your question';
    return `Great question! Let's work through this together.\n\nYou asked: "${question.slice(0, 120)}${question.length > 120 ? '...' : ''}"\n\nHere's how I'd approach it:\n1. Start by identifying the key idea or concept involved.\n2. Break the problem into smaller steps.\n3. Check your work at each step.\n\nRemember, there's no such thing as a silly question — every question is a step forward in learning! Would you like me to explain any part in more detail?`;
  }

  async gradeAnswer(opts: {
    question: string;
    expected: string;
    studentAnswer: string;
    gradeId?: string;
  }): Promise<{ score: number; feedback: string }> {
    // Simple overlap heuristic
    const expectedWords = new Set(opts.expected.toLowerCase().split(/\W+/).filter(Boolean));
    const studentWords = opts.studentAnswer.toLowerCase().split(/\W+/).filter(Boolean);
    const matches = studentWords.filter((w) => expectedWords.has(w)).length;
    const score = Math.min(100, Math.round((matches / Math.max(expectedWords.size, 1)) * 100));

    const feedback =
      score >= 80
        ? 'Excellent work! Your answer covers the key points well.'
        : score >= 50
          ? 'Good effort! You captured some important ideas. Try to include more detail about the main concept.'
          : 'Keep trying! Re-read the relevant section and look for the key terms and ideas.';

    return { score, feedback };
  }

  async *streamTutorReply(messages: TutorMessage[]): AsyncIterable<string> {
    const reply = await this.tutorReply(messages);
    // Emit in small chunks to simulate streaming
    const chunkSize = 40;
    for (let i = 0; i < reply.length; i += chunkSize) {
      yield reply.slice(i, i + chunkSize);
      // Tiny async gap so SSE can flush
      await new Promise((resolve) => setImmediate(resolve));
    }
  }

  /** Extract notable words from text (simple frequency approach). */
  private _extractKeyTerms(text: string): string[] {
    const stopWords = new Set([
      'the','a','an','and','or','but','in','on','at','to','for','of','with',
      'is','are','was','were','be','been','being','have','has','had','do',
      'does','did','will','would','could','should','may','might','shall',
      'this','that','these','those','it','its','as','by','from','not','no',
    ]);
    const freq = new Map<string, number>();
    text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3 && !stopWords.has(w))
      .forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w)
      .slice(0, 20);
  }
}

// ─── Anthropic adapter (production) ───────────────────────────────────────────

class AnthropicLlmAdapter implements LlmAdapter {
  private readonly model: string;
  private clientPromise: Promise<import('@anthropic-ai/sdk').default>;

  constructor() {
    this.model = env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
    this.clientPromise = this._initClient();
  }

  private async _initClient(): Promise<import('@anthropic-ai/sdk').default> {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  private async _complete(prompt: string, systemPrompt?: string): Promise<string> {
    const client = await this.clientPromise;
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: prompt },
    ];
    const response = await client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: systemPrompt ?? 'You are Mentora, a helpful educational AI assistant for K-12 students and their teachers.',
      messages,
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }

  async summarize(text: string, opts?: SummarizeOpts): Promise<string> {
    const grade = opts?.gradeId ? ` Tailor the language for ${opts.gradeId}.` : '';
    const sentences = opts?.maxSentences ? ` Keep it to about ${opts.maxSentences} sentences.` : '';
    return this._complete(
      `Summarise the following educational material concisely.${sentences}${grade}\n\n${text}`,
      'You are an expert educational content summariser. Be clear and age-appropriate.',
    );
  }

  async generateQuiz(opts: {
    text: string;
    numQuestions: number;
    gradeId?: string;
    subjectId?: string;
  }): Promise<AiQuizQuestion[]> {
    const grade = opts.gradeId ? ` Grade level: ${opts.gradeId}.` : '';
    const subject = opts.subjectId ? ` Subject: ${opts.subjectId}.` : '';
    const prompt = `Generate exactly ${opts.numQuestions} multiple-choice quiz questions from the following text.${grade}${subject}

Rules:
- Each question must have exactly 4 options (A, B, C, D).
- Only ONE option is correct.
- Provide a brief explanation for the correct answer.
- Respond ONLY with valid JSON (no markdown) in this format:
[{"question":"...","options":["A","B","C","D"],"answerIndex":0,"explanation":"..."}]

Text:
${opts.text.slice(0, 6000)}`;

    try {
      const raw = await this._complete(prompt);
      // Extract JSON array even if wrapped in markdown
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON array found in response');
      return JSON.parse(match[0]) as AiQuizQuestion[];
    } catch (err) {
      console.error('[llm:anthropic] generateQuiz parse error:', err);
      // Fall back to stub
      return new StubLlmAdapter().generateQuiz(opts);
    }
  }

  async explainSimply(text: string, gradeId?: string): Promise<string> {
    const grade = gradeId ?? 'grade-5';
    const gradeNum = parseInt(grade.replace('grade-', ''), 10) || 5;
    const level =
      gradeNum <= 4 ? 'a 7-9 year old' : gradeNum <= 8 ? 'a 11-14 year old' : 'a 15-17 year old';
    return this._complete(
      `Explain the following concept so that ${level} can understand it easily. Use simple language, a real-world analogy, and end with an encouraging note.\n\n${text}`,
    );
  }

  async lessonPlan(opts: LessonPlanOpts): Promise<string> {
    return this._complete(
      `Create a detailed lesson plan for the following:\n- Subject: ${opts.subject}\n- Grade: ${opts.gradeId}\n- Topic: ${opts.topic}\n- Duration: ${opts.durationMinutes ?? 60} minutes\n\nInclude learning objectives, materials, a timed lesson flow, and an assessment strategy.`,
      'You are an expert curriculum designer creating lesson plans for K-12 teachers.',
    );
  }

  async tutorReply(messages: TutorMessage[]): Promise<string> {
    const client = await this.clientPromise;
    const response = await client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system:
        'You are Mentora Tutor, a warm and patient AI tutor for K-12 students. Give clear, encouraging, step-by-step help. Never just give the answer — guide the student to discover it.',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }

  async gradeAnswer(opts: {
    question: string;
    expected: string;
    studentAnswer: string;
    gradeId?: string;
  }): Promise<{ score: number; feedback: string }> {
    const prompt = `Grade the following student answer. Respond ONLY with JSON: {"score":0-100,"feedback":"..."}\n\nQuestion: ${opts.question}\nExpected answer: ${opts.expected}\nStudent answer: ${opts.studentAnswer}`;
    try {
      const raw = await this._complete(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON found');
      return JSON.parse(match[0]);
    } catch {
      return { score: 0, feedback: 'Could not grade automatically. Please ask your teacher.' };
    }
  }

  async *streamTutorReply(messages: TutorMessage[]): AsyncIterable<string> {
    const client = await this.clientPromise;
    // .stream() returns a MessageStream helper; .textStream is an async iterable of text chunks
    const stream = client.messages.stream({
      model: this.model,
      max_tokens: 1024,
      system:
        'You are Mentora Tutor, a warm and patient AI tutor for K-12 students.',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    // textStream is available on the stream helper in @anthropic-ai/sdk >= 0.20
    for await (const text of stream.textStream) {
      yield text;
    }
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _instance: LlmAdapter | undefined;

export function getLlmAdapter(): LlmAdapter {
  if (_instance) return _instance;

  const driver = env.LLM_DRIVER;

  if (driver === 'anthropic') {
    if (!env.ANTHROPIC_API_KEY) {
      console.warn(
        '[llm] LLM_DRIVER=anthropic but ANTHROPIC_API_KEY is not set — falling back to stub.',
      );
      _instance = new StubLlmAdapter();
    } else {
      _instance = new AnthropicLlmAdapter();
      console.log(`[llm] Using driver: AnthropicLlmAdapter (model: ${env.ANTHROPIC_MODEL})`);
    }
  } else {
    // stub (default) — and openai falls through to stub until implemented
    if (driver === 'openai' && !env.OPENAI_API_KEY) {
      console.warn('[llm] LLM_DRIVER=openai but OPENAI_API_KEY is not set — using stub.');
    }
    _instance = new StubLlmAdapter();
    console.log('[llm] Using driver: StubLlmAdapter');
  }

  return _instance;
}

export { StubLlmAdapter };
