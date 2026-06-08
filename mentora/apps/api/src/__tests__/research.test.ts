/**
 * Research route integration tests.
 *
 * Covers:
 *  - POST /ai/research returns 200 and a well-formed ResearchBriefing
 *  - POST /ai with task=research_topic returns the briefing under `result`
 *  - Validation: missing/too-short topic → 400 (ApiError shape)
 *  - Unauthenticated requests → 401
 *
 * All tests run with the default stub drivers (LLM_DRIVER=stub,
 * RESEARCH_DRIVER=stub) set in setup.ts — no API keys required.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndLogin, authHeader } from './helpers';
import type { ResearchBriefing, ApiError } from '@mentora/shared';

const RESEARCH_BASE = '/api/ai/research';
const AI_BASE = '/api/ai';

describe('POST /api/ai/research', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post(RESEARCH_BASE)
      .send({ topic: 'Photosynthesis' });

    expect(res.status).toBe(401);
    const body = res.body as ApiError;
    expect(body).toHaveProperty('error');
    expect(body).toHaveProperty('message');
  });

  it('returns 400 when topic is missing', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(RESEARCH_BASE)
      .set(authHeader(accessToken))
      .send({});

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body).toHaveProperty('error');
    expect(body).toHaveProperty('message');
  });

  it('returns 400 when topic is too short (< 2 chars)', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(RESEARCH_BASE)
      .set(authHeader(accessToken))
      .send({ topic: 'A' });

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body).toHaveProperty('error');
  });

  it('returns 200 with a well-formed ResearchBriefing for a valid topic', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(RESEARCH_BASE)
      .set(authHeader(accessToken))
      .send({ topic: 'Photosynthesis' });

    expect(res.status).toBe(200);

    const body = res.body as ResearchBriefing;

    // Shape checks
    expect(typeof body.topic).toBe('string');
    expect(body.topic).toBe('Photosynthesis');
    expect(typeof body.summary).toBe('string');
    expect(body.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(body.keyPoints)).toBe(true);
    expect(body.keyPoints.length).toBeGreaterThan(0);
    expect(Array.isArray(body.suggestedLessonOutline)).toBe(true);
    expect(body.suggestedLessonOutline.length).toBeGreaterThan(0);
    expect(Array.isArray(body.sources)).toBe(true);
    expect(body.sources.length).toBeGreaterThan(0);
    expect(typeof body.provider).toBe('string');
    expect(body.provider.length).toBeGreaterThan(0);
    expect(typeof body.liveWeb).toBe('boolean');
  });

  it('returns optional gradeId and subjectId in the briefing when provided', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(RESEARCH_BASE)
      .set(authHeader(accessToken))
      .send({
        topic: 'The Water Cycle',
        gradeId: 'grade-5',
        subjectId: 'science',
      });

    expect(res.status).toBe(200);

    const body = res.body as ResearchBriefing;
    expect(body.topic).toBe('The Water Cycle');
    expect(body.gradeId).toBe('grade-5');
    expect(body.subjectId).toBe('science');
    expect(body.summary.length).toBeGreaterThan(0);
    expect(body.keyPoints.length).toBeGreaterThan(0);
    expect(body.suggestedLessonOutline.length).toBeGreaterThan(0);
    expect(body.sources.length).toBeGreaterThan(0);
  });

  it('each source has the required ResearchSource shape', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(RESEARCH_BASE)
      .set(authHeader(accessToken))
      .send({ topic: 'Fractions' });

    expect(res.status).toBe(200);

    const body = res.body as ResearchBriefing;
    for (const source of body.sources) {
      expect(typeof source.title).toBe('string');
      expect(source.title.length).toBeGreaterThan(0);
      expect(typeof source.url).toBe('string');
      expect(source.url.length).toBeGreaterThan(0);
      expect(typeof source.snippet).toBe('string');
      expect(source.snippet.length).toBeGreaterThan(0);
    }
  });

  it('each lesson outline section has title and non-empty points array', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(RESEARCH_BASE)
      .set(authHeader(accessToken))
      .send({ topic: 'World War II causes' });

    expect(res.status).toBe(200);

    const body = res.body as ResearchBriefing;
    for (const section of body.suggestedLessonOutline) {
      expect(typeof section.title).toBe('string');
      expect(section.title.length).toBeGreaterThan(0);
      expect(Array.isArray(section.points)).toBe(true);
      expect(section.points.length).toBeGreaterThan(0);
    }
  });

  it('stub driver sets liveWeb to false and provider to "stub"', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(RESEARCH_BASE)
      .set(authHeader(accessToken))
      .send({ topic: 'Cell biology' });

    expect(res.status).toBe(200);

    const body = res.body as ResearchBriefing;
    // In test mode LLM_DRIVER=stub and RESEARCH_DRIVER=stub (default)
    expect(body.liveWeb).toBe(false);
    expect(body.provider).toBe('stub');
  });
});

describe('POST /api/ai with task=research_topic', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post(AI_BASE)
      .send({ task: 'research_topic', topic: 'Gravity' });

    expect(res.status).toBe(401);
  });

  it('returns 200 and briefing under result field', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(AI_BASE)
      .set(authHeader(accessToken))
      .send({
        task: 'research_topic',
        topic: 'The Solar System',
        gradeId: 'grade-4',
        subjectId: 'science',
      });

    expect(res.status).toBe(200);
    expect(res.body.task).toBe('research_topic');

    const briefing = res.body.result as ResearchBriefing;
    expect(typeof briefing.topic).toBe('string');
    expect(briefing.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(briefing.keyPoints)).toBe(true);
    expect(briefing.keyPoints.length).toBeGreaterThan(0);
    expect(Array.isArray(briefing.suggestedLessonOutline)).toBe(true);
    expect(briefing.suggestedLessonOutline.length).toBeGreaterThan(0);
    expect(Array.isArray(briefing.sources)).toBe(true);
    expect(briefing.sources.length).toBeGreaterThan(0);
    expect(typeof briefing.provider).toBe('string');
    expect(typeof briefing.liveWeb).toBe('boolean');
  });

  it('accepts topic via the prompt field', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(AI_BASE)
      .set(authHeader(accessToken))
      .send({
        task: 'research_topic',
        prompt: 'Ancient Egypt',
      });

    expect(res.status).toBe(200);
    expect(res.body.task).toBe('research_topic');

    const briefing = res.body.result as ResearchBriefing;
    expect(briefing.topic).toBe('Ancient Egypt');
    expect(briefing.summary.length).toBeGreaterThan(0);
  });

  it('returns 400 when neither topic nor prompt is provided', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(AI_BASE)
      .set(authHeader(accessToken))
      .send({ task: 'research_topic' });

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body).toHaveProperty('error');
  });

  it('returns 400 for topic exceeding max length (300 chars)', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(AI_BASE)
      .set(authHeader(accessToken))
      .send({
        task: 'research_topic',
        topic: 'x'.repeat(301),
      });

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body).toHaveProperty('error');
  });
});
