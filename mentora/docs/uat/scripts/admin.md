# UAT Script: Admin — Platform Oversight

**Persona:** The Mentora platform administrator. This account is responsible for verifying new teacher profiles, monitoring the marketplace health, and doing sanity checks on listings to make sure the data displayed to users is accurate.

**Account:** `admin@mentora.app` / `Admin@1234!`

> **Note on admin capabilities:** The current web app (`/dashboard`) shows a student-style dashboard for the admin role. The admin-specific management tools (teacher verification, content moderation) are expected to be accessed via the API or a dedicated admin interface in a future sprint. This script therefore covers what the admin can see and confirm through the existing web UI, plus direct verification of key data that the platform promises. Where a full admin UI does not yet exist, the step describes what to confirm and marks the expectation clearly.

---

## Preconditions

- [ ] The app is running at `http://localhost:3000`
- [ ] The database has been seeded (`npm run db:seed`)
- [ ] All three previous persona scripts (Margaret, Alex, David) have been run
- [ ] You are not already signed in

---

## Section 1: Admin sign-in and dashboard

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 1 | Open `http://localhost:3000/login` | The sign-in page appears with the Mentora logo, email and password fields, and a "Sign in" button. | | |
| 2 | Enter email `admin@mentora.app`, password `Admin@1234!`, click **Sign in** | A "Welcome back!" toast appears. The page navigates to `/dashboard`. | | |
| 3 | Note what the dashboard shows for the admin role | The dashboard currently shows a student-style view (this is expected for the current implementation). The "Hello" greeting and quick actions should appear without error. No JavaScript errors should appear in the browser console (open DevTools > Console to check). | | |
| 4 | Navigate to `http://localhost:4000/api/health` | The API responds with `{"status":"ok"}` or similar. | | |

---

