# UAT Script: Alex Johnson — Learner

**Persona:** Alex Johnson, a student in their early teens (or the parent of one). Alex wants to find a great maths teacher, look at available courses, upgrade to a paid subscription, join a live class, and use the AI tutor for homework help.

**Account:** `student@mentora.app` / `Password123!`

**Current plan:** Scholar ($19/mo) — already active in the seeded data, so the subscription step below tests that the plan displays correctly and that a mock checkout can be initiated.

---

## Preconditions

- [ ] The app is running at `http://localhost:3000`
- [ ] The database has been seeded (`npm run db:seed`)
- [ ] The Margaret teacher script has been completed (so at least one published course and one scheduled session exist)
- [ ] You are not already signed in — start from a fresh browser tab or incognito window

---

## Section 1: Browse teachers — no account needed

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 1 | Open `http://localhost:3000` without signing in | The Mentora home page loads. A "Find a Teacher" button and a "Become a Mentor" button are visible in the hero section. A stats bar shows numbers like "2,400+ Expert mentors" and "18,000+ Students learning". | | |
| 2 | Click **Find a Teacher** in the hero section | The page navigates to `/teachers` without requiring a login. | | |
| 3 | The teacher directory loads | A search bar ("Name, subject, expertise…"), a "Subject" filter dropdown, and a "Grade" filter dropdown are visible at the top. Below, teacher cards appear showing name, headline, subject badges, rating, and hourly rate. At least four teacher cards should be visible. | | |
| 4 | In the **Subject** dropdown, choose **Mathematics** | The list of teacher cards updates (or reloads). Only teachers who teach Mathematics should remain. Margaret Chen's card should be visible. | | |
| 5 | Clear the subject filter by choosing **All subjects** | All teacher cards return. | | |
| 6 | Type `NASA` in the search bar | The results update to show teachers whose name, bio, or headline contains "NASA". Dr. James Okafor (Former NASA Scientist) should appear. | | |
| 7 | Clear the search bar | All teachers return. | | |
| 8 | In the **Grade** dropdown, choose **Grade 8** | Only teachers who teach Grade 8 are shown. | | |
| 9 | Clear the grade filter | All teachers return. | | |
| 10 | Click the card for **Margaret Chen** | The browser navigates to `/teachers/[margaret-id]`. The page shows Margaret's full profile: her name, "Verified" badge, "Mentor Pro" badge, headline "Retired MIT Professor | 35 Years in Mathematics Education", bio, subjects (Mathematics), grade levels, and a star rating. | | |
| 11 | Scroll down to see her courses | A section titled "Courses by Margaret Chen" appears, showing at least "Algebra Fundamentals: From Confusion to Confidence" with a price badge. | | |
| 12 | Look at the right-hand sidebar | A "Book a session" card shows Margaret's hourly rate ($85.00/hour) and a "Book 1:1 coaching" button. If upcoming group sessions are seeded, they appear below with "Join free" or "Join — $X.XX" buttons. | | |

---

## Section 2: View a course in detail

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 13 | Click **Algebra Fundamentals: From Confusion to Confidence** from Margaret's profile | The browser navigates to `/courses/[algebra-course-id]`. The page shows: course title, subject and grade badges ("Mathematics", "Grade 8"), full description, lesson count, enrolled student count, rating, and a section called "Your instructor" showing Margaret's name and headline. | | |
| 14 | Scroll to the "Lessons" section | Five lessons are listed in order: 1. Introduction to Variables and Expressions, 2. Solving One-Step Equations, 3. Two-Step and Multi-Step Equations, 4. Inequalities and the Number Line, 5. Introduction to Graphing Linear Functions. Each shows its summary. | | |
| 15 | Look at the course materials section (if visible) | A "Course materials" section may appear with a "Algebra Variables — Study Guide" entry and a download icon. | | |
| 16 | Look at the enrolment card on the right | Shows the price ($49.00), an "Enroll now" button, and a checklist including "Downloadable materials", "AI tutor support", and "Certificate on completion". | | |
| 17 | Click **Enroll now** without being signed in | The browser redirects to `/login?redirect=/courses/[algebra-course-id]`. The login page shows the correct redirect parameter in the URL. | | |

---

