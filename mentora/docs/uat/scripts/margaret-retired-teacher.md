# UAT Script: Margaret Chen — Retired Teacher

**Persona:** Margaret Chen, a retired MIT mathematics professor. She is comfortable with email and video calls but not deeply technical. She wants to upload her existing study guides, create a structured course, schedule live sessions with students, and see clearly what she has earned.

**Account:** `margaret.chen@mentora.app` / `Password123!`

**Mentor tier:** Mentor Pro — she keeps **90%** of every payment; the platform keeps 10%.

---

## Preconditions

- [ ] The app is running at `http://localhost:3000`
- [ ] The database has been seeded (`npm run db:seed`)
- [ ] You are not already signed in — start from a fresh browser tab or use a private/incognito window

---

## Section 1: Sign in and check the dashboard

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 1 | Open `http://localhost:3000/login` | The sign-in page appears. It shows the Mentora logo, an "Email address" field, a "Password" field, and a "Sign in" button. The heading reads "Welcome back". | | |
| 2 | Enter email `margaret.chen@mentora.app`, enter password `Password123!`, click **Sign in** | A green success toast appears at the top that reads "Welcome back!" and the page moves to `/dashboard`. | | |
| 3 | Look at the teacher dashboard heading | It says "Good to see you, Margaret" (first name only) with a graduation cap emoji. | | |
| 4 | Confirm the three action buttons are visible below the greeting | You can see: **Upload material**, **New course**, and **Schedule session**. | | |
| 5 | Look at the earnings snapshot cards | Three cards show: "Total earned" (a dollar amount), "Pending payout" (a dollar amount), and "Active courses" (a number). Values may be $0 if no payments have been made in this seed run — that is acceptable; the cards must still appear. | | |
| 6 | Look at the "Upcoming sessions" section | At least one session is listed (seeded data includes "Live Q&A: Solving Multi-Step Equations") with an "Upcoming" badge, or an empty-state message "No sessions scheduled" with a "Schedule a session" link. Either is acceptable. | | |
| 7 | Look at the "My courses" section | At least two course cards appear: "Algebra Fundamentals: From Confusion to Confidence" and "Pre-Calculus Mastery". Both should show a green "published" badge. | | |

---

## Section 2: Edit your profile

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 8 | Click the account avatar or navigate to `http://localhost:3000/account` | The Account page loads showing Margaret's name, email (`margaret.chen@mentora.app`), and two badges: "TEACHER" and "Verified". Three tabs are visible: **Profile**, **Subscription**, and **Accessibility**. | | |
| 9 | The "Profile" tab should be active by default. Find the "Professional headline" field | The field is pre-filled with "Retired MIT Professor | 35 Years in Mathematics Education". | | |
| 10 | Find the "Hourly rate (USD)" field | It is pre-filled with `85`. | | |
| 11 | Find the "Years experience" field | It is pre-filled with `35`. | | |
| 12 | Clear the "Bio" field and type: `Testing bio update.` then click **Save changes** | A green toast appears: "Profile saved!". The form does not show any red error messages. | | |
| 13 | Without refreshing the page, check the "Bio" field still shows `Testing bio update.` | The field retains the new text. | | |
| 14 | (Optional cleanup) Restore the bio to: `I spent 35 years teaching mathematics at MIT and several top high schools. Now retired, I am passionate about making math accessible and enjoyable for every K-12 learner.` and click **Save changes** | "Profile saved!" toast appears again. | | |

---

## Section 3: Upload a worksheet and verify OCR + AI summary

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 15 | Click **Upload material** on the dashboard, or navigate to `http://localhost:3000/teach/upload` | The Upload page loads. Heading reads "Upload course materials". There is a large dashed drop-zone that says "Drag & drop, or click to browse". Below it, accepted formats are listed: "PDF, Word, images, video, audio · Up to 50MB each". | | |
| 16 | Create a small test PDF on your computer (any simple text document saved as PDF will do — even a one-line text file renamed `.pdf` works for this test), then either drag it onto the drop zone or click the drop zone and choose your file | An entry appears under "Your uploads" with the file name and an amber "Uploading…" badge. | | |
| 17 | Wait up to 30 seconds while watching the badge change | The badge changes from "Uploading…" to "Queued" (grey) then "Processing…" (amber) and finally "Text extracted" (teal/green). A blue-tinted box labelled "AI Summary" appears below the file name, containing a paragraph of generated text. | | |
| 18 | If OCR extracted text is available and the AI Summary has not appeared yet, click "View extracted text" | A pre-formatted block of text appears showing what the OCR engine read from the file. | | |
| 19 | After the upload completes, confirm the **Use these in a course** button appears at the bottom of the uploads list | A teal button labelled "Use these in a course" is visible. | | |

> **Note:** In the development environment the OCR and AI adapters use local/stub implementations. The "Text extracted" badge and an AI summary should still appear because the seed data includes mock OCR responses. If the badge remains stuck on "Processing…" for more than 2 minutes, record a P3 defect.

---

