# Mentora — India Product Differentiation

> **Purpose:** Maps each differentiator to (a) why it matters in India, (b) current build status in Mentora, (c) what to build next. Use this as a shared reference for product, engineering, and GTM teams.

---

## 1. Multilingual UI + Content

**Why it matters in India.**
India has 22 scheduled languages; Hindi alone has 600M+ speakers. Over 90% of board-exam students sit state-board exams where instruction is in the regional language. Quality EdTech is almost entirely English-first. A parent in Patna or Ludhiana who wants their child tutored in Hindi or Punjabi has almost no online options. This is a blue-ocean wedge: multilingual is a distribution lever, not just a feature.

**Currently built in Mentora:** All UI strings are in English. The codebase (Next.js App Router, React Native/Expo) uses standard component-based rendering with no i18n library integrated yet. No translated strings, no font configuration for Indic scripts.

**What to build next:**
- Integrate `next-intl` (web) and `i18n-js` or `expo-localization` (mobile) for string externalization.
- Extract all UI strings into JSON message catalogs (`messages/en.json`, `messages/hi.json`, etc.).
- Configure Tailwind/global CSS with Indic-safe font stacks (see INDIA_LOCALIZATION.md).
- Launch with 4 languages: **English, Hindi (हिन्दी), Punjabi (ਪੰਜਾਬੀ), Bengali (বাংলা)**.
- Priority translation surfaces (in order): Onboarding screens → Navigation/global chrome → Teacher profile cards → Parent dashboard → AI tutor responses → Course materials/downloads.

**Language-specific details:**

| Language | Script | Font Needed | RTL? | Phase |
|---|---|---|---|---|
| English | Latin | System default | No | Phase 1 |
| Hindi (हिन्दी) | Devanagari | Noto Sans Devanagari | No | Phase 1 |
| Punjabi (ਪੰਜਾਬੀ) | Gurmukhi | Noto Sans Gurmukhi | No | Phase 1 |
| Bengali (বাংলা) | Bengali | Noto Sans Bengali | No | Phase 1 |
| Marathi (मराठी) | Devanagari | (shares Hindi font) | No | Phase 2 |
| Telugu (తెలుగు) | Telugu | Noto Sans Telugu | No | Phase 2 |
| Tamil (தமிழ்) | Tamil | Noto Sans Tamil | No | Phase 2 |
| Kannada (ಕನ್ನಡ) | Kannada | Noto Sans Kannada | No | Phase 3 |
| Malayalam (മലയാളം) | Malayalam | Noto Sans Malayalam | No | Phase 3 |
| Gujarati (ગુજરાતી) | Gujarati | Noto Sans Gujarati | No | Phase 3 |

---

## 2. Curriculum / Board Alignment

**Why it matters in India.**
India's K-12 system has ~30+ boards. CBSE serves ~9% of secondary students but dominates urban private schools (where the paying audience concentrates). State boards serve ~92% of all board-exam sitters — the mass market. Any content or teacher profile that explicitly tags board and grade instantly signals relevance to a parent. Without this, every course feels generic; trust and conversion drop.

**Currently built in Mentora:**
- `grades.ts` defines Class 1–12 with `primary/middle/secondary` stages — correct for India.
- `types.ts` includes `gradeId` and `subjectId` on Course and Session objects.
- `subjects.ts` covers Math, Science, English, Social Studies, History, Geography, CS, Languages, Art, Life Skills, Exam Prep — good India coverage.
- **Board field is absent.** No CBSE/ICSE/state-board tag exists on courses, teachers, or search filters.

**What to build next:**
1. Add `boardId` to the `Course` and `UserPublic` (teacher) schemas. Seed a `Board` lookup table: `CBSE`, `ICSE/ISC`, `MH State Board`, `UP Board`, `WB Board`, `TN State Board`, `Karnataka State Board`, `Rajasthan Board`, `MP Board`, `Bihar Board` (start with top 10 by enrollment).
2. Add board filter to teacher search and course browse.
3. Teacher onboarding: let teachers tag which boards they are familiar with.
4. AI lesson-plan generator: accept `boardId` as context and adjust syllabus references accordingly.
5. Exam-prep subject: map `exam-prep` subject to specific exams (JEE, NEET, CUET, NDA, Board Class 10, Board Class 12) as sub-tags.

---

## 3. Affordability + Payments

**Why it matters in India.**
The average household income in Tier-2/3 cities is below ₹15,000/month. Post-BYJU'S, parents are averse to large upfront commitments. The sweet spot for online tutoring is ₹500–₹2,500/month for a subscription and ₹200–₹800/session for 1:1. UPI is the default payment rail for over 70% of Indian digital transactions; not supporting it is a hard barrier to adoption.

