'use client';
// Note: metadata is intentionally omitted here (client component).
// The default title from layout.tsx applies.

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check, X, ArrowRight, TrendingUp, Sparkles, Shield, Star,
} from 'lucide-react';
import {
  LEARNER_PLANS,
  TEACHER_PLANS,
  CURRENCIES,
  formatPrice,
  COMMISSION,
  splitEarnings,
  getPlanPriceCents,
  type Plan,
  type Currency,
} from '@mentora/shared';
import { paymentsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CurrencySwitcher } from '@/components/CurrencySwitcher';
import { useCurrencyState } from '@/lib/currency';
import clsx from 'clsx';

function PlanCard({
  plan,
  annual,
  currency,
}: {
  plan: Plan;
  annual: boolean;
  currency: Currency;
}) {
  const priceCents = plan.priceCents === 0
    ? 0
    : getPlanPriceCents(plan.id, currency, annual ? 'year' : 'month');

  // Monthly display price
  const displayCents = annual && priceCents > 0
    ? Math.round(priceCents / 12)
    : priceCents;

  const isFree = priceCents === 0;

  // Annual total for billed note
  const annualTotal = annual && priceCents > 0
    ? formatPrice(priceCents, currency)
    : null;

  // Savings vs monthly × 12
  const monthlyCents = plan.priceCents === 0
    ? 0
    : getPlanPriceCents(plan.id, currency, 'month');
  const savingsCents = annual && monthlyCents > 0
    ? monthlyCents * 12 - priceCents
    : 0;

  async function handleCheckout() {
    try {
      const res = await paymentsApi.checkout({
        kind: 'subscription',
        planId: plan.id,
        interval: annual ? 'year' : 'month',
        currency,
      });
      if (res.url) window.location.href = res.url;
    } catch {
      // Error handled by toast upstream; here we just guard
    }
  }

  return (
    <div
      className={clsx(
        'relative flex flex-col rounded-3xl border-2 transition-all duration-300',
        plan.popular
          ? 'border-brand-500 shadow-lift bg-white scale-[1.02]'
          : 'border-surface-200 shadow-card bg-white hover:shadow-lift hover:-translate-y-1',
      )}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="eyebrow bg-brand-500 text-white border-brand-400 shadow-glow text-sm font-bold px-5 py-1.5">
            <Star size={13} aria-hidden="true" />
            Most popular
          </span>
        </div>
      )}

      {/* Accent bar */}
      {plan.popular && (
        <div className="h-1.5 bg-brand-gradient rounded-t-3xl" aria-hidden="true" />
      )}

      <div className="p-8 flex-1 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h3 className="text-ink-900">{plan.name}</h3>
          <p className="text-ink-700 mt-1 text-base">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-ink-900 tracking-tight">
              {isFree ? 'Free' : formatPrice(displayCents, currency)}
            </span>
            {!isFree && (
              <span className="text-ink-700 mb-2 text-lg">/ mo</span>
            )}
          </div>
          {annualTotal && (
            <p className="text-sm text-ink-700 mt-1">
              Billed {annualTotal} per year
            </p>
          )}
          {annual && savingsCents > 0 && (
            <Badge variant="green" size="sm" className="mt-2">
              Save {formatPrice(savingsCents, currency)} per year
            </Badge>
          )}
          {!annual && !isFree && (
            <p className="text-xs text-ink-700 mt-1 opacity-70">Billed monthly</p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 flex-1" role="list">
          {plan.features.map((f) => (
            <li key={f.label} className="flex items-start gap-3">
              {f.included ? (
                <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="text-teal-600" aria-label="Included" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-surface-100 flex items-center justify-center shrink-0 mt-0.5">
                  <X size={12} className="text-surface-300" aria-label="Not included" />
                </div>
              )}
              <span
                className={clsx(
                  'text-base leading-snug',
                  f.included
                    ? f.highlight
                      ? 'font-semibold text-ink-800'
                      : 'text-ink-700'
                    : 'text-ink-700 opacity-40',
                )}
              >
                {f.label}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {isFree ? (
          <Link href="/signup" className="no-underline mt-2">
            <Button variant="outline" fullWidth size="lg" iconEnd={<ArrowRight size={18} />}>
              Get started free
            </Button>
          </Link>
        ) : (
          <Button
            variant={plan.popular ? 'primary' : 'outline'}
            fullWidth
            size="lg"
            iconEnd={<ArrowRight size={18} />}
            className={plan.popular ? 'btn-sheen mt-2' : 'mt-2'}
            onClick={handleCheckout}
          >
            Choose {plan.name}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const { currency, setCurrency, detected } = useCurrencyState();

  // Earnings calculator
  const [grossInput, setGrossInput] = useState(500);
  const standardSplit = splitEarnings(grossInput * 100, 'standard');
  const proSplit = splitEarnings(grossInput * 100, 'pro');

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-warm pointer-events-none" aria-hidden="true" />
        <div className="grid-dots absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="blob w-[500px] h-[500px] bg-brand-200/20 -top-32 -left-32 animate-float" aria-hidden="true" />
        <div className="blob w-[400px] h-[400px] bg-teal-200/15 -bottom-20 -right-20 animate-float-slow" aria-hidden="true" />

        <div className="page-container relative text-center">
          <span className="eyebrow mb-6">
            <Sparkles size={14} aria-hidden="true" />
            Transparent, learner-first pricing
          </span>
          <h1 className="text-ink-900 mb-5 text-balance animate-fade-up">
            Simple pricing,{' '}
            <span className="text-gradient">serious learning</span>
          </h1>
          <p className="text-xl text-ink-700 max-w-2xl mx-auto mb-10 animate-fade-up delay-75">
            Start free. Upgrade when you&apos;re ready. Cancel any time.
            Every plan gives your child access to retired professionals who&apos;ve mastered their field.
          </p>

          {/* Controls row: toggle + currency switcher */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up delay-150">
            {/* Annual / Monthly toggle */}
            <div className="inline-flex items-center gap-1 bg-surface-100 rounded-full p-1.5 shadow-soft">
              <button
                onClick={() => setAnnual(false)}
                className={clsx(
                  'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 min-h-[40px]',
                  !annual
                    ? 'bg-white text-brand-600 shadow-soft'
                    : 'text-ink-700 hover:text-ink-900',
                )}
                aria-pressed={!annual}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={clsx(
                  'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 min-h-[40px] flex items-center gap-2',
                  annual
                    ? 'bg-white text-brand-600 shadow-soft'
                    : 'text-ink-700 hover:text-ink-900',
                )}
                aria-pressed={annual}
              >
                Annual
                <Badge variant="green" size="sm">Save up to 17%</Badge>
              </button>
            </div>

            {/* Currency switcher */}
            <CurrencySwitcher value={currency} onChange={setCurrency} />
          </div>

          {/* Regional pricing note */}
          {(() => {
            const detectedMeta = CURRENCIES.find((c) => c.code === detected);
            return detectedMeta ? (
              <p className="text-sm text-ink-700 mt-5 animate-fade-up delay-200 opacity-80">
                Prices shown in{' '}
                <strong className="font-semibold text-ink-900">
                  {detectedMeta.flag} {detectedMeta.code}
                </strong>
                {' '}— adjusted for your region.
              </p>
            ) : null;
          })()}
        </div>
      </section>

      {/* ── Learner plans ── */}
      <section className="section py-8 lg:py-16">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="eyebrow mb-4">For learners</span>
            <h2 className="text-ink-900">Choose your learning plan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-28">
            {LEARNER_PLANS.map((plan, idx) => (
              <div
                key={plan.id}
                className="animate-fade-up"
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                <PlanCard plan={plan} annual={annual} currency={currency} />
              </div>
            ))}
          </div>

          {/* ── Teacher plans ── */}
          <div id="teachers" className="text-center mb-14">
            <span className="eyebrow mb-4">
              <Shield size={14} aria-hidden="true" />
              For mentors
            </span>
            <h2 className="text-ink-900 mb-4">Earn more, keep more</h2>
            <p className="text-lg text-ink-700 max-w-xl mx-auto">
              Mentora takes a small commission so the platform stays free to join.
              You keep the lion&apos;s share.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">
            {TEACHER_PLANS.map((plan, idx) => (
              <div
                key={plan.id}
                className="animate-fade-up"
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                <PlanCard plan={plan} annual={annual} currency={currency} />
              </div>
            ))}
          </div>

          {/* ── Earnings calculator ── */}
          <div className="relative rounded-3xl overflow-hidden max-w-3xl mx-auto mb-20 animate-fade-up">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-teal-50" aria-hidden="true" />
            <div className="relative p-8 md:p-12 border border-brand-100 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center">
                  <TrendingUp size={24} className="text-brand-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-ink-900">Earnings calculator</h3>
                  <p className="text-sm text-ink-700">See exactly what you&apos;d take home</p>
                </div>
              </div>

              <div className="mb-8">
                <label
                  htmlFor="gross-input"
                  className="block text-sm font-semibold text-ink-800 mb-3"
                >
                  Monthly gross earnings (USD)
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-ink-700">$</span>
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
                  <span className="text-2xl font-bold text-brand-600 min-w-[90px] text-right">
                    ${grossInput.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Standard tier */}
                <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-soft">
                  <p className="text-xs font-bold text-ink-700 uppercase tracking-widest mb-1">Mentor (free)</p>
                  <p className="text-sm text-ink-700 mb-4">
                    Platform keeps {COMMISSION.standard}%
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-700">Platform fee</span>
                      <span className="font-semibold text-ink-800">
                        {formatPrice(standardSplit.platformFeeCents)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2.5 border-t border-surface-100">
                      <span className="font-bold text-ink-800">Your payout</span>
                      <span className="font-bold text-teal-600 text-xl">
                        {formatPrice(standardSplit.payoutCents)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pro tier */}
                <div className="bg-brand-gradient rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-accent-400 text-white border-0 shadow-glow-amber" size="sm">
                      Best value
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-brand-200 uppercase tracking-widest mb-1">Mentor Pro</p>
                  <p className="text-sm text-brand-200 mb-4">
                    Platform keeps {COMMISSION.pro}%
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-200">Platform fee</span>
                      <span className="font-semibold text-white">
                        {formatPrice(proSplit.platformFeeCents)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2.5 border-t border-brand-400/50">
                      <span className="font-bold text-white">Your payout</span>
                      <span className="font-bold text-accent-300 text-xl">
                        {formatPrice(proSplit.payoutCents)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-brand-200 mt-3">
                    +{formatPrice(proSplit.payoutCents - standardSplit.payoutCents)} more vs. free tier
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── FAQ / support ── */}
          <div className="text-center animate-fade-up">
            <p className="text-ink-700 mb-5 text-lg">Questions? We&apos;re real humans — not a chatbot.</p>
            <Link href="mailto:hello@mentora.app" className="no-underline">
              <Button variant="ghost" size="lg">
                Contact support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
