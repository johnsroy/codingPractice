# Mentora Web App

Next.js 15 App Router frontend for Mentora — a K-12 online learning marketplace connecting retired/seasoned professionals with students (grades 1-12).

## Running locally

```bash
# From monorepo root — builds @mentora/shared first
npm run bootstrap

# Start the dev server (port 3000)
npm run dev:web

# Or from apps/web directly
cd apps/web
npm run dev
```

Environment variables are read from `.env` at the repo root. Copy `.env.example` to `.env` and fill in any keys you need. The app works out of the box with `stub` drivers — no external keys required.

## Page & route map

| Route | Description |
|---|---|
| `/` | Landing page — hero, how it works, featured teachers, subject grid, social proof |
| `/pricing` | Learner plans + teacher plans with annual/monthly toggle, earnings calculator |
| `/login` | Sign-in form |
| `/signup` | Sign-up form with role chooser (Learner / Teacher) |
| `/teachers` | Searchable/filterable teacher directory |
| `/teachers/[id]` | Teacher profile — bio, subjects, courses, book 1:1, view sessions |
| `/courses` | Browse/filter course catalogue |
| `/courses/[id]` | Course detail — lessons, materials, enroll |
| `/dashboard` | Role-aware dashboard (student: sessions/courses; teacher: earnings/sessions/courses) |
| `/teach/upload` | Drag-and-drop material upload with live OCR + AI summary polling |
| `/teach/courses/new` | Create a new course |
| `/teach/courses/[id]` | Manage course — add lessons, attach materials, publish |
| `/teach/sessions/new` | Schedule a group or 1:1 session |
| `/room/[sessionId]` | Live classroom — LiveKit if keys set, mock local-preview room otherwise |
| `/tutor` | AI Tutor chat — SSE streaming, quick actions (quiz, explain, summarize) |
| `/account` | Profile edit, subscription status, accessibility prefs |

## Design principles

- **18px base font** — scales to 22.5px with "Larger text" toggle (persisted to localStorage).
- **WCAG AA contrast everywhere** — minimum 4.5:1 ratio, explicit focus rings on all interactive elements.
- **48px minimum tap targets** — every button, link and input meets this.
- **Warm, calm palette** — indigo brand (#6366f1) + teal secondary (#14b8a6) + amber accent (#f59e0b) on near-white surface (#fafaf9).
- **No jargon** — plain, friendly language throughout.
- **Graceful degradation** — all API calls have loading/error/empty states; no page crashes if the API is unreachable.

## Design tokens

| Token | Value | Usage |
|---|---|---|
| `brand-500` | `#6366f1` | Primary buttons, links, focus rings |
| `teal-500` | `#14b8a6` | Secondary actions, badges |
| `accent-500` | `#f59e0b` | Highlights, earnings, stars |
| `surface-50` | `#fafaf9` | Page background |
| `shadow-card` | `0 4px 20px rgba(0,0,0,0.08)` | Cards |
| `shadow-hover` | `0 8px 30px rgba(99,102,241,0.18)` | Hovered cards |
| `--font-scale` | `1` / `1.25` | Accessibility font multiplier |

## Key components

- `src/components/ui/` — full design system (Button, Card, Input, Textarea, Select, Badge, Avatar, Modal, Tabs, Toast, Spinner, EmptyState)
- `src/components/layout/` — Navbar (sticky, mobile-responsive, role-aware) + Footer
- `src/lib/api.ts` — typed API client wrapping all API_ROUTES from @mentora/shared
- `src/lib/auth.tsx` — AuthContext with login/register/logout/role helpers
- `src/lib/accessibility.tsx` — font-size toggle context

## Dependencies the orchestrator must install

All listed in `package.json`. Key runtime deps:

```
next ^15  react ^19  react-dom ^19
@tanstack/react-query ^5
@livekit/components-react ^2  livekit-client ^2
@mentora/shared *
clsx  lucide-react  zod
tailwindcss ^3  postcss  autoprefixer
```

LiveKit imports are behind a dynamic `lazy()` import and only activate when `VIDEO_DRIVER=livekit` + valid keys are set. The build succeeds without them.
