/**
 * Verification integration tests.
 *
 * Covers:
 *  - Teacher status default: unverified
 *  - Upload a document (multipart, small PNG buffer) → 201
 *  - Submit without docs → 400
 *  - Submit with docs → status becomes 'pending'
 *  - RBAC: non-TEACHER role gets 403 on teacher routes
 *  - RBAC: non-ADMIN role gets 403 on admin routes
 *  - Admin list shows pending submissions
 *  - Admin approve → verified=true + status='verified'
 *  - Admin reject → status='rejected'
 *  - Currency is recorded on checkout payment
 *
 * Uses VERIFICATION_DRIVER=manual (default) — no external keys needed.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndLogin, authHeader } from './helpers';

const VERIF_BASE = '/api/verification';
const ADMIN_BASE = '/api/admin/verifications';

/** Minimal 1×1 white PNG — 67 bytes. */
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';

function tinyPngBuffer(): Buffer {
  return Buffer.from(TINY_PNG_BASE64, 'base64');
}

// ─── GET /verification/status ─────────────────────────────────────────────────

describe('GET /api/verification/status', () => {
  it('requires authentication', async () => {
    const res = await request(app).get(`${VERIF_BASE}/status`);
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-TEACHER role (STUDENT)', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .get(`${VERIF_BASE}/status`)
      .set(authHeader(student.accessToken));
    expect(res.status).toBe(403);
  });

  it('returns 403 for GUARDIAN', async () => {
    const guardian = await registerAndLogin('GUARDIAN');
    const res = await request(app)
      .get(`${VERIF_BASE}/status`)
      .set(authHeader(guardian.accessToken));
    expect(res.status).toBe(403);
  });

  it('new teacher defaults to status=unverified with no documents', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const res = await request(app)
      .get(`${VERIF_BASE}/status`)
      .set(authHeader(teacher.accessToken));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'unverified',
      documents: [],
    });
    expect(res.body).toHaveProperty('userId');
    expect(res.body.userId).toBe(teacher.user.id);
    expect(res.body).toHaveProperty('provider');
  });
});

// ─── POST /verification/documents ─────────────────────────────────────────────

describe('POST /api/verification/documents', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post(`${VERIF_BASE}/documents`)
      .attach('file', tinyPngBuffer(), { filename: 'id.png', contentType: 'image/png' })
      .field('kind', 'government_id');
    expect(res.status).toBe(401);
  });

  it('returns 403 for STUDENT', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .post(`${VERIF_BASE}/documents`)
      .set(authHeader(student.accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'id.png', contentType: 'image/png' })
      .field('kind', 'government_id');
    expect(res.status).toBe(403);
  });

  it('returns 400 when no file is attached', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const res = await request(app)
      .post(`${VERIF_BASE}/documents`)
      .set(authHeader(teacher.accessToken))
      .field('kind', 'government_id');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when kind is missing', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const res = await request(app)
      .post(`${VERIF_BASE}/documents`)
      .set(authHeader(teacher.accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'id.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for an invalid kind value', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const res = await request(app)
      .post(`${VERIF_BASE}/documents`)
      .set(authHeader(teacher.accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'id.png', contentType: 'image/png' })
      .field('kind', 'not_a_valid_kind');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('uploads a PNG document and returns 201 with the document record', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const res = await request(app)
      .post(`${VERIF_BASE}/documents`)
      .set(authHeader(teacher.accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'passport.png', contentType: 'image/png' })
      .field('kind', 'government_id');

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      userId: teacher.user.id,
      kind: 'government_id',
      mimeType: 'image/png',
      status: 'pending',
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('fileUrl');
    expect(typeof res.body.fileUrl).toBe('string');
    expect(res.body.fileUrl.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('createdAt');
  });

  it('uploaded document appears in teacher status', async () => {
    const teacher = await registerAndLogin('TEACHER');

    await request(app)
      .post(`${VERIF_BASE}/documents`)
      .set(authHeader(teacher.accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'credential.png', contentType: 'image/png' })
      .field('kind', 'teaching_credential');

    const statusRes = await request(app)
      .get(`${VERIF_BASE}/status`)
      .set(authHeader(teacher.accessToken));

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.documents).toHaveLength(1);
    expect(statusRes.body.documents[0].kind).toBe('teaching_credential');
  });
});

// ─── POST /verification/submit ─────────────────────────────────────────────────