## Section 4: Create a course with a lesson and publish it

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 20 | Navigate to `http://localhost:3000/teach/courses/new` or click **New course** on the dashboard | The "Create a new course" form appears. Fields: "Course title", "Description", "Subject" (dropdown), "Grade level" (dropdown), "Price per student (USD)". | | |
| 21 | Fill in: Title = `UAT Test Course`, Description = `A course created during user acceptance testing to verify the publish flow.` | Both fields accept the text without error. | | |
| 22 | In the **Subject** dropdown, choose any subject (e.g. "Mathematics") | The dropdown updates to show your selection. | | |
| 23 | In the **Grade level** dropdown, choose any grade (e.g. "Grade 8") | The dropdown updates to show your selection. | | |
| 24 | Leave **Price per student** at `0` — note the hint text "Free (recommended to start)" appears | The price field shows `0` and the hint is visible. | | |
| 25 | Click **Create course** | A green toast says "Course created! Add lessons and materials." and the page moves to `/teach/courses/[new-course-id]`. The course header shows a yellow "draft" badge. | | |
| 26 | On the course management page, click **Add lesson** | A modal dialog appears with a "Lesson title" field (required) and a "Summary (optional)" field. | | |
| 27 | Type `Introduction to UAT` in the "Lesson title" field and `This lesson covers the basics of user acceptance testing.` in the Summary field, then click **Add lesson** | The modal closes. The Lessons section now shows "Lessons (1)" and a card labelled "Introduction to UAT" with the summary below it. A green "Lesson added!" toast appears. | | |
| 28 | Click **Publish course** (the button near the course title) | A green toast says "Course is now live!" and the yellow "draft" badge changes to a green "published" badge. A "View live" button appears. | | |
| 29 | Click **View live** | The browser opens `/courses/[new-course-id]` showing the course as a student would see it: title, description, lesson count, "Your instructor" section with Margaret's name and headline, lesson list, and an enrolment card on the right. | | |

---

## Section 5: Schedule a group classroom and a 1:1 session

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 30 | Navigate to `http://localhost:3000/teach/sessions/new` or click **Schedule session** on the dashboard | The "Schedule a session" page appears. Two large buttons for session type: **Group classroom** (left, showing a group icon and "Teach multiple students at once") and **1:1 Coaching** (right, showing a person icon and "Private personal session"). | | |
| 31 | Click **Group classroom** to select it (it should already be selected by default) | The "Group classroom" button has a blue/brand-coloured border and background, indicating it is selected. An "aria-pressed" state is true. | | |
| 32 | Fill in **Session title**: `UAT Group Maths Session` | Text appears in the field without error. | | |
| 33 | Fill in **Start date & time**: choose any date and time that is at least one hour from now | The datetime field accepts the value. | | |
| 34 | Leave **Duration** as "60 minutes (recommended)" | The dropdown shows "60 minutes (recommended)". | | |
| 35 | Leave **Price per student** as `0` and **Max students** as `20` | Both fields show their default values. | | |
| 36 | Click **Schedule session** | A green toast says "Session scheduled!" and the page redirects to `/dashboard`. The new session appears in the "Upcoming sessions" list with an "Upcoming" badge. | | |
| 37 | Click **Schedule** again (the small button in the "Upcoming sessions" header, or navigate back to `http://localhost:3000/teach/sessions/new`) | The scheduling form appears again. | | |
| 38 | This time click **1:1 Coaching** | The "1:1 Coaching" button becomes selected (brand border). The "Max students" field disappears (1:1 sessions always have a capacity of 1). | | |
| 39 | Fill in **Session title**: `UAT Private Session`, choose a start time at least one hour from now, set **Price per student** to `85` | All fields accept the values without error. A "$" prefix is shown before the price field. | | |
| 40 | Click **Schedule session** | Green toast "Session scheduled!" appears and the page returns to `/dashboard`. | | |

---

## Section 6: Check earnings and commission split

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 41 | On the teacher dashboard, look at the three earnings cards | "Total earned", "Pending payout", and "Active courses" cards are all visible. The values are formatted as currency (e.g. "$76.50") or a plain number for the course count. | | |
| 42 | Navigate to `http://localhost:3000/pricing` | The pricing page loads. Two sections are visible: "For Families" (learner plans) and "For Mentors" (teacher plans). | | |
| 43 | Scroll down to the "For Mentors" section and find the **Mentor** (free) plan card | The card shows: "Standard payout (you keep 85%)" highlighted in bold. Mentora keeps 15%. | | |
| 44 | Find the **Mentor Pro** plan card | The card shows: "Reduced commission (you keep 90%)" highlighted. Price is "$12 / mo". | | |
| 45 | Scroll down to the **Earnings calculator** section | A slider labelled "Monthly gross earnings (USD)" is visible. Below it, two panels side by side: "Mentor (free)" showing platform fee and payout at 15% commission, and "Mentor Pro" showing platform fee and payout at 10% commission. | | |
| 46 | Drag the slider to $1,000 | The Mentor (free) panel shows: Platform fee = $150.00, Your payout = $850.00. The Mentor Pro panel shows: Platform fee = $100.00, Your payout = $900.00. A badge on the Pro panel shows "+$50.00 more vs. free". | | |
| 47 | Confirm the commission maths for $500 input | Drag slider to $500. Mentor (free): Platform fee = $75.00, payout = $425.00. Mentor Pro: Platform fee = $50.00, payout = $450.00. | | |

---

## Script result summary

| | Count |
|---|---|
| Total steps | 47 |
| Pass | |
| Fail | |
| Blocked (could not run) | |

**Overall result:** Pass / Fail / Blocked

**Tester name:**

**Date tested:**

**Browser and OS:**
