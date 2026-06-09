# Mentora — End-to-End Tests (`@mentora/e2e`)

Playwright-based e2e suite for the full Mentora platform (web + API + database).

---

## Prerequisites

The entire stack must be **running and seeded** before you invoke any test command.
These tests do **not** start any server themselves.

### 1. Start the database

```bash
# from the monorepo root
npm run db:up          # spins up the Postgres Docker container
```

### 2. Run migrations and seed demo data

```bash
# from the monorepo root
npm run db:migrate     # applies Prisma migrations
npm run db:seed        # inserts demo users, courses, sessions, etc.
```

Seeded demo accounts (password `Password123!`, except admin: `Admin@1234!`):

| Role     | Email                        | Password       |
|----------|------------------------------|----------------|
| Teacher  | margaret.chen@mentora.app    | `Password123!` |
| Student  | student@mentora.app          | `Password123!` |
| Guardian | david.park@example.com       | `Password123!` |
| Admin    | admin@mentora.app            | `Admin@1234!`  |

### 3. Start the API and web servers

```bash
# from the monorepo root — runs both concurrently
npm run dev

# or separately:
npm run dev:api        # API on http://localhost:4000
npm run dev:web        # Web on http://localhost:3000
```

---

## First-time browser install

```bash
# from tests/e2e
npm run install:browsers
```

This downloads the Chromium binary used by Playwright (one-time operation).

---

## Running the tests

```bash
# Headless (CI default)
npm test

# Headed — opens a real Chromium window (great for debugging)
npm run test:headed
```

---

## Environment variables

| Variable        | Default                   | Purpose                          |
|-----------------|---------------------------|----------------------------------|
| `E2E_BASE_URL`  | `http://localhost:3000`   | Web origin the tests navigate to |
| `E2E_API_URL`   | `http://localhost:4000`   | API origin (referenced in docs)  |

Export overrides before running:

```bash
E2E_BASE_URL=https://staging.mentora.app npm test
```

---

## Spec files and journeys covered

### `tests/visitor.spec.ts` — Visitor (unauthenticated)

| Test | What it verifies |
|------|-----------------|
| Brand name visible in navbar | `Mentora` link rendered in `<header>` |
| Hero heading renders | h1 "A lifetime of expertise becomes…" |
| "Find a Teacher" CTA | Present and href `/teachers` |
| "Become a Mentor" CTA | Present and href `/signup?role=TEACHER` |
| Trust badge | "Trusted by 18,000+ families" visible |
| Stats bar | 2,400+, 18,000+, 4.9/5 social-proof numbers |
| "Get started free" CTA | Links to `/signup` |
| "View plans" CTA | Links to `/pricing` |
| Nav links for guests | Find a Teacher, Courses, Pricing visible |
| Pricing page heading | "Simple, transparent pricing" |
| Explorer plan | Name, tagline, "Free" price |
| Scholar plan | Name, $19.00/mo, "Billed monthly" |
| Family plan | Name, $39.00/mo |
| Teacher plans section | "Earn more, keep more" heading |
| Mentor (free) plan | Name and tagline |
| Mentor Pro plan | Name, $12.00/mo |
| Monthly→Annual toggle | Scholar changes to $15.83, billed note + Save badge appear |
| Annual→Monthly toggle | Price reverts to $19.00 |
| Annual aria-pressed | `aria-pressed` attribute tracks state |

### `tests/auth.spec.ts` — Authentication

| Test | What it verifies |
|------|-----------------|
| New learner sign-up | Random email, chooses "I want to learn", lands on `/dashboard` with greeting |
| Short-password validation | Client-side error shown, URL stays on `/signup` |
| Sign out | Student logs in, clicks "Sign out", "Sign in" button reappears |
| Student login | Seeded student logs in, sees student dashboard |
| Wrong password | Error alert "Email or password is incorrect" |
| Empty form | Field-level errors for email + password shown |

### `tests/teacher.spec.ts` — Teacher

| Test | What it verifies |
|------|-----------------|
| Personalised greeting | Dashboard h1 "Good to see you, Margaret" |
| Upload material button | Visible on the teacher hero section |
| "Teach" nav link | Only visible for authenticated teachers |
| Upload drop-zone | `role="button"`, correct accessible label |
| Accepted file types text | "PDF, Word, images, video, audio" |
| File upload → OCR/AI UI | File appears in list; OCR status badge renders; spec waits up to 30 s for Text extracted / AI Summary (time-boxed — pipeline latency may vary in CI) |

### `tests/learner.spec.ts` — Learner / AI Tutor

| Test | What it verifies |
|------|-----------------|
| Welcome message | "Hello! I'm your Mentora AI tutor…" visible on page load |
| Quick-action buttons | Make a quiz, Explain simply, Summarise for me |
| Input & Send button | Textarea and Send button rendered |
| Free-text question | User bubble appears; assistant reply renders (30 s timeout) |
| "Make a quiz" quick action | User bubble appears; quiz option buttons render (45 s timeout) |

### `tests/accessibility.spec.ts` — Accessibility

| Test | What it verifies |
|------|-----------------|
| Toggle button label | `aria-label="Switch to larger text size"` in navbar |
| Toggle ON | `data-font-size="large"` added to `<html>` |
| Toggle OFF | Attribute removed from `<html>` |
| Preference persistence | Attribute survives a page reload (localStorage key `mentora_font_size`) |
| A+ indicator | `A+` text appears in navbar button when large text is active |
| Skip link exists | `<a href="#main-content">Skip to main content</a>` in DOM |
| Main landmark | `<main id="main-content">` exists |

---

## Recommended run sequence (CI)

```bash
# 1. Infrastructure
npm run db:up && npm run db:migrate && npm run db:seed

# 2. Start stack (in background or separate terminals)
npm run dev:api &
npm run dev:web &

# 3. Wait for readiness (adjust to your CI health-check strategy)
# e.g. npx wait-on http://localhost:3000 http://localhost:4000

# 4. Install browsers (once per runner image)
cd tests/e2e && npm run install:browsers

# 5. Run tests
npm test
```

---

## Artifacts

| Artifact | Location |
|----------|----------|
| HTML report | `tests/e2e/playwright-report/index.html` |
| Test results | `tests/e2e/test-results/` |
| Failure screenshots | `tests/e2e/test-results/<test>/screenshot.png` |
| Traces (first retry) | `tests/e2e/test-results/<test>/trace.zip` — open with `npx playwright show-trace <path>` |
