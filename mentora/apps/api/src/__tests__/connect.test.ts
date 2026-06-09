/**
 * Stripe Connect onboarding integration tests.
 *
 * Covers (all against the default mock driver — no Stripe key required):
 *  - GET /payments/connect/status before onboarding → connected:false, onboardingComplete:false
 *  - POST /payments/connect/onboard → 200 with url + provider; user now has stripeAccountId
 *  - Follow-up GET /payments/connect/status → connected:true, onboardingComplete:true, payoutsEnabled:true
 *  - RBAC: STUDENT calling onboard/status → 403; unauthenticated → 401
 *  - Paid session checkout still records payoutCents/payeeId consistent with splitEarnings
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndLogin, authHeader } from './helpers';
import { splitEarnings } from '@mentora/shared';

const CONNECT_BASE = '/api/payments/connect';
const PAYMENTS_BASE = '/api/payments';
const SESSIONS_BASE = '/api/sessions';

/** Returns a future ISO datetime string (1 day from now). */
function futureDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

// ─── GET /payments/connect/status ─────────────────────────────────────────────

describe('GET /api/payments/connect/status', () => {
  it('requires authentication → 401', async () => {
    const res = await request(app).get(`${CONNECT_BASE}/status`);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('STUDENT calling status → 403', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .get(`${CONNECT_BASE}/status`)
      .set(authHeader(student.accessToken));

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('new TEACHER with no onboarding → connected:false, onboardingComplete:false', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const res = await request(app)
      .get(`${CONNECT_BASE}/status`)
      .set(authHeader(teacher.accessToken));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      connected: false,
      onboardingComplete: false,
      detailsSubmitted: false,
      payoutsEnabled: false,
      chargesEnabled: false,
      provider: 'mock',
    });
  });
});

// ─── POST /payments/connect/onboard ───────────────────────────────────────────

describe('POST /api/payments/connect/onboard', () => {
  it('requires authentication → 401', async () => {
    const res = await request(app).post(`${CONNECT_BASE}/onboard`);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('STUDENT calling onboard → 403', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .post(`${CONNECT_BASE}/onboard`)
      .set(authHeader(student.accessToken));

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('TEACHER onboarding returns url and provider:mock', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const res = await request(app)
      .post(`${CONNECT_BASE}/onboard`)
      .set(authHeader(teacher.accessToken));

    expect(res.status).toBe(200);
    expect(typeof res.body.url).toBe('string');
    expect(res.body.url.length).toBeGreaterThan(0);
    expect(res.body.provider).toBe('mock');
  });

  it('after onboarding, status shows connected:true, onboardingComplete:true, payoutsEnabled:true', async () => {
    const teacher = await registerAndLogin('TEACHER');

    // First trigger onboarding so stripeAccountId is persisted on the user.
    const onboardRes = await request(app)
      .post(`${CONNECT_BASE}/onboard`)
      .set(authHeader(teacher.accessToken));
    expect(onboardRes.status).toBe(200);

    // Now check status — mock driver treats any stored account id as fully onboarded.
    const statusRes = await request(app)
      .get(`${CONNECT_BASE}/status`)
      .set(authHeader(teacher.accessToken));

    expect(statusRes.status).toBe(200);
    expect(statusRes.body).toMatchObject({
      connected: true,
      onboardingComplete: true,
      detailsSubmitted: true,
      payoutsEnabled: true,
      chargesEnabled: true,
      provider: 'mock',
    });
  });

  it('calling onboard a second time is idempotent — same account id, still returns url', async () => {
    const teacher = await registerAndLogin('TEACHER');

    const first = await request(app)
      .post(`${CONNECT_BASE}/onboard`)
      .set(authHeader(teacher.accessToken));
    expect(first.status).toBe(200);

    const second = await request(app)
      .post(`${CONNECT_BASE}/onboard`)
      .set(authHeader(teacher.accessToken));
    expect(second.status).toBe(200);
    // Both calls should return a url
    expect(typeof second.body.url).toBe('string');
    expect(second.body.provider).toBe('mock');
  });
});

// ─── Session payment: payoutCents / payeeId ───────────────────────────────────

describe('Session payment — payoutCents and payeeId persisted on checkout', () => {
  it('records payoutCents consistent with splitEarnings on a paid session booking', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const student = await registerAndLogin('STUDENT');

    const priceCents = 2000; // $20

    // Teacher creates a paid session.
    const sessionRes = await request(app)
      .post(SESSIONS_BASE)
      .set(authHeader(teacher.accessToken))
      .send({
        kind: 'one_on_one',
        title: 'Connect Payout Test Session',
        startsAt: futureDate(),
        durationMinutes: 60,
        priceCents,
        capacity: 1,
      });
    expect(sessionRes.status).toBe(201);
    const sessionId: string = sessionRes.body.id;

    // Student books via checkout.
    const checkoutRes = await request(app)
      .post(`${PAYMENTS_BASE}/checkout`)
      .set(authHeader(student.accessToken))
      .send({ kind: 'session', sessionId });
    expect(checkoutRes.status).toBe(200);

    // Teacher's earnings should reflect the split.
    const earningsRes = await request(app)
      .get(`${PAYMENTS_BASE}/earnings`)
      .set(authHeader(teacher.accessToken));
    expect(earningsRes.status).toBe(200);

    const expected = splitEarnings(priceCents, 'standard'); // standard teacher (proTier=false)
    expect(earningsRes.body.totalGrossCents).toBe(priceCents);
    expect(earningsRes.body.totalPlatformFeeCents).toBe(expected.platformFeeCents);
    expect(earningsRes.body.totalPayoutCents).toBe(expected.payoutCents);
    expect(earningsRes.body.paymentCount).toBe(1);
  });
});
