# Mentora — Deployment Guide

Mentora runs locally today with **zero API keys** (every integration has a
stub/mock driver). Going to production is a matter of provisioning
infrastructure and setting environment variables — the adapter pattern means
**no code changes** are required to switch a capability from stub to a real
provider.

This guide covers what to provision, which API keys you need, and the
step‑by‑step deploy.

---

## 1. Architecture in production

```
            ┌──────────────┐         ┌──────────────────┐
  Browser ─▶│  Web (Vercel) │ ─REST─▶ │  API (container)  │ ─▶ Postgres (managed)
  Mobile  ─▶│  Next.js      │         │  Express + Prisma │ ─▶ Object storage (S3)
            └──────────────┘         └────────┬─────────┘
                                              │ adapters (env-selected)
                       ┌──────────────────────┼───────────────────────────┐
                  LLM (Anthropic)      Video (LiveKit)      Payments (Stripe)
                  Research (Tavily)    OCR (Textract)       Storage (S3)
```

- **Web** → any Node/edge host; Vercel is the easiest for Next.js.
- **API** → any container host (Render, Railway, Fly.io, AWS ECS, Google Cloud Run).
- **Database** → managed PostgreSQL (Neon, Supabase, RDS, Cloud SQL).
- **Object storage** → AWS S3 (or any S3-compatible store).

---

## 2. Environment variables & API keys

Copy `.env.example` and fill in. Grouped by what they unlock. **Everything
left blank falls back to a working stub**, so adopt providers incrementally.

### Always required in production
| Var | What | Where to get it |
|-----|------|-----------------|
| `DATABASE_URL` | Postgres connection string | your managed Postgres provider |
| `JWT_SECRET` | signs auth tokens — use a long random string | generate: `openssl rand -hex 32` |
| `WEB_URL` | public URL of the web app (CORS + links) | your Vercel domain |
| `API_URL` / `NEXT_PUBLIC_API_URL` | public URL of the API | your API host domain |

### Generative AI — `LLM_DRIVER=anthropic` (recommended) or `openai`
| Var | Notes |
|-----|-------|
| `ANTHROPIC_API_KEY` | from the Anthropic Console. Powers the AI tutor, summaries, quiz generation, lesson plans, grading, **and the agentic research loop**. |
| `ANTHROPIC_MODEL` | default `claude-sonnet-4-6` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | only if `LLM_DRIVER=openai` |

### Live web research for teachers — `RESEARCH_DRIVER=tavily` \| `brave` \| `serpapi`
| Var | Notes |
|-----|-------|
| `TAVILY_API_KEY` | tavily.com — simplest, search built for LLMs (recommended) |
| `BRAVE_API_KEY` | Brave Search API |
| `SERPAPI_API_KEY` | SerpAPI (Google results) |
| `RESEARCH_MAX_RESULTS` | default 6 |

> Without a research key, teacher "Research a topic" still works using
> example sources (the UI shows an honest "Example sources" badge). With a key,
> it searches the live web and Claude synthesizes a cited briefing.

### Low-latency video — `VIDEO_DRIVER=livekit`
| Var | Notes |
|-----|-------|
| `LIVEKIT_URL` | your LiveKit Cloud or self-hosted SFU URL (e.g. `wss://…`) |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | from LiveKit Cloud project |

