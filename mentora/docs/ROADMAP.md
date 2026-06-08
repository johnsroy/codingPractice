# Mentora — Roadmap

Mentora ships as a full product, designed to be continuously built upon. This
is the forward plan, grouped by horizon.

## Now (shipped in this foundation)
- Two-sided marketplace: teachers, learners, guardians, admin.
- Auth (JWT + refresh), role-based access.
- Courses → lessons → materials; teacher directory; course catalog.
- Material upload with OCR + AI summary pipeline.
- Live sessions: group classrooms + paid 1:1 coaching, with video join tickets.
- AI tutor + summarize / quiz / explain / lesson-plan / grade tasks.
- Pricing, subscriptions, pay-per-session checkout, commission split + earnings.
- Pluggable adapters for storage, OCR, LLM, video, payments.
- Accessibility-first web app + Expo mobile app.

## Next (high-value increments)
- **Stripe Connect** onboarding so teacher payouts hit real bank accounts.
- **LiveKit recordings** + automatic transcript → AI lesson notes & highlights.
- **Whiteboard & screen share** in the classroom; breakout rooms.
- **Scheduling & availability** calendar with timezone handling and reminders.
- **Reviews & ratings** with verified-attendance gating.
- **Notifications**: email + push (Expo) for bookings, reminders, messages.
- **Search**: full-text over OCR'd materials and course content.
- **Guardian controls**: screen-time, content filters, weekly digests.

## Later (scale & moat)
- **Adaptive learning**: AI builds a personalized path per learner from quiz performance.
- **Curriculum alignment** to regional standards (CBSE, Common Core, etc.).
- **Marketplace growth**: teacher storefronts, referral program, cohort classes.
- **Analytics**: learning-outcome dashboards for guardians and schools.
- **Institutions**: school/district plans, SSO, bulk seats.
- **Trust & safety**: ID verification, background checks, moderation, recording consent.
- **Offline-first mobile** for low-connectivity regions.

## Engineering hygiene to add
- Automated tests (API integration + web e2e with Playwright).
- CI: typecheck + build + test on PR.
- Observability: structured logs, tracing, error reporting.
- Rate limiting, audit logs, and GDPR/childrens-privacy (COPPA) tooling.
