'use client';

/**
 * ChatMessage — renders a single chat message bubble.
 *
 * - Assistant messages: rendered as Markdown (GFM + math via KaTeX).
 * - User messages: plain text bubble.
 * - Code blocks include a Copy button.
 * - katex CSS is imported once here.
 */

import React, { useCallback, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import clsx from 'clsx';
import { Check, Copy, Bot, User } from 'lucide-react';
import type { AiQuizQuestion } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  questions?: AiQuizQuestion[];
  loading?: boolean;
  timestamp?: Date;
}

interface ChatMessageProps {
  message: ChatMessageData;
  /** Optional quiz renderer injected from parent */
  quizSlot?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// CodeBlock with Copy button
// ---------------------------------------------------------------------------

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
}

function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(async () => {
    const text = ref.current?.textContent ?? String(children ?? '');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  }, [children]);

  if (inline) {
    return (
      <code
        className={clsx(
          'px-1.5 py-0.5 rounded-md text-sm font-mono',
          'bg-brand-50 text-brand-800 border border-brand-100',
          className,
        )}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-3">
      <pre
        ref={ref}
        className={clsx(
          'overflow-x-auto rounded-xl px-5 py-4 text-sm font-mono',
          'bg-ink-900 text-surface-50 border border-ink-800',
          'leading-relaxed',
          className,
        )}
      >
        <code>{children}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className={clsx(
          'absolute top-2.5 right-2.5 flex items-center gap-1.5',
          'px-2.5 py-1.5 rounded-lg text-xs font-medium',
          'transition-all duration-150',
          'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          copied
            ? 'bg-green-500 text-white'
            : 'bg-ink-700 text-surface-200 hover:bg-ink-600',
        )}
      >
        {copied ? (
          <>
            <Check size={12} aria-hidden="true" />
            Copied
          </>
        ) : (
          <>
            <Copy size={12} aria-hidden="true" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Markdown prose wrapper
// ---------------------------------------------------------------------------

// Typed components map: keyed by tag name, each is a React component.
// We use a broad props type to side-step a React version conflict between
// the monorepo root node_modules (react-markdown) and the workspace's
// @types/react.
type MdComponents = Record<string, React.FC<React.HTMLAttributes<HTMLElement> & { href?: string; className?: string }>>;

function AssistantMarkdown({ content }: { content: string }) {
  const components: MdComponents = {
    h1: ({ children }) => (
      <h1 className="text-xl font-semibold text-ink-900 mt-5 mb-2 first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold text-ink-900 mt-4 mb-2 first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold text-ink-900 mt-3 mb-1.5 first:mt-0">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-medium text-ink-900 mt-3 mb-1 first:mt-0">{children}</h4>
    ),
    p: ({ children }) => (
      <p className="text-ink-800 leading-relaxed mb-3 last:mb-0">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1.5 mb-3 text-ink-800 pl-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1.5 mb-3 text-ink-800 pl-2">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    code: ({ className, children }) => {
      const isInline = !className;
      return (
        <CodeBlock className={className} inline={isInline}>
          {children}
        </CodeBlock>
      );
    },
    pre: ({ children }) => <>{children}</>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-brand-300 pl-4 py-1 my-3 text-ink-700 italic bg-brand-50/50 rounded-r-lg">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full text-sm border-collapse rounded-xl overflow-hidden border border-surface-200">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-brand-50 text-ink-900 font-semibold">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-surface-200">{children}</tbody>
    ),
    tr: ({ children }) => <tr className="hover:bg-surface-50">{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-2.5 text-left font-semibold text-ink-900 border-b border-surface-200">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="px-4 py-2.5 text-ink-800">{children}</td>,
    hr: () => <hr className="border-surface-200 my-4" />,
    strong: ({ children }) => (
      <strong className="font-semibold text-ink-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-ink-700">{children}</em>,
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="prose-mentora">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components as Parameters<typeof ReactMarkdown>[0]['components']}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------

export function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center py-1" aria-label="AI is thinking" role="status">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">AI is thinking…</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timestamp
// ---------------------------------------------------------------------------

function Timestamp({ date }: { date: Date }) {
  const formatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <time
      dateTime={date.toISOString()}
      className="text-xs text-ink-500 mt-1.5 select-none"
      aria-label={`Sent at ${formatted}`}
    >
      {formatted}
    </time>
  );
}

// ---------------------------------------------------------------------------
// Main ChatMessage component
// ---------------------------------------------------------------------------

export function ChatMessage({ message, quizSlot }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={clsx(
        'flex gap-3 animate-fade-up',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 select-none',
          isAssistant
            ? 'bg-gradient-to-br from-brand-500 to-teal-500 text-white shadow-glow'
            : 'bg-surface-100 text-ink-700 border border-surface-200',
        )}
        aria-hidden="true"
      >
        {isAssistant ? (
          <Bot size={20} />
        ) : (
          <User size={18} />
        )}
      </div>

      {/* Bubble + timestamp */}
      <div className={clsx('flex flex-col max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={clsx(
            'rounded-2xl px-5 py-4 text-base',
            isAssistant
              ? 'bg-white border border-surface-200 text-ink-900 shadow-card'
              : 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-soft',
          )}
        >
          {message.loading ? (
            <TypingIndicator />
          ) : isAssistant ? (
            <>
              <AssistantMarkdown content={message.content} />
              {quizSlot}
            </>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && !message.loading && (
          <Timestamp date={message.timestamp} />
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
