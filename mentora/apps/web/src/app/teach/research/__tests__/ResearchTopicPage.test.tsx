/**
 * ResearchTopicPage — component test
 *
 * Mocks:
 *   - @/lib/api  — replaces aiApi.research with a controllable vi.fn()
 *   - @/lib/auth — provides a logged-in teacher so auth guards pass
 *   - next/navigation — stubs useRouter (no Next.js runtime required)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ResearchBriefing } from '@mentora/shared';

// ---------------------------------------------------------------------------
// Mock next/navigation (useRouter, usePathname are called inside the page)
// ---------------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/teach/research',
}));

// ---------------------------------------------------------------------------
// Mock @/lib/auth — return a fully authenticated teacher
// ---------------------------------------------------------------------------
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Ada Lovelace', role: 'TEACHER', email: 'ada@example.com', createdAt: '2024-01-01T00:00:00Z' },
    isAuthenticated: true,
    isLoading: false,
    isTeacher: true,
    isStudent: false,
    isGuardian: false,
    isAdmin: false,
  }),
}));

// ---------------------------------------------------------------------------
// Mock @/lib/api — expose a controllable aiApi.research
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    aiApi: {
      ...actual.aiApi,
      research: vi.fn(),
    },
  };
});

import { aiApi } from '@/lib/api';
import ResearchTopicPage from '../page';

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

function makeBriefing(overrides: Partial<ResearchBriefing> = {}): ResearchBriefing {
  return {
    topic: 'The Water Cycle',
    summary: 'The water cycle describes the continuous movement of water on, above and below Earth.',
    keyPoints: [
      'Evaporation turns liquid water into vapour.',
      'Condensation forms clouds.',
      'Precipitation returns water to Earth as rain or snow.',
    ],
    suggestedLessonOutline: [
      {
        title: 'Introduction (10 min)',
        points: ['Activate prior knowledge', 'Show a diagram of the water cycle'],
      },
      {
        title: 'Core concepts (20 min)',
        points: ['Explain evaporation', 'Explain condensation', 'Explain precipitation'],
      },
    ],
    sources: [
      {
        title: 'NASA: The Water Cycle',
        url: 'https://example.nasa.gov/water-cycle',
        snippet: 'NASA explains how water moves through the environment.',
        siteName: 'NASA',
      },
      {
        title: 'USGS Water Cycle Overview',
        url: 'https://example.usgs.gov/water-cycle',
        snippet: 'A comprehensive guide from the US Geological Survey.',
        siteName: null,
      },
    ],
    provider: 'stub',
    liveWeb: false,
    gradeId: null,
    subjectId: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ResearchTopicPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading and explainer text', () => {
    render(<ResearchTopicPage />);
    expect(
      screen.getByRole('heading', { name: /research a topic/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/type any topic.*mentora researches/i),
    ).toBeInTheDocument();
  });

  it('renders the topic input and submit button', () => {
    render(<ResearchTopicPage />);
    expect(
      screen.getByRole('textbox', { name: /what topic would you like/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /research this topic/i }),
    ).toBeInTheDocument();
  });

  it('submit button is disabled when the topic input is empty', () => {
    render(<ResearchTopicPage />);
    const btn = screen.getByRole('button', { name: /research this topic/i });
    expect(btn).toBeDisabled();
  });

  it('submit button becomes enabled when the user types a topic', async () => {
    const user = userEvent.setup();
    render(<ResearchTopicPage />);
    const input = screen.getByRole('textbox', { name: /what topic would you like/i });
    await user.type(input, 'The Water Cycle');
    const btn = screen.getByRole('button', { name: /research this topic/i });
    expect(btn).not.toBeDisabled();
  });

  it('calls aiApi.research with the topic when the form is submitted', async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.research).mockResolvedValue(makeBriefing());
    render(<ResearchTopicPage />);

    const input = screen.getByRole('textbox', { name: /what topic would you like/i });
    await user.type(input, 'The Water Cycle');
    await user.click(screen.getByRole('button', { name: /research this topic/i }));

    expect(vi.mocked(aiApi.research)).toHaveBeenCalledOnce();
    expect(vi.mocked(aiApi.research)).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'The Water Cycle' }),
    );
  });

  it('renders the summary after a successful response', async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.research).mockResolvedValue(makeBriefing());
    render(<ResearchTopicPage />);

    await user.type(
      screen.getByRole('textbox', { name: /what topic would you like/i }),
      'The Water Cycle',
    );
    await user.click(screen.getByRole('button', { name: /research this topic/i }));

    await waitFor(() =>
      expect(
        screen.getByText('The water cycle describes the continuous movement of water on, above and below Earth.'),
      ).toBeInTheDocument(),
    );
  });

  it('renders all key points as a list', async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.research).mockResolvedValue(makeBriefing());
    render(<ResearchTopicPage />);

    await user.type(
      screen.getByRole('textbox', { name: /what topic would you like/i }),
      'The Water Cycle',
    );
    await user.click(screen.getByRole('button', { name: /research this topic/i }));

    await waitFor(() => screen.getByText('Evaporation turns liquid water into vapour.'));

    expect(screen.getByText('Condensation forms clouds.')).toBeInTheDocument();
    expect(screen.getByText('Precipitation returns water to Earth as rain or snow.')).toBeInTheDocument();
  });

  it('renders the lesson outline section titles', async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.research).mockResolvedValue(makeBriefing());
    render(<ResearchTopicPage />);

    await user.type(
      screen.getByRole('textbox', { name: /what topic would you like/i }),
      'The Water Cycle',
    );
    await user.click(screen.getByRole('button', { name: /research this topic/i }));

    await waitFor(() => screen.getByText(/Introduction \(10 min\)/i));
    expect(screen.getByText(/Core concepts \(20 min\)/i)).toBeInTheDocument();
  });

  it('renders source links with correct href and target=_blank', async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.research).mockResolvedValue(makeBriefing());
    render(<ResearchTopicPage />);

    await user.type(
      screen.getByRole('textbox', { name: /what topic would you like/i }),
      'The Water Cycle',
    );
    await user.click(screen.getByRole('button', { name: /research this topic/i }));

    await waitFor(() => screen.getByText('NASA: The Water Cycle'));

    const nasaLink = screen.getByRole('link', { name: /NASA: The Water Cycle/i });
    expect(nasaLink).toHaveAttribute('href', 'https://example.nasa.gov/water-cycle');
    expect(nasaLink).toHaveAttribute('target', '_blank');
    expect(nasaLink).toHaveAttribute('rel', 'noopener noreferrer');

    const usgsLink = screen.getByRole('link', { name: /USGS Water Cycle Overview/i });
    expect(usgsLink).toHaveAttribute('href', 'https://example.usgs.gov/water-cycle');
    expect(usgsLink).toHaveAttribute('target', '_blank');
  });

  it('shows the liveWeb=false badge when liveWeb is false', async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.research).mockResolvedValue(makeBriefing({ liveWeb: false }));
    render(<ResearchTopicPage />);

    await user.type(
      screen.getByRole('textbox', { name: /what topic would you like/i }),
      'The Water Cycle',
    );
    await user.click(screen.getByRole('button', { name: /research this topic/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/example sources.*add a search api key/i),
      ).toBeInTheDocument(),
    );
  });

  it('shows the Live web badge when liveWeb is true', async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.research).mockResolvedValue(makeBriefing({ liveWeb: true }));
    render(<ResearchTopicPage />);

    await user.type(
      screen.getByRole('textbox', { name: /what topic would you like/i }),
      'The Water Cycle',
    );
    await user.click(screen.getByRole('button', { name: /research this topic/i }));

    await waitFor(() =>
      expect(screen.getByText('Live web')).toBeInTheDocument(),
    );
  });

  it('renders a "Turn this into a course" link pointing to /teach/courses/new', async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.research).mockResolvedValue(makeBriefing());
    render(<ResearchTopicPage />);

    await user.type(
      screen.getByRole('textbox', { name: /what topic would you like/i }),
      'The Water Cycle',
    );
    await user.click(screen.getByRole('button', { name: /research this topic/i }));

    await waitFor(() => screen.getByText('NASA: The Water Cycle'));

    const courseLink = screen.getByRole('link', { name: /turn this into a course/i });
    expect(courseLink).toHaveAttribute('href', '/teach/courses/new');
  });

  it('shows a friendly error message when the API call fails', async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.research).mockRejectedValue(new Error('Server is unavailable'));
    render(<ResearchTopicPage />);

    await user.type(
      screen.getByRole('textbox', { name: /what topic would you like/i }),
      'The Water Cycle',
    );
    await user.click(screen.getByRole('button', { name: /research this topic/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    );
    expect(screen.getByText('Server is unavailable')).toBeInTheDocument();
  });

  it('does not crash when the API returns an unknown error shape', async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.research).mockRejectedValue('unexpected string error');
    render(<ResearchTopicPage />);

    await user.type(
      screen.getByRole('textbox', { name: /what topic would you like/i }),
      'The Water Cycle',
    );
    await user.click(screen.getByRole('button', { name: /research this topic/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    );
    // Should show the fallback message, not crash
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
