/**
 * Materials integration tests.
 *
 * Covers:
 *  - Multipart file upload returns 201 with ocrStatus = 'processing'
 *  - GET /materials/:id returns the material record
 *  - GET /materials/:id/ocr polling endpoint
 *  - Background OCR pipeline transitions state to a terminal status
 *    ('done' | 'skipped' | 'failed') and the stub LLM may set aiSummary
 *  - Authorization checks (must be logged in)
 *
 * OCR strategy:
 *  We upload a tiny valid PNG (a 1×1 white pixel, minimal overhead).
 *  Tesseract will either extract empty text (→ 'skipped') or find
 *  something (→ 'done').  Either way, we just wait for any terminal state
 *  within 20 s and confirm the record is no longer 'processing'.
 *  This keeps the test robust across environments with/without native
 *  Tesseract binaries.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndLogin, authHeader, pollUntil } from './helpers';

const BASE = '/api/materials';

/** Minimal 1×1 white PNG — 67 bytes, valid image that Tesseract can parse. */
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';

function tinyPngBuffer(): Buffer {
  return Buffer.from(TINY_PNG_BASE64, 'base64');
}

describe('POST /api/materials (upload)', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post(BASE)
      .attach('file', tinyPngBuffer(), { filename: 'test.png', contentType: 'image/png' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when no file is attached', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(BASE)
      .set(authHeader(accessToken))
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('uploads a PNG and returns 201 with ocrStatus=processing', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(BASE)
      .set(authHeader(accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'test.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      kind: 'image',
      mimeType: 'image/png',
      ocrStatus: 'processing',
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('fileUrl');
    expect(res.body.ownerId).toBeTruthy();
    // At upload time these are null; pipeline fills them in later
    expect(res.body.extractedText).toBeNull();
    expect(res.body.aiSummary).toBeNull();
  });

  it('accepts an optional title for the material', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(BASE)
      .set(authHeader(accessToken))
      .field('title', 'My Custom Title')
      .attach('file', tinyPngBuffer(), { filename: 'test.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('My Custom Title');
  });
});

describe('GET /api/materials/:id', () => {
  it('returns the material record', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const uploadRes = await request(app)
      .post(BASE)
      .set(authHeader(accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'test.png', contentType: 'image/png' });

    const materialId: string = uploadRes.body.id;

    const res = await request(app)
      .get(`${BASE}/${materialId}`)
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(materialId);
  });

  it('returns 404 for unknown material', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .get(`${BASE}/non-existent-id`)
      .set(authHeader(accessToken));

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/materials/:id/ocr (pipeline state transition)', () => {
  it('OCR status transitions to a terminal state (done | skipped | failed) within 20 s', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    // Upload the tiny PNG — pipeline kicks off asynchronously
    const uploadRes = await request(app)
      .post(BASE)
      .set(authHeader(accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'test.png', contentType: 'image/png' });

    expect(uploadRes.status).toBe(201);
    const materialId: string = uploadRes.body.id;

    // Poll the OCR endpoint until it leaves 'processing'
    const TERMINAL = new Set(['done', 'skipped', 'failed']);

    const finalRecord = await pollUntil(
      async () => {
        const r = await request(app)
          .get(`${BASE}/${materialId}/ocr`)
          .set(authHeader(accessToken));
        return r.body as { id: string; ocrStatus: string; extractedText: unknown; aiSummary: unknown };
      },
      (body) => TERMINAL.has(body.ocrStatus),
      { intervalMs: 300, timeoutMs: 20_000 },
    );

    expect(TERMINAL.has(finalRecord.ocrStatus)).toBe(true);
    expect(finalRecord.id).toBe(materialId);

    // When status is 'done', the stub LLM should have set aiSummary
    // (requires >50 chars of extracted text — may or may not trigger on a blank image)
    // We only assert structure here to stay robust
    expect(finalRecord).toHaveProperty('extractedText');
    expect(finalRecord).toHaveProperty('aiSummary');
  }, 25_000 /* generous per-test timeout */);

  it('the /ocr polling endpoint returns the expected fields', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const uploadRes = await request(app)
      .post(BASE)
      .set(authHeader(accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'test.png', contentType: 'image/png' });

    const materialId: string = uploadRes.body.id;

    const res = await request(app)
      .get(`${BASE}/${materialId}/ocr`)
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    // Must have these exact fields
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('ocrStatus');
    expect(res.body).toHaveProperty('extractedText');
    expect(res.body).toHaveProperty('aiSummary');
  });
});

describe('GET /api/materials (list)', () => {
  it('returns own materials when no filter is applied', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    await request(app)
      .post(BASE)
      .set(authHeader(accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'a.png', contentType: 'image/png' });

    await request(app)
      .post(BASE)
      .set(authHeader(accessToken))
      .attach('file', tinyPngBuffer(), { filename: 'b.png', contentType: 'image/png' });

    const res = await request(app)
      .get(BASE)
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});
