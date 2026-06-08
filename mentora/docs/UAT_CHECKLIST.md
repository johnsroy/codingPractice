# Mentora — UAT Checklist (run this on your end)

A single, tick-as-you-go acceptance checklist covering every user-facing flow,
the AI/agentic features, and the "extreme ease of use" mandate. Detailed
persona scripts live in [`docs/uat/`](uat/); this is the consolidated pass.

**Setup**
```bash
cd mentora && cp .env.example .env
npm install && npm run build --workspace=@mentora/shared
npm run db:up && npm run db:migrate && npm run db:seed
npm run dev          # web → http://localhost:3000 · api → http://localhost:4000
```
**Demo logins** (password `Password123!`): teacher `margaret.chen@mentora.app` ·
student `student@mentora.app` · guardian `david.park@example.com` · admin
`admin@mentora.app`.

> Tip: open the browser console (F12) and watch for red errors during the pass —
> there should be none.

---

## A. First impressions & navigation
- [ ] Landing page loads; hero, "how it works", featured teachers, subject grid all visible.
- [ ] Top nav and footer links all work (Find a Teacher, Courses, Pricing, AI Tutor).
- [ ] **"Larger text" toggle** (the `T` icon in the nav) visibly enlarges all text; preference persists after refresh.
- [ ] Everything is legible: good contrast, no overlapping/clipped text, buttons ≥ a comfortable tap size.
- [ ] Resize to a phone width — layout reflows, nav becomes a hamburger, nothing is cut off.

## B. Pricing & money model
- [ ] `/pricing` shows learner plans (Explorer free, Scholar $19, Family $39) and teacher plans (Mentor free, Mentor Pro $12).
- [ ] Monthly/Annual toggle changes the displayed prices (Scholar shows ~$15.83/mo annually) and shows the savings.
- [ ] The teacher earnings/commission explanation is clear (keep 85% / 90%).

## C. Sign up & sign in
- [ ] Sign up as a **learner** (random email) → lands on the student dashboard.
- [ ] Sign up as a **teacher** → lands on the teacher dashboard.
- [ ] Wrong password shows a friendly error (not a stack trace); empty form shows field-level hints.
- [ ] Log out returns you to a signed-out state; log back in works.

## D. Learner experience
- [ ] Browse `/teachers`; filter by subject and grade; open a teacher profile.
- [ ] Browse `/courses`; open a course; see lessons/materials; the Enrol button is present.
- [ ] Student dashboard shows upcoming sessions and enrolled courses (no `$NaN`/blank).
- [ ] Open a classroom (`/room/<id>` via a session) — you get a join screen; mock mode shows a camera preview and clear controls.

## E. Generative AI — the AI Tutor (`/tutor`)
- [ ] Welcome message renders; quick actions visible (Make a quiz / Explain simply / Summarise).
- [ ] Type a question → an AI answer appears (no crash).
- [ ] Click **"Make a quiz"** → an interactive multiple-choice quiz renders; selecting an option reveals the correct answer.
- [ ] **"Explain simply"** returns an age-appropriate explanation.
- [ ] *(With `ANTHROPIC_API_KEY` set)* answers are genuinely intelligent and specific to your question, not templated.

## F. Agentic web research for teachers (`/teach/research`) — NEW
- [ ] As a teacher, reach **"Research a topic"** from the navbar or the dashboard in ≤3 clicks.
- [ ] Enter a brand-new topic (e.g. "The Water Cycle"), optionally pick subject + grade, click **Research this topic**.
- [ ] A clear loading state appears ("Searching the web and writing your briefing…").
- [ ] A briefing renders with: a **summary**, **key points**, a **suggested lesson plan** (timed sections), and **Sources**.
- [ ] Each source is a clickable link that opens in a new tab.
- [ ] Badge honesty: with no search key it says "Example sources"; *(with `TAVILY_API_KEY` set)* it says "Live web" and the sources are real, current pages about your topic.
- [ ] "Turn this into a course" and "Copy briefing" buttons work.

## G. Teacher tools & content
- [ ] **Upload material** (`/teach/upload`): drag/drop or pick a file (try a PDF/image and a `.txt`).
- [ ] OCR status progresses and an **AI summary** appears for the uploaded document.
- [ ] Unsupported file types show a friendly message (not a server error).
- [ ] Create a course (`/teach/courses/new`), add a lesson, **publish** it; it then appears in `/courses`.
- [ ] Schedule a session (`/teach/sessions/new`) — both **Group classroom** and **1:1 coaching** options work.
- [ ] Teacher dashboard **earnings** show real currency values (e.g. "Your earnings (you keep 85%)") — **no `$NaN`**.

## H. Guardian & admin
- [ ] Guardian (`david.park@…`) can see their account; children are associated.
- [ ] Admin (`admin@…`) can sign in and view the teacher directory / marketplace.

## I. Accessibility & ease-of-use acceptance
- [ ] Base text is large and legible; "Larger text" makes it bigger still.
- [ ] Every page has one obvious primary action; no jargon.
- [ ] All interactive elements are keyboard-reachable with a visible focus ring; `Tab`/`Enter` work in forms.
- [ ] The "Skip to main content" link appears when tabbing from the top.
- [ ] Color contrast is comfortable; nothing important is conveyed by color alone.
- [ ] No console errors during the whole pass.

## J. Robustness
- [ ] Stop the API server and reload a page — you get friendly "can't reach the server" states, not a white screen.
- [ ] No visible `undefined`, `NaN`, or `[object Object]` anywhere.

---

### Automated coverage already passing (for reference)
- Unit (shared): **285** · Component (web): **137** · Integration (api): **87** · E2E (Playwright): **64** → **573 automated tests green**, including a full route-by-route UI audit. See [`TESTING.md`](TESTING.md).

### Sign-off
| Area | Pass / Fail | Notes |
|------|-------------|-------|
| Navigation & a11y | | |
| Pricing | | |
| Auth | | |
| Learner flows | | |
| AI Tutor | | |
| Agentic research | | |
| Teacher tools | | |
| Guardian/Admin | | |

**Go / No-go:** ____________  **Tester:** ____________  **Date:** ____________
