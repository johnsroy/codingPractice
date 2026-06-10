/**
 * Mentora pricing model.
 *
 * Two sides of the marketplace:
 *  - LEARNERS subscribe to plans for group classrooms + AI tutoring,
 *    and pay-per-session for 1:1 coaching.
 *  - TEACHERS (retired pros) join free and earn. Mentora takes a
 *    commission on paid sessions/courses. A "Mentor Pro" upgrade lowers
 *    the commission and unlocks analytics + a branded storefront.
 *
 * This module is the single source of truth for plans and is consumed by
 * the pricing page, the checkout flow, and the payout/commission engine.
 */

export type BillingInterval = 'month' | 'year' | 'one_time';
export type Audience = 'learner' | 'teacher';

export interface PlanFeature {
  label: string;
  included: boolean;
  /** Optional emphasis for marketing cards. */
  highlight?: boolean;
}

export interface Plan {
  id: string;
  audience: Audience;
  name: string;
  tagline: string;
  /** Price in USD cents. 0 = free. */
  priceCents: number;
  interval: BillingInterval;
  /** Optional annual price in cents (for marketing the discount). */
  annualPriceCents?: number;
  popular?: boolean;
  features: PlanFeature[];
  /** Maps to Stripe Price IDs at runtime (set via env / DB). */
  stripePriceEnv?: string;
}

export const LEARNER_PLANS: Plan[] = [
  {
    id: 'explorer',
    audience: 'learner',
    name: 'Explorer',
    tagline: 'Try Mentora, free forever',
    priceCents: 0,
    interval: 'month',
    features: [
      { label: 'Browse all teachers & courses', included: true },
      { label: '1 free trial group class', included: true, highlight: true },
      { label: '5 AI tutor questions / day', included: true },
      { label: 'Access to free course materials', included: true },
      { label: 'Unlimited group classrooms', included: false },
      { label: '1:1 coaching', included: false },
    ],
  },
  {
    id: 'scholar',
    audience: 'learner',
    name: 'Scholar',
    tagline: 'Everything one learner needs',
    priceCents: 1900,
    annualPriceCents: 19000,
    interval: 'month',
    popular: true,
    stripePriceEnv: 'STRIPE_PRICE_SCHOLAR',
    features: [
      { label: 'Unlimited group classrooms', included: true, highlight: true },
      { label: 'Unlimited AI tutor & homework help', included: true, highlight: true },
      { label: 'All course materials + downloads', included: true },
      { label: 'Progress reports & certificates', included: true },
      { label: 'Discounted 1:1 coaching rates', included: true },
      { label: 'Multiple children', included: false },
    ],
  },
  {
    id: 'family',
    audience: 'learner',
    name: 'Family',
    tagline: 'Up to 4 learners, one bill',
    priceCents: 3900,
    annualPriceCents: 39000,
    interval: 'month',
    stripePriceEnv: 'STRIPE_PRICE_FAMILY',
    features: [
      { label: 'Everything in Scholar', included: true },
      { label: 'Up to 4 child profiles', included: true, highlight: true },
      { label: 'Guardian dashboard & controls', included: true },
      { label: 'Family progress digest', included: true },
      { label: 'Priority support', included: true },
      { label: 'Best 1:1 coaching discount', included: true },
    ],
  },
];

export const TEACHER_PLANS: Plan[] = [
  {
    id: 'mentor-free',
    audience: 'teacher',
    name: 'Mentor',
    tagline: 'Start teaching, keep most of what you earn',
    priceCents: 0,
    interval: 'month',
    features: [
      { label: 'Create unlimited courses', included: true },
      { label: 'Host group classrooms & 1:1 coaching', included: true },
      { label: 'OCR + AI material tools', included: true },
      { label: 'Standard payout (you keep 85%)', included: true, highlight: true },
      { label: 'Advanced analytics', included: false },
      { label: 'Branded teacher storefront', included: false },
    ],
  },
  {
    id: 'mentor-pro',
    audience: 'teacher',
    name: 'Mentor Pro',
    tagline: 'Lower fees + tools to grow your students',
    priceCents: 1200,
    annualPriceCents: 12000,
    interval: 'month',
    popular: true,
    stripePriceEnv: 'STRIPE_PRICE_MENTOR_PRO',
    features: [
      { label: 'Everything in Mentor', included: true },
      { label: 'Reduced commission (you keep 90%)', included: true, highlight: true },
      { label: 'Advanced student analytics', included: true, highlight: true },
      { label: 'Branded storefront & custom link', included: true },
      { label: 'AI lesson-plan & quiz generator (unlimited)', included: true },
      { label: 'Featured placement in search', included: true },
    ],
  },
];