### Payments & payouts — `PAYMENTS_DRIVER=stripe`
| Var | Notes |
|-----|-------|
| `STRIPE_SECRET_KEY` | Stripe dashboard (live key) |
| `STRIPE_WEBHOOK_SECRET` | from the webhook endpoint you create (see step 5) |
| `STRIPE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `PLATFORM_COMMISSION_PCT` / `PLATFORM_COMMISSION_PCT_PRO` | defaults 15 / 10 |

> For real teacher payouts to bank accounts, enable **Stripe Connect** and
> onboard teachers as connected accounts (a documented next step in `ROADMAP.md`).

### File storage — `STORAGE_DRIVER=s3`
| Var | Notes |
|-----|-------|
| `AWS_REGION`, `AWS_S3_BUCKET` | your bucket |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | IAM user with `s3:PutObject`/`GetObject` |

### High-accuracy OCR — `OCR_DRIVER=textract` (optional)
Uses the same AWS credentials. Default `tesseract` runs locally for free;
`mock` is for CI.

---

## 3. Provision infrastructure

1. **Postgres** — create a managed database; copy its connection string into
   `DATABASE_URL`.
2. **S3 bucket** — create a private bucket + an IAM user scoped to it.
3. **Provider accounts** — sign up for Anthropic, LiveKit, Stripe, Tavily and
   collect the keys above (add them as you go; each is optional at first).

---

## 4. Deploy the API (container)

The API is a standard Node service. Example with any container host:

```bash
# Build
cd mentora
npm install
npm run build --workspace=@mentora/shared
npm run build --workspace=@mentora/api      # runs `prisma generate && tsc`

# Run DB migrations against production (one-off)
DATABASE_URL=... npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# (optional) seed demo data — DO NOT run on a real production DB
# DATABASE_URL=... npm run db:seed --workspace=@mentora/api

# Start
node apps/api/dist/index.js     # honours API_PORT (default 4000)
```

A minimal Dockerfile for `apps/api`:

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install \
 && npm run build --workspace=@mentora/shared \
 && npm run build --workspace=@mentora/api
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
```

Set all env vars in your host's dashboard. Point your API domain at the
service and confirm `GET /api/health` returns `{"status":"ok"}`.

---

## 5. Deploy the web app (Vercel)

1. Import the repo into Vercel; set the **Root Directory** to `apps/web`.
2. Build command: `npm run build` (Vercel runs it inside the workspace).
   Ensure `@mentora/shared` is built — set the install command to
   `npm install && npm run build --workspace=@mentora/shared` if needed.
3. Set env vars: `NEXT_PUBLIC_API_URL=https://<your-api-domain>`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=…`, `WEB_URL=https://<your-web-domain>`.
4. Deploy. Update the API's `WEB_URL` to the web domain so CORS allows it.

### Stripe webhook
Create a webhook endpoint in Stripe pointing at
`https://<your-api-domain>/api/payments/webhook`, then put its signing secret
into `STRIPE_WEBHOOK_SECRET` on the API.

---

## 6. Mobile (Expo)
```bash
cd apps/mobile
# set EXPO_PUBLIC_API_URL=https://<your-api-domain>
npx expo prebuild       # generate native projects
eas build --platform all   # build with EAS, or run `expo start` for dev
```
Real low-latency video on device uses `@livekit/react-native` in a custom dev
build (see `apps/mobile/README.md`).

---

## 7. Production hardening checklist
- [ ] Strong random `JWT_SECRET`; rotate periodically.
- [ ] HTTPS everywhere; set `WEB_URL`/`NEXT_PUBLIC_API_URL` to https domains.
- [ ] Lock CORS to your web domain (already driven by `WEB_URL`).
- [ ] Managed Postgres with automated backups; run `prisma migrate deploy` on release.
- [ ] Put the API behind a rate limiter / WAF; add request logging & error reporting.
- [ ] Restrict the S3 bucket to private; serve files via signed URLs in production.
- [ ] Configure Stripe in **live** mode and verify the webhook signature.
- [ ] Children's-privacy/COPPA + Terms/Privacy review before public launch.
- [ ] Add CI to run `npm test` (unit+component+integration) and Playwright e2e on PRs.

---

## 8. Recommended adoption order
1. Postgres + S3 + `JWT_SECRET` → app fully functional with stub AI.
2. `ANTHROPIC_API_KEY` → real AI tutor, summaries, quizzes, agentic research.
3. `TAVILY_API_KEY` → live web research for teachers.
4. `STRIPE_*` → real subscriptions and paid sessions.
5. `LIVEKIT_*` → real low-latency classrooms & 1:1 video.
6. `OCR_DRIVER=textract` → higher-accuracy document extraction.
