/**
 * PayoutsSection — component test
 *
 * Exercises the three payout states visible to a teacher:
 *   (a) Not onboarded  → "Set up payouts" button; clicking calls connectOnboard
 *   (b) Verifying      → "Finishing verification…" / "Continue setup" button
 *   (c) Enabled        → "Payouts enabled" success state
 *
 * Mocks:
 *   - @/lib/api          → paymentsApi.connectStatus / connectOnboard
 *   - next/navigation    → useSearchParams (no ?connect param by default)
 *   - @/components/ui/Toast → useToast (avoids needing ToastProvider in tree)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ConnectAccountStatus, ConnectOnboardingLink } from '@/lib/api';

// ---------------------------------------------------------------------------
// Mock next/navigation — useSearchParams returns an empty params object
// ---------------------------------------------------------------------------
const mockGet = vi.fn().mockReturnValue(null);
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: mockGet }),
}));

// ---------------------------------------------------------------------------
// Mock @/components/ui/Toast so we don't need a ToastProvider in the tree
// ---------------------------------------------------------------------------
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    toast: vi.fn(),
    info: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Mock @/lib/api — expose controllable paymentsApi stubs
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    paymentsApi: {
      ...actual.paymentsApi,
      connectStatus: vi.fn(),
      connectOnboard: vi.fn(),
    },
  };
});

import { paymentsApi } from '@/lib/api';
import { PayoutsSection } from '../PayoutsSection';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeStatus(overrides: Partial<ConnectAccountStatus> = {}): ConnectAccountStatus {
  return {
    connected: false,
    detailsSubmitted: false,
    payoutsEnabled: false,
    chargesEnabled: false,
    onboardingComplete: false,
    provider: 'mock',
    ...overrides,
  };
}

function makeLink(overrides: Partial<ConnectOnboardingLink> = {}): ConnectOnboardingLink {
  return {
    url: 'https://connect.stripe.com/mock-onboarding',
    provider: 'mock',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PayoutsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no ?connect param
    mockGet.mockReturnValue(null);
    // Silence window.location.href assignment in jsdom
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, href: '' },
    });
  });

  // -----------------------------------------------------------------------
  // State (a): Not onboarded
  // -----------------------------------------------------------------------

  describe('not-onboarded teacher', () => {
    beforeEach(() => {
      vi.mocked(paymentsApi.connectStatus).mockResolvedValue(makeStatus());
    });

    it('renders the "Set up payouts" button after status loads', async () => {
      render(<PayoutsSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /set up payouts/i }),
        ).toBeInTheDocument(),
      );
    });

    it('shows the friendly explainer copy', async () => {
      render(<PayoutsSection />);
      await waitFor(() =>
        expect(
          screen.getByText(/connect your bank to get paid/i),
        ).toBeInTheDocument(),
      );
    });

    it('clicking "Set up payouts" calls paymentsApi.connectOnboard', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.connectOnboard).mockResolvedValue(makeLink());
      render(<PayoutsSection />);

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /set up payouts/i }),
        ).toBeInTheDocument(),
      );

      await user.click(screen.getByRole('button', { name: /set up payouts/i }));

      expect(vi.mocked(paymentsApi.connectOnboard)).toHaveBeenCalledOnce();
    });

    it('navigates to the onboarding URL returned by connectOnboard', async () => {
      const user = userEvent.setup();
      const url = 'https://connect.stripe.com/mock-onboarding';
      vi.mocked(paymentsApi.connectOnboard).mockResolvedValue(makeLink({ url }));
      render(<PayoutsSection />);

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /set up payouts/i }),
        ).toBeInTheDocument(),
      );
      await user.click(screen.getByRole('button', { name: /set up payouts/i }));

      await waitFor(() => {
        expect(window.location.href).toBe(url);
      });
    });

    it('shows a friendly error toast when connectOnboard fails', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.connectOnboard).mockRejectedValue(
        new Error('Something went wrong'),
      );
      render(<PayoutsSection />);

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /set up payouts/i }),
        ).toBeInTheDocument(),
      );
      await user.click(screen.getByRole('button', { name: /set up payouts/i }));

      // Non-ApiError → falls back to the generic user-friendly message
      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith(
          expect.stringContaining('Could not start payout setup'),
        ),
      );
    });

    it('compact variant shows "Set up payouts" button', async () => {
      vi.mocked(paymentsApi.connectOnboard).mockResolvedValue(makeLink());
      render(<PayoutsSection compact />);

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /set up payouts/i }),
        ).toBeInTheDocument(),
      );
    });
  });

  // -----------------------------------------------------------------------
  // State (b): Details submitted, not yet enabled (verifying)
  // -----------------------------------------------------------------------

  describe('verifying teacher (detailsSubmitted=true, payoutsEnabled=false)', () => {
    beforeEach(() => {
      vi.mocked(paymentsApi.connectStatus).mockResolvedValue(
        makeStatus({ connected: true, detailsSubmitted: true }),
      );
    });

    it('shows "Finishing verification…" heading', async () => {
      render(<PayoutsSection />);
      await waitFor(() =>
        expect(
          screen.getByText(/finishing verification/i),
        ).toBeInTheDocument(),
      );
    });

    it('shows the "Continue setup" button', async () => {
      render(<PayoutsSection />);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /continue setup/i }),
        ).toBeInTheDocument(),
      );
    });

    it('clicking "Continue setup" calls connectOnboard', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.connectOnboard).mockResolvedValue(makeLink());
      render(<PayoutsSection />);

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /continue setup/i }),
        ).toBeInTheDocument(),
      );
      await user.click(screen.getByRole('button', { name: /continue setup/i }));

      expect(vi.mocked(paymentsApi.connectOnboard)).toHaveBeenCalledOnce();
    });
  });

  // -----------------------------------------------------------------------
  // State (c): Onboarded — payouts fully enabled
  // -----------------------------------------------------------------------

  describe('onboarded teacher (payoutsEnabled=true)', () => {
    beforeEach(() => {
      vi.mocked(paymentsApi.connectStatus).mockResolvedValue(
        makeStatus({
          connected: true,
          detailsSubmitted: true,
          payoutsEnabled: true,
          chargesEnabled: true,
          onboardingComplete: true,
        }),
      );
    });

    it('shows "Payouts enabled" success state', async () => {
      render(<PayoutsSection />);
      await waitFor(() =>
        expect(screen.getByText(/payouts enabled/i)).toBeInTheDocument(),
      );
    });

    it('does NOT show the "Set up payouts" button', async () => {
      render(<PayoutsSection />);
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: /set up payouts/i })).not.toBeInTheDocument(),
      );
    });

    it('shows reassuring copy about bank payouts', async () => {
      render(<PayoutsSection />);
      await waitFor(() =>
        expect(
          screen.getByText(/earnings are paid.*bank/i),
        ).toBeInTheDocument(),
      );
    });

    it('compact variant shows the green "Payouts enabled" badge', async () => {
      render(<PayoutsSection compact />);
      await waitFor(() =>
        expect(screen.getByText(/payouts enabled/i)).toBeInTheDocument(),
      );
    });
  });

  // -----------------------------------------------------------------------
  // Stripe return: ?connect=done
  // -----------------------------------------------------------------------

  describe('Stripe return (?connect=done)', () => {
    it('shows a success toast when returning from Stripe with ?connect=done', async () => {
      mockGet.mockImplementation((key: string) =>
        key === 'connect' ? 'done' : null,
      );
      vi.mocked(paymentsApi.connectStatus).mockResolvedValue(
        makeStatus({
          connected: true,
          detailsSubmitted: true,
          payoutsEnabled: true,
          chargesEnabled: true,
          onboardingComplete: true,
        }),
      );

      render(<PayoutsSection />);

      await waitFor(() =>
        expect(mockToastSuccess).toHaveBeenCalledWith(
          expect.stringContaining('Bank account connected'),
        ),
      );
    });

    it('re-fetches connectStatus on mount when returning from Stripe', async () => {
      mockGet.mockImplementation((key: string) =>
        key === 'connect' ? 'mock-complete' : null,
      );
      vi.mocked(paymentsApi.connectStatus).mockResolvedValue(makeStatus());

      render(<PayoutsSection />);

      await waitFor(() =>
        expect(vi.mocked(paymentsApi.connectStatus)).toHaveBeenCalledOnce(),
      );
    });
  });

  // -----------------------------------------------------------------------
  // Error state: connectStatus fails
  // -----------------------------------------------------------------------

  describe('connectStatus API error', () => {
    it('shows an accessible error message when status fetch fails', async () => {
      vi.mocked(paymentsApi.connectStatus).mockRejectedValue(
        new Error('Network error'),
      );
      render(<PayoutsSection />);

      await waitFor(() =>
        expect(screen.getByRole('alert')).toBeInTheDocument(),
      );
      expect(screen.getByText(/could not load payout status/i)).toBeInTheDocument();
    });

    it('shows a "Try again" button on fetch failure', async () => {
      vi.mocked(paymentsApi.connectStatus).mockRejectedValue(
        new Error('Server offline'),
      );
      render(<PayoutsSection />);

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /try again/i }),
        ).toBeInTheDocument(),
      );
    });

    it('"Try again" button re-calls connectStatus', async () => {
      const user = userEvent.setup();
      // First call fails, second succeeds
      vi.mocked(paymentsApi.connectStatus)
        .mockRejectedValueOnce(new Error('Server offline'))
        .mockResolvedValue(makeStatus());

      render(<PayoutsSection />);

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /try again/i }),
        ).toBeInTheDocument(),
      );

      await user.click(screen.getByRole('button', { name: /try again/i }));

      await waitFor(() =>
        expect(vi.mocked(paymentsApi.connectStatus)).toHaveBeenCalledTimes(2),
      );
    });
  });
});
