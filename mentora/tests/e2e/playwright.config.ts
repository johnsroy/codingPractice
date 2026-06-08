/**
 * Mentora E2E — Playwright configuration
 *
 * Prerequisites (the stack must already be running before you invoke `npm test`):
 *   1. Postgres:  `npm run db:up` (from monorepo root) — starts Docker container
 *   2. Seed data: `npm run db:seed` — creates demo users + content
 *   3. API:       `npm run dev:api` — http://localhost:4000
 *   4. Web:       `npm run dev:web` — http://localhost:3000
 *
 * Environment variables (all optional — sensible defaults are wired in):
 *   E2E_BASE_URL  Web origin to test against  (default: http://localhost:3000)
 *   E2E_API_URL   API origin                  (default: http://localhost:4000)
 *
 * Then in this package:
 *   npm run install:browsers   # one-time: downloads Chromium
 *   npm test                   # run all specs headlessly
 *   npm run test:headed        # run with a visible browser (great for debugging)
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // ── Location of spec files ──────────────────────────────────────────────
  testDir: './tests',

  // ── Global timeout per test ──────────────────────────────────────────────
  timeout: 45_000,

  // ── Expect assertion timeout ─────────────────────────────────────────────
  expect: {
    timeout: 10_000,
  },

  // ── Reporter ─────────────────────────────────────────────────────────────
  reporter: [['html', { open: 'never' }], ['list']],

  // ── Shared settings for every project ────────────────────────────────────
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',

    // Record a trace on the first retry so failures are easy to inspect:
    //   npx playwright show-trace test-results/<test>/trace.zip
    trace: 'on-first-retry',

    // Capture screenshots on failure
    screenshot: 'only-on-failure',

    // Slightly generous navigation timeout for the Next.js dev server
    navigationTimeout: 20_000,
  },

  // ── Projects (browsers) ───────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // ── NO webServer block — the orchestrator is responsible for starting    ──
  // ── the full stack before running these tests. See Prerequisites above.  ──
});
