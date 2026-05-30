/**
 * Test helpers for Mentora API integration tests.
 *
 * Provides:
 *  - `registerAndLogin(role, overrides?)` — register a user and return their
 *    tokens + public profile so tests can make authenticated requests.
 *  - `authHeader(token)` — shorthand for the Authorization header object.
 */

import request from 'supertest';
import { createApp } from '../app';

// Re-use a single app instance across helpers to avoid re-creating the
// Express app for every helper call.  Tests should import `app` from here
// rather than importing createApp() themselves.
export const app = createApp();

export type Role = 'STUDENT' | 'TEACHER' | 'GUARDIAN' | 'ADMIN';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    [key: string]: unknown;
  };
}

let _counter = 0;

/**
 * Register a new user with the given role and immediately login,
 * returning their access token, refresh token, and public profile.
 *
 * Each call generates a unique email to avoid collisions across tests
 * running in the same process.
 */
export async function registerAndLogin(
  role: Role,
  overrides: { name?: string; email?: string; password?: string } = {},
): Promise<AuthResult> {
  const id = ++_counter;
  const email = overrides.email ?? `test-${role.toLowerCase()}-${id}-${Date.now()}@example.com`;
  const password = overrides.password ?? 'Password123!';
  const name = overrides.name ?? `Test ${role} ${id}`;

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password, role });

  if (res.status !== 201) {
    throw new Error(
      `registerAndLogin failed: ${res.status} ${JSON.stringify(res.body)}`,
    );
  }

  return {
    accessToken: res.body.accessToken as string,
    refreshToken: res.body.refreshToken as string,
    user: res.body.user as AuthResult['user'],
  };
}

/** Convenience object to pass as request headers. */
export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Poll a getter function until the predicate returns true, or until
 * `timeoutMs` elapses (default 10 s).  Useful for waiting on async
 * background jobs (OCR pipeline, etc.) without hard-coded sleeps.
 */
export async function pollUntil<T>(
  getter: () => Promise<T>,
  predicate: (val: T) => boolean,
  {
    intervalMs = 250,
    timeoutMs = 10_000,
  }: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const val = await getter();
    if (predicate(val)) return val;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`pollUntil timed out after ${timeoutMs} ms`);
}
