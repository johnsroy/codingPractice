/**
 * ChatMessage — unit tests (Vitest + RTL).
 *
 * What we test:
 * 1. Assistant messages render markdown (headings, paragraphs, lists).
 * 2. Code blocks are rendered with a Copy button.
 * 3. User messages render as plain text (no markdown processing).
 * 4. TypingIndicator is shown when loading=true.
 * 5. Timestamp is displayed when provided.
 *
 * No network mocks needed — ChatMessage is pure UI.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatMessage, TypingIndicator } from '../ChatMessage';
import type { ChatMessageData } from '../ChatMessage';

// ---------------------------------------------------------------------------
// navigator.clipboard mock (jsdom doesn't implement clipboard as writable)
// ---------------------------------------------------------------------------

// jsdom doesn't implement navigator.clipboard at all. Define it on the
// global object so the component's `navigator.clipboard.writeText()` call
// resolves instead of throwing, and we can assert on it.
const writeTextMock = vi.fn().mockResolvedValue(undefined);

// Define once at module scope — defineProperty with configurable:true lets
// subsequent beforeEach calls update the value reference safely.
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  writable: true,
  configurable: true,
});

beforeEach(() => {
  writeTextMock.mockClear();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMsg(overrides: Partial<ChatMessageData> = {}): ChatMessageData {
  return {
    id: 'test-1',
    role: 'assistant',
    content: '',
    loading: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChatMessage — assistant markdown', () => {
  it('renders a markdown heading (# Hello)', () => {
    render(
      <ChatMessage
        message={makeMsg({ content: '# Hello World\n\nSome text.' })}
      />,
    );
    // The h1 rendered by react-markdown should be in the document
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Some text.')).toBeInTheDocument();
  });

  it('renders an unordered list', () => {
    render(
      <ChatMessage
        message={makeMsg({
          content: '- Item one\n- Item two\n- Item three',
        })}
      />,
    );
    expect(screen.getByText('Item one')).toBeInTheDocument();
    expect(screen.getByText('Item two')).toBeInTheDocument();
    expect(screen.getByText('Item three')).toBeInTheDocument();
  });

  it('renders an ordered list', () => {
    render(
      <ChatMessage
        message={makeMsg({ content: '1. First step\n2. Second step' })}
      />,
    );
    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.getByText('Second step')).toBeInTheDocument();
  });

  it('renders bold text', () => {
    render(
      <ChatMessage message={makeMsg({ content: 'This is **bold** text.' })} />,
    );
    expect(screen.getByText('bold')).toBeInTheDocument();
  });

  it('renders a blockquote', () => {
    render(
      <ChatMessage
        message={makeMsg({ content: '> This is a quote.' })}
      />,
    );
    expect(screen.getByText('This is a quote.')).toBeInTheDocument();
  });
});

describe('ChatMessage — code block with Copy button', () => {
  it('renders a fenced code block', () => {
    const code = 'const x = 42;';
    render(
      <ChatMessage
        message={makeMsg({ content: '```js\n' + code + '\n```' })}
      />,
    );
    expect(screen.getByText(code)).toBeInTheDocument();
  });

  it('renders a Copy button inside a code block', () => {
    render(
      <ChatMessage
        message={makeMsg({ content: '```python\nprint("hello")\n```' })}
      />,
    );
    // The button is "Copy code" (aria-label)
    expect(
      screen.getByRole('button', { name: /copy code/i }),
    ).toBeInTheDocument();
  });

  it('Copy button writes to clipboard and shows "Copied"', async () => {
    render(
      <ChatMessage
        message={makeMsg({ content: '```js\nlet a = 1;\n```' })}
      />,
    );
    const copyBtn = screen.getByRole('button', { name: /copy code/i });
    // Use fireEvent to bypass pointer-events checks on the opacity-0 button
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();
    // After copy, aria-label changes to "Copied"
    expect(
      await screen.findByRole('button', { name: /copied/i }),
    ).toBeInTheDocument();
  });
});

describe('ChatMessage — user message', () => {
  it('renders user content as plain text (no markdown processing)', () => {
    render(
      <ChatMessage
        message={makeMsg({
          role: 'user',
          content: '**Not bold** just text',
        })}
      />,
    );
    // User bubbles render raw text — the asterisks should be present literally
    expect(screen.getByText('**Not bold** just text')).toBeInTheDocument();
  });

  it('renders with user layout (flex-row-reverse)', () => {
    const { container } = render(
      <ChatMessage message={makeMsg({ role: 'user', content: 'Hello' })} />,
    );
    const outer = container.firstElementChild;
    expect(outer?.className).toMatch(/flex-row-reverse/);
  });
});

describe('ChatMessage — loading state', () => {
  it('shows typing indicator when loading=true', () => {
    render(
      <ChatMessage message={makeMsg({ loading: true, content: '' })} />,
    );
    expect(
      screen.getByRole('status', { name: /ai is thinking/i }),
    ).toBeInTheDocument();
  });

  it('does not show content when loading=true', () => {
    render(
      <ChatMessage
        message={makeMsg({ loading: true, content: 'This should not appear' })}
      />,
    );
    expect(screen.queryByText('This should not appear')).not.toBeInTheDocument();
  });
});

describe('ChatMessage — timestamp', () => {
  it('shows a timestamp when provided', () => {
    const ts = new Date('2024-01-15T10:30:00');
    render(
      <ChatMessage
        message={makeMsg({
          content: 'Hi',
          timestamp: ts,
        })}
      />,
    );
    // There should be a <time> element
    const timeEl = document.querySelector('time');
    expect(timeEl).toBeInTheDocument();
  });

  it('does not show a timestamp when not provided', () => {
    render(
      <ChatMessage message={makeMsg({ content: 'No time stamp here' })} />,
    );
    expect(document.querySelector('time')).not.toBeInTheDocument();
  });
});

describe('TypingIndicator', () => {
  it('renders three animated dots', () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll('[aria-hidden="true"]');
    expect(dots.length).toBeGreaterThanOrEqual(3);
  });

  it('has an accessible status role', () => {
    render(<TypingIndicator />);
    expect(
      screen.getByRole('status', { name: /ai is thinking/i }),
    ).toBeInTheDocument();
  });
});
