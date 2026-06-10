'use client';

/**
 * PayoutsSection — teacher-facing Stripe Connect onboarding UI.
 *
 * Three states:
 *   1. Not onboarded  (onboardingComplete false, detailsSubmitted false)
 *      → friendly explainer + "Set up payouts" CTA
 *   2. Verifying      (detailsSubmitted true, payoutsEnabled false)
 *      → "Finishing verification…" + "Continue setup" button
 *   3. Enabled        (payoutsEnabled true)
 *      → calm green success state
 *
 * Stripe return handling:
 *   - When URL contains ?connect=done or ?connect=mock-complete, the component
 *     re-fetches status on mount and shows a success toast.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Banknote, RefreshCw, AlertCircle } from 'lucide-react';
import { paymentsApi, ApiError } from '@/lib/api';
import type { ConnectAccountStatus } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

// ---------------------------------------------------------------------------
// Compact variant — used on the dashboard earnings area
// ---------------------------------------------------------------------------

interface PayoutsSectionProps {
  /** When true renders as a compact card row instead of the full account page card. */
  compact?: boolean;
}

export function PayoutsSection({ compact = false }: PayoutsSectionProps) {
  const [status, setStatus] = useState<ConnectAccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { success: toastSuccess, error: toastError } = useToast();
  const searchParams = useSearchParams();

  // Detect return from Stripe Connect onboarding
  const connectReturn = searchParams?.get('connect');
  const isStripeReturn =
    connectReturn === 'done' || connectReturn === 'mock-complete';

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const s = await paymentsApi.connectStatus();
      setStatus(s);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Could not check payout status. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: fetch status; if returning from Stripe, show a toast
  useEffect(() => {
    fetchStatus().then(() => {
      if (isStripeReturn) {
        toastSuccess('Bank account connected! Your payout status has been updated.');
      }
    });
  // fetchStatus is stable (useCallback with no deps), toastSuccess is stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSetupPayouts() {
    setOnboarding(true);
    setErrorMsg(null);
    try {
      const link = await paymentsApi.connectOnboard();
      window.location.href = link.url;
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Could not start payout setup. Please try again.';
      setErrorMsg(msg);
      toastError(msg);
      setOnboarding(false);
    }
  }

  // ---- Render helpers -------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4" aria-live="polite">
        <Spinner size="sm" label="Loading payout status…" />
        <span className="text-stone-500">Checking payout status…</span>
      </div>
    );
  }

  if (errorMsg && !status) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50"
      >
        <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-semibold text-red-800">Could not load payout status</p>
          <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
            onClick={fetchStatus}
            icon={<RefreshCw size={15} />}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // ---- State 3: Payouts enabled (fully onboarded) --------------------------
  if (status?.payoutsEnabled) {
    if (compact) {
      return (
        <div className="flex items-center gap-3 py-1">
          <CheckCircle2 size={20} className="text-green-500 shrink-0" aria-hidden="true" />
          <div>
            <Badge variant="green" size="sm">Payouts enabled ✓</Badge>
            <p className="text-sm text-stone-500 mt-1">
              Earnings are paid directly to your bank.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="flex items-start gap-4 p-5 rounded-2xl border-2 border-green-200 bg-green-50"
        aria-label="Payout status: enabled"
      >
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <CheckCircle2 size={24} className="text-green-600" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-stone-900">Payouts enabled</p>
            <Badge variant="green" size="sm">Active ✓</Badge>
          </div>
          <p className="text-stone-600">
            You&apos;re all set — earnings are paid to your bank automatically after each class.
          </p>
        </div>
      </div>
    );
  }

  // ---- State 2: Details submitted but not yet enabled (Stripe reviewing) ---
  if (status?.detailsSubmitted) {
    if (compact) {
      return (
        <div className="flex items-center gap-3 py-1">
          <RefreshCw size={18} className="text-amber-500 shrink-0 animate-spin" aria-hidden="true" />
          <div>
            <Badge variant="amber" size="sm">Finishing verification…</Badge>
            <p className="text-sm text-stone-500 mt-1">
              Stripe is reviewing your details.{' '}
              <button
                className="text-brand-600 underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                onClick={handleSetupPayouts}
                disabled={onboarding}
                aria-disabled={onboarding}
              >
                Continue setup
              </button>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="flex items-start gap-4 p-5 rounded-2xl border-2 border-amber-200 bg-amber-50"
        aria-label="Payout status: verification in progress"
      >
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <RefreshCw size={24} className="text-amber-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-stone-900">Finishing verification…</p>
            <Badge variant="amber" size="sm">In review</Badge>
          </div>
          <p className="text-stone-600 mb-4">
            You&apos;ve submitted your details. Stripe may need a little more information to activate
            your payouts.
          </p>
          {errorMsg && (
            <p role="alert" className="text-sm text-red-700 mb-3">{errorMsg}</p>
          )}
          <Button
            variant="outline"
            size="md"
            onClick={handleSetupPayouts}
            loading={onboarding}
            icon={<RefreshCw size={18} />}
          >
            Continue setup
          </Button>
        </div>
      </div>
    );
  }

  // ---- State 1: Not started — show the main CTA ---------------------------
  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-1">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Banknote size={20} className="text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-800">Connect your bank to get paid</p>
            <p className="text-sm text-stone-500">
              Set up payouts so earnings go straight to your account.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleSetupPayouts}
          loading={onboarding}
          className="self-start sm:self-auto shrink-0"
        >
          Set up payouts
        </Button>
      </div>
    );
  }

  return (
    <Card padding="lg">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
          <Banknote size={28} className="text-brand-500" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-1">
            Connect your bank to get paid
          </h2>
          <p className="text-stone-600">
            Set up payouts so your earnings go directly to your bank account after each class.
            It&apos;s quick, secure, and powered by Stripe.
          </p>
        </div>
      </div>

      <ul className="space-y-2 mb-6 text-stone-600">
        <li className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-teal-500 shrink-0" aria-hidden="true" />
          Takes about 5 minutes to complete
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-teal-500 shrink-0" aria-hidden="true" />
          Your bank details are kept safe by Stripe — we never see them
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-teal-500 shrink-0" aria-hidden="true" />
          Earnings are paid out automatically after each class
        </li>
      </ul>

      {errorMsg && (
        <p role="alert" className="text-sm text-red-700 mb-4">{errorMsg}</p>
      )}

      <Button
        size="lg"
        onClick={handleSetupPayouts}
        loading={onboarding}
        icon={<Banknote size={20} />}
      >
        Set up payouts
      </Button>
    </Card>
  );
}
