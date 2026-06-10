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

export type Currency =
  | 'USD' | 'CAD' | 'GBP' | 'EUR' | 'AUD' | 'AED' | 'SGD'
  | 'INR' | 'PKR' | 'BDT' | 'LKR' | 'NPR'
  | 'NGN' | 'KES' | 'ZAR' | 'EGP'
  | 'PHP' | 'IDR' | 'VND'
  | 'BRL' | 'MXN';

/** Economic tier (affordability band) — used for display + the PPP rationale. */
export type EconomicTier = 'T1' | 'T2' | 'T3' | 'T4';

export interface CurrencyMeta {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  flag: string;
  tier: EconomicTier;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: 'USD', symbol: '$',    name: 'US Dollar',          locale: 'en-US', flag: '🇺🇸', tier: 'T1' },
  { code: 'CAD', symbol: 'CA$',  name: 'Canadian Dollar',    locale: 'en-CA', flag: '🇨🇦', tier: 'T1' },
  { code: 'GBP', symbol: '£',    name: 'British Pound',      locale: 'en-GB', flag: '🇬🇧', tier: 'T1' },
  { code: 'EUR', symbol: '€',    name: 'Euro',               locale: 'en-IE', flag: '🇪🇺', tier: 'T1' },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar',  locale: 'en-AU', flag: '🇦🇺', tier: 'T1' },
  { code: 'AED', symbol: 'AED',  name: 'UAE Dirham',         locale: 'en-AE', flag: '🇦🇪', tier: 'T1' },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar',   locale: 'en-SG', flag: '🇸🇬', tier: 'T1' },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real',     locale: 'pt-BR', flag: '🇧🇷', tier: 'T2' },
  { code: 'MXN', symbol: 'MX$',  name: 'Mexican Peso',       locale: 'es-MX', flag: '🇲🇽', tier: 'T2' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand', locale: 'en-ZA', flag: '🇿🇦', tier: 'T2' },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee',       locale: 'en-IN', flag: '🇮🇳', tier: 'T3' },
  { code: 'PHP', symbol: '₱',    name: 'Philippine Peso',    locale: 'en-PH', flag: '🇵🇭', tier: 'T3' },
  { code: 'IDR', symbol: 'Rp',   name: 'Indonesian Rupiah',  locale: 'id-ID', flag: '🇮🇩', tier: 'T3' },
  { code: 'VND', symbol: '₫',    name: 'Vietnamese Dong',    locale: 'vi-VN', flag: '🇻🇳', tier: 'T3' },
  { code: 'EGP', symbol: 'E£',   name: 'Egyptian Pound',     locale: 'en-EG', flag: '🇪🇬', tier: 'T3' },
  { code: 'LKR', symbol: 'Rs',   name: 'Sri Lankan Rupee',   locale: 'en-LK', flag: '🇱🇰', tier: 'T3' },
  { code: 'PKR', symbol: '₨',    name: 'Pakistani Rupee',    locale: 'en-PK', flag: '🇵🇰', tier: 'T4' },
  { code: 'BDT', symbol: '৳',    name: 'Bangladeshi Taka',   locale: 'en-BD', flag: '🇧🇩', tier: 'T4' },
  { code: 'NPR', symbol: 'रू',    name: 'Nepalese Rupee',     locale: 'en-NP', flag: '🇳🇵', tier: 'T4' },
  { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira',     locale: 'en-NG', flag: '🇳🇬', tier: 'T4' },
  { code: 'KES', symbol: 'KSh',  name: 'Kenyan Shilling',    locale: 'en-KE', flag: '🇰🇪', tier: 'T4' },
];

export const DEFAULT_CURRENCY: Currency = 'USD';

const EU_EURO_COUNTRIES = ['AT','BE','CY','EE','FI','FR','DE','GR','IE','IT','LV','LT','LU','MT','NL','PT','SK','SI','ES'];

/** ISO-3166 alpha-2 country → display currency. Falls back to USD. */
export const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', NZ: 'AUD',
  AE: 'AED', SA: 'AED', QA: 'AED', SG: 'SGD',
  IN: 'INR', PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR',
  NG: 'NGN', KE: 'KES', ZA: 'ZAR', EG: 'EGP',
  PH: 'PHP', ID: 'IDR', VN: 'VND',
  BR: 'BRL', MX: 'MXN',
  ...Object.fromEntries(EU_EURO_COUNTRIES.map((c) => [c, 'EUR' as Currency])),
};

/** Map an ISO country code to its display currency (USD fallback). */
export function currencyForCountry(country?: string | null): Currency {
  return COUNTRY_TO_CURRENCY[(country ?? '').toUpperCase()] ?? DEFAULT_CURRENCY;
}

