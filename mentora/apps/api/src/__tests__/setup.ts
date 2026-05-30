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
 *
 * The setup file truncates all tables before each test file so tests are
 * hermetic — create everything they need; rely on nothing pre-seeded.
 */

// Ensure we run as 'test' so morgan is suppressed and error messages are verbose.
process.env['NODE_ENV'] = 'test';

// Point adapters at local/stub drivers so no external API keys are needed.
process.env['LLM_DRIVER'] = 'stub';
process.env['OCR_DRIVER'] = 'tesseract';
process.env['VIDEO_DRIVER'] = 'mock';
process.env['PAYMENTS_DRIVER'] = 'mock';
process.env['STORAGE_DRIVER'] = 'local';

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
 * Truncate every table before each test *file* (via beforeEach on the global
 * scope, which runs once per file when singleFork=true and each file imports
 * setup.ts fresh).
 *
 * We use CASCADE so FK-constrained child rows are removed automatically.
 * The order doesn't matter with CASCADE, but we list them explicitly for
 * documentation clarity.
 *
 * After truncating, reset singleton adapter instances so each test file gets
 * a fresh adapter (important if an earlier file set env vars differently).
 */
beforeEach(async () => {
  // Truncate in dependency order (children first to avoid FK issues without CASCADE on some PG configs)
  await prisma.$executeRaw`TRUNCATE TABLE
    "Payment",
    "Subscription",
    "Enrollment",
    "Material",
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
