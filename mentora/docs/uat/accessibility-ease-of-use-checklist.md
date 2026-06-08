# Accessibility & Ease-of-Use Checklist

This checklist exists because Mentora's core audience includes **retired professionals** — people who may be encountering online learning tools for the first time, and who deserve an experience that is clear, comfortable, and confidence-building. Every item here maps to a real commitment Mentora has made in its design.

Work through each item on a desktop browser (Chrome or Firefox) first, then repeat the mobile checks on a 375px-wide viewport (use Chrome DevTools > Device Emulation > iPhone SE).

---

## How to use this checklist

For each item, tick one of:

- **Pass** — the item is clearly satisfied
- **Fail** — the item is not satisfied; raise a defect
- **N/A** — the item does not apply to the page or device being tested

Write any observations in the Notes column even for passing items if you spotted something borderline.

---

## Part 1: Text size and readability

| # | Check | Where to verify | Pass / Fail / N/A | Notes |
|---|-------|-----------------|-------------------|-------|
| A1 | Body text on all key pages is at least 18px (equivalent to 1.125rem at the browser's default 16px base). Squinting should not be needed. | Home (`/`), `/teachers`, `/courses`, `/tutor`, `/account` | | |
| A2 | Headings are significantly larger than body text — the hierarchy is obvious at a glance. | All pages | | |
| A3 | The **"Larger text"** toggle on the **Accessibility tab** at `/account` switches to a 22.5px base (an increase of roughly 25%) and makes text visibly bigger across the whole app. | `/account` > Accessibility tab, then navigate to `/courses` to observe | | |
| A4 | After turning "Larger text" ON, the toggle persists when navigating between pages — it does not reset on page change. | Toggle on at `/account`, then navigate to `/teachers`, then back to `/account` | | |
| A5 | After a full browser refresh (F5 or Ctrl+R) with "Larger text" ON, the preference is still active. | Enable "Larger text", reload the page | | |
| A6 | Line length is comfortable: body text paragraphs do not stretch more than ~75 characters wide on a 1280px desktop. | `/teachers/[id]` bio text, `/courses/[id]` description | | |

---

## Part 2: Colour contrast (WCAG AA)

WCAG AA requires: **4.5:1 contrast ratio** for normal text, **3:1** for large text (18px bold or 24px regular) and UI components.

| # | Check | Where to verify | Pass / Fail / N/A | Notes |
|---|-------|-----------------|-------------------|-------|
| B1 | Dark body text on white or light backgrounds has sufficient contrast. Use the browser's accessibility inspector (Chrome DevTools > Elements > Accessibility) or a contrast checker tool to spot-check. | Body text on any white card | | |
| B2 | Brand-coloured buttons (the deep indigo/violet "brand-500" colour) have sufficient contrast with their white label text. | Primary "Find a Teacher" and "Sign in" buttons | | |
| B3 | Teal-coloured badges (e.g. grade level badges like "Grade 8") have sufficient contrast with their text. | `/teachers`, `/courses` | | |
| B4 | Stone/grey text used for descriptions and secondary labels (e.g. "18,000+ Students learning" in the stats bar) is not too light — readable without effort. | Home page stats bar, course card description text | | |
| B5 | Error messages (red text on pink backgrounds, e.g. on the login form) are clearly legible. Enter a wrong password on `/login` to trigger the error state. | `/login` | | |
| B6 | The "MOCK ROOM" banner in the video room is readable (white text on red background). | `/room/[any-session-id]` | | |
| B7 | Green "Verified" badges and "published" course badges pass contrast for their internal text. | `/teachers`, `/courses`, `/teach/courses/[id]` | | |

---

## Part 3: Touch and click target sizes

All interactive elements should have a minimum tap target of **48 × 48 px** (Google Material guideline, used throughout Mentora per the source code). This is especially important for teachers who may use the app on a tablet.

| # | Check | Where to verify | Pass / Fail / N/A | Notes |
|---|-------|-----------------|-------------------|-------|
| C1 | Primary action buttons (e.g. "Sign in", "Find a Teacher", "Create course", "Schedule session") are at least 48px tall. In Chrome DevTools, hover over a button and check the element size in the bottom bar, or use the inspector. | `/login`, `/dashboard`, `/teach/sessions/new` | | |
| C2 | The monthly/annual pricing toggle buttons ("Monthly" and "Annual") are at least 40px tall (they use `min-h-[40px]` per the source code). | `/pricing` | | |
| C3 | Quiz answer buttons in the AI tutor are at least 48px tall. | `/tutor` — click "Make a quiz" and inspect one answer button | | |
| C4 | The "Remove file" (X) button on uploaded files in the upload page is large enough to tap without precision. | `/teach/upload` — upload a file, then check the X button | | |
| C5 | On a 375px mobile viewport, all buttons remain tappable without zooming in. | All main pages in mobile emulation | | |
| C6 | Navigation links in the top bar (Navbar) are spaced wide enough to be tapped individually on a small screen without hitting the wrong one. | Mobile emulation — look at the top navigation | | |

---

## Part 4: Primary actions reachable in 3 clicks or fewer

Mentora's ease-of-use mandate is that no primary action should require more than three clicks from the home page. Test from a signed-in starting point where noted.

| # | Primary action | Starting point | Maximum clicks allowed | Actual click count | Pass / Fail / N/A | Notes |
|---|----------------|----------------|------------------------|--------------------|-------------------|-------|
| D1 | Find a teacher and view their profile | `/` (home page, not signed in) | 3 | | | Home → /teachers → /teachers/[id] = 2 clicks |
| D2 | Browse courses by subject | `/` | 3 | | | Home → click a subject tile in the subject grid = 2 clicks |
| D3 | Sign in | `/` | 2 | | | Nav or "Get started free" → `/login` = 1–2 clicks |
| D4 | Upload a material (teacher) | `/dashboard` (signed in as teacher) | 2 | | | Dashboard "Upload material" button → `/teach/upload` = 1 click |
| D5 | Create a new course (teacher) | `/dashboard` (signed in as teacher) | 2 | | | Dashboard "New course" button → `/teach/courses/new` = 1 click |
| D6 | Schedule a session (teacher) | `/dashboard` (signed in as teacher) | 2 | | | Dashboard "Schedule session" button → `/teach/sessions/new` = 1 click |
| D7 | Open the AI Tutor | `/dashboard` (signed in as student) | 2 | | | Dashboard "AI Tutor" quick action → `/tutor` = 1 click |
| D8 | View the pricing page | `/` | 2 | | | Footer or "View plans" link → `/pricing` = 1–2 clicks |

---

## Part 5: Plain language and no jargon

Mentora's intended teacher audience is retired professionals who are not education or tech insiders. Check that the language is warm and clear.

| # | Check | Where to verify | Pass / Fail / N/A | Notes |
|---|-------|-----------------|-------------------|-------|
| E1 | The home page hero text is written in plain English, uses no acronyms, and immediately explains what Mentora does. | `/` | | |
| E2 | The pricing page uses terms like "keep 85%", not "revenue share" or "net payout margin". Commission is explained in plain terms. | `/pricing` | | |
| E3 | Error messages use friendly, helpful language (e.g. "Please enter your email address." not "Email field cannot be null"). | `/login` — leave email blank and click Sign in; `/teach/courses/new` — leave title blank and click Create course | | |
| E4 | The upload page explains what will happen to uploaded files before the user uploads anything. | `/teach/upload` — headline and subheading visible without scrolling | | |
| E5 | Button labels describe what will happen, not a vague action. (Good: "Publish course". Bad: "Submit".) | `/teach/courses/[id]`, `/teach/sessions/new`, `/teach/courses/new` | | |
| E6 | Empty states (when a list has no items) include a helpful message and a next-step action. | `/dashboard` with no sessions; `/courses` with a filter that returns 0 results | | |
| E7 | The AI Tutor greeting message is welcoming and describes what the tutor can do in one or two sentences. | `/tutor` | | |

---

## Part 6: Keyboard navigation and visible focus

| # | Check | Where to verify | Pass / Fail / N/A | Notes |
|---|-------|-----------------|-------------------|-------|
| F1 | Tab key moves focus through all interactive elements on the page in a logical order (top to bottom, left to right). | `/login`, `/teachers`, `/pricing` | | |
| F2 | Focused elements have a visible focus ring (a coloured outline). The focus ring is never hidden or invisible. | Tab through `/login` and watch for the outline on each field and button | | |
| F3 | Forms can be submitted using Enter (no mouse required). | `/login` — fill in credentials, press Enter | | |
| F4 | Modal dialogs (e.g. "Add a lesson" modal on `/teach/courses/[id]`) trap focus inside the modal when open — tabbing does not leave the modal and reach elements behind it. | Open the "Add lesson" modal and Tab through it | | |
| F5 | The "Skip to main content" link is the first focusable element on every page (it may be visually hidden until focused). Press Tab on any page without clicking first. | Any page | | |
| F6 | The quiz answer buttons in `/tutor` can be selected with Enter or Space when focused. | `/tutor` — click "Make a quiz", Tab to an answer button, press Space | | |
| F7 | The upload drop zone can be activated with Enter or Space (keyboard users should be able to open the file browser). | `/teach/upload` — Tab to the drop zone, press Enter | | |

---

## Part 7: Mobile viewport (375px wide)

Perform these checks using Chrome DevTools with the viewport set to 375px wide (iPhone SE emulation). You do not need a real phone.

| # | Check | Where to verify | Pass / Fail / N/A | Notes |
|---|-------|-----------------|-------------------|-------|
| G1 | The home page hero text and buttons are fully visible without horizontal scrolling. | `/` on 375px | | |
| G2 | The teacher directory filter bar stacks vertically (Search, Subject, Grade are each full-width rows on mobile). | `/teachers` on 375px | | |
| G3 | Course cards and teacher cards in grid layouts switch to single-column on mobile. | `/courses`, `/teachers` on 375px | | |
| G4 | The pricing plan cards stack vertically. Each card is fully readable without horizontal scrolling. | `/pricing` on 375px | | |
| G5 | The login and signup forms fit within the screen width with comfortable padding. | `/login`, `/signup` on 375px | | |
| G6 | The "New course" form at `/teach/courses/new` is usable on mobile — all fields are accessible and the keyboard does not cover the submit button. | `/teach/courses/new` on 375px | | |
| G7 | The AI Tutor chat interface is usable on mobile — the text input and Send button are visible above the keyboard. | `/tutor` on 375px | | |

---

## Part 8: Forms, labels, and friendly error handling

| # | Check | Where to verify | Pass / Fail / N/A | Notes |
|---|-------|-----------------|-------------------|-------|
| H1 | Every input field has a visible label above it. No field relies solely on placeholder text as its label. | `/login`, `/signup`, `/teach/courses/new`, `/account` | | |
| H2 | Required fields are clearly marked (with an asterisk or "required" label). | `/teach/courses/new` — Course title and Description fields have `*` | | |
| H3 | When a required field is left empty and the form is submitted, a clear inline error appears next to that field in red text. | `/teach/courses/new` — click "Create course" with empty title | | |
| H4 | Error messages disappear (or update) once the user corrects the input and re-submits. | After seeing an error, fix the field, re-submit | | |
| H5 | The password field on `/login` has a "Forgot password?" link nearby. | `/login` | | |
| H6 | After a successful form submission, a positive confirmation (toast or on-page message) appears. | Submit `/teach/courses/new` successfully; submit `/account` profile save | | |
| H7 | File upload errors (e.g. file too large) display a friendly message (e.g. "is too large. Max size is 50MB."), not a raw technical error. | `/teach/upload` — try uploading a file larger than 50MB if you have one; otherwise this is N/A | | |

---

## Checklist result summary

| Part | Items | Pass | Fail | N/A |
|------|-------|------|------|-----|
| A — Text size and readability | 6 | | | |
| B — Colour contrast (WCAG AA) | 7 | | | |
| C — Touch/click target sizes | 6 | | | |
| D — 3-click reach | 8 | | | |
| E — Plain language | 7 | | | |
| F — Keyboard and focus | 7 | | | |
| G — Mobile viewport | 7 | | | |
| H — Forms and errors | 7 | | | |
| **Total** | **55** | | | |

**Overall accessibility result:** Pass / Fail / Partial

**Tester name:**

**Date tested:**

**Browser and OS:**

**Mobile emulation device used:**