**Currently built in Mentora:**
- Pricing defined in USD cents: Explorer (free), Scholar ($19/mo), Family ($39/mo), Mentor Pro ($12/mo teacher).
- Payment provider: Stripe (mock default; Stripe production configured via env). Stripe does support India, but UPI acceptance is limited without a local payment gateway.
- No INR pricing, no UPI integration, no lakh/crore formatting.

**What to build next:**

### India-Adapted Price Points (Illustrative; adjust based on willingness-to-pay research)

| Plan | Current USD | Suggested INR/mo | Suggested INR/yr | Rationale |
|---|---|---|---|---|
| Explorer | Free | Free | Free | Unchanged |
| Scholar (1 child) | $19 (~₹1,590) | ₹1,499/mo | ₹14,990/yr (~₹1,249/mo) | Competitive with local tuition centre per subject; save 17% annual |
| Family (up to 4 children) | $39 (~₹3,260) | ₹2,999/mo | ₹27,999/yr (~₹2,333/mo) | Comparable to 2 subjects at a local centre; strong family-value pitch |
| 1:1 session (teacher sets rate) | Teacher-set USD | ₹300–₹800/session | — | Position vs. home-tutor rate (₹500–₹1,500/hr) |
| Mentor Pro (teacher) | $12 (~₹1,000) | ₹999/mo | ₹8,990/yr | Palatable for a retired teacher earning ₹5,000–₹20,000/mo on the platform |

**Note:** Exchange rate approximate at ~₹83–84/USD as of mid-2025; monitor quarterly.

### Payment Implementation Steps
1. Add `Razorpay` or `Cashfree` as a second payment driver (alongside Stripe). These gateways support UPI, UPI AutoPay (for recurring subscriptions), RuPay, net banking, EMI.
2. Add `PAYMENTS_DRIVER=razorpay` to `.env.example` and the payments adapter interface.
3. Store currency (`INR` vs `USD`) on the `Payment` and `Subscription` models; add `currencyCode` to `Plan`.
4. UPI AutoPay for monthly/annual subscriptions (Razorpay supports NACH mandate).
5. Format prices in the UI using `₹` and lakh/crore conventions (see INDIA_LOCALIZATION.md).
6. Offer EMI plans via Razorpay (3/6/9-month) for the annual Family plan — converts price-sensitive households.

---

## 4. Low-Bandwidth and Mobile-First

**Why it matters in India.**
While data is cheap (~₹14/GB), connection quality in Tier-2/3 cities and rural areas is patchy — often 3G or fluctuating 4G. 80%+ of edtech usage in India happens on Android smartphones. The Mentora mobile app (React Native/Expo) is already built; the focus is adaptive streaming and offline capability.

**Currently built in Mentora:**
- Expo / React Native mobile app exists (see `apps/mobile/`).
- LiveKit WebRTC for video (low-latency; adaptive bitrate is a LiveKit feature).
- Material uploads (PDF, image, doc) with AI extraction — materials can be downloaded.
- No explicit offline mode; no video compression guidance for teachers.

**What to build next:**
1. **Adaptive video quality.** Instruct teachers to use 720p max; surface a "Low bandwidth mode" toggle in session settings that drops video to 480p/360p (LiveKit supports simulcast).
2. **Offline materials.** Allow students to mark PDF/image materials for offline access in the mobile app (React Native `react-native-fs` + local cache).
3. **Android-first testing matrix.** Add mid-range Android devices (₹8,000–₹15,000 segment: Redmi, Realme) to the test plan. Ensure the app works on Android 10+.
4. **Progressive Web App (PWA).** The Next.js web app should be PWA-ready for learners who prefer browser over app install — reduces friction for first use.
5. **Compressed AI responses.** For the AI tutor on mobile, paginate long responses rather than streaming a wall of text; use concise formatting.

---

## 5. Trust and Safety

**Why it matters in India.**
Post-BYJU'S, trust is the #1 purchase driver. Mentora's teacher pool being retired adults (who may teach minors) means safety infrastructure is non-negotiable — both for legal compliance and parent confidence. India's DPDP Act (Digital Personal Data Protection Act, 2023) adds regulatory obligations for processing children's data.

**Currently built in Mentora:**
- `verified` boolean field on `UserPublic` (teacher) — plumbing exists.
- GUARDIAN role with its own login flow and child account management.
- Family plan with "Guardian dashboard & controls" as a listed feature.
- Session recording field not present in current schema; consent flow not built.