/** Currency metadata lookup with a safe USD default. */
export function currencyMeta(code: Currency): CurrencyMeta {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]!;
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
    USD: { monthlyCents: 1900,    annualCents: 19000 },
    CAD: { monthlyCents: 2500,    annualCents: 25000 },
    GBP: { monthlyCents: 1500,    annualCents: 15000 },
    EUR: { monthlyCents: 1700,    annualCents: 17000 },
    AUD: { monthlyCents: 2700,    annualCents: 27000 },
    AED: { monthlyCents: 6900,    annualCents: 69000 },
    SGD: { monthlyCents: 2500,    annualCents: 25000 },
    BRL: { monthlyCents: 4900,    annualCents: 49000 },
    MXN: { monthlyCents: 19900,   annualCents: 199000 },
    ZAR: { monthlyCents: 19900,   annualCents: 199000 },
    INR: { monthlyCents: 149900,  annualCents: 1499000 },   // ₹1,499
    PHP: { monthlyCents: 49900,   annualCents: 499000 },    // ₱499
    IDR: { monthlyCents: 9900000, annualCents: 99000000 },  // Rp99,000
    VND: { monthlyCents: 14900000,annualCents: 149000000 }, // ₫149,000
    EGP: { monthlyCents: 49900,   annualCents: 499000 },
    LKR: { monthlyCents: 249000,  annualCents: 2490000 },
    PKR: { monthlyCents: 199900,  annualCents: 1999000 },   // ₨1,999
    BDT: { monthlyCents: 149900,  annualCents: 1499000 },   // ৳1,499
    NPR: { monthlyCents: 199900,  annualCents: 1999000 },
    NGN: { monthlyCents: 450000,  annualCents: 4500000 },   // ₦4,500
    KES: { monthlyCents: 120000,  annualCents: 1200000 },   // KSh1,200
  },
  family: {
    USD: { monthlyCents: 3900,    annualCents: 39000 },
    CAD: { monthlyCents: 4900,    annualCents: 49000 },
    GBP: { monthlyCents: 3100,    annualCents: 31000 },
    EUR: { monthlyCents: 3500,    annualCents: 35000 },
    AUD: { monthlyCents: 5500,    annualCents: 55000 },
    AED: { monthlyCents: 14900,   annualCents: 149000 },
    SGD: { monthlyCents: 4900,    annualCents: 49000 },
    BRL: { monthlyCents: 9900,    annualCents: 99000 },
    MXN: { monthlyCents: 39900,   annualCents: 399000 },
    ZAR: { monthlyCents: 39900,   annualCents: 399000 },
    INR: { monthlyCents: 299900,  annualCents: 2999000 },   // ₹2,999
    PHP: { monthlyCents: 99900,   annualCents: 999000 },
    IDR: { monthlyCents: 19900000,annualCents: 199000000 },
    VND: { monthlyCents: 29900000,annualCents: 299000000 },
    EGP: { monthlyCents: 99900,   annualCents: 999000 },
    LKR: { monthlyCents: 499000,  annualCents: 4990000 },
    PKR: { monthlyCents: 399900,  annualCents: 3999000 },
    BDT: { monthlyCents: 299900,  annualCents: 2999000 },
    NPR: { monthlyCents: 399900,  annualCents: 3999000 },
    NGN: { monthlyCents: 890000,  annualCents: 8900000 },
    KES: { monthlyCents: 240000,  annualCents: 2400000 },
  },
  'mentor-pro': {
    USD: { monthlyCents: 1200,    annualCents: 12000 },
    CAD: { monthlyCents: 1500,    annualCents: 15000 },
    GBP: { monthlyCents: 900,     annualCents: 9000 },
    EUR: { monthlyCents: 1100,    annualCents: 11000 },
    AUD: { monthlyCents: 1700,    annualCents: 17000 },
    AED: { monthlyCents: 4500,    annualCents: 45000 },
    SGD: { monthlyCents: 1500,    annualCents: 15000 },
    BRL: { monthlyCents: 2900,    annualCents: 29000 },
    MXN: { monthlyCents: 12900,   annualCents: 129000 },
    ZAR: { monthlyCents: 12900,   annualCents: 129000 },
    INR: { monthlyCents: 99900,   annualCents: 999000 },    // ₹999
    PHP: { monthlyCents: 29900,   annualCents: 299000 },
    IDR: { monthlyCents: 6500000, annualCents: 65000000 },
    VND: { monthlyCents: 9900000, annualCents: 99000000 },
    EGP: { monthlyCents: 29900,   annualCents: 299000 },
    LKR: { monthlyCents: 149000,  annualCents: 1490000 },
    PKR: { monthlyCents: 129900,  annualCents: 1299000 },
    BDT: { monthlyCents: 99900,   annualCents: 999000 },
    NPR: { monthlyCents: 129900,  annualCents: 1299000 },
    NGN: { monthlyCents: 290000,  annualCents: 2900000 },
    KES: { monthlyCents: 79000,   annualCents: 790000 },
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
