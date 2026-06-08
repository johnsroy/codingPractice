/**
 * Health endpoint integration test.
 *
 * Verifies that GET /api/health returns the expected shape and 200 status.
 * This is the simplest smoke test and should always pass if the server
 * bootstraps correctly.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './helpers';

describe('GET /api/health', () => {
  it('returns 200 with status ok and expected fields', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'mentora-api',
      version: '1.0.0',
    });
    // environment and timestamp should also be present
    expect(typeof res.body.environment).toBe('string');
    expect(typeof res.body.timestamp).toBe('string');
    // timestamp must be a valid ISO date string
    expect(() => new Date(res.body.timestamp as string)).not.toThrow();
  });

  it('returns 404 for unknown routes with ApiError shape', async () => {
    const res = await request(app).get('/api/does-not-exist-at-all');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: 'NOT_FOUND',
    });
    expect(typeof res.body.message).toBe('string');
  });
});