**What to build next:**
1. **Teacher verification flow.** Collect: government ID (Aadhaar), proof of credentials (degree/service book scan), former employer reference (optional). Run manual review + store verification status. Display a "Verified by Mentora" badge on teacher cards.
2. **Background check integration.** For Phase 2, integrate with a third-party Indian background-check provider (e.g., AuthBridge, IDfy) for police record verification — especially important for teachers of younger children (Classes 1–5).
3. **Session recording consent.** Add `recordingEnabled` (boolean) and `recordingConsentAt` (timestamp) to `ClassSession`. Surface consent banner to both teacher and student at session start. Store recordings in S3 with access scoped to participants.
4. **Parental controls.** Guardian dashboard (already in Family plan): time limits on AI tutor, session history, message preview, ability to block/report a teacher.
5. **DPDP Act compliance.** Children's data (under 18) requires verifiable parental consent. Add a GUARDIAN consent gate during student account creation. Do not serve behavioural ads to minors. Appoint a Data Protection Officer before launch.
6. **In-session safety.** No direct messaging between teacher and student outside the platform. All communication through Mentora's channel (no WhatsApp numbers shared until after 5+ sessions — platform policy, not technical enforcement initially).

---

## 6. AI Tutor in the Learner's Own Language + Agentic Research for Teachers

**Why it matters in India.**
Two distinct AI differentiators that compound each other:

- **For learners:** A Hindi-speaking Class 8 student in Lucknow who gets stuck on a Maths problem at 10pm has no one to ask. An AI tutor that responds in Hindi — correctly, patiently, with worked examples — is transformative. No competitor today offers this reliably.
- **For teachers:** A retired Physics teacher who last formally studied the topic in 1995 can now research any topic in 30 seconds via Mentora's agentic live-web research tool (already built: `AiTask = 'research_topic'`; returns `ResearchBriefing` with summary, key points, lesson outline, and cited sources).

**Currently built in Mentora:**
- AI tutor (`tutor_chat` task) — built; currently English-only prompts.
- Homework help, quiz generation, lesson plan generation — built.
- **Agentic research** (`research_topic` task) — fully built: searches live web via Tavily/Brave/SerpAPI, synthesizes a teacher-ready briefing with citations. Production-ready when `RESEARCH_DRIVER=tavily` is set.
- OCR material extraction (Tesseract local / AWS Textract) — built; turns scanned worksheets into text for AI processing.
- AI-generated course summary, explain-simply, grade-answer — built.

**What to build next:**
1. **Multilingual AI tutor.** Update `tutor_chat` system prompt to: "Respond in the same language the student writes in." Test with Hindi, Bengali, and Punjabi queries. Claude (Anthropic) handles all three scripts natively — no additional model needed.
2. **Language detection on AI task dispatch.** Detect `Accept-Language` header or user profile language preference; pass it to the LLM context so AI responses default to the user's language even if they type in English.
3. **Vernacular exam-prep prompts.** Create curated prompt templates for CBSE board exam style Q&A in Hindi (e.g., "Explain in the way a CBSE Class 10 board examiner expects").
4. **Teacher research in regional language.** Allow the research topic input in Hindi/Bengali/Punjabi; the AI returns the briefing in that language. This makes the tool usable by teachers who are not comfortable in English.
5. **AI lesson-plan board-alignment.** When `boardId=CBSE` and `gradeId=grade-10`, the lesson plan AI should reference CBSE Chapter structure (e.g., NCERT chapters) — requires system prompt tuning and optional NCERT chapter index.

---

## 7. Vernacular + Exam Prep and Values/EQ from Elders

**Why it matters in India.**

**Exam prep:** Board exams (Class 10, 12) and entrance tests (JEE, NEET, CUET) are high-stakes, high-anxiety events. Tutoring demand spikes sharply in Classes 9–12. A retired IIT professor or ex-CBSE board examiner carries enormous credibility for exam prep — they know the marking scheme from the inside.

**Values/EQ:** India's joint-family culture places enormous respect on elders as teachers of life. A retired grandparent-age teacher can deliver "soft" subjects — life skills, values, emotional resilience, financial literacy — with authenticity that no 25-year-old EdTech creator can match. This is completely unaddressed by any competitor. It also creates a low-competition subject niche.

**Currently built in Mentora:**
- `exam-prep` and `life-skills` are both defined subject IDs in `grades.ts`.
- No exam-specific tagging (JEE/NEET/CUET/Board Class 10/Board Class 12).
- No "Elders' wisdom" or values-specific teacher category.

