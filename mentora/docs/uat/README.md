# Mentora UAT Pack

Welcome to the User Acceptance Testing pack for **Mentora** — the K-12 learning marketplace where retired and seasoned professionals teach.

This document explains everything a tester needs to know before opening a single page: where the app lives, which accounts to use, what counts as a pass, and how to record what you find.

---

## What is this testing for?

Mentora has three promises to check:

1. **Everything works end-to-end** — a teacher can upload materials, create a course, schedule a session, and see their earnings; a learner can find that teacher, subscribe, join a class, and use the AI tutor; a guardian can manage their children's accounts.
2. **Extreme ease of use** — the platform is designed for retired professionals who may not be tech-savvy. Large text, plain language, big tap targets, and a "Larger text" toggle are non-negotiable.
3. **Money flows correctly** — subscription prices, pay-per-session fees, and the commission split (85% to standard-tier teachers, 90% to Mentor Pro teachers) must all display and calculate correctly.

---

## Environment setup

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 20 or higher |
| Docker Desktop | any recent version |
| Browser | Chrome, Firefox, or Safari (latest) |

### Starting the app for the first time

Open a terminal and run these commands one by one:

```bash
cd mentora
cp .env.example .env          # copy environment config — only needed once
npm install
npm run build --workspace=@mentora/shared
npm run db:up                 # start Postgres inside Docker
npm run db:migrate            # apply database schema
npm run db:seed               # load all demo data (prints credentials at the end)
npm run dev                   # start the API and the web app together
```

Wait until you see a line like `ready on http://localhost:3000` before opening the browser.

### After the first time

```bash
npm run db:up    # if Docker is not already running
npm run dev
```

### Where to open the app

| Service | URL | What you should see |
|---------|-----|---------------------|
| Web app | `http://localhost:3000` | Mentora home page with "A lifetime of expertise becomes the next generation's head start." |
| API health check | `http://localhost:4000/api/health` | `{"status":"ok"}` |

If either URL fails to load, stop and notify the development team. Do not start testing.

---

## Demo accounts

All accounts use the password **`Password123!`**, except the admin account,
which uses **`Admin@1234!`**.

| Role | Email | Name | Key details |
|------|-------|------|-------------|
| Teacher | `margaret.chen@mentora.app` | Margaret Chen | Mentor Pro, Math, MIT background, verified, $85/hr |
| Teacher | `james.okafor@mentora.app` | Dr. James Okafor | Mentor Pro, Science, NASA background, verified, $90/hr |
| Teacher | `eleanor.vasquez@mentora.app` | Eleanor Vasquez | Standard Mentor, English, UCLA, $75/hr |
| Teacher | `robert.tanaka@mentora.app` | Robert Tanaka | Mentor Pro, Computer Science, Google/Microsoft, $95/hr |
| Teacher | `patricia.obrien@mentora.app` | Patricia O'Brien | Standard Mentor, History, Smithsonian, $70/hr |
| Teacher | `amelia.krishnaswamy@mentora.app` | Dr. Amelia Krishnaswamy | Standard Mentor, Languages, not yet verified |
| Student | `student@mentora.app` | Alex Johnson | Active Scholar subscription ($19/mo), enrolled in Algebra, Python, and History courses |
| Guardian | `david.park@example.com` | David Park | Parent of Lily Park and Ethan Park |
| Child | `lily.park@example.com` | Lily Park | Enrolled in Algebra + Reading; guardian is David |
| Child | `ethan.park@example.com` | Ethan Park | Enrolled in Python + Chemistry; guardian is David |
| Admin | `admin@mentora.app` | Mentora Admin | Platform administrator — password `Admin@1234!` |

---

## Entry criteria

Do not begin testing until all of these boxes can be checked:

- [ ] `http://localhost:3000` loads the home page without error messages
- [ ] `http://localhost:4000/api/health` returns `{"status":"ok"}`
- [ ] `npm run db:seed` has completed successfully (no red error output)
- [ ] Signing in with `student@mentora.app` / `Password123!` lands on `/dashboard`
- [ ] At least one teacher appears on `/teachers` and at least one course on `/courses`
- [ ] No P1 (Critical) defects from any previous test session are unresolved

---

## Exit criteria

UAT is complete when:

| Metric | Required threshold |
|--------|--------------------|
| Overall pass rate (all scripts combined) | 90% or higher |
| P1 (Critical) defects open | 0 |
| P2 (High) defects open | 0 |
| P3 (Medium) defects open | 3 or fewer |
| Accessibility checklist items marked Fail | 0 |

If any threshold is not met, the release is blocked until the defects are fixed and re-tested.

---

## How to record results

Every test script is a markdown file with a table. Each row is one step. The last two columns are yours to fill in:

| Column | What to write |
|--------|--------------|
| **Pass / Fail** | Write **Pass** if what you saw matches the "Expected result" exactly. Write **Fail** if it does not match, even partially. |
| **Notes** | For a Fail: write exactly what you saw — copy any error message word for word, note the URL, describe the visual. For a Pass: leave blank, or add a note if something looked unusual. |

At the end of each script, record the total number of Pass and Fail steps. Then raise a defect ticket for every Fail (see severity definitions below).

---

## Defect severity definitions

| Severity | When to use it | Example |
|----------|----------------|---------|
| **P1 — Critical** | The app is completely broken, data is lost or corrupted, or the problem blocks all further testing. | Clicking "Publish course" crashes the server; the login page never loads. |
| **P2 — High** | A primary user journey cannot be completed and there is no workaround. | A teacher cannot upload any file; the earnings screen always shows $0. |
| **P3 — Medium** | A primary journey works but something is noticeably wrong or confusing, and a workaround exists. | The OCR status badge stays on "Processing…" for more than 5 minutes; the commission percentage shown is wrong but the earn totals are right. |
| **P4 — Low** | A cosmetic or wording issue with no functional impact. | A typo on the pricing page; a badge colour looks slightly different from the design. |

When raising a defect, include: severity, which script and step number, exact steps to reproduce, what you expected, and what actually happened.

---

## Test scripts

Run the scripts in this order if possible — earlier scripts create data (published courses, scheduled sessions) that later scripts depend on.

| File | Persona | What is covered |
|------|---------|-----------------|
| `scripts/margaret-retired-teacher.md` | Margaret Chen, retired teacher | Sign-in, profile edit, material upload, OCR and AI summary, course creation and publishing, scheduling group and 1:1 sessions, earnings and commission |
| `scripts/alex-learner.md` | Alex Johnson, student | Browse and filter teachers and courses, subscribe to Scholar plan, join a live class room, AI tutor chat and quiz generation |
| `scripts/david-guardian.md` | David Park, guardian | View and manage child profiles, review progress, manage subscription and billing |
| `scripts/admin.md` | Mentora Admin | Verify a teacher, review marketplace listings, sanity-check key numbers |

---

## Sign-off

When all scripts are complete, fill in `docs/uat/uat-summary-template.md` and get it signed by the product owner before any release.
