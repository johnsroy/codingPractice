<div align="center">

# 🎓 Mentora

### Where a lifetime of expertise becomes the next generation's head start.

[![Mentora CI](https://github.com/johnsroy/codingPractice/actions/workflows/ci.yml/badge.svg)](https://github.com/johnsroy/codingPractice/actions/workflows/ci.yml)

**Mentora** is a web + mobile learning platform where **retired and seasoned
professionals teach children grades 1–12** — through self-paced courses, live
group classrooms, and paid 1:1 coaching. OCR turns any worksheet into a lesson,
low-latency video powers real classrooms, and generative AI is baked into every
corner. It's built to **generate real, recurring income for the teachers.**

</div>

---

## Why Mentora

Millions of retired teachers, engineers, doctors, accountants and artists have
decades of knowledge and time to give. Today's tutoring tools are built for
20-somethings and are intimidating to set up. Mentora flips that:

- **Extreme ease of use** — large type, high contrast, big buttons, plain
  language, a one-tap "Larger text" toggle. If you can use WhatsApp, you can teach on Mentora.
- **Upload anything** — drag a photo of a worksheet or a PDF and OCR + AI turn
  it into searchable text, a summary, and a ready-made quiz.
- **Real classrooms** — low-latency WebRTC video for 1:1 coaching and group
  classes, with materials and an AI tutor right beside the video.
- **AI everywhere** — summarize, explain-for-a-Class-3-child, generate quizzes,
  draft lesson plans, grade answers, and an always-on tutor for learners.
- **Agentic research** — a teacher types any new topic and Mentora's AI
  **searches the live web** and synthesizes a teacher-ready briefing (summary,
  key points, a suggested lesson, and cited sources).
- **Get paid** — subscriptions for learners, pay-per-session coaching, and a
  transparent commission split so teachers always see what they earn.

## Monorepo layout

```
mentora/
├── packages/
│   └── shared/        @mentora/shared — types, zod schemas, pricing, API contract
├── apps/
│   ├── api/           @mentora/api — Express + Prisma + Postgres + adapters
│   ├── web/           @mentora/web — Next.js (App Router) + Tailwind
│   └── mobile/        @mentora/mobile — Expo / React Native
├── docs/
│   ├── ARCHITECTURE.md
│   └── ORCHESTRATION.md   (how the AI agent team built this)
├── .claude/agents/    the engineering sub-agent definitions
├── docker-compose.yml Postgres (+ optional LiveKit)
└── .env.example
```

## Quick start

```bash
# 0. Prereqs: Node 20+, Docker (for Postgres)
cd mentora
cp .env.example .env

# 1. Install the whole workspace, build the shared package
npm install
npm run build --workspace=@mentora/shared

# 2. Start Postgres and set up the database with demo data
npm run db:up
npm run db:migrate
npm run db:seed

# 3. Run the API + web app together
npm run dev
#   API  → http://localhost:4000/api/health
#   Web  → http://localhost:3000

# Mobile (separate terminal)
npm run start --workspace=@mentora/mobile
```

### Demo logins (created by the seed)

| Role    | Email                       | Password       |
|---------|-----------------------------|----------------|
| Teacher | `margaret.chen@mentora.app` | `Password123!` |
| Guardian| `david.park@example.com`    | `Password123!` |
| Admin   | `admin@mentora.app`         | `Admin@1234!`  |

> Exact seeded accounts are printed by `npm run db:seed`.

## Runs today, production-ready when you add keys

Everything works **with zero API keys** thanks to the adapter pattern. Flip to
production providers by setting environment variables — no code changes:

| Capability | Default (no key)      | Production (add key)        | Env               |
|------------|-----------------------|-----------------------------|-------------------|
| Storage    | local disk            | AWS S3                      | `STORAGE_DRIVER=s3` |
| OCR        | Tesseract (local)     | AWS Textract                | `OCR_DRIVER=textract` |
| GenAI/LLM  | deterministic stub    | Anthropic Claude / OpenAI   | `LLM_DRIVER=anthropic` |
| Research   | example sources       | Tavily / Brave / SerpAPI (live web) | `RESEARCH_DRIVER=tavily` |
| Video      | mock room + token     | LiveKit (low-latency WebRTC)| `VIDEO_DRIVER=livekit` |
| Payments   | mock (auto-succeed)   | Stripe (Checkout + payouts) | `PAYMENTS_DRIVER=stripe` |

**Docs:** [Architecture](docs/ARCHITECTURE.md) · [Deployment & API keys](docs/DEPLOYMENT.md) · [Teacher verification](docs/VERIFICATION.md) · [Testing](docs/TESTING.md) · [UAT checklist](docs/UAT_CHECKLIST.md) · [Roadmap](docs/ROADMAP.md) · [Agent orchestration](docs/ORCHESTRATION.md)

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design and
[`docs/ORCHESTRATION.md`](docs/ORCHESTRATION.md) for how an AI agent team built it.

## Pricing model

Defined once in `@mentora/shared` and used by the pricing page, checkout, and
the payout engine.

**For learners**
- **Explorer** — Free. Browse everything, 1 trial class, 5 AI questions/day.
- **Scholar** — $19/mo. Unlimited group classrooms + AI tutor + materials.
- **Family** — $39/mo. Everything in Scholar for up to 4 children.

**For teachers (retired pros)**
- **Mentor** — Free to join, keep **85%** of what you earn.
- **Mentor Pro** — $12/mo, keep **90%**, plus analytics, a branded storefront,
  unlimited AI lesson tools, and featured placement.

**1:1 coaching** is pay-per-session at the teacher's own rate; the platform
commission is 15% (10% for Mentor Pro). The split is computed by `splitEarnings()`.

## License

UNLICENSED — proprietary. © Mentora.