**What to build next:**
1. Add exam sub-tags (JEE, NEET, CUET, Class 10 Boards, Class 12 Boards, NDA, State Scholarships) as searchable metadata on courses and teacher profiles.
2. Create a "Life Skills & Values" browse category with curated elder-teacher profiles.
3. Teacher profile card: surface "Years of experience" prominently (a 35-year retired teacher beats any algorithm on trust).
4. Seasonal push: in Oct–Feb (board exam season), surface exam-prep teachers on homepage; run "Ask a Board Examiner" 1:1 session packs.

---

## 8. Differentiation Backlog — Prioritized by Impact × Effort

> **Scale:** Impact: H = High, M = Medium, L = Low. Effort: S = Small (1–2 sprints), M = Medium (1–2 months), L = Large (3+ months).

| # | Feature | Impact | Effort | Priority Score | Next Step |
|---|---|---|---|---|---|
| 1 | INR pricing + Razorpay/UPI integration | H | M | **P0** | Add Razorpay payment driver; add `currencyCode` to Plan model |
| 2 | Multilingual UI — Phase 1 (4 languages) | H | M | **P0** | Integrate `next-intl`; extract strings; hire Hindi/Punjabi/Bengali translators |
| 3 | Teacher verification badge + Aadhaar ID check | H | S | **P0** | Build verification submission flow; manual review queue in Admin |
| 4 | Board alignment field (CBSE/ICSE/state) on courses and teacher profiles | H | S | **P0** | Add `boardId` to schema; seed Board lookup; add search filter |
| 5 | AI tutor multilingual (Hindi/Bengali/Punjabi) | H | S | **P1** | Update system prompt: "respond in user's language"; test with Claude |
| 6 | Guardian/parental controls (time limits, session history) | H | M | **P1** | Build Guardian dashboard fully; link to Family plan |
| 7 | Mobile: Android-first test suite + low-bandwidth mode | H | M | **P1** | Add device matrix to CI; implement 480p LiveKit simulcast |
| 8 | Exam sub-tags (JEE, NEET, CUET, Board 10/12) | M | S | **P1** | Add enum to schema; surface in search/browse |
| 9 | Background check integration (AuthBridge/IDfy) | H | L | **P2** | Vendor evaluation; API integration for police record check |
| 10 | Session recording consent + storage | M | M | **P2** | Add schema fields; consent banner in video room component |
| 11 | Multilingual AI tutor — Phase 2 (Marathi, Telugu, Tamil) | H | M | **P2** | Extend language detection; add 3 more languages to i18n |
| 12 | Offline materials (mobile) | M | M | **P2** | React Native local cache for downloaded PDFs |
| 13 | Teacher research in regional language | M | S | **P2** | Pass language context to `research_topic` task |
| 14 | NCERT chapter-aligned AI lesson plans | M | L | **P3** | Build NCERT chapter index; inject into lesson-plan prompt |
| 15 | UPI AutoPay (recurring subscription mandate) | H | M | **P2** | Razorpay NACH mandate API |
| 16 | PWA (Progressive Web App for browser users) | M | S | **P2** | Add `next-pwa` or manual service worker to Next.js config |
| 17 | Life Skills & Values browse category | M | S | **P3** | Add category tag; curate initial elder-teacher profiles |
| 18 | EMI plans for annual Family plan | M | S | **P3** | Razorpay EMI API; surface on checkout |
| 19 | DPDP Act compliance (children's data + consent gate) | H | L | **P2** | Legal review; build parental consent gate for <18 accounts |
| 20 | Multilingual content translation — Phase 3 (course materials) | H | L | **P3** | AI-assisted translation pipeline for teacher-uploaded PDFs |

---

## Summary: Mentora's Differentiation Stack for India

```
LAYER 1 — SUPPLY SIDE (hardest to copy)
  Retired / seasoned professionals as teachers
  → Trust, credibility, life experience
  → Willing to teach at lower rates (supplemental income, not primary income)

LAYER 2 — PRODUCT (built or near-term)
  AI that REDUCES effort for senior teachers
  → OCR + lesson plan + quiz + live-web research (all built)
  Multilingual UI + AI tutor in the learner's own language
  → Phase 1: 4 languages; Phase 2: 7 languages

LAYER 3 — MARKET FIT (structural)
  INR pricing + UPI + affordable subscriptions
  Board alignment (CBSE, ICSE, state boards)
  Trust architecture (verification, parental controls, no hard sell)

LAYER 4 — SOFT MOAT (compound over time)
  Community of respected retired educators
  Word-of-mouth in WhatsApp groups and RWA (Resident Welfare Associations)
  Values/EQ + life skills — a category no tech-first competitor can credibly serve
```
