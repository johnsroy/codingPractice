/**
 * FeaturedTeachers — feature component test.
 *
 * - The API client (@/lib/api) is mocked so no network calls happen.
 * - react-query is driven through its real QueryClient so the
 *   async data-loading lifecycle is exercised deterministically.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeaturedTeachers } from '../FeaturedTeachers';
import { formatPrice } from '@mentora/shared';
import type { UserPublic } from '@/lib/api';

// ---------------------------------------------------------------------------
// Mock the entire @/lib/api module
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    usersApi: {
      teachers: vi.fn(),
    },
  };
});

import { usersApi } from '@/lib/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTeacher(overrides: Partial<UserPublic> = {}): UserPublic {
  return {
    id: 'teacher-1',
    role: 'TEACHER',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    avatarUrl: null,
    headline: 'Pioneer of computing',
    subjects: ['math', 'science'],
    grades: ['9', '10'],
    hourlyRateCents: 5000,
    rating: 4.8,
    verified: true,
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function queryWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FeaturedTeachers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner while the query is in-flight', () => {
    // Never resolve
    vi.mocked(usersApi.teachers).mockReturnValue(new Promise(() => {}));
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    expect(screen.getByRole('status', { name: /loading teachers/i })).toBeInTheDocument();
  });

  it('renders a teacher card with the teacher name', async () => {
    vi.mocked(usersApi.teachers).mockResolvedValue([makeTeacher()]);
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    await waitFor(() => expect(screen.getByText('Ada Lovelace')).toBeInTheDocument());
  });

  it('renders the teacher headline', async () => {
    vi.mocked(usersApi.teachers).mockResolvedValue([makeTeacher()]);
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    await waitFor(() =>
      expect(screen.getByText('Pioneer of computing')).toBeInTheDocument(),
    );
  });

  it('displays the formatted hourly rate via formatPrice', async () => {
    const teacher = makeTeacher({ hourlyRateCents: 5000 });
    vi.mocked(usersApi.teachers).mockResolvedValue([teacher]);
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    const expected = `${formatPrice(5000)}/hr`;
    await waitFor(() => expect(screen.getByText(expected)).toBeInTheDocument());
  });

  it('displays the rating', async () => {
    vi.mocked(usersApi.teachers).mockResolvedValue([makeTeacher({ rating: 4.8 })] );
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    await waitFor(() => expect(screen.getByText('4.8')).toBeInTheDocument());
  });

  it('shows "New teacher" when rating is null', async () => {
    vi.mocked(usersApi.teachers).mockResolvedValue([makeTeacher({ rating: null })]);
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    await waitFor(() => expect(screen.getByText('New teacher')).toBeInTheDocument());
  });

  it('shows "Verified" badge when teacher.verified is true', async () => {
    vi.mocked(usersApi.teachers).mockResolvedValue([makeTeacher({ verified: true })]);
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    await waitFor(() => expect(screen.getByText('Verified')).toBeInTheDocument());
  });

  it('does not show a rate when hourlyRateCents is 0', async () => {
    vi.mocked(usersApi.teachers).mockResolvedValue([
      makeTeacher({ hourlyRateCents: 0, rating: null }),
    ]);
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    await waitFor(() => screen.getByText('Ada Lovelace'));
    // formatPrice(0) = "$0.00"; should NOT appear
    expect(screen.queryByText(/\$0\.00\/hr/)).not.toBeInTheDocument();
  });

  it('renders placeholder skeleton cards on API error', async () => {
    vi.mocked(usersApi.teachers).mockRejectedValue(new Error('Network error'));
    const { container } = render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    await waitFor(() => {
      // Placeholder cards have animate-pulse class
      const pulses = container.querySelectorAll('.animate-pulse');
      expect(pulses.length).toBeGreaterThan(0);
    });
  });

  it('renders a friendly empty state when API returns an empty array', async () => {
    vi.mocked(usersApi.teachers).mockResolvedValue([]);
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    await waitFor(() =>
      expect(screen.getByText(/our mentors are getting ready/i)).toBeInTheDocument(),
    );
    // Empty state links visitors to the full teacher directory
    expect(screen.getByRole('link', { name: /browse all teachers/i })).toHaveAttribute(
      'href',
      '/teachers',
    );
  });

  it('renders at most 6 teacher cards', async () => {
    const teachers = Array.from({ length: 10 }, (_, i) =>
      makeTeacher({ id: `t-${i}`, name: `Teacher ${i}` }),
    );
    vi.mocked(usersApi.teachers).mockResolvedValue(teachers);
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    await waitFor(() => screen.getByText('Teacher 0'));
    // Teachers are rendered as <h3> headings inside cards
    const names = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(names.length).toBeLessThanOrEqual(6);
  });

  it('renders a link to the teacher profile page', async () => {
    vi.mocked(usersApi.teachers).mockResolvedValue([makeTeacher({ id: 'teacher-1' })]);
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    await waitFor(() => screen.getByText('Ada Lovelace'));
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/teachers/teacher-1');
  });

  it('shows an Avatar with initials fallback when avatarUrl is null', async () => {
    vi.mocked(usersApi.teachers).mockResolvedValue([
      makeTeacher({ name: 'Ada Lovelace', avatarUrl: null }),
    ]);
    render(<FeaturedTeachers />, { wrapper: queryWrapper() });
    // Avatar with no src falls back to initials "AL"
    await waitFor(() => expect(screen.getByText('AL')).toBeInTheDocument());
  });
});
