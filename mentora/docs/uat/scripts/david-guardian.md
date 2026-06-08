# UAT Script: David Park — Guardian

**Persona:** David Park, a parent managing the learning accounts for his two children, Lily (enrolled in Algebra and Reading) and Ethan (enrolled in Python and Chemistry). David wants to see what his children are studying, check their progress, and manage his family's subscription and billing.

**Account:** `david.park@example.com` / `Password123!`

**Child accounts:**
- Lily Park — `lily.park@example.com` / `Password123!`
- Ethan Park — `ethan.park@example.com` / `Password123!`

---

## Preconditions

- [ ] The app is running at `http://localhost:3000`
- [ ] The database has been seeded (`npm run db:seed`)
- [ ] The Margaret teacher script has been completed (published courses exist)
- [ ] You are not already signed in

---

## Section 1: Guardian sign-in and dashboard overview

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 1 | Open `http://localhost:3000/login` | The sign-in page appears with "Welcome back" heading, email and password fields, and a "Sign in" button. | | |
| 2 | Enter email `david.park@example.com`, password `Password123!`, click **Sign in** | A "Welcome back!" toast appears and the page navigates to `/dashboard`. | | |
| 3 | Check what type of dashboard is shown | The dashboard view for David's role should appear. If it shows a guardian-specific layout with a "Guardian dashboard" or child management section, note the details. If it shows the student dashboard layout (which is also used for guardians in the current implementation), note that too — both are acceptable at this stage. The key check is that the sign-in works and a dashboard loads without errors. | | |
| 4 | Look for any "Find a teacher" or learning navigation links | Quick action cards should be visible: "Find a teacher" (links to `/teachers`), "My courses" (links to `/courses`), and "AI Tutor" (links to `/tutor`). | | |

---

## Section 2: View child profiles

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 5 | Sign out of David's account (click the account avatar or menu, then sign out). Then sign in as **Lily Park** using `lily.park@example.com` / `Password123!` | After signing in, the dashboard shows "Hello, Lily" in the welcome heading. | | |
| 6 | Check Lily's upcoming sessions section | If Lily is enrolled in sessions, they are listed. If not, an empty state shows "No upcoming sessions" with a "Find a teacher" link. | | |
| 7 | Navigate to `http://localhost:3000/courses` | The courses browse page loads. Lily is enrolled in the Algebra and Reading courses. | | |
| 8 | Sign out of Lily's account. Sign in as **Ethan Park** using `ethan.park@example.com` / `Password123!` | After signing in, the dashboard shows "Hello, Ethan". | | |
| 9 | Navigate to `http://localhost:3000/courses` | Ethan is enrolled in Python and Chemistry courses (seeded data). | | |
| 10 | Sign out of Ethan's account. Sign back in as **David Park** using `david.park@example.com` / `Password123!` | David's dashboard loads. | | |

---