export const ALL_PLANS: Plan[] = [...LEARNER_PLANS, ...TEACHER_PLANS];

export function getPlan(id: string): Plan | undefined {
  return ALL_PLANS.find((p) => p.id === id);
}

/** Commission percentages taken by the platform on paid sessions. */
export const COMMISSION = {
  standard: 15, // Mentor (free) tier
  pro: 10, // Mentor Pro tier
} as const;

/**
 * Split a gross amount (in cents) into platform fee + teacher payout.
 * Used by the payments/payout engine and shown in teacher earnings UI.
 */
export function splitEarnings(
  grossCents: number,
  tier: 'standard' | 'pro' = 'standard'
): { grossCents: number; platformFeeCents: number; payoutCents: number; commissionPct: number } {
  const commissionPct = tier === 'pro' ? COMMISSION.pro : COMMISSION.standard;
  const platformFeeCents = Math.round((grossCents * commissionPct) / 100);
  return {
    grossCents,
    platformFeeCents,
    payoutCents: grossCents - platformFeeCents,
    commissionPct,
  };
}

export function formatPrice(cents: number, currency: Currency | string = 'USD'): string {
  const meta = CURRENCIES.find((c) => c.code === currency);
  return new Intl.NumberFormat(meta?.locale ?? 'en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

// ─── Multi-currency ───────────────────────────────────────────────────────────
// Mentora bills globally via Stripe (cards work in Canada/US/India + 40 more
// countries). Prices are shown in the user's currency; the checkout charges in
// that currency. INR/local methods (UPI) can be layered on for India.

export type Currency = 'USD' | 'CAD' | 'INR';

export interface CurrencyMeta {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  flag: string;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', flag: '🇺🇸' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA', flag: '🇨🇦' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', flag: '🇮🇳' },
];

export const DEFAULT_CURRENCY: Currency = 'USD';

/** Map an ISO country code to its default display currency. */
export function currencyForCountry(country?: string | null): Currency {
  switch ((country ?? '').toUpperCase()) {
    case 'IN':
      return 'INR';
    case 'CA':
      return 'CAD';
    default:
      return 'USD';
  }
}

interface CurrencyPrice {
  monthlyCents: number;
  annualCents: number;
}

/**
 * Localized price points per plan and currency. Not FX conversions — these are
 * intentional, market-adjusted prices (e.g. INR tuned to Indian willingness to
 * pay). Free plans are 0 in every currency.
 */
export const PLAN_PRICES: Record<string, Partial<Record<Currency, CurrencyPrice>>> = {
  scholar: {
    USD: { monthlyCents: 1900, annualCents: 19000 },
    CAD: { monthlyCents: 2500, annualCents: 25000 },
    INR: { monthlyCents: 149900, annualCents: 1499000 }, // ₹1,499 / ₹14,990
  },
  family: {
    USD: { monthlyCents: 3900, annualCents: 39000 },
    CAD: { monthlyCents: 4900, annualCents: 49000 },
    INR: { monthlyCents: 299900, annualCents: 2999000 }, // ₹2,999 / ₹29,990
  },
  'mentor-pro': {
    USD: { monthlyCents: 1200, annualCents: 12000 },
    CAD: { monthlyCents: 1500, annualCents: 15000 },
    INR: { monthlyCents: 99900, annualCents: 999000 }, // ₹999 / ₹9,990
  },
};

/** Price (in minor units) for a plan in a given currency + interval. */
export function getPlanPriceCents(
  planId: string,
  currency: Currency = DEFAULT_CURRENCY,
  interval: 'month' | 'year' = 'month'
): number {
  const plan = getPlan(planId);
  if (!plan || plan.priceCents === 0) return 0;
  const localized = PLAN_PRICES[planId]?.[currency];
  if (localized) {
    return interval === 'year' ? localized.annualCents : localized.monthlyCents;
  }
  // Fallback to the canonical USD amounts on the plan.
  return interval === 'year' ? plan.annualPriceCents ?? plan.priceCents * 10 : plan.priceCents;
}

/** Convenience: formatted localized price for a plan. */
export function formatPlanPrice(
  planId: string,
  currency: Currency = DEFAULT_CURRENCY,
  interval: 'month' | 'year' = 'month'
): string {
  return formatPrice(getPlanPriceCents(planId, currency, interval), currency);
}
