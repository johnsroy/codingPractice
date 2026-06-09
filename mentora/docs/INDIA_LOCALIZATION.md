# Mentora — India Localization Spec

> **Audience:** Frontend engineers (web + mobile), AI/backend engineers, and the QA team. This is an implementation-oriented spec. Each section ends with concrete action items an engineer can pick up.

---

## 1. Language List

### Phase 1 Languages (launch target)

| Language | Native Name | Script | Script Code | BCP-47 Tag | Approximate Speakers | Priority Reason |
|---|---|---|---|---|---|---|
| English | English | Latin | Latn | `en` | ~130M in India (second language) | Platform default; teacher default |
| Hindi | हिन्दी | Devanagari | Deva | `hi` | ~600M | Largest single language group; Tier-2/3 core market |
| Punjabi | ਪੰਜਾਬੀ | Gurmukhi | Guru | `pa` | ~130M | Punjab, Haryana, Delhi NCR; strong diaspora |
| Bengali | বাংলা | Bengali | Beng | `bn` | ~100M (India) | West Bengal, Tripura; large urban middle class |

### Phase 2 Languages (6–12 months post-launch)

| Language | Native Name | Script | BCP-47 Tag | Approximate Speakers |
|---|---|---|---|---|
| Marathi | मराठी | Devanagari | `mr` | ~83M |
| Telugu | తెలుగు | Telugu | `te` | ~82M |
| Tamil | தமிழ் | Tamil | `ta` | ~75M |

### Phase 3 Languages (12–24 months)

| Language | Native Name | Script | BCP-47 Tag | Approximate Speakers |
|---|---|---|---|---|
| Kannada | ಕನ್ನಡ | Kannada | `kn` | ~44M |
| Malayalam | മലയാളം | Malayalam | `ml` | ~37M |
| Gujarati | ગુજરાતી | Gujarati | `gu` | ~57M |
| Odia | ଓଡ଼ିଆ | Odia | `or` | ~38M |

### RTL Note
None of the Phase 1–3 Indic languages are right-to-left. Hindi (Devanagari), Punjabi (Gurmukhi), Bengali, Marathi, Telugu, Tamil, Kannada, Malayalam, Gujarati, and Odia are all **left-to-right**. No RTL CSS (`direction: rtl`) or layout mirroring is required. This simplifies implementation significantly compared to Arabic/Hebrew localization.

---

## 2. Number, Date, and Currency Formatting

### Currency

| Detail | Value |
|---|---|
| Currency code | `INR` |
| Symbol | `₹` (Unicode U+20B9) |
| Symbol placement | Prefix, no space: `₹1,499` |
| Decimal separator | `.` (period) |
| Thousands separator | `,` (comma) |

**Indian numbering system** — India uses lakh and crore, not million and billion:

| Value | Indian Format | Western Format |
|---|---|---|
| 100,000 | ₹1,00,000 (one lakh) | ₹100,000 |
| 10,000,000 | ₹1,00,00,000 (one crore) | ₹10,000,000 |
| 1,500 | ₹1,500 | ₹1,500 |
| 14,990 | ₹14,990 | ₹14,990 |

For **plan pricing** (amounts under ₹1,00,000), standard comma formatting is fine. For **market stats or teacher earnings summaries** displayed in the app, use lakh/crore formatting.

**Implementation:** Use `Intl.NumberFormat` with locale `en-IN` for currency:

```ts
// Use this for INR display
function formatINR(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}
// formatINR(1499) → "₹1,499"
// formatINR(100000) → "₹1,00,000"
```

Update the existing `formatPrice()` in `packages/shared/src/pricing.ts`:
- Add an optional `locale` parameter defaulting to `'en-US'`.
- For India, call with `locale = 'en-IN'` and `currency = 'INR'`.

### Dates

| Context | Format | Example |
|---|---|---|
| Full date (UI) | `DD MMM YYYY` | 14 Aug 2025 |
| Short date | `DD/MM/YYYY` | 14/08/2025 |
| Time | 12-hour with AM/PM | 4:30 PM |
| Session date+time | `EEE, DD MMM · h:mm a` | Mon, 14 Aug · 4:30 PM |

Use `Intl.DateTimeFormat` with `'en-IN'` locale — this produces DD/MM/YYYY order automatically. Do not hard-code month names; use the locale formatter.

```ts
// Session date formatting for India
const fmt = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short', day: '2-digit', month: 'short',
  hour: '2-digit', minute: '2-digit', hour12: true,
});
```

