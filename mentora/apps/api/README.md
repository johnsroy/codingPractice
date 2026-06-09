# Mentora API

The REST backend for Mentora — a K-12 online learning marketplace where retired and seasoned professionals teach.

Built with **Express + TypeScript + Prisma (PostgreSQL)**. Ships with a pluggable adapter architecture so every feature works out-of-the-box with zero API keys (stubs/mock adapters) and upgrades seamlessly to production providers by setting env vars.

---

## Quick Start

```bash
# 1. Copy environment config
cp ../../.env.example .env   # edit DATABASE_URL etc.

# 2. Start PostgreSQL (Docker Compose provided at monorepo root)
docker compose up -d postgres

# 3. Install dependencies (from monorepo root)
npm install

# 4. Build the shared package
npm run build --workspace=@mentora/shared

# 5. Run migrations and generate Prisma client
npm run db:migrate --workspace=@mentora/api
npm run db:generate --workspace=@mentora/api

# 6. Seed demo data
npm run db:seed --workspace=@mentora/api

# 7. Start in dev mode (hot reload)
npm run dev --workspace=@mentora/api
```

Server starts at **http://localhost:4000**. Health check: `GET /api/health`.

---

## Environment Variables

All variables are documented in `/.env.example` at the monorepo root. Key ones:

| Variable | Default | Description |
|---|---|---|
| `API_PORT` | `4000` | HTTP port |
| `DATABASE_URL` | postgres://mentora:mentora@localhost:5432/mentora | PostgreSQL connection string |
| `JWT_SECRET` | dev-only-... | Sign access + refresh tokens. Change in production! |
| `STORAGE_DRIVER` | `local` | `local` or `s3` |
| `OCR_DRIVER` | `tesseract` | `tesseract` (local) or `textract` (AWS) |
| `LLM_DRIVER` | `stub` | `stub`, `anthropic`, or `openai` |
| `VIDEO_DRIVER` | `mock` | `mock` or `livekit` |
| `PAYMENTS_DRIVER` | `mock` | `mock` or `stripe` |

---

## Adapter Architecture

Every integration point is abstracted behind an interface + factory. The factory reads a `*_DRIVER` env var and picks the implementation. If a production driver is chosen but credentials are missing, it **falls back gracefully** with a warning — the server never fails to boot.

### Storage (`src/adapters/storage/`)
| Driver | How it works |
|---|---|
| `local` (default) | Writes files to `STORAGE_LOCAL_DIR`; served via `GET /api/files/:key` |
| `s3` | Stores in AWS S3; needs `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |

### OCR (`src/adapters/ocr/`)
| Driver | How it works |
|---|---|
| `tesseract` (default) | Runs [tesseract.js](https://github.com/naptha/tesseract.js) locally — no API key needed |
| `textract` | AWS Textract — higher accuracy for complex or scanned docs |

### LLM (`src/adapters/llm/`)
| Driver | How it works |
|---|---|
| `stub` (default) | Deterministic heuristic responses — fully demoable, zero cost |
| `anthropic` | claude-sonnet-4-6 via `@anthropic-ai/sdk`; streaming SSE supported |
| `openai` | Falls back to stub until implemented; set `OPENAI_API_KEY` + `OPENAI_MODEL` |

### Video (`src/adapters/video/`)
| Driver | How it works |
|---|---|
| `mock` (default) | Returns a fake token; web app renders a built-in mock room |
| `livekit` | Mints real JWT access tokens for a [LiveKit](https://livekit.io/) SFU — sub-200ms WebRTC |

LiveKit was chosen over alternatives because it is open-source, self-hostable, and provides a proper SFU (Selective Forwarding Unit) which scales from 2-person 1:1 coaching to 500-seat classrooms without peer-to-peer topology limits.

### Payments (`src/adapters/payments/`)
| Driver | How it works |
|---|---|
| `mock` (default) | Immediately marks payments succeeded; creates Enrollment + Subscription rows; computes `splitEarnings` commission |
| `stripe` | Stripe Checkout Sessions + webhook signature verification + commission accounting |

---

## API Endpoints

All routes are prefixed with `/api`. The canonical list lives in `@mentora/shared/contract.ts`.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new account |
| POST | `/api/auth/login` | — | Login, receive JWT pair |
| POST | `/api/auth/refresh` | — | Exchange refresh token |
| GET | `/api/auth/me` | Bearer | Current user profile |
| POST | `/api/auth/logout` | — | Revoke refresh token |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | Bearer | Own profile |
| PATCH | `/api/users/me` | Bearer | Update profile |
| GET | `/api/users/teachers` | — | Teacher directory (`?subject=&grade=&q=&page=`) |
| GET | `/api/users/:id` | — | Public profile |

### Courses
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/courses` | — | List published courses |
| POST | `/api/courses` | TEACHER | Create course |
| GET | `/api/courses/:id` | — | Course detail |
| PATCH | `/api/courses/:id` | TEACHER (owner) | Update course |
| POST | `/api/courses/:id/publish` | TEACHER (owner) | Publish (needs ≥1 lesson) |
| POST | `/api/courses/:id/enroll` | Bearer | Enroll (free or checkout) |
| GET | `/api/courses/:id/lessons` | — | List course lessons |

