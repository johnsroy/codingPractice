import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',

    // Run test files sequentially (one at a time) since they all hit the
    // same Postgres database and share DB state via TRUNCATE between files.
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    // Each individual test file gets 30 s before Vitest kills it.
    testTimeout: 30_000,

    // Load test environment variables before any test file is executed.
    setupFiles: ['./src/__tests__/setup.ts'],

    // Only pick up files in the __tests__ directory.
    include: ['src/__tests__/**/*.test.ts'],

    // Suppress noisy console output from the app during tests.
    // Individual test failures still surface clearly.
    reporters: ['verbose'],
  },
});
