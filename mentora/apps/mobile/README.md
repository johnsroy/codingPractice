# Mentora Mobile

Expo / React Native app for the Mentora K-12 learning marketplace.
Built with Expo SDK 51, Expo Router (file-based navigation), and TypeScript.

---

## Quick start

```bash
# From the monorepo root — install all deps (hoisted) and build shared package:
npm run bootstrap

# Then start the Expo dev server:
cd apps/mobile
npx expo start           # Interactive menu (scan QR with Expo Go)
npx expo start --ios     # iOS Simulator
npx expo start --android # Android Emulator
npx expo start --web     # Web (Metro + React Native Web)
```

> **Expo Go caveat:** The LiveKit video SDK requires native modules and must
> run in a custom dev build (see _Video_ section below).
> Everything else works in Expo Go.

---

## Environment setup

Copy the root `.env.example` to `.env` and set:

```
EXPO_PUBLIC_API_URL=http://localhost:4000
```

`EXPO_PUBLIC_*` variables are surfaced by `expo-constants` on both native
and web.  The API client (`src/lib/api.ts`) reads `EXPO_PUBLIC_API_URL`
and appends `/api` to form the base URL.

For a physical device replace `localhost` with your machine's LAN IP:

```
EXPO_PUBLIC_API_URL=http://192.168.1.x:4000
```

---

## Navigation map

```
app/
├── _layout.tsx            Root layout — AuthProvider + Stack
├── index.tsx              Redirect → auth or tabs based on login state
│
├── (auth)/
│   ├── _layout.tsx        Auth stack (redirects logged-in users to tabs)
│   ├── welcome.tsx        ★ Landing page with feature cards + CTAs
│   ├── login.tsx          Email + password sign in
│   └── signup.tsx         Name / email / password + role chooser (Learn / Teach)
│
├── (tabs)/
│   ├── _layout.tsx        Bottom tab bar (role-aware labels)
│   ├── index.tsx          Home / Dashboard — upcoming sessions + courses
│   ├── browse.tsx         Browse — search teachers & courses (subject/grade filters)
│   ├── classes.tsx        My Classes — upcoming + past sessions
│   ├── tutor.tsx          AI Tutor — chat hitting POST /ai (task: tutor_chat)
│   └── account.tsx        Account — profile, subscription, sign out
│
├── teacher/[id].tsx       Teacher profile + available sessions + Book 1:1 CTA
├── course/[id].tsx        Course detail + Enrol CTA
└── session/[id].tsx       Session detail + Book / Join video CTA → VideoJoinTicket
```

---

## Monorepo Metro config

The `metro.config.js` sets two critical options for npm workspaces:

```js
config.watchFolders = [repoRoot];          // watch packages/shared changes
config.resolver.nodeModulesPaths = [
  path.resolve(repoRoot, 'node_modules'),  // hoisted deps first
  path.resolve(__dirname, 'node_modules'),
];
```

The `babel.config.js` aliases `@mentora/shared` directly to
`../../packages/shared/src/index.ts` so Metro resolves the TypeScript
source without a build step in development.

The `tsconfig.json` mirrors the same alias via `paths` so the type checker
agrees with the runtime resolution.

---

## Video (LiveKit stub)

The session join screen (`app/session/[id].tsx`) calls
`POST /sessions/:id/join` and receives a `VideoJoinTicket`:

```ts
interface VideoJoinTicket {
  provider: 'mock' | 'livekit';
  url: string;       // LiveKit server URL
  token: string;     // room access JWT
  roomName: string;
  identity: string;
  canPublish: boolean;
  expiresAt: string;
}
```

The actual video view is **stubbed** because `@livekit/react-native` requires
native module linking (cannot run in Expo Go).

To enable real video:

1. `npm install @livekit/react-native @livekit/react-native-webrtc`
2. Run `npx expo prebuild` (ejects to bare workflow)
3. Replace `<VideoPlaceholder>` in `app/session/[id].tsx` with:

```tsx
import { VideoConferenceView } from '@livekit/react-native';

<VideoConferenceView
  serverUrl={ticket.url}
  token={ticket.token}
  style={{ flex: 1 }}
/>
```

4. Build with EAS: `eas build --profile development --platform ios`

---

## What is stubbed / assumptions

| Feature | Status | Notes |
|---|---|---|
| Video conferencing | Stub | Ticket info shown; needs EAS build + LiveKit SDK |
| AI Tutor streaming (SSE) | Non-streaming | Uses POST /ai; SSE `/ai/tutor/stream` is a TODO |
| Payments / checkout | Alert | Opens browser prompt; Stripe deep-link needs EAS build |
| Push notifications | Not built | Requires `expo-notifications` + server-side integration |
| Teacher session creation | Web only | Mobile shows read-only session list; create on web |
| Guardian / child profiles | Not built | GUARDIAN role exists in shared but not surfaced in mobile |
| Image upload (avatar, cover) | Not built | Requires `expo-image-picker` + multipart upload |
| Deep links | Scheme set | `mentora://` scheme configured in app.json; link handlers not wired |

---

## Typecheck

```bash
cd apps/mobile
npx tsc --noEmit
```

---

## Dependencies the orchestrator must ensure are installed

These are declared in `package.json` under `@mentora/mobile`:

**Runtime:**
- `expo` ~51.0.28
- `expo-router` ~3.5.23
- `expo-secure-store` ~13.0.2
- `expo-splash-screen` ~0.27.6
- `expo-status-bar` ~1.12.1
- `expo-constants` ~16.0.2
- `expo-linking` ~6.3.1
- `expo-font` ~12.0.10
- `expo-system-ui` ~3.0.7
- `react` 18.2.0
- `react-native` 0.74.5
- `react-native-safe-area-context` 4.10.5
- `react-native-screens` 3.31.1
- `react-native-web` ~0.19.10
- `react-dom` 18.2.0
- `@react-navigation/native` ^6.1.17
- `@react-navigation/native-stack` ^6.9.26
- `@react-navigation/bottom-tabs` ^6.5.20
- `@mentora/shared` * (workspace)
- `zod` ^3.23.8

**Dev:**
- `@babel/core` ^7.24.0
- `@types/react` ~18.2.79
- `@types/react-native` ~0.73.0
- `babel-plugin-module-resolver` ^5.0.2
- `typescript` ^5.3.3