## Section 3: Account settings and subscription management

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 11 | Navigate to `http://localhost:3000/account` | The Account page loads showing David Park's name, email (`david.park@example.com`), and a "GUARDIAN" role badge. Three tabs are visible: **Profile**, **Subscription**, **Accessibility**. | | |
| 12 | The Profile tab should be active. Check the fields | "Full name" shows "David Park". "Email address" is pre-filled and disabled with a note "Contact support to change your email." "Bio" shows "Parent of two wonderful learners." No "Professional headline", "Hourly rate", or "Years experience" fields are shown (those are teacher-only). | | |
| 13 | Update the **Bio** field to `Parent of Lily and Ethan.` and click **Save changes** | A green toast "Profile saved!" appears. The change is retained on the form. | | |
| 14 | Click the **Subscription** tab | One of two states is shown: (a) A "No active plan" card with a "View plans" button, or (b) A subscription card showing the current plan. David does not have a pre-seeded subscription, so option (a) is the expected result. | | |
| 15 | Click **View plans** (if visible on the "No active plan" card) | The page navigates to `/pricing`. | | |
| 16 | On the pricing page, find the **Family** plan card | The card shows: "Family — $39 / mo", tagline "Up to 4 learners, one bill", and the following features: "Everything in Scholar", "Up to 4 child profiles" (highlighted), "Guardian dashboard & controls", "Family progress digest", "Priority support", "Best 1:1 coaching discount". | | |
| 17 | Click **Choose Family** | The browser navigates to `/signup?plan=family`. (This is the expected mock checkout behaviour in development.) | | |
| 18 | Press the browser back button to return to the pricing page | The pricing page loads again without error. | | |
| 19 | Navigate back to `/account` and click the **Accessibility** tab | The Accessibility tab shows a "Larger text" toggle switch. The current state is shown below: "Text size is currently normal (18px base)." | | |
| 20 | Click the **Larger text** toggle to turn it on | The toggle moves to the "on" position (blue/brand colour). The text below updates to "Text size is currently large (22.5px base)." All text on the page visibly increases in size. | | |
| 21 | Navigate to `http://localhost:3000/courses` | The courses page loads and text appears larger than normal. Headings, body text, and labels are all noticeably bigger. | | |
| 22 | Navigate back to `/account` > **Accessibility** tab and turn the **Larger text** toggle off | The toggle returns to the off (grey) state. Text returns to normal size across the app. | | |

---

## Section 4: Review a child's enrolled courses and progress

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 23 | Sign out as David. Sign in as **Lily Park** (`lily.park@example.com` / `Password123!`) | Dashboard shows "Hello, Lily". | | |
| 24 | Navigate to `http://localhost:3000/courses` | Lily's enrolled courses are visible. At minimum: "Algebra Fundamentals: From Confusion to Confidence" and "Reading Foundations for Early Learners". | | |
| 25 | Click **Algebra Fundamentals: From Confusion to Confidence** | The course detail page loads showing the title, description, subject badge "Mathematics", grade badge "Grade 8", and a list of 5 lessons. The "Your instructor" section shows Margaret Chen. | | |
| 26 | Click back to courses and then click **Reading Foundations for Early Learners** | The course detail page loads showing "Free" in the enrolment card (no cost to access). The instructor is Dr. Amelia Krishnaswamy. Three lessons are listed. | | |
| 27 | Note: the course page shows a "Certificate on completion" item in the enrolment checklist | Verify that "Certificate on completion" appears in the checklist on the right-side card. | | |

---

## Section 5: Browse and explore the teacher marketplace

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 28 | Sign out as Lily. Sign in as **David Park** (`david.park@example.com` / `Password123!`) | Dashboard loads. | | |
| 29 | Navigate to `http://localhost:3000/teachers` | The teacher directory loads. Multiple teacher cards are visible. | | |
| 30 | Filter by **Subject = Languages** | Dr. Amelia Krishnaswamy should appear (she teaches Languages). Other teachers who do not teach Languages should disappear. | | |
| 31 | Click Dr. Amelia Krishnaswamy's teacher profile card | Her profile page loads showing her name, headline "Retired Linguist | 5 Languages | K-12 Language Arts", bio, subjects (English, Languages), grade levels (Grades 1-6), and the "Book a session" card on the right. Note: her profile does **not** show a "Verified" badge (she is not yet verified in the seed data). | | |
| 32 | Check that the "Book 1:1 coaching" button on her profile works for a signed-in guardian | The button is visible and labelled "Book 1:1 coaching". Clicking it would navigate to the session scheduling page (which is a teacher-only page, so it should redirect to `/dashboard` for David). Record what actually happens. | | |

---

## Script result summary

| | Count |
|---|---|
| Total steps | 32 |
| Pass | |
| Fail | |
| Blocked (could not run) | |

**Overall result:** Pass / Fail / Blocked

**Tester name:**

**Date tested:**

**Browser and OS:**