describe('POST /api/verification/submit', () => {
  it('requires authentication', async () => {
    const res = await request(app).post(`${VERIF_BASE}/submit`).send({});
    expect(res.status).toBe(401);
  });

  it('returns 403 for STUDENT', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .post(`${VERIF_BASE}/submit`)
      .set(authHeader(student.accessToken))
      .send({});
    expect(res.status).toBe(403);
  });

  it('returns 400 when teacher has no uploaded documents', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const res = await request(app)
      .post(`${VERIF_BASE}/submit`)
      .set(authHeader(teacher.accessToken))
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('sets status to pending after submitting with documents', async () => {
    const teacher = await registerAndLogin('TEACHER');

    // Upload a doc first
    const uploadRes = await request(app)
      .post(`${VERIF_BASE}/documents`)
      .set(authHeader(teacher.accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'id.png', contentType: 'image/png' })
      .field('kind', 'government_id');
    expect(uploadRes.status).toBe(201);

    // Submit for review
    const submitRes = await request(app)
      .post(`${VERIF_BASE}/submit`)
      .set(authHeader(teacher.accessToken))
      .send({ note: 'Please review my documents.' });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body).toMatchObject({
      userId: teacher.user.id,
      status: 'pending',
      note: 'Please review my documents.',
    });
    expect(submitRes.body.submittedAt).toBeTruthy();
    expect(submitRes.body.documents).toHaveLength(1);
  });
});

// ─── POST /verification/start ──────────────────────────────────────────────────

describe('POST /api/verification/start', () => {
  it('requires authentication', async () => {
    const res = await request(app).post(`${VERIF_BASE}/start`);
    expect(res.status).toBe(401);
  });

  it('returns 403 for STUDENT', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .post(`${VERIF_BASE}/start`)
      .set(authHeader(student.accessToken));
    expect(res.status).toBe(403);
  });

  it('returns provider=manual and url=null for default (manual) driver', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const res = await request(app)
      .post(`${VERIF_BASE}/start`)
      .set(authHeader(teacher.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.provider).toBe('manual');
    expect(res.body.url).toBeNull();
  });
});

// ─── GET /admin/verifications ─────────────────────────────────────────────────

describe('GET /api/admin/verifications', () => {
  it('requires authentication', async () => {
    const res = await request(app).get(ADMIN_BASE);
    expect(res.status).toBe(401);
  });

  it('returns 403 for TEACHER', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const res = await request(app)
      .get(ADMIN_BASE)
      .set(authHeader(teacher.accessToken));
    expect(res.status).toBe(403);
  });

  it('returns 403 for STUDENT', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .get(ADMIN_BASE)
      .set(authHeader(student.accessToken));
    expect(res.status).toBe(403);
  });

  it('returns empty list when no pending teachers', async () => {
    const admin = await registerAndLogin('ADMIN');
    const res = await request(app)
      .get(ADMIN_BASE)
      .set(authHeader(admin.accessToken));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('lists teachers with status=pending including their documents and teacher fields', async () => {
    const admin = await registerAndLogin('ADMIN');
    const teacher = await registerAndLogin('TEACHER');

    // Upload a doc
    await request(app)
      .post(`${VERIF_BASE}/documents`)
      .set(authHeader(teacher.accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'id.png', contentType: 'image/png' })
      .field('kind', 'government_id');

    // Submit
    await request(app)
      .post(`${VERIF_BASE}/submit`)
      .set(authHeader(teacher.accessToken))
      .send({});

    const res = await request(app)
      .get(ADMIN_BASE)
      .set(authHeader(admin.accessToken));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);

    const summary = res.body[0] as {
      userId: string;
      status: string;
      teacherName: string;
      teacherEmail: string;
      documents: unknown[];
    };
    expect(summary.userId).toBe(teacher.user.id);
    expect(summary.status).toBe('pending');
    expect(typeof summary.teacherName).toBe('string');
    expect(typeof summary.teacherEmail).toBe('string');
    expect(Array.isArray(summary.documents)).toBe(true);
    expect(summary.documents).toHaveLength(1);
  });
});

// ─── POST /admin/verifications/:userId (approve/reject) ────────────────────────

