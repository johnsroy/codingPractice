/**
 * Global test setup for Mentora API integration tests.
 *
 * CI PREREQUISITES
 * ----------------
 * 1. Set DATABASE_URL to a disposable test database, e.g.:
 *      DATABASE_URL=postgresql://mentora:mentora@localhost:5432/mentora_test
 * 2. Run `prisma migrate deploy` against that database before running tests:
 *      npx prisma migrate deploy
 * 3. Run the suite:
 *      npm test --workspace=@mentora/api
 *      # or from the repo root:
 *      pnpm --filter @mentora/api test
 *
 * The setup file truncates all tables before each test so tests are
 * hermetic — create everything they need; rely on nothing pre-seeded.
 *
 * Adapter singletons are not reset between tests because the env vars
 * (set at the top of this file, before any imports) are read on first
 * factory call, and all adapters default to their stub/mock/local variants
 * when no external keys are present. Re-importing in singleFork mode would
 * not clear the cache anyway; the env values are stable for the entire run.
 */

// Ensure we run as 'test' so morgan is suppressed and error messages are verbose.
process.env['NODE_ENV'] = 'test';

// Point adapters at local/stub drivers so no external API keys are needed.
process.env['LLM_DRIVER'] = 'stub';
process.env['OCR_DRIVER'] = 'mock'; // deterministic; avoids tesseract WASM worker in CI
process.env['VIDEO_DRIVER'] = 'mock';
process.env['PAYMENTS_DRIVER'] = 'mock';
process.env['STORAGE_DRIVER'] = 'local';
// Use manual verification driver — no Stripe Identity or DigiLocker keys needed.
process.env['VERIFICATION_DRIVER'] = 'manual';

// Predictable JWT secret for tests.
process.env['JWT_SECRET'] = 'test-jwt-secret-do-not-use-in-prod';
process.env['JWT_EXPIRES_IN'] = '1h';
process.env['REFRESH_TOKEN_EXPIRES_IN'] = '7d';

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

/**
 * Truncate every table before each test so tests are fully isolated.
 *
 * We use CASCADE so FK-constrained child rows are removed automatically.
 * The explicit table list documents the full schema; CASCADE makes ordering
 * unnecessary, but we list children before parents for clarity.
 */
beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE
    "Payment",
    "Subscription",
    "Enrollment",
    "Material",
    "VerificationDocument",
    "ClassSession",
    "Lesson",
    "Course",
    "RefreshToken",
    "User"
    RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
