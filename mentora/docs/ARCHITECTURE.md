# Mentora — Architecture

Mentora is a two-sided K-12 learning marketplace: **seasoned/retired professionals teach, learners (and their guardians) learn.** This document describes how the system fits together.

## High level

```
                         ┌──────────────────────────────┐
                         │        @mentora/shared        │
                         │  types · zod schemas · pricing │
                         │  roles · grades · API contract │
                         └───────────────┬───────────────┘
                  imports                │                imports
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                 │                                 │
┌───────▼────────┐               ┌────────▼────────┐               ┌────────▼────────┐
│   apps/web      │   REST /api   │    apps/api      │   REST /api   │  apps/mobile     │
│  Next.js (App)  │ ◀───────────▶ │ Express + Prisma │ ◀───────────▶ │  Expo / RN       │
│  Tailwind UI    │     JSON      │   PostgreSQL     │     JSON      │                  │
└────────┬────────┘               └────────┬─────────┘               └─────────────────┘
         │ low-latency video                │ adapters (pluggable)
         │ (LiveKit/WebRTC)                  ▼
         │                  ┌────────────────────────────────────────────┐
         └────────────────▶ │ storage · OCR · LLM · video · payments       │
                            │ local/S3 · tesseract/Textract · stub/Claude  │
                            │ mock/LiveKit · mock/Stripe                   │
                            └────────────────────────────────────────────┘
```

## Workspaces

| Package           | Stack                              | Responsibility                                            |
|-------------------|------------------------------------|-----------------------------------------------------------|
| `@mentora/shared` | TypeScript, zod                    | Single source of truth: domain types, validation schemas, pricing model, roles, grades/subjects, REST contract (`API_ROUTES`), brand constants. |
| `@mentora/api`    | Express, Prisma, PostgreSQL        | Auth, courses, lessons, materials, sessions, AI, payments. All integrations behind adapters. |
| `@mentora/web`    | Next.js (App Router), Tailwind     | Beautiful, accessibility-first web app for learners, guardians, and teachers. |
| `@mentora/mobile` | Expo / React Native                | Mobile app reusing the same contract and types.           |

Because both clients and the server import the **same** `@mentora/shared`
package, the API contract physically cannot drift between them.

## The adapter pattern (why nothing is hardcoded to a vendor)

Every external capability is an interface with a runnable, key-free default
and a production implementation selected by an environment variable. This is
what lets the whole product run locally today, and flip to production-grade
providers by setting keys — no code changes.

| Capability | Interface      | Default (no keys)        | Production (set env)            | Env switch         |
|------------|----------------|--------------------------|---------------------------------|--------------------|
| Storage    | `StorageAdapter` | `local` (disk)         | `s3` (AWS S3)                   | `STORAGE_DRIVER`   |
| OCR        | `OcrAdapter`     | `tesseract` (tesseract.js, real) | `textract` (AWS Textract) | `OCR_DRIVER`       |
| LLM / GenAI| `LlmAdapter`     | `stub` (deterministic, useful) | `anthropic` (Claude) / `openai` | `LLM_DRIVER`   |
| Video      | `VideoAdapter`   | `mock` (local preview + fake token) | `livekit` (WebRTC SFU, low latency) | `VIDEO_DRIVER` |
| Payments   | `PaymentsAdapter`| `mock` (auto-succeed, real accounting) | `stripe` (Checkout + payouts) | `PAYMENTS_DRIVER` |

## Why these choices

- **LiveKit for video.** A WebRTC SFU (selective forwarding unit) gives
  sub-300ms glass-to-glass latency suitable for live 1:1 coaching and
  interactive classrooms — far lower latency than HLS/RTMP broadcast stacks.
  Tokens are minted server-side per participant with publish/subscribe grants.
- **Tesseract for OCR** runs locally with no API key, so uploaded worksheets,
  textbook pages and handwritten notes become searchable text immediately;
  AWS Textract is the drop-in upgrade for higher-accuracy / form extraction.
- **Claude (Anthropic) for GenAI.** The LLM adapter powers material
  summarization, auto-quiz generation, "explain it simply for a Class N child",
  lesson-plan drafting, the always-on AI tutor, and answer grading.
- **Stripe for payments**, with a commission split engine (`splitEarnings` in
  `@mentora/shared`) that computes the platform fee and the teacher payout so
  retired teachers clearly see what they earn.

## The OCR + AI material pipeline

```
upload (multipart) ─▶ StorageAdapter.save ─▶ Material{ocrStatus: processing}
                                                   │ (async, non-blocking)
                                                   ▼
                              OcrAdapter.extractText ─▶ extractedText
                                                   ▼
                              LlmAdapter.summarize  ─▶ aiSummary
                                                   ▼
                                  Material{ocrStatus: done}
```

The client uploads, gets an immediate response, then polls
`GET /materials/:id/ocr` until `done` — so the teacher never waits on a
blocked request.

## Data model

See `apps/api/prisma/schema.prisma`. Core entities: `User` (role-based:
TEACHER / STUDENT / GUARDIAN / ADMIN, with guardian↔children linkage),
`Course` → `Lesson` → `Material`, `ClassSession` (classroom or 1:1),
`Enrollment`, `Payment` (with `platformFeeCents` / `payoutCents` accounting),
and `Subscription`.

## Pricing model

Defined once in `@mentora/shared/pricing.ts` and consumed by the pricing page,
checkout, and the payout engine:

- **Learners:** Explorer (free) · Scholar ($19/mo) · Family ($39/mo, up to 4 kids).
- **Teachers:** Mentor (free, keep 85%) · Mentor Pro ($12/mo, keep 90% + analytics + storefront).
- **1:1 coaching:** pay-per-session at the teacher's rate; platform takes 15% (10% for Pro).