## Section 2: Verify the teacher marketplace is populated and accurate

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 5 | Navigate to `http://localhost:3000/teachers` | The teacher directory loads. At minimum **six** teacher cards are visible. | | |
| 6 | Count the teacher cards visible without any filters applied | Six or more cards are shown. The count shown below the filters (e.g. "Showing 6 teachers") matches the number of cards on screen. | | |
| 7 | Look for the "Verified" badge on teacher cards | Margaret Chen and Dr. James Okafor (and Robert Tanaka and Eleanor Vasquez and Patricia O'Brien) should show a green "Verified" badge. Dr. Amelia Krishnaswamy should **not** show a "Verified" badge — she is unverified in the seed data. | | |
| 8 | Look for the "Mentor Pro" badge on teacher cards | Margaret Chen, Dr. James Okafor, and Robert Tanaka should show a "Mentor Pro" badge. Eleanor Vasquez, Patricia O'Brien, and Dr. Amelia Krishnaswamy should **not** show this badge. | | |
| 9 | Click **Dr. Amelia Krishnaswamy**'s profile | Her profile page loads at `/teachers/[id]`. Confirm: no "Verified" badge is present in her profile header. The headline reads "Retired Linguist | 5 Languages | K-12 Language Arts". | | |
| 10 | Navigate back to `/teachers` and click **Margaret Chen**'s profile | Her profile shows a green "Verified" badge and a blue "Mentor Pro" badge. Her hourly rate shows "$85.00/hour". Her star rating shows 4.9. | | |

---

## Section 3: Verify the course marketplace

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 11 | Navigate to `http://localhost:3000/courses` | The courses browse page loads. A filter bar appears (Search, Subject, Grade). | | |
| 12 | Check the total course count shown | At least **eight** courses should be displayed (the eight seeded by the seed script, plus any created during the Margaret teacher script). | | |
| 13 | Check that all displayed courses have a "published" status | Every course card visible should show published content (no course in a "draft" state should appear in the public listing, because draft courses are not visible to learners). | | |
| 14 | Find the course **"Reading Foundations for Early Learners"** (by Dr. Amelia Krishnaswamy) | The course card shows a green "Free" badge instead of a price. | | |
| 15 | Click **"Reading Foundations for Early Learners"** | The course detail page loads. The enrolment card on the right shows "Free" in large teal text and "Included with any plan" below it. The "Enroll for free" button is visible. The instructor section shows Dr. Amelia Krishnaswamy. | | |
| 16 | Navigate back to `/courses` and find **"Algebra Fundamentals: From Confusion to Confidence"** | The course card shows the price **$49.00** (4900 cents). | | |
| 17 | Click **"Algebra Fundamentals: From Confusion to Confidence"** | The course detail page shows $49.00 in the enrolment card. The instructor is Margaret Chen. Five lessons are listed. A "Course materials" section shows "Algebra Variables — Study Guide" with a download icon. | | |
| 18 | Filter courses by **Subject = Computer Science** | Only "Introduction to Python Programming" (by Robert Tanaka) appears. | | |
| 19 | Click **Introduction to Python Programming** | The course detail page shows $49.00, instructor Robert Tanaka, and five lessons (Your First Python Program, Variables Data Types and Input, Making Decisions with if/elif/else, Loops for and while, Functions). | | |

---

## Section 4: Pricing sanity check

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 20 | Navigate to `http://localhost:3000/pricing` | The pricing page loads. Three learner plan cards and two teacher plan cards are visible. | | |
| 21 | Check the three learner plan prices on the "Monthly" toggle | Explorer = Free, Scholar = $19.00/mo (marked "Most popular"), Family = $39.00/mo. | | |
| 22 | Check the two teacher plan prices on the "Monthly" toggle | Mentor = Free, Mentor Pro = $12.00/mo (marked "Most popular"). | | |
| 23 | Switch to the **Annual** toggle | Scholar shows approximately $15.83/mo (equivalent), billed $190.00/year. Family shows approximately $32.50/mo, billed $390.00/year. Mentor Pro shows approximately $10.00/mo, billed $120.00/year. A green "Save X per year" badge appears on each paid plan. | | |
| 24 | Scroll to the **Earnings calculator** and set the slider to **$2,000** | Mentor (free): Platform fee = $300.00, Your payout = $1,700.00. Mentor Pro: Platform fee = $200.00, Your payout = $1,800.00. The badge on the Mentor Pro panel says "+$100.00 more vs. free". | | |
| 25 | Verify the commission maths is consistent: on any amount, Mentor keeps 85% and Mentor Pro keeps 90% | Check two more values — e.g. $500: Mentor payout = $425.00; $1,500: Mentor payout = $1,275.00. Mentor Pro payout at $500 = $450.00; at $1,500 = $1,350.00. | | |

---

## Section 5: Confirm key pages load without errors

| # | Step | Expected result | Pass / Fail | Notes |
|---|------|-----------------|-------------|-------|
| 26 | Navigate to `http://localhost:3000` (home page) while signed in as admin | The home page loads. The hero heading reads "A lifetime of expertise becomes the next generation's head start." Stats bar shows numbers. Featured teachers section and subject grid are visible. No console errors. | | |
| 27 | Navigate to `http://localhost:3000/teachers` | Page loads. Teacher cards visible. No console errors. | | |
| 28 | Navigate to `http://localhost:3000/courses` | Page loads. Course cards visible. No console errors. | | |
| 29 | Navigate to `http://localhost:3000/tutor` | The AI Tutor page loads. "Make a quiz", "Explain simply", and "Summarise for me" buttons are visible. The opening AI message appears. | | |
| 30 | Navigate to `http://localhost:3000/account` | The Account page loads for the admin account. Shows name "Mentora Admin", email `admin@mentora.app`, role badge "ADMIN". Three tabs visible: Profile, Subscription, Accessibility. | | |
| 31 | Click the **Subscription** tab | Shows "No active plan" (the admin account has no subscription) with a "View plans" button. | | |
| 32 | Click **View plans** | Navigates to `/pricing`. | | |
| 33 | Sign out of the admin account | The session ends and the user is redirected to the home page or login page without error. | | |

---

## Script result summary

| | Count |
|---|---|
| Total steps | 33 |
| Pass | |
| Fail | |
| Blocked (could not run) | |

**Overall result:** Pass / Fail / Blocked

**Tester name:**

**Date tested:**

**Browser and OS:**
