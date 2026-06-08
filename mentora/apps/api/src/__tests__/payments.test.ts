/**
 * Payments integration tests.
 *
 * Covers:
 *  - GET /payments/plans — returns the ALL_PLANS array (publicly accessible)
 *  - POST /payments/checkout with kind=subscription creates a Subscription row
 *    and returns provider='mock' + a URL
 *  - Session payment via POST /payments/checkout records platformFee+payout
 *    consistent with splitEarnings (standard 15% commission)
 *  - GET /payments/earnings for the teacher reflects the payout from a paid session
 *  - Requires authentication for protected endpoints
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndLogin, authHeader } from './helpers';

const PAYMENTS_BASE = '/api/payments';
const SESSIONS_BASE = '/api/sessions';

/** Returns a future ISO datetime string. */
function futureDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

describe('GET /api/payments/plans', () => {
  it('is publicly accessible and returns an array of plans', async () => {
    const res = await request(app).get(`${PAYMENTS_BASE}/plans`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const plan = res.body[0] as {
      id: string;
      priceCents: number;
      name: string;
      audience: string;
    };
    expect(typeof plan.id).toBe('string');
    expect(typeof plan.priceCents).toBe('number');
    expect(typeof plan.name).toBe('string');
    expect(['learner', 'teacher']).toContain(plan.audience);
  });

  it('includes known plan ids (explorer, scholar, mentor-free)', async () => {
    const res = await request(app).get(`${PAYMENTS_BASE}/plans`);
    const ids = (res.body as { id: string }[]).map((p) => p.id);

    expect(ids).toContain('explorer');
    expect(ids).toContain('scholar');
    expect(ids).toContain('mentor-free');
  });
});

describe('POST /api/payments/checkout (subscription)', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post(`${PAYMENTS_BASE}/checkout`)
      .send({ kind: 'subscription', planId: 'explorer' });

    expect(res.status).toBe(401);
  });

  it('creates an active subscription for a free plan (explorer)', async () => {
    const student = await registerAndLogin('STUDENT');

    const res = await request(app)
      .post(`${PAYMENTS_BASE}/checkout`)
      .set(authHeader(student.accessToken))
      .send({ kind: 'subscription', planId: 'explorer' });

    expect(res.status).toBe(200);
    expect(res.body.provider).toBe('mock');
    expect(typeof res.body.url).toBe('string');
    // Free plan creates subscription immediately — paymentId is the subscription id
    expect(res.body).toHaveProperty('paymentId');

    // Verify subscription appears when queried
    const subRes = await request(app)
      .get(`${PAYMENTS_BASE}/subscription`)
      .set(authHeader(student.accessToken));

    expect(subRes.status).toBe(200);
    expect(subRes.body.subscription).toMatchObject({
      planId: 'explorer',
      status: 'active',
      provider: 'mock',
    });
    expect(typeof subRes.body.subscription.currentPeriodEnd).toBe('string');
  });

  it('creates an active subscription for a paid plan (scholar)', async () => {
    const student = await registerAndLogin('STUDENT');

    const res = await request(app)
      .post(`${PAYMENTS_BASE}/checkout`)
      .set(authHeader(student.accessToken))
      .send({ kind: 'subscription', planId: 'scholar', interval: 'month' });

    expect(res.status).toBe(200);
    expect(res.body.provider).toBe('mock');

    const subRes = await request(app)
      .get(`${PAYMENTS_BASE}/subscription`)
      .set(authHeader(student.accessToken));

    expect(subRes.body.subscription.planId).toBe('scholar');
  });

  it('returns 400 for an unknown planId', async () => {
    const student = await registerAndLogin('STUDENT');

    const res = await request(app)
      .post(`${PAYMENTS_BASE}/checkout`)
      .set(authHeader(student.accessToken))
      .send({ kind: 'subscription', planId: 'does-not-exist' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('validation error for missing kind field', async () => {
    const student = await registerAndLogin('STUDENT');

    const res = await request(app)
      .post(`${PAYMENTS_BASE}/checkout`)
      .set(authHeader(student.accessToken))
      .send({ planId: 'explorer' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Session payment — splitEarnings commission consistency', () => {
  it('session checkout records platformFee and payout consistent with 15% standard commission', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const student = await registerAndLogin('STUDENT');

    // Create a paid session (1000 cents = $10)
    const priceCents = 1000;

    const sessionRes = await request(app)
      .post(SESSIONS_BASE)
      .set(authHeader(teacher.accessToken))
      .send({
        kind: 'one_on_one',
        title: 'Paid Tutoring',
        startsAt: futureDate(),
        durationMinutes: 60,
        priceCents,
        capacity: 1,
      });

    expect(sessionRes.status).toBe(201);
    const sessionId: string = sessionRes.body.id;

    // Pay via checkout (not /book, which is the free path)
    const checkoutRes = await request(app)
      .post(`${PAYMENTS_BASE}/checkout`)
      .set(authHeader(student.accessToken))
      .send({ kind: 'session', sessionId });

    expect(checkoutRes.status).toBe(200);
    expect(checkoutRes.body.provider).toBe('mock');

    // Fetch teacher earnings
    const earningsRes = await request(app)
      .get(`${PAYMENTS_BASE}/earnings`)
      .set(authHeader(teacher.accessToken));

    expect(earningsRes.status).toBe(200);
    const earnings = earningsRes.body as {
      totalGrossCents: number;
      totalPlatformFeeCents: number;
      totalPayoutCents: number;
      paymentCount: number;
      commissionPct: number;
      currency: string;
    };

    // Standard teacher: 15% commission
    const expectedPlatformFee = Math.round((priceCents * 15) / 100); // 150
    const expectedPayout = priceCents - expectedPlatformFee; // 850

    expect(earnings.totalGrossCents).toBe(priceCents);
    expect(earnings.totalPlatformFeeCents).toBe(expectedPlatformFee);
    expect(earnings.totalPayoutCents).toBe(expectedPayout);
    expect(earnings.paymentCount).toBe(1);
    expect(earnings.currency).toBe('USD');
    // commissionPct from env (defaults to 15)
    expect(typeof earnings.commissionPct).toBe('number');
  });

  it('GET /payments/earnings requires TEACHER role (403 for STUDENT)', async () => {
    const student = await registerAndLogin('STUDENT');

    const res = await request(app)
      .get(`${PAYMENTS_BASE}/earnings`)
      .set(authHeader(student.accessToken));

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/payments/subscription', () => {
  it('returns null when user has no subscription', async () => {
    const student = await registerAndLogin('STUDENT');

    const res = await request(app)
      .get(`${PAYMENTS_BASE}/subscription`)
      .set(authHeader(student.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.subscription).toBeNull();
  });

  it('requires authentication', async () => {
    const res = await request(app).get(`${PAYMENTS_BASE}/subscription`);
    expect(res.status).toBe(401);
  });
});
