# Mentora — PPP / Region-Based Pricing Spec

> **Audience:** Engineering team implementing `@mentora/shared` pricing config + checkout logic. This is an implementation-ready specification. Do not modify without a product decision; pricing changes require a version bump in shared config.

---

## 1. What Is PPP Pricing and Why It Matters

**Purchasing Power Parity (PPP)** is the exchange rate at which the same basket of goods costs the same in two countries. A USD $19 subscription is not equally accessible everywhere:

| Country | Monthly USD $19 as % of average monthly wage (approx) |
|---|---|
| United States | ~0.1% of avg wage |
| Canada | ~0.12% of avg wage |
| India | ~1.5–2.5% of avg wage |
| Nigeria | ~5–8% of avg wage |
| Nepal | ~6–10% of avg wage |

> Sources: [World Bank PPP conversion factor data](https://data.worldbank.org/indicator/PA.NUS.PPP) · [IMF World Economic Outlook GDP per capita PPP](https://www.imf.org/external/datamapper/PPPPC@WEO) · [Worldometers GDP per Capita 2024](https://www.worldometers.info/gdp/gdp-per-capita/)

At USD $19, a typical Indian family earning ₹40,000/month would spend ~4% of household income on a single child's subscription — a high friction point. The same family will readily pay ₹1,499/month (~3.7% of income), and this price-to-income ratio still generates meaningful revenue at scale.

**Business case for PPP pricing:**
- Companies implementing localized pricing see approximately **30% higher growth rates** than those that don't. ([Mirava](https://www.mirava.io/blog/regional-pricing-subscriptions-best-practices))
- Spotify India at ~$3.50/mo (vs $9.99 US) drove mass subscriber acquisition without undermining US pricing.
- Netflix India mobile-only at ~$2.70/mo accounted for ~50% of new subscriber additions after launch.
- PPP pricing converts markets that would otherwise generate **$0 revenue** — a 20% margin on ₹1,499 is infinitely better than 0% conversion at $19.

**Anti-cannibalisation principle:** Prices are denominated in local currency, displayed only on the local-language/region landing page, and enforced at checkout via payment-method country detection. There is no publicly visible cross-country price comparison on Mentora's own surfaces.

---

## 2. Tier Definitions

| Economic Tier | Description | Approximate GDP per Capita PPP Range (int'l $) | PPP Factor vs US Base |
|---|---|---|---|
| **T1 — High income** | US, CA, GB, AU, DE, FR, SG, AE | > $35,000 | 1.00 (US base) to ~0.70 |
| **T2 — Upper-middle income** | BR, MX, ZA, MY | $15,000–$35,000 | 0.40–0.55 |
| **T3 — Lower-middle income** | IN, PH, ID, VN, EG, LK | $7,000–$15,000 | 0.20–0.35 |
| **T4 — Low income** | PK, BD, NG, KE, NP | < $7,000 | 0.12–0.22 |

> GDP per capita PPP figures sourced from IMF World Economic Outlook April 2026 data as published on [Worldometers](https://www.worldometers.info/gdp/gdp-per-capita/) and [Wikipedia List of countries by GDP PPP per capita](https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(PPP)_per_capita). All tier assignments are approximate; review annually.

---

## 3. The PPP Price Table

### Base Prices (US, T1 = 1.0)
- **Scholar** (1 child): USD $19.00/mo
- **Family** (up to 4 children): USD $39.00/mo
- **Mentor Pro** (teacher): USD $12.00/mo

### How to Read the Table
- **PPP Factor:** multiply US base price by this factor to get the theoretical PPP-adjusted price before local rounding.
- **Localized price:** the "pretty number" after rounding + local anchoring conventions that engineers should hard-code.
- **Currency code / symbol:** ISO 4217 code; use symbol in UI display.

---

### Full PPP Price Table

| # | Country | ISO | Currency | Symbol | Tier | PPP Factor | Scholar (base $19) — calc | Scholar Localized | Family (base $39) — calc | Family Localized | Mentor Pro (base $12) — calc | Mentor Pro Localized |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | United States | US | USD | $ | T1 | 1.00 | $19.00 | **$19** | $39.00 | **$39** | $12.00 | **$12** |
| 2 | Canada | CA | CAD | CA$ | T1 | 0.90 | CA$17.10 | **CA$17** | CA$35.10 | **CA$35** | CA$10.80 | **CA$11** |
| 3 | United Kingdom | GB | GBP | £ | T1 | 0.82 | £15.58 | **£15** | £31.98 | **£32** | £9.84 | **£10** |
| 4 | Germany | DE | EUR | € | T1 | 0.82 | €15.58 | **€15** | €31.98 | **€32** | €9.84 | **€10** |
| 5 | France | FR | EUR | € | T1 | 0.80 | €15.20 | **€15** | €31.20 | **€31** | €9.60 | **€10** |
| 6 | Australia | AU | AUD | A$ | T1 | 0.80 | A$15.20 | **A$15** | A$31.20 | **A$31** | A$9.60 | **A$10** |
| 7 | United Arab Emirates | AE | AED | د.إ | T1 | 0.72 | AED 13.68 | **AED 69** | AED 28.08 | **AED 139** | AED 8.64 | **AED 44** |
| 8 | Singapore | SG | SGD | S$ | T1 | 0.68 | S$12.92 | **S$13** | S$26.52 | **S$27** | S$8.16 | **S$8** |
| 9 | Brazil | BR | BRL | R$ | T2 | 0.50 | R$9.50 | **R$29** | R$19.50 | **R$59** | R$6.00 | **R$19** |
| 10 | Mexico | MX | MXN | $ | T2 | 0.48 | MXN 9.12 | **MXN 179** | MXN 18.72 | **MXN 369** | MXN 5.76 | **MXN 119** |
| 11 | South Africa | ZA | ZAR | R | T2 | 0.42 | R7.98 | **R149** | R16.38 | **R299** | R5.04 | **R99** |
| 12 | India | IN | INR | ₹ | T3 | 0.32 | ₹608 | **₹1,499** | ₹1,248 | **₹2,999** | ₹384 | **₹999** |
| 13 | Philippines | PH | PHP | ₱ | T3 | 0.30 | ₱5.70 | **₱499** | ₱11.70 | **₱999** | ₱3.60 | **₱349** |
| 14 | Indonesia | ID | IDR | Rp | T3 | 0.28 | Rp 53,200 | **Rp 79,000** | Rp 109,200 | **Rp 159,000** | Rp 33,600 | **Rp 49,000** |
| 15 | Vietnam | VN | VND | ₫ | T3 | 0.28 | ₫532,000 | **₫99,000** | ₫1,092,000 | **₫199,000** | ₫336,000 | **₫69,000** |
| 16 | Egypt | EG | EGP | ج.م | T3 | 0.25 | EGP 4.75 | **EGP 179** | EGP 9.75 | **EGP 369** | EGP 3.00 | **EGP 119** |
| 17 | Sri Lanka | LK | LKR | Rs | T3 | 0.22 | LKR 418 | **LKR 1,499** | LKR 858 | **LKR 2,999** | LKR 264 | **LKR 999** |
| 18 | Pakistan | PK | PKR | ₨ | T4 | 0.18 | ₨342 | **₨999** | ₨702 | **₨1,999** | ₨216 | **₨699** |
| 19 | Bangladesh | BD | BDT | ৳ | T4 | 0.17 | ৳323 | **৳799** | ৳663 | **৳1,599** | ৳204 | **৳499** |
| 20 | Nigeria | NG | NGN | ₦ | T4 | 0.14 | ₦2,660 | **₦4,500** | ₦5,460 | **₦8,999** | ₦1,680 | **₦2,999** |
| 21 | Kenya | KE | KES | KSh | T4 | 0.15 | KSh 285 | **KSh 499** | KSh 585 | **KSh 999** | KSh 180 | **KSh 349** |
| 22 | Nepal | NP | NPR | रू | T4 | 0.14 | NPR 266 | **NPR 799** | NPR 546 | **NPR 1,599** | NPR 168 | **NPR 499** |

> **Note on India Scholar/Family:** The localized prices (₹1,499 and ₹2,999) are set *above* the raw PPP-calculated floor (₹608 / ₹1,248) and slightly below the direct USD conversion (₹1,590 / ₹3,260 at ~₹84/USD). This is intentional: the prices are competitively positioned vs. local tuition centres (₹500–₹2,500/mo per subject) while remaining psychologically accessible. The PPP factor is used as a floor, not a ceiling.

> **Note on AED (UAE):** AED prices are shown in the table as AED values; these translate to per-month charges. The AED is pegged to USD at ~3.67 AED/USD; the adjustment reflects PPP/cost-of-living rather than pure exchange rate.

> **Note on VND (Vietnam):** The localized VND prices are rounded down below the raw PPP calc to hit psychologically anchored "99,000 / 199,000 / 69,000" price points — standard practice for Vietnamese consumer apps.

---

## 4. Rounding and Anchoring Conventions by Currency

| Currency | Convention | Example |
|---|---|---|
| **USD / CAD / GBP / EUR / AUD / SGD** | Round to nearest whole dollar; use $X not $X.99 for B2C simplicity; exception: .99 anchoring acceptable for these if A/B tested | $19, £15, €15, CA$17 |
| **INR (₹)** | Always end in ₹,X99 or ₹,X49 (e.g. ₹1,499 not ₹1,500); use comma as thousands separator (Indian lakh format: ₹14,990 not ₹14990) | ₹1,499 / ₹2,999 / ₹999 |
| **PKR / BDT / LKR / NPR** | Round to nearest ₨/৳/Rs/रू 99 or nearest 99 ending; thousands comma | ₨999, ৳799, LKR 1,499, NPR 799 |
| **NGN (₦)** | Round to nearest ₦500 or ₦999; no paise equivalent | ₦4,500 / ₦8,999 / ₦2,999 |
| **KES (KSh)** | Round to nearest KSh 49 or KSh 99 | KSh 499 / KSh 999 / KSh 349 |
| **PHP (₱)** | Round to nearest ₱49 or ₱99; anchor on ₱499 family of numbers | ₱499 / ₱999 / ₱349 |
| **IDR (Rp)** | Round to nearest Rp 1,000; use format Rp XX,000 | Rp 79,000 / Rp 159,000 / Rp 49,000 |
| **VND (₫)** | Round to nearest ₫1,000; anchor on X9,000 pattern (₫99,000 family) | ₫99,000 / ₫199,000 / ₫69,000 |
| **BRL (R$)** | Round to nearest R$9 | R$29 / R$59 / R$19 |
| **MXN ($)** | Round to nearest MXN 9; use MXN prefix to avoid $ ambiguity | MXN 179 / MXN 369 / MXN 119 |
| **ZAR (R)** | Round to nearest R49 or R99 | R149 / R299 / R99 |
| **EGP (ج.م)** | Round to nearest EGP 9 | EGP 179 / EGP 369 / EGP 119 |
| **AED (د.إ)** | Round to nearest AED 1; monthly display in AED | AED 69 / AED 139 / AED 44 |

---

## 5. VAT / GST Display Note

> **Engineering note:** Display prices as shown in the table. Taxes are jurisdiction-specific and must be added at checkout, not absorbed into the listed price, except where local law mandates tax-inclusive display (e.g., Australia GST, India GST for digital services).

| Jurisdiction | Tax Treatment | Note |
|---|---|---|
| **India** | 18% GST on digital services (OIDAR rules) | Add GST at checkout; display "₹1,499 + GST" or show ₹1,769 all-inclusive depending on UX decision; all Indian EdTech competitors show ex-GST pricing |
| **Australia** | 10% GST; must be included in displayed price | Adjust AUD prices to include GST in the listed localized price |
| **UK** | 20% VAT; UK VAT registered once threshold crossed | Add at checkout; consider displaying inc-VAT once VAT registered |
| **EU (DE, FR, etc.)** | 20% VAT; use OSS registration | Add at checkout per country VAT rate; Stripe Tax can handle this automatically |
| **Canada** | 5% GST + provincial tax varies | Add at checkout |
| **UAE** | 5% VAT | Add at checkout |
| **Brazil** | Complex; multiple federal/state taxes | Use a Brazilian payment provider (e.g., Stripe Brazil or Pagar.me) to handle tax compliance |
| **Singapore** | 9% GST | Add at checkout |
| **All T4 countries** | Varies; many have no digital services VAT | Check per-country; default to no tax until revenue threshold crossed |

---

## 6. Anti-Abuse Policy

PPP pricing requires guardrails to prevent high-income users from accessing low-income country pricing.

### 6.1 Source of Truth for Pricing: Payment Method Country

**The country of the card-issuing bank (or UPI/wallet registration) at checkout is the authoritative source for which price to apply.** This is enforced by Stripe/Razorpay billing address + card BIN lookup.

- A user with an Indian IP address but a US credit card is charged the US price.
- A user with a US IP but an Indian UPI account is charged the Indian price.
- VPN IP detection is used as a secondary signal only (log it; do not use it as the primary price gate).

### 6.2 Manual Override

- Users may select a different currency at checkout (e.g., an NRI in India who prefers to pay in USD).
- If they choose a higher-priced currency than their detected country, allow it (they are paying more — no abuse).
- If they choose a lower-priced currency than their payment method country, require their payment method to be issued in that country (enforce at payment processor level).

### 6.3 Subscription Lock

- Once a subscription is created at a given currency/price, the price is locked for that billing cycle.
- On renewal, re-validate payment method country. If mismatch is detected (card country changed), prompt re-validation before next renewal.
- Grandfathered pricing: if a country's price tier changes (annual review), existing subscribers are grandfathered for 12 months with 90-day advance notice.

### 6.4 No Public Cross-Country Price Display

- India landing page (`/in`): shows INR only.
- US landing page (`/us` or default): shows USD only.
- No `<meta>` tags or JSON-LD that expose all country prices simultaneously.
- No public "pricing for all countries" page — this reduces incentive for abuse and protects pricing differentiation.

### 6.5 Annual Review

- Review PPP factors and localized prices annually in Q1 (January).
- Trigger: if any country's exchange rate moves > 15% vs USD since last review, or World Bank publishes a new ICP round, update the table.
- Increment the config version in `@mentora/shared` with each change; log the change in a `PRICING_CHANGELOG.md`.

---

## 7. Engineering Implementation Notes

### 7.1 Where to Encode This Table

Encode the table as a TypeScript constant in `@mentora/shared/src/pricing/ppp-config.ts`:

```typescript
// @mentora/shared/src/pricing/ppp-config.ts
// AUTO-GENERATED from PPP_PRICING.md — do not edit manually; run `pnpm gen:pricing`

export type EconomicTier = 'T1' | 'T2' | 'T3' | 'T4';

export interface CountryPricing {
  countryCode: string;       // ISO 3166-1 alpha-2
  currencyCode: string;      // ISO 4217
  currencySymbol: string;
  tier: EconomicTier;
  pppFactor: number;         // relative to US = 1.0
  plans: {
    scholar:    { amount: number; displayPrice: string };
    family:     { amount: number; displayPrice: string };
    mentorPro:  { amount: number; displayPrice: string };
  };
}

export const PPP_PRICING: CountryPricing[] = [
  {
    countryCode: 'US', currencyCode: 'USD', currencySymbol: '$',
    tier: 'T1', pppFactor: 1.00,
    plans: {
      scholar:   { amount: 1900,  displayPrice: '$19'        },
      family:    { amount: 3900,  displayPrice: '$39'        },
      mentorPro: { amount: 1200,  displayPrice: '$12'        },
    },
  },
  // ... remaining countries as per table above
];
```

- `amount` is in the **smallest currency unit** (cents for USD, paise for INR, etc.) — standard Stripe/Razorpay convention.
- `displayPrice` is the human-readable string rendered in the UI.
- For INR, amounts are in paise: ₹1,499 = `149900`.
- For IDR and VND (no sub-units), `amount` = full unit value (Rp 79,000 = `79000`).

### 7.2 Checkout Flow

```
1. User clicks "Subscribe"
2. Detect billing country:
   a. If user has payment method on file → use card BIN country (Stripe: `card.country`)
   b. Else → use browser locale + IP geolocation as provisional; confirm at payment step
3. Look up CountryPricing by countryCode from PPP_PRICING
4. If no exact match → fall back to 'US' T1 pricing
5. Create Stripe/Razorpay checkout session with:
   - currency: countryPricing.currencyCode (lowercase for Stripe)
   - amount: countryPricing.plans[planId].amount
   - metadata: { pppTier, countryCode, pppFactor }
6. On success webhook → store { currency, amount, countryCode, pppFactor } on Subscription record
```

### 7.3 Annual Billing Discount

Apply a consistent discount at the payment processor level, not in the PPP table:
- **Scholar annual:** 17% off monthly × 12 (≈ 10 months' equivalent)
- **Family annual:** 19% off monthly × 12 (≈ 9.7 months' equivalent)
- **Mentor Pro annual:** 25% off monthly × 12 (≈ 9 months' equivalent)

For INR: Scholar annual = ₹1,249 × 12 = ₹14,988 → display as ₹14,990. Family annual = ₹2,499 × 12 = ₹29,988 → display as ₹27,999 (adjust to competitive anchor).

---

## 8. Sources

- [World Bank PPP Conversion Factor, GDP (LCU per int'l $)](https://data.worldbank.org/indicator/PA.NUS.PPP)
- [World Bank Price Level Ratio of PPP Conversion Factor (India)](https://data.worldbank.org/indicator/PA.NUS.PPPC.RF?locations=IN)
- [IMF World Economic Outlook — GDP per capita, current prices (PPP)](https://www.imf.org/external/datamapper/PPPPC@WEO)
- [Worldometers GDP per Capita 2024 (IMF data)](https://www.worldometers.info/gdp/gdp-per-capita/)
- [Wikipedia: List of countries by GDP (PPP) per capita](https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(PPP)_per_capita)
- [Mirava: How to Set Up PPP Pricing](https://www.mirava.io/blog/how-to-set-up-purchasing-power-parity-pricing)
- [Mirava: Regional Pricing Best Practices](https://www.mirava.io/blog/regional-pricing-subscriptions-best-practices)
- [Dodo Payments: PPP Pricing for SaaS](https://dodopayments.com/blogs/purchasing-power-parity-pricing-saas)
- [Ambeteco: PPP for Digital Products (Medium)](https://ambeteco.medium.com/purchasing-power-parity-ppp-for-digital-products-how-to-make-your-pricing-global-9adf005326b5)
- [Paritydeals — PPP Pricing Tool for SaaS](https://www.paritydeals.com/)