### Lessons
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/lessons` | TEACHER (course owner) | Create lesson |
| GET | `/api/lessons/:id` | — | Get lesson |

### Materials
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/materials` | Bearer | Upload file (multipart `file` field); kicks off OCR pipeline |
| GET | `/api/materials` | Bearer | List (`?courseId=` or `?lessonId=`) |
| GET | `/api/materials/:id` | Bearer | Get material |
| GET | `/api/materials/:id/ocr` | Bearer | OCR status + extracted text |

### Sessions
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/sessions` | Bearer | List (`?mine=true&kind=classroom&upcoming=true`) |
| POST | `/api/sessions` | TEACHER | Create session |
| GET | `/api/sessions/:id` | — | Session detail |
| POST | `/api/sessions/:id/book` | Bearer | Book a session |
| GET | `/api/sessions/:id/join` | Bearer | Get `VideoJoinTicket` |
| POST | `/api/sessions/:id/start` | TEACHER (owner) | Set status → `live` |
| POST | `/api/sessions/:id/end` | TEACHER (owner) | Set status → `completed` |

### AI
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/ai` | Bearer | Invoke AI task (`summarize_material`, `generate_quiz`, `explain_simply`, `lesson_plan`, `tutor_chat`, `grade_answer`) |
| GET | `/api/ai/tutor/stream` | Bearer | SSE stream (`?message=...`) |
| POST | `/api/ai/tutor/stream` | Bearer | SSE stream (body: `{ messages: [...] }`) |

### Payments
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/payments/plans` | — | All pricing plans |
| POST | `/api/payments/checkout` | Bearer | Create checkout session |
| POST | `/api/payments/webhook` | — | Stripe/mock webhook receiver |
| GET | `/api/payments/subscription` | Bearer | Current subscription |
| GET | `/api/payments/earnings` | TEACHER | Payout summary |

### Static Files
| Method | Path | Description |
|---|---|---|
| GET | `/api/files/:key` | Serve uploaded files (local storage driver only) |

---

## Demo Credentials

After running `npm run db:seed`:

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@mentora.app | Admin@1234! |
| TEACHER (Pro) | margaret.chen@mentora.app | Password123! |
| TEACHER (Pro) | james.okafor@mentora.app | Password123! |
| TEACHER | eleanor.vasquez@mentora.app | Password123! |
| TEACHER (Pro) | robert.tanaka@mentora.app | Password123! |
| TEACHER | patricia.obrien@mentora.app | Password123! |
| TEACHER | amelia.krishnaswamy@mentora.app | Password123! |
| GUARDIAN | david.park@example.com | Password123! |
| STUDENT | student@mentora.app | Password123! |

---

## Scripts

```bash
npm run dev          # Start with hot reload (tsx watch)
npm run build        # prisma generate + tsc
npm run start        # Run compiled dist/index.js
npm run typecheck    # tsc --noEmit
npm run db:migrate   # prisma migrate dev
npm run db:generate  # prisma generate
npm run db:seed      # seed demo data
```
