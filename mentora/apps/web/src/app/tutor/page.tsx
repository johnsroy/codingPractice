'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Sparkles, BookOpen, MessageCircle, HelpCircle, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { aiApi } from '@/lib/api';
import type { AiQuizQuestion } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  questions?: AiQuizQuestion[];
  loading?: boolean;
}

interface QuizCardProps {
  questions: AiQuizQuestion[];
}

function QuizCard({ questions }: QuizCardProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <div className="mt-4 space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
          <p className="font-semibold text-ink-900 mb-4">
            {qi + 1}. {q.question}
          </p>
          <div className="space-y-2.5">
            {q.options.map((opt, oi) => {
              const chosen = answers[qi] === oi;
              const correct = oi === q.answerIndex;
              const show = revealed[qi];

              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => {
                    if (revealed[qi]) return;
                    setAnswers((prev) => ({ ...prev, [qi]: oi }));
                    setRevealed((prev) => ({ ...prev, [qi]: true }));
                  }}
                  className={clsx(
                    'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[48px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                    !show && 'border-surface-200 bg-white hover:border-brand-400 hover:bg-brand-50',
                    show && correct && 'border-green-400 bg-green-50 text-green-800',
                    show && !correct && chosen && 'border-red-400 bg-red-50 text-red-800',
                    show && !correct && !chosen && 'border-surface-200 bg-white text-stone-400',
                  )}
                  aria-pressed={chosen}
                  aria-label={`Option ${oi + 1}: ${opt}`}
                >
                  <span className="mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                  {show && correct && <span className="ml-2 text-green-600 font-bold">✓</span>}
                </button>
              );
            })}
          </div>
          {revealed[qi] && (
            <div className="mt-4 bg-white rounded-xl p-4 border border-brand-100">
              <p className="text-sm font-semibold text-brand-700 mb-1">Explanation</p>
              <p className="text-sm text-ink-700">{q.explanation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const quickActions = [
  {
    id: 'quiz',
    icon: <HelpCircle size={18} />,
    label: 'Make a quiz',
    prompt: 'Please create a short quiz for me on this topic.',
    task: 'generate_quiz' as const,
  },
  {
    id: 'explain',
    icon: <Sparkles size={18} />,
    label: 'Explain simply',
    prompt: 'Please explain this concept in simple words, like I am 10 years old.',
    task: 'explain_simply' as const,
  },
  {
    id: 'summarize',
    icon: <BookOpen size={18} />,
    label: 'Summarise for me',
    prompt: 'Please give me a clear summary of what we have covered.',
    task: 'summarize_material' as const,
  },
];

export default function TutorPage() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your Mentora AI tutor. I can help you understand any topic, create practice quizzes, or explain things in a simple way. What would you like to learn today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (
      text: string,
      task: 'tutor_chat' | 'generate_quiz' | 'explain_simply' | 'summarize_material' = 'tutor_chat',
    ) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
      };
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        loading: true,
      };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
      setInput('');
      setLoading(true);

      // Try SSE stream first for tutor_chat; fall back to invoke
      if (task === 'tutor_chat') {
        try {
          const es = aiApi.tutorStream(text.trim());
          let accumulated = '';

          es.onmessage = (e) => {
            if (e.data === '[DONE]') {
              es.close();
              setLoading(false);
              return;
            }
            try {
              const parsed = JSON.parse(e.data);
              const chunk: string = parsed.text ?? parsed.content ?? '';
              accumulated += chunk;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsg.id ? { ...m, content: accumulated, loading: false } : m,
                ),
              );
            } catch { /* ignore parse errors */ }
          };

          es.onerror = async () => {
            es.close();
            // Fallback to regular invoke
            try {
              const res = await aiApi.invoke({ task: 'tutor_chat', prompt: text.trim() });
              const reply = typeof res.result === 'string' ? res.result : '';
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsg.id ? { ...m, content: reply, loading: false } : m,
                ),
              );
            } catch {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsg.id
                    ? { ...m, content: "I'm having trouble right now. Please try again in a moment.", loading: false }
                    : m,
                ),
              );
            } finally {
              setLoading(false);
            }
          };

          return;
        } catch {
          // fall through to invoke
        }
      }

      // Regular invoke for non-chat tasks
      try {
        const res = await aiApi.invoke({ task, prompt: text.trim() });
        // generate_quiz returns the questions array under `result`; every other
        // task returns a plain string. Normalise so we never render an object.
        const questions = Array.isArray(res.result) ? res.result : res.questions;
        const content = Array.isArray(res.result)
          ? 'Here is a quick quiz to check your understanding:'
          : (res.result ?? '');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id
              ? { ...m, content, questions, loading: false }
              : m,
          ),
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id
              ? { ...m, content: "I'm sorry, I couldn't process that request. Please try again.", loading: false }
              : m,
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  return (
    <div className="section">
      <div className="page-container max-w-3xl">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8 animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center shadow-glow">
            <Bot size={30} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-ink-900">AI Tutor</h1>
            <p className="text-ink-700">Ask anything — I&apos;m here to help you learn.</p>
          </div>
          {!isAuthenticated && (
            <Badge variant="amber" size="md" className="ml-auto">
              Sign in for unlimited questions
            </Badge>
          )}
        </div>

        {/* ── Quick actions ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          {quickActions.map((a) => (
            <Button
              key={a.id}
              size="sm"
              variant="outline"
              icon={a.icon}
              onClick={() => sendMessage(a.prompt, a.task)}
              disabled={loading}
            >
              {a.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw size={16} />}
            onClick={() => setMessages([messages[0]])}
            aria-label="Start a new conversation"
          >
            New chat
          </Button>
        </div>

        {/* ── Chat window ── */}
        <Card padding="none" className="overflow-hidden flex flex-col shadow-lift">
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-6 space-y-5"
            style={{ minHeight: '400px', maxHeight: '60vh' }}
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  'flex gap-3',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                )}
              >
                {/* Avatar */}
                <div
                  className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    msg.role === 'assistant'
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-100 text-ink-700',
                  )}
                  aria-hidden="true"
                >
                  {msg.role === 'assistant' ? (
                    <Bot size={20} />
                  ) : (
                    <span className="text-sm font-bold">You</span>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={clsx(
                    'max-w-[80%] rounded-2xl px-5 py-4',
                    msg.role === 'assistant'
                      ? 'bg-surface-50 text-ink-900 border border-surface-200'
                      : 'bg-brand-500 text-white',
                  )}
                >
                  {msg.loading ? (
                    <Spinner size="sm" label="Thinking…" />
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.questions && msg.questions.length > 0 && (
                        <QuizCard questions={msg.questions} />
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-surface-200 p-4 flex gap-3 items-end bg-surface-50">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
              rows={2}
              className="flex-1 resize-none bg-white border-2 border-surface-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400 placeholder:text-stone-400 min-h-[48px]"
              aria-label="Type your question"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage(input)}
              loading={loading}
              disabled={!input.trim()}
              icon={<Send size={18} />}
              size="lg"
              aria-label="Send message"
            >
              Send
            </Button>
          </div>
        </Card>

        {/* ── Tips ── */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <MessageCircle size={20} className="text-brand-400" />,
              tip: 'Ask follow-up questions anytime — I remember our conversation.',
            },
            {
              icon: <HelpCircle size={20} className="text-teal-400" />,
              tip: "Say \"make a quiz on fractions\" and I'll create an interactive practice test.",
            },
            {
              icon: <Sparkles size={20} className="text-accent-500" />,
              tip: "Ask me to \"explain like I'm 8\" for super-simple explanations.",
            },
          ].map((t, i) => (
            <div key={i} className="flex gap-3 p-4 bg-surface-50 rounded-xl border border-surface-200">
              <span className="shrink-0 mt-0.5" aria-hidden="true">{t.icon}</span>
              <p className="text-sm text-ink-700">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