### Numbers

| Context | Format |
|---|---|
| Large numbers (market stats) | Use "lakh" and "crore" labels: "1.5 lakh students" |
| Phone numbers | +91 followed by 10-digit number; store without formatting |
| Percentages | Standard: 87% |
| Grades/class numbers | "Class 1" through "Class 12" (already correct in `grades.ts`) |

---

## 3. Font Considerations for Indic Scripts

### The Problem
Indic scripts (Devanagari, Gurmukhi, Bengali, Tamil, etc.) have complex glyph shaping — conjunct consonants, above/below vowel marks (matras), and Unicode normalization requirements. System fonts on older Android devices often render Indic scripts poorly or fallback to boxes. A deliberate font stack is required.

### Recommended Font: Noto Sans Family (Google)
Google's Noto project ("No Tofu") was designed specifically to eliminate missing-glyph boxes across all scripts. It is:
- Open source (SIL Open Font License)
- Excellent rendering quality for all Phase 1–3 languages
- Available via Google Fonts CDN or self-hostable
- Widely used in production Indian apps

### Font Stack by Script

```css
/* Devanagari (Hindi, Marathi) */
font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;

/* Gurmukhi (Punjabi) */
font-family: 'Noto Sans Gurmukhi', 'Raavi', sans-serif;

/* Bengali (Bengali) */
font-family: 'Noto Sans Bengali', 'Vrinda', sans-serif;

/* Telugu */
font-family: 'Noto Sans Telugu', 'Gautami', sans-serif;

/* Tamil */
font-family: 'Noto Sans Tamil', 'Latha', sans-serif;

/* Kannada */
font-family: 'Noto Sans Kannada', 'Tunga', sans-serif;

/* Malayalam */
font-family: 'Noto Sans Malayalam', 'Kartika', sans-serif;

/* Gujarati */
font-family: 'Noto Sans Gujarati', 'Shruti', sans-serif;
```

### Implementation in Next.js (Web)

```ts
// apps/web/src/app/layout.tsx
import { Noto_Sans_Devanagari, Noto_Sans_Bengali, Noto_Sans_Gurmukhi } from 'next/font/google';

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
});

const bengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-bengali',
  display: 'swap',
});

const gurmukhi = Noto_Sans_Gurmukhi({
  subsets: ['gurmukhi'],
  variable: '--font-gurmukhi',
  display: 'swap',
});
```

Apply the font variable CSS class to `<html>` alongside the existing font. In `globals.css`, set script-specific selectors:

```css
:lang(hi), :lang(mr) { font-family: var(--font-devanagari), sans-serif; }
:lang(pa) { font-family: var(--font-gurmukhi), sans-serif; }
:lang(bn) { font-family: var(--font-bengali), sans-serif; }
```

### Implementation in React Native / Expo (Mobile)

React Native on Android uses the platform's font rendering for Unicode text. On Android 7+ (API 24+), Noto fonts are bundled. For older devices or custom font loading:

```ts
// Use expo-font to load Noto Sans for each script
import * as Font from 'expo-font';
await Font.loadAsync({
  'NotoSansDevanagari': require('./assets/fonts/NotoSansDevanagari-Regular.ttf'),
  'NotoSansBengali': require('./assets/fonts/NotoSansBengali-Regular.ttf'),
  'NotoSansGurmukhi': require('./assets/fonts/NotoSansGurmukhi-Regular.ttf'),
});
```