## Section 3: Sign in and subscribe to Scholar

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 18 | On the login page (arrived from step 17 above), sign in with `student@mentora.app` / `Password123!` | After signing in, the browser redirects back to the course page (not to `/dashboard`). A "Welcome back!" toast appears. | | |
| 19 | On the course page, click **Enroll now** (now that you are signed in) | A green confirmation panel replaces the button: a tick icon, "You're enrolled!" text, and a "Go to dashboard" link. A toast says "Enrolled successfully! Check your dashboard." | | |
| 20 | Navigate to `http://localhost:3000/pricing` | The pricing page loads. Three learner plan cards appear: Explorer (Free), Scholar ($19/mo — marked "Most popular"), and Family ($39/mo). | | |
| 21 | Click the **Annual** toggle at the top | All plan prices update. Scholar shows an equivalent monthly price of ~$15.83/mo and a green badge "Save $28.00 per year". Family shows ~$32.50/mo. | | |
| 22 | Click back to **Monthly** | Prices return: Explorer = Free, Scholar = $19.00/mo, Family = $39.00/mo. | | |
| 23 | On the **Scholar** plan card, click **Choose Scholar** | The browser navigates to `/signup?plan=scholar`. (The checkout is mocked — in development this just shows the signup page. This is expected behaviour.) | | |
| 24 | Navigate back to `/account` then click the **Subscription** tab | The Subscription tab shows Alex's current plan: a "scholar" badge, status "active", billing provider "mock", and a renewal date approximately one month in the future. A "Manage billing" button is visible. | | |

---

## Section 4: Join a live class room

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 25 | Navigate to `/dashboard` | The student dashboard appears. "Upcoming sessions" section is visible. | | |
| 26 | If a session with a "Join live" button is visible, click it. If not: in a separate browser tab, sign in as `margaret.chen@mentora.app` and open the dashboard — find a session and note its ID from the URL, then sign back in as Alex and navigate to `/room/[that-session-id]` | The page navigates to `/room/[sessionId]`. A loading spinner appears briefly, then the room view loads. | | |
| 27 | In the room view, confirm the mock room banner is shown | A red badge reading "MOCK ROOM" appears in the top navigation bar. An amber notice reads: "Development mode: real video activates when LiveKit keys are configured." This is expected — not a defect. | | |
| 28 | Check the session title appears in the top bar | The session title (e.g. "Live Q&A: Solving Multi-Step Equations") is displayed in white text in the top bar. | | |
| 29 | Look at the controls at the bottom of the room | Four controls: a round microphone button, a round camera button, a chat bubble button, and a materials/AI button. A red round "leave" button (phone icon rotated) is on the right. | | |
| 30 | Click the **Chat** button (speech bubble icon) | A side panel slides open on the right. It shows a "Chat" tab and a "Materials & AI" tab. The Chat tab is active. A message "Welcome to the classroom! 👋" appears from the system. | | |
| 31 | Type a short message in the chat input and press Enter (or click the send button) | Your message appears as a blue bubble on the right side of the chat panel. | | |
| 32 | Click the **Materials & AI** tab in the side panel | The panel switches to show an "Open AI Tutor" link that opens in a new tab, and a note about session materials. | | |
| 33 | Click the red **Leave session** button (bottom right) | The browser navigates to `/dashboard`. | | |

---

## Section 5: Use the AI tutor and generate a quiz

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 34 | Navigate to `http://localhost:3000/tutor` | The AI Tutor page loads. A large blue robot icon is shown. Heading reads "AI Tutor" with subtitle "Ask anything — I'm here to help you learn." Three quick-action buttons appear: "Make a quiz", "Explain simply", and "Summarise for me". A "New chat" button (circular arrow icon) is also shown. | | |
| 35 | Look at the initial message in the chat window | A message from the AI says: "Hello! I'm your Mentora AI tutor. I can help you understand any topic, create practice quizzes, or explain things in a simple way. What would you like to learn today?" | | |
| 36 | Type `What is a variable in algebra?` in the input box and press Enter (or click **Send**) | Your message appears as a blue bubble on the right. A loading indicator ("..." animation) appears in an AI bubble on the left. Within a few seconds the AI responds with an explanation of variables. | | |
| 37 | Click the **Explain simply** quick-action button | A message "Please explain this concept in simple words, like I am 10 years old." appears from you, followed by an AI response that explains something in simple language. | | |
| 38 | Click the **Make a quiz** quick-action button | A message "Please create a short quiz for me on this topic." appears from you. The AI responds with a quiz. Inside the AI's reply, interactive multiple-choice question cards appear — each card has a question, letter options (A, B, C, D) as clickable buttons, and the buttons have a minimum height of 48px. | | |
| 39 | Click one of the answer options in the quiz | The selected option changes colour: green (with a tick) if correct, red if wrong. The correct answer is highlighted green regardless of your choice. An "Explanation" box appears below the options with a brief explanation. | | |
| 40 | Try to click a second answer option for the same question | Nothing happens — the question is locked once answered. You cannot change your answer. | | |
| 41 | Click the **New chat** button (circular arrow icon) | The conversation resets to only the opening "Hello!" message. Previous messages are cleared. | | |
| 42 | Type a message without being signed in (sign out first via the account menu, then return to `/tutor`) | The AI still responds (the tutor works for unauthenticated users on the free tier). An amber badge near the top reads "Sign in for unlimited questions". | | |

---

## Script result summary

| | Count |
|---|---|
| Total steps | 42 |
| Pass | |
| Fail | |
| Blocked (could not run) | |

**Overall result:** Pass / Fail / Blocked

**Tester name:**

**Date tested:**

**Browser and OS:**
