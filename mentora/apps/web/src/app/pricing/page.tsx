'use client';
// Note: metadata is intentionally omitted here (client component).
// The default title from layout.tsx applies.

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight, TrendingUp } from 'lucide-react';
import {
  LEARNER_PLANS,
  TEACHER_PLANS,
  formatPrice,
  COMMISSION,
  splitEarnings,
  type Plan,
} from '@mentora/shared';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import clsx from 'clsx';

function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const price = annual && plan.annualPriceCents != null
    ? plan.annualPriceCents / 12   // monthly equivalent
    : plan.priceCents;
  const isFree = price === 0;
  const billedNote = annual && plan.annualPriceCents != null
    ? `Billed ${formatPrice(plan.annualPriceCents)} per year`
    : plan.interval === 'month' && !isFree
    ? 'Billed monthly'
    : null;

  return (
    <div className={clsx(
      'relative flex flex-col rounded-2xl border-2 transition-shadow',
      plan.popular
        ? 'border-brand-500 shadow-hover bg-white'
        : 'border-surface-200 shadow-card bg-white hover:shadow-hover',
    )}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge variant="brand" size="md" className="px-4 py-1.5 shadow-soft font-bold">
            Most popular
          </Badge>
        </div>
      )}

      <div className="p-8 flex-1 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold text-stone-900">{plan.name}</h3>
          <p className="text-stone-500 mt-1">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-stone-900">
              {isFree ? 'Free' : formatPrice(price)}
            </span>
            {!isFree && (
              <span className="text-stone-500 mb-2 text-lg">/ mo</span>
            )}
          </div>
          {billedNote && (
            <p className="text-sm text-stone-400 mt-1">{billedNote}</p>
          )}
          {annual && plan.annualPriceCents != null && plan.priceCents > 0 && (
            <Badge variant="green" size="sm" className="mt-2">
              Save {formatPrice(plan.priceCents * 12 - plan.annualPriceCents)} per year
            </Badge>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 flex-1">
          {plan.features.map((f) => (
            <li key={f.label} className="flex items-start gap-3">
              {f.included ? (
                <Check
                  size={20}
                  className="text-teal-500 shrink-0 mt-0.5"
                  aria-label="Included"
                />
              ) : (
                <X
                  size={20}
                  className="text-stone-300 shrink-0 mt-0.5"
                  aria-label="Not included"
                />
              )}
              <span
                className={clsx(
                  'text-base',
                  f.included
                    ? f.highlight
                      ? 'font-semibold text-stone-800'
                      : 'text-stone-700'
                    : 'text-stone-400',
                )}
              >
                {f.label}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={isFree ? '/signup' : `/signup?plan=${plan.id}`}
          className="no-underline mt-2"
        >
          <Button
            variant={plan.popular ? 'primary' : 'outline'}
            fullWidth
            size="lg"
            iconEnd={<ArrowRight size={18} />}
          >
            {isFree ? 'Get started free' : `Choose ${plan.name}`}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  // Earnings calculator state
  const [grossInput, setGrossInput] = useState(500);
  const standardSplit = splitEarnings(grossInput * 100, 'standard');
  const proSplit = splitEarnings(grossInput * 100, 'pro');

  return (
    <div className="section">
      <div className="page-container">
        {/* ── Learner plans ── */}
        <div className="text-center mb-12">
          <h1 className="text-stone-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-stone-500 max-w-2xl mx-auto">
            Start free. Upgrade when you&apos;re ready. Cancel any time.
          </p>

          {/* Annual / monthly toggle */}
          <div className="inline-flex items-center gap-4 mt-8 bg-surface-100 rounded-full p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={clsx(
                'px-5 py-2 rounded-full text-sm font-semibold transition-all min-h-[40px]',
                !annual
                  ? 'bg-white text-brand-600 shadow-soft'
                  : 'text-stone-500 hover:text-stone-700',
              )}
              aria-pressed={!annual}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={clsx(
                'px-5 py-2 rounded-full text-sm font-semibold transition-all min-h-[40px] flex items-center gap-2',
                annual
                  ? 'bg-white text-brand-600 shadow-soft'
                  : 'text-stone-500 hover:text-stone-700',
              )}
              aria-pressed={annual}
            >
              Annual
              <Badge variant="green" size="sm">Save up to 17%</Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {LEARNER_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} annual={annual} />
          ))}
        </div>

        {/* ── Teacher plans ── */}
        <div id="teachers" className="text-center mb-12">
          <Badge variant="teal" size="md" className="mb-4">For Mentors</Badge>
          <h2 className="text-stone-900 mb-4">Earn more, keep more</h2>
          <p className="text-lg text-stone-500 max-w-xl mx-auto">
            Mentora takes a small commission so the platform stays free to join.
            You keep the lion&apos;s share.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {TEACHER_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} annual={annual} />
          ))}
        </div>

        {/* ── Earnings calculator ── */}
        <div className="bg-gradient-to-br from-brand-50 to-teal-50 rounded-3xl p-8 md:p-12 border border-brand-100 max-w-3xl mx-auto mb-16">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={28} className="text-brand-500" aria-hidden="true" />
            <h3 className="text-2xl font-bold text-stone-900">Earnings calculator</h3>
          </div>
          <p className="text-stone-600 mb-8">
            See exactly what you&apos;d earn each month. Our commission is simple and fixed.
          </p>

          <div className="mb-8">
            <label
              htmlFor="gross-input"
              className="block text-sm font-semibold text-stone-700 mb-3"
            >
              Monthly gross earnings (USD)
            </label>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-stone-700">$</span>
              <input
                id="gross-input"
                type="range"
                min={100}
                max={5000}
                step={100}
                value={grossInput}
                onChange={(e) => setGrossInput(Number(e.target.value))}
                className="flex-1 h-3 accent-brand-500 cursor-pointer"
                aria-label="Gross monthly earnings in dollars"
              />
              <span className="text-2xl font-bold text-brand-600 min-w-[80px] text-right">
                ${grossInput.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Standard tier */}
            <div className="bg-white rounded-2xl p-6 border border-surface-200">
              <p className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Mentor (free)</p>
              <p className="text-sm text-stone-500 mb-4">
                Mentora keeps {COMMISSION.standard}%
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-600">Platform fee</span>
                  <span className="font-semibold text-stone-800">
                    {formatPrice(standardSplit.platformFeeCents)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-surface-100">
                  <span className="font-bold text-stone-800">Your payout</span>
                  <span className="font-bold text-teal-600 text-xl">
                    {formatPrice(standardSplit.payoutCents)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pro tier */}
            <div className="bg-brand-500 rounded-2xl p-6 text-white border-2 border-brand-400">
              <p className="text-sm font-semibold text-brand-200 uppercase tracking-wide mb-3">Mentor Pro</p>
              <p className="text-sm text-brand-200 mb-4">
                Mentora keeps {COMMISSION.pro}%
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-brand-200">Platform fee</span>
                  <span className="font-semibold text-white">
                    {formatPrice(proSplit.platformFeeCents)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-brand-400">
                  <span className="font-bold text-white">Your payout</span>
                  <span className="font-bold text-accent-300 text-xl">
                    {formatPrice(proSplit.payoutCents)}
                  </span>
                </div>
              </div>
              <Badge className="mt-4 bg-accent-500 text-white border-0" size="sm">
                +{formatPrice(proSplit.payoutCents - standardSplit.payoutCents)} more vs. free
              </Badge>
            </div>
          </div>
        </div>

        {/* FAQ row */}
        <div className="text-center">
          <p className="text-stone-500 mb-4">Questions? We&apos;re real humans.</p>
          <Link href="mailto:hello@mentora.app" className="no-underline">
            <Button variant="ghost" size="lg">Contact support</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