Bundle the `.ttf` files in `apps/mobile/assets/fonts/`. Download from [Google Fonts](https://fonts.google.com/noto).

### Performance Note
Load only the script subsets needed for the user's active language. Noto Sans Devanagari Regular is ~200KB; loading all scripts upfront is ~1MB+ — use `display: swap` and load lazily based on the user's selected language.

---

## 4. i18n Architecture

### Web (Next.js App Router)

**Recommended library:** `next-intl` (well-maintained, App Router native, works with RSC)

```
apps/web/
├── messages/
│   ├── en.json         # English (source of truth)
│   ├── hi.json         # Hindi
│   ├── pa.json         # Punjabi
│   └── bn.json         # Bengali
├── i18n.ts             # next-intl config
└── middleware.ts       # locale detection + routing
```

**Locale detection order:**
1. User profile language preference (stored in DB on `UserPublic` — add `preferredLocale` field)
2. `Accept-Language` HTTP header
3. Default: `en`

**URL strategy:** Use path-prefix routing: `/hi/dashboard`, `/pa/teachers`, etc. This is SEO-friendly and shareable. Alternatively, use subdomain (`hi.mentora.app`) — path-prefix is simpler to implement first.

### Mobile (Expo / React Native)

**Recommended library:** `expo-localization` + `i18n-js` or `i18next`

```ts
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const i18n = new I18n({
  en: require('./locales/en.json'),
  hi: require('./locales/hi.json'),
  pa: require('./locales/pa.json'),
  bn: require('./locales/bn.json'),
});
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;  // Fall back to English if key missing
```

Allow the user to override language from Settings screen; persist in AsyncStorage and user profile.

### Message Key Conventions

Use dot-notation namespacing:

```json
{
  "nav.home": "Home",
  "nav.courses": "Courses",
  "nav.teachers": "Teachers",
  "nav.dashboard": "Dashboard",
  "auth.login.title": "Log in to Mentora",
  "auth.login.email": "Email address",
  "auth.login.password": "Password",
  "auth.login.cta": "Log in",
  "onboarding.welcome": "Welcome to Mentora",
  "onboarding.role.teacher": "I want to teach",
  "onboarding.role.learner": "I want to learn",
  "pricing.explorer.name": "Explorer",
  "pricing.scholar.name": "Scholar",
  "pricing.family.name": "Family",
  "ai.tutor.placeholder": "Ask me anything about your homework…",
  "session.join": "Join class",
  "session.schedule": "Schedule a session"
}
```

Add a linting step (e.g., `i18n-ally` VS Code extension or a CI script) that fails if any key is present in `en.json` but missing in another language file. This prevents silent fallback-to-English regressions.

---

## 5. Translation Priority and Workflow

### Surfaces to Translate (Priority Order)

| Priority | Surface | Why |
|---|---|---|
| 1 | Onboarding (sign-up, role selection, first-use wizard) | First impression; determines trust |
| 2 | Navigation / global chrome (header, footer, sidebar) | Always visible |
| 3 | Teacher profile card (name, subject, board, grade, bio excerpt, "Book a session" CTA) | Core conversion surface |
| 4 | Course browse and detail page | Second conversion surface |
| 5 | Pricing page (plan names, features, CTA, INR prices) | Payment conversion |
| 6 | Parent/Guardian dashboard (child progress, session history) | Post-purchase retention |
| 7 | AI tutor response language (handled by LLM, not static strings) | Phase 2 |
| 8 | Course materials / lesson PDFs (teacher-uploaded content) | Phase 3 |
| 9 | Email notifications and push notifications | Phase 2 |
| 10 | Legal / Terms of Service, Privacy Policy | Phase 2 (required before marketing to non-English users) |

### Translation Workflow (Initial)

1. **Phase 1 bootstrap:** Export `en.json` → hire 3 professional translators (Hindi, Punjabi, Bengali) via a service like Lokalise, Crowdin, or direct hire on Upwork India. Cost estimate: ~₹40,000–₹80,000 for initial string set (~500 keys).
2. **Ongoing:** Use Lokalise or Crowdin for translator-contributor workflow. Engineers add new `en.json` keys; a CI check flags untranslated keys; translator reviews before release.
3. **AI-assisted draft translation:** Use Claude or GPT-4 to draft translations for speed; always have a human reviewer for UI-facing strings (machine translation for Indic scripts can be awkward).
4. **Teacher-facing text:** Because the teacher audience (retired professionals) skews older and regional-language-comfortable, prioritize Hindi translation of teacher dashboard and onboarding above all else.

---

## 6. Phased Rollout Plan

### Phase 1 — Foundation (Months 1–3)

**Goal:** Ship a working Hindi, Punjabi, and Bengali UI with INR pricing. No AI changes needed yet.

| Task | Owner | Complexity |
|---|---|---|
| Add `preferredLocale` field to `UserPublic` (shared + API) | Backend | S |
| Integrate `next-intl` in Next.js web app | Frontend | S |
| Extract all UI strings into `messages/en.json` (~500 keys) | Frontend | M |
| Hire translators; deliver `hi.json`, `pa.json`, `bn.json` | PM | S |
| Load Noto fonts for Devanagari, Gurmukhi, Bengali in web layout | Frontend | S |
| Add Expo font loading for mobile | Mobile | S |
| Add `expo-localization` + `i18n-js` to mobile app | Mobile | S |
| Add `currencyCode` field to `Plan`; add INR plan definitions | Shared/Backend | S |
| Integrate Razorpay (or Cashfree) as a payment driver | Backend | M |
| Implement `formatINR()` utility; update pricing page | Frontend | S |
| QA: test all 4 languages on Chrome (web) + Redmi/Realme (Android) | QA | M |
| Add `boardId` field to Course and teacher profile; seed top-10 boards | Backend | S |

**Exit criteria for Phase 1:** A Hindi-speaking user can sign up, browse teachers filtered by board and grade, see prices in INR, and check out via UPI — entirely in Hindi.

---

### Phase 2 — AI Tutor in Learner's Language (Months 4–6)

**Goal:** The AI tutor and AI homework helper respond in whichever language the student writes in.

| Task | Owner | Complexity |
|---|---|---|
| Update `tutor_chat` system prompt: "Respond in the same language the student writes in." | AI/Backend | S |
| Add language-detection utility (detect script from input text) | Backend | S |
| Pass `preferredLocale` as context to all AI tasks | Backend | S |
| Update `research_topic` to accept and respond in Hindi/Bengali/Punjabi | Backend | S |
| Add Marathi, Telugu, Tamil to i18n (Phase 2 languages) | Frontend/Mobile | M |
| Build session recording consent flow (schema + UI banner) | Full-stack | M |
| Build Guardian dashboard — full parental controls | Full-stack | M |
| UPI AutoPay (Razorpay NACH mandate for subscriptions) | Backend | M |
| Email notifications in user's preferred language | Backend | M |
| Teacher verification flow + Aadhaar/credential upload | Full-stack | M |
| DPDP Act compliance: parental consent gate for <18 accounts | Full-stack + Legal | L |
| PWA (service worker + offline shell for web) | Frontend | S |

**Exit criteria for Phase 2:** A student types a Maths question in Hindi; the AI tutor replies in Hindi with a worked solution. A teacher researches a new topic; the briefing comes back in Hindi if that is their preference.

---

### Phase 3 — Content Translation + Full Vernacular (Months 7–12)

**Goal:** Teacher-uploaded course content is machine-translated with human review; Phase 3 languages go live.

| Task | Owner | Complexity |
|---|---|---|
| AI-assisted PDF/material translation pipeline (upload → translate → store) | Backend + AI | L |
| Phase 3 languages: Kannada, Malayalam, Gujarati, Odia i18n | Frontend/Mobile | M |
| Background check integration (AuthBridge/IDfy) | Backend | L |
| NCERT chapter index → board-aligned AI lesson plans | AI/Backend | L |
| Offline materials (React Native local cache) | Mobile | M |
| Exam sub-tag search (JEE, NEET, CUET, Board 10/12) | Full-stack | S |
| Teacher research tool in regional language (full pass-through) | AI/Backend | S |

---

## 7. Engineering Checklist — Before Merging i18n

- [ ] All user-visible strings are in message catalog; no hardcoded English strings in JSX/TSX
- [ ] `formatINR()` is used for all INR prices; `formatPrice()` is parameterized for currency
- [ ] Noto fonts load with `display: swap` (no FOUT blocking render)
- [ ] Language switcher accessible from Settings on both web and mobile
- [ ] `preferredLocale` persisted to user profile on change
- [ ] CI step fails if any key present in `en.json` is absent from other language files
- [ ] Indic text renders correctly on Android 10+ (Redmi Note 10, Realme C21 as test devices)
- [ ] Date/time displayed in `DD/MM/YYYY` format for `en-IN` locale users
- [ ] Currency displayed as `₹` prefix with `en-IN` number grouping
- [ ] AI tutor tested with Hindi, Bengali, Punjabi input — responses in correct script
- [ ] No language-specific layout breaks (Devanagari text can be 20–30% longer than English equivalent — check all fixed-width containers)

---

## 8. Reference Resources

- Google Noto Fonts: https://fonts.google.com/noto
- `next-intl` docs: https://next-intl-docs.vercel.app/
- `expo-localization` docs: https://docs.expo.dev/versions/latest/sdk/localization/
- Razorpay UPI AutoPay API: https://razorpay.com/docs/payments/upi/
- India DPDP Act 2023 summary: https://meity.gov.in/data-protection-framework
- BCP-47 language tags reference: https://www.iana.org/assignments/language-subtag-registry
- `Intl.NumberFormat` with `en-IN`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
