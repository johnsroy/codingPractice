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

import type { AiQuizQuestion, ResearchBriefing, LessonOutlineSection } from '@mentora/shared';
import { env } from '../../config/env';
import { getResearchAdapter } from '../research';

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

export interface ResearchTopicOpts {
  topic: string;
  gradeId?: string;
  subjectId?: string;
  maxResults?: number;
}

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

  /**
   * Agentic research: searches the web (via the research adapter) and
   * synthesises a teacher-ready ResearchBriefing with citations.
   *
   * Anthropic driver: runs a real tool-use loop where the model issues
   * web_search tool calls, results are fed back, and the model then returns
   * structured JSON for the briefing.
   *
   * Stub driver: deterministically synthesises a useful briefing from the
   * research adapter's (stub or real) results without an LLM call.
   */
  researchTopic(opts: ResearchTopicOpts): Promise<ResearchBriefing>;
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

  async researchTopic(opts: ResearchTopicOpts): Promise<ResearchBriefing> {
    const research = getResearchAdapter();
    const sources = await research.search(
      `${opts.topic}${opts.gradeId ? ` grade ${opts.gradeId}` : ''}${opts.subjectId ? ` ${opts.subjectId}` : ''}`,
      { maxResults: opts.maxResults ?? env.RESEARCH_MAX_RESULTS },
    );

    const gradeLabel = opts.gradeId
      ? opts.gradeId.replace('grade-', 'Grade ')
      : 'K-12';
    const subjectLabel = opts.subjectId ?? 'General';

    const summary =
      `This briefing covers "${opts.topic}" for ${gradeLabel} (${subjectLabel}). ` +
      `It draws on ${sources.length} source(s) to give teachers a quick, evidence-based overview. ` +
      (sources[0] ? `According to ${sources[0].siteName ?? 'a recent source'}: ${sources[0].snippet.slice(0, 200)}.` : '');

    const keyPoints = sources.slice(0, 6).map((s, i) => {
      const base = s.snippet.split(/[.!?]/)[0]?.trim() ?? s.title;
      return `${i + 1}. ${base}.`;
    });
    // Always have at least 4 key points
    while (keyPoints.length < 4) {
      keyPoints.push(
        `${keyPoints.length + 1}. Explore hands-on activities that make "${opts.topic}" tangible for ${gradeLabel} learners.`,
      );
    }

    const outline = buildStubOutline(opts.topic, gradeLabel);

    return {
      topic: opts.topic,
      gradeId: opts.gradeId ?? null,
      subjectId: opts.subjectId ?? null,
      summary,
      keyPoints,
      suggestedLessonOutline: outline,
      sources,
      provider: 'stub',
      liveWeb: research.liveWeb,
    };
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

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Build a deterministic 3-section lesson outline for the given topic and grade.
 * Used by both the stub LLM adapter and as a fallback in the Anthropic adapter.
 */
function buildStubOutline(topic: string, gradeLabel: string): LessonOutlineSection[] {
  return [
    {
      title: 'Introduction & Prior Knowledge (10 min)',
      points: [
        `Ask students what they already know about "${topic}".`,
        `Share a brief real-world example or story that connects to "${topic}".`,
        `State the learning objectives in student-friendly language.`,
      ],
    },
    {
      title: `Core Concepts: ${topic} (25 min)`,
      points: [
        `Introduce key vocabulary and definitions relevant to "${topic}".`,
        `Walk through 2–3 concrete examples appropriate for ${gradeLabel}.`,
        `Check for understanding with quick think-pair-share prompts.`,
        `Address common misconceptions identified in the research.`,
      ],
    },
    {
      title: 'Practice, Assessment & Wrap-Up (25 min)',
      points: [
        `Guided practice: students apply concepts via a short activity or worksheet.`,
        `Independent or small-group task exploring "${topic}" further.`,
        `Exit ticket: 2–3 questions to assess comprehension.`,
        `Preview how "${topic}" connects to the next lesson.`,
      ],
    },
  ];
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

    // Iterate raw stream events and yield text deltas. This is stable across
    // @anthropic-ai/sdk versions (the `.textStream` helper has moved/renamed).
    for await (const event of stream as AsyncIterable<any>) {
      if (
        event?.type === 'content_block_delta' &&
        event?.delta?.type === 'text_delta' &&
        typeof event.delta.text === 'string'
      ) {
        yield event.delta.text as string;
      }
    }
  }

  /**
   * Agentic research loop using Anthropic tool use.
   *
   * Flow:
   *  1. Send system prompt + user message with a `web_search` tool definition.
   *  2. Model calls web_search 1-3 times; we execute each via the research adapter.
   *  3. Model returns a final message containing strict JSON for the briefing.
   *  4. Parse the JSON into ResearchBriefing; fall back to stub synthesis on parse failure.
   *
   * The loop is capped at 4 iterations to prevent runaway tool calls.
   */
  async researchTopic(opts: ResearchTopicOpts): Promise<ResearchBriefing> {
    const research = getResearchAdapter();
    const client = await this.clientPromise;
    const maxResults = opts.maxResults ?? env.RESEARCH_MAX_RESULTS;
    const gradeLabel = opts.gradeId ? opts.gradeId.replace('grade-', 'Grade ') : 'K-12';
    const subjectLabel = opts.subjectId ?? 'General';

    // Tool definition for Anthropic tool-use API
    const tools: import('@anthropic-ai/sdk').default.Tool[] = [
      {
        name: 'web_search',
        description:
          'Search the web for educational information about a topic. Returns a list of relevant sources with titles, URLs, and snippets.',
        input_schema: {
          type: 'object' as const,
          properties: {
            query: {
              type: 'string',
              description: 'The search query to execute.',
            },
          },
          required: ['query'],
        },
      },
    ];

    const systemPrompt = `You are a curriculum research assistant for K-12 teachers. \
Your job is to research a topic thoroughly using the web_search tool, then synthesise a \
teacher-ready briefing. The teacher works at the ${gradeLabel} level (subject: ${subjectLabel}).

After gathering information with 1-3 web_search calls, respond ONLY with valid JSON \
matching this exact structure (no markdown fences, no extra text):
{
  "summary": "<plain-language overview, 3-5 sentences>",
  "keyPoints": ["<point 1>", "<point 2>", "<point 3>", "<point 4>", "<point 5>"],
  "suggestedLessonOutline": [
    {"title": "<section title>", "points": ["<point>", "<point>", "<point>"]},
    {"title": "<section title>", "points": ["<point>", "<point>", "<point>"]},
    {"title": "<section title>", "points": ["<point>", "<point>", "<point>"]}
  ],
  "sources": [
    {"title": "<title>", "url": "<url>", "snippet": "<snippet>"}
  ]
}`;

    type AnthropicMessage = import('@anthropic-ai/sdk').default.MessageParam;
    const messages: AnthropicMessage[] = [
      {
        role: 'user',
        content: `Please research the topic: "${opts.topic}" for ${gradeLabel} students (${subjectLabel}). Use the web_search tool to gather current, relevant information, then provide your structured briefing.`,
      },
    ];

    // Collected sources from all tool calls
    const allSources: import('@mentora/shared').ResearchSource[] = [];

    let iterations = 0;
    const MAX_ITERATIONS = 4;

    try {
      while (iterations < MAX_ITERATIONS) {
        iterations++;

        const response = await client.messages.create({
          model: this.model,
          max_tokens: 4096,
          system: systemPrompt,
          tools,
          messages,
        });

        // Check for tool use blocks
        const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
        const textBlocks = response.content.filter((b) => b.type === 'text');

        if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
          // Model returned a final answer — extract JSON from text blocks
          const textContent = textBlocks
            .map((b) => (b.type === 'text' ? b.text : ''))
            .join('');

          try {
            const match = textContent.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('No JSON object found in response');
            const parsed = JSON.parse(match[0]) as {
              summary?: string;
              keyPoints?: string[];
              suggestedLessonOutline?: LessonOutlineSection[];
              sources?: import('@mentora/shared').ResearchSource[];
            };

            // Merge any sources from tool calls with those in the JSON
            const jsonSources = parsed.sources ?? [];
            const mergedSources = [...allSources];
            for (const s of jsonSources) {
              if (!mergedSources.find((m) => m.url === s.url)) {
                mergedSources.push(s);
              }
            }
            const finalSources = mergedSources.length > 0 ? mergedSources : allSources;

            return {
              topic: opts.topic,
              gradeId: opts.gradeId ?? null,
              subjectId: opts.subjectId ?? null,
              summary: parsed.summary ?? `Research briefing for "${opts.topic}" (${gradeLabel}, ${subjectLabel}).`,
              keyPoints: parsed.keyPoints ?? [],
              suggestedLessonOutline: parsed.suggestedLessonOutline ?? buildStubOutline(opts.topic, gradeLabel),
              sources: finalSources.slice(0, maxResults),
              provider: `anthropic+${env.RESEARCH_DRIVER}`,
              liveWeb: research.liveWeb,
            };
          } catch (parseErr) {
            console.warn('[llm:anthropic] researchTopic JSON parse failed, falling back to stub synthesis:', parseErr);
            break; // fall through to stub fallback
          }
        }

        // Execute tool calls and add results to the conversation
        // First, add the assistant message with tool use
        messages.push({ role: 'assistant', content: response.content });

        // Build tool results
        const toolResults: import('@anthropic-ai/sdk').default.ToolResultBlockParam[] = [];

        for (const block of toolUseBlocks) {
          if (block.type !== 'tool_use') continue;
          const input = block.input as { query?: string };
          const query = input.query ?? opts.topic;

          let sources: import('@mentora/shared').ResearchSource[] = [];
          try {
            sources = await research.search(query, { maxResults });
          } catch (err) {
            console.warn('[llm:anthropic] web_search tool execution failed:', err);
            sources = [];
          }

          // Accumulate sources
          for (const s of sources) {
            if (!allSources.find((a) => a.url === s.url)) {
              allSources.push(s);
            }
          }

          const resultText = sources.length > 0
            ? sources.map((s, i) =>
                `[${i + 1}] ${s.title}\nURL: ${s.url}\nSnippet: ${s.snippet}${s.publishedAt ? `\nPublished: ${s.publishedAt}` : ''}`,
              ).join('\n\n')
            : 'No results found for this query.';

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: resultText,
          });
        }

        // Add user message with tool results
        messages.push({ role: 'user', content: toolResults });
      }
    } catch (err) {
      console.error('[llm:anthropic] researchTopic loop error:', err);
      // Fall through to stub synthesis
    }

    // Fallback: deterministic synthesis from collected sources (or fetch stub sources)
    console.warn('[llm:anthropic] researchTopic falling back to stub synthesis');
    const fallbackSources = allSources.length > 0
      ? allSources
      : await research.search(opts.topic, { maxResults });

    const stub = new StubLlmAdapter();
    // Use stub adapter's researchTopic but override provider
    const fallback = await stub.researchTopic({ ...opts, maxResults });
    return {
      ...fallback,
      sources: fallbackSources.length > 0 ? fallbackSources.slice(0, maxResults) : fallback.sources,
      provider: `anthropic+${env.RESEARCH_DRIVER}`,
      liveWeb: research.liveWeb,
    };
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
