# Mentora UAT Pack — README

Welcome to the User Acceptance Testing (UAT) pack for Mentora. This document explains what UAT is, how to get the app running, which test accounts to use, and how to record your results. Please read this page before opening any of the test scripts.

---

## What is UAT?

UAT is the final check before we ship. Real people — not just developers — click through the app and confirm it works the way it should. You do not need any technical skills. You just need a browser, the app running locally or on a staging server, and the ability to follow numbered steps and write down what you saw.

---

## Environment Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 or higher |
| Docker Desktop | any recent version |
| A modern browser | Chrome, Firefox, or Safari |

### Starting the App

Open a terminal and run these commands in order:

```bash
cd mentora
cp .env.example .env          # only needed the very first time
npm install
npm run build --workspace=@mentora/shared
npm run db:up                 # starts the Postgres database in Docker
npm run db:migrate
npm run db:seed               # loads demo accounts and sample data
npm run dev                   # starts both the API and the web app
```

When you see output like `ready on http://localhost:3000`, the app is live.

### Where to Open the App

| Service | URL |
|---------|-----|
| Web app (this is what you test) | http://localhost:3000 |
| API health check (optional sanity check) | http://localhost:4000/api/health |

---

## Demo Accounts

All demo accounts share the same password: **`Password123!`**

| Role | Email | Notes |
|------|-------|-------|
| Teacher (retired professional) | `margaret.chen@mentora.app` | Pre-seeded with subjects and a headline |
| Student / Learner | `student@mentora.app` | Explorer (free) plan |
| Guardian (parent) | `david.park@example.com` | Has child profiles linked |
| Admin | `admin@mentora.app` | Can verify teachers and oversee the marketplace |

> If the seed added additional demo teachers they will be printed to the console when you run `npm run db:seed`.

---

## Entry Criteria

Before you begin a test session, confirm all of these are true:

- [ ] `http://localhost:3000` loads without a browser error
- [ ] `http://localhost:4000/api/health` returns `{"status":"ok"}` or similar
- [ ] You can sign in with `student@mentora.app` / `Password123!` and reach `/dashboard`
- [ ] At least one course and one teacher appear on `/teachers` and `/courses`

If any entry criterion fails, stop and alert the development team. Do not begin testing until the app is stable.

---

## Exit Criteria (Go / No-Go)

We aim for the following before shipping:

| Metric | Threshold |
|--------|-----------|
| Overall pass rate | 90% or higher across all scripts |
| Critical (P1) defects open | 0 |
| High (P2) defects open | 2 or fewer |
| Accessibility checklist items failed | 0 items marked "Fail" in the WCAG AA column |

If the threshold is not met, the release is blocked until defects are resolved and re-tested.

---

## How to Record Results

Each script file contains a table with these columns:

| Column | What to write |
|--------|--------------|
| **Pass / Fail** | Write **Pass** if what you saw matches the "Expected result". Write **Fail** if it does not. |
| **Notes** | Write what you actually saw when it differs from expected, any error messages (copy the exact wording), the browser and screen size you used, and any steps that were unclear. |

You do not need to fill in the Notes column for a passing step unless you spotted something worth mentioning (for example, a typo or slow load).

At the end of each script there is an overall result row. Fill this in after completing all steps.

---

## Defect Severity Definitions

Use these definitions when reporting a bug so the team can prioritise quickly.

| Severity | Label | Definition | Example |
|----------|-------|------------|---------|
| 1 | **Critical (P1)** | A core flow is completely broken — a user cannot complete the action at all, or data is lost or corrupted. | Clicking "Publish course" throws a blank error and nothing is saved. |
| 2 | **High (P2)** | A key feature works but is significantly wrong — wrong data shown, a required field silently ignored, or a crash that affects many users. | The earnings calculator shows the wrong commission percentage. |
| 3 | **Medium (P3)** | A feature mostly works but a minor part is wrong or confusing. A workaround exists. | A success toast message says "Course created" when the course was published. |
| 4 | **Low (P4)** | Cosmetic issues, spelling errors, minor UI inconsistencies. No functional impact. | The "Forgot password?" link is slightly misaligned on Safari. |

When reporting a defect, please include: the severity label, the test script and step number where it occurred, the exact steps to reproduce it, what you expected, and what actually happened.

---

## Test Scripts

Each persona has its own file under `docs/uat/scripts/`:

| File | Persona | Role |
|------|---------|------|
| `margaret-retired-teacher.md` | Margaret Chen | Teacher — upload materials, create a course, schedule sessions, check earnings |
| `alex-learner.md` | Alex (student) | Learner — browse teachers, subscribe, join a class, use the AI tutor |
| `david-guardian.md` | David Park | Guardian — manage children, review progress, manage billing |
| `admin.md` | Admin | Admin — verify teachers, oversee the marketplace |

Run the scripts in order if possible, because some steps (like a teacher publishing a course) create data that later scripts (like Alex browsing courses) depend on.

---

## Sign-Off Template

When all scripts are complete, fill in `docs/uat/uat-summary-template.md` and obtain sign-off from the product owner before releasing.