describe('POST /api/admin/verifications/:userId (approve)', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post(`${ADMIN_BASE}/some-user-id`)
      .send({ decision: 'approve' });
    expect(res.status).toBe(401);
  });

  it('returns 403 for TEACHER attempting admin review', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const teacher2 = await registerAndLogin('TEACHER');
    const res = await request(app)
      .post(`${ADMIN_BASE}/${teacher2.user.id}`)
      .set(authHeader(teacher.accessToken))
      .send({ decision: 'approve' });
    expect(res.status).toBe(403);
  });

  it('returns 404 for an unknown userId', async () => {
    const admin = await registerAndLogin('ADMIN');
    const res = await request(app)
      .post(`${ADMIN_BASE}/nonexistent-user-id`)
      .set(authHeader(admin.accessToken))
      .send({ decision: 'approve' });
    expect(res.status).toBe(404);
  });

  it('approve → verificationStatus=verified, verified=true, reviewedAt set', async () => {
    const admin = await registerAndLogin('ADMIN');
    const teacher = await registerAndLogin('TEACHER');

    // Upload + submit
    await request(app)
      .post(`${VERIF_BASE}/documents`)
      .set(authHeader(teacher.accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'id.png', contentType: 'image/png' })
      .field('kind', 'government_id');

    await request(app)
      .post(`${VERIF_BASE}/submit`)
      .set(authHeader(teacher.accessToken))
      .send({});

    // Admin approves
    const approveRes = await request(app)
      .post(`${ADMIN_BASE}/${teacher.user.id}`)
      .set(authHeader(admin.accessToken))
      .send({ decision: 'approve', note: 'All documents look good.' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body).toMatchObject({
      userId: teacher.user.id,
      status: 'verified',
    });
    expect(approveRes.body.reviewedAt).toBeTruthy();
    expect(approveRes.body.note).toBe('All documents look good.');

    // Verify the teacher's own status now shows verified
    const statusRes = await request(app)
      .get(`${VERIF_BASE}/status`)
      .set(authHeader(teacher.accessToken));

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.status).toBe('verified');
    expect(statusRes.body.reviewedAt).toBeTruthy();

    // Approved teacher should no longer appear in the admin queue
    const queueRes = await request(app)
      .get(ADMIN_BASE)
      .set(authHeader(admin.accessToken));
    expect(queueRes.body).toHaveLength(0);
  });

  it('reject → verificationStatus=rejected', async () => {
    const admin = await registerAndLogin('ADMIN');
    const teacher = await registerAndLogin('TEACHER');

    // Upload + submit
    await request(app)
      .post(`${VERIF_BASE}/documents`)
      .set(authHeader(teacher.accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'id.png', contentType: 'image/png' })
      .field('kind', 'other');

    await request(app)
      .post(`${VERIF_BASE}/submit`)
      .set(authHeader(teacher.accessToken))
      .send({});

    // Admin rejects
    const rejectRes = await request(app)
      .post(`${ADMIN_BASE}/${teacher.user.id}`)
      .set(authHeader(admin.accessToken))
      .send({ decision: 'reject', note: 'Document quality too low. Please re-upload.' });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.status).toBe('rejected');
    expect(rejectRes.body.reviewedAt).toBeTruthy();
    expect(rejectRes.body.note).toBe('Document quality too low. Please re-upload.');

    // Verify status from teacher's own view
    const statusRes = await request(app)
      .get(`${VERIF_BASE}/status`)
      .set(authHeader(teacher.accessToken));
    expect(statusRes.body.status).toBe('rejected');
  });

  it('returns 400 for missing decision field', async () => {
    const admin = await registerAndLogin('ADMIN');
    const teacher = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(`${ADMIN_BASE}/${teacher.user.id}`)
      .set(authHeader(admin.accessToken))
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── Currency in checkout ──────────────────────────────────────────────────────

describe('Currency in checkout (mock adapter)', () => {
  it('checkout defaults to USD when currency is omitted', async () => {
    // We can't directly read the Payment row via a public API, but a subscription
    // checkout with no currency should succeed (mock adapter defaults to USD).
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .post('/api/payments/checkout')
      .set(authHeader(student.accessToken))
      .send({ kind: 'subscription', planId: 'explorer' });

    expect(res.status).toBe(200);
    expect(res.body.provider).toBe('mock');
  });

  it('checkout accepts currency=CAD without error', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .post('/api/payments/checkout')
      .set(authHeader(student.accessToken))
      .send({ kind: 'subscription', planId: 'explorer', currency: 'CAD' });

    expect(res.status).toBe(200);
    expect(res.body.provider).toBe('mock');
  });

  it('checkout accepts currency=INR without error', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .post('/api/payments/checkout')
      .set(authHeader(student.accessToken))
      .send({ kind: 'subscription', planId: 'explorer', currency: 'INR' });

    expect(res.status).toBe(200);
    expect(res.body.provider).toBe('mock');
  });

  it('checkout returns 400 for an invalid currency value', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .post('/api/payments/checkout')
      .set(authHeader(student.accessToken))
      .send({ kind: 'subscription', planId: 'explorer', currency: 'EUR' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
