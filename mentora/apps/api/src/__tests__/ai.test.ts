/**
 * AI route integration tests.
 *
 * Covers:
 *  - POST /ai with task=explain_simply returns stub output
 *  - POST /ai with task=generate_quiz returns an array of questions
 *  - POST /ai with an invalid/unknown task returns 400 ApiError
 *  - Validation rejects requests missing required fields
 *  - Requires authentication
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndLogin, authHeader } from './helpers';

const BASE = '/api/ai';

describe('POST /api/ai', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post(BASE)
      .send({ task: 'explain_simply', context: 'Water is wet.' });

    expect(res.status).toBe(401);
  });

  describe('task: explain_simply', () => {
    it('returns a string explanation from the stub LLM', async () => {
      const { accessToken } = await registerAndLogin('STUDENT');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({
          task: 'explain_simply',
          context: 'Photosynthesis is the process by which green plants use sunlight to make food from carbon dioxide and water. This process produces oxygen as a by-product.',
        });

      expect(res.status).toBe(200);
      expect(res.body.task).toBe('explain_simply');
      expect(typeof res.body.result).toBe('string');
      expect(res.body.result.length).toBeGreaterThan(0);
    });

    it('works with the prompt field instead of context', async () => {
      const { accessToken } = await registerAndLogin('STUDENT');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({
          task: 'explain_simply',
          prompt: 'Gravity is a force that attracts objects with mass toward each other.',
        });

      expect(res.status).toBe(200);
      expect(typeof res.body.result).toBe('string');
    });

    it('returns 400 when no context, materialId, or prompt is provided', async () => {
      const { accessToken } = await registerAndLogin('STUDENT');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({ task: 'explain_simply' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('task: generate_quiz', () => {
    it('returns an array of quiz questions', async () => {
      const { accessToken } = await registerAndLogin('TEACHER');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({
          task: 'generate_quiz',
          context: 'The mitochondria is the powerhouse of the cell. It produces ATP through cellular respiration. ATP stands for adenosine triphosphate. Cells need ATP for energy.',
          numQuestions: 3,
        });

      expect(res.status).toBe(200);
      expect(res.body.task).toBe('generate_quiz');
      expect(Array.isArray(res.body.result)).toBe(true);
      expect(res.body.result.length).toBeGreaterThan(0);

      // Each question should have the AiQuizQuestion shape
      const q = res.body.result[0] as {
        question: string;
        options: string[];
        answerIndex: number;
        explanation: string;
      };
      expect(typeof q.question).toBe('string');
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options).toHaveLength(4);
      expect(typeof q.answerIndex).toBe('number');
      expect(typeof q.explanation).toBe('string');
    });

    it('returns 400 when no text source is provided', async () => {
      const { accessToken } = await registerAndLogin('STUDENT');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({ task: 'generate_quiz' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('task: summarize_material', () => {
    it('summarises provided context text', async () => {
      const { accessToken } = await registerAndLogin('TEACHER');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({
          task: 'summarize_material',
          context: 'The water cycle describes the continuous movement of water through Earth\'s systems. Water evaporates from the ocean, condenses into clouds, and falls as precipitation. This cycle distributes fresh water across the planet.',
        });

      expect(res.status).toBe(200);
      expect(res.body.task).toBe('summarize_material');
      expect(typeof res.body.result).toBe('string');
      expect(res.body.result.length).toBeGreaterThan(0);
    });
  });

  describe('task: tutor_chat', () => {
    it('returns a tutor reply string', async () => {
      const { accessToken } = await registerAndLogin('STUDENT');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({
          task: 'tutor_chat',
          prompt: 'Can you explain what a variable is in mathematics?',
        });

      expect(res.status).toBe(200);
      expect(res.body.task).toBe('tutor_chat');
      expect(typeof res.body.result).toBe('string');
    });

    it('returns 400 when prompt is missing', async () => {
      const { accessToken } = await registerAndLogin('STUDENT');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({ task: 'tutor_chat' });

      expect(res.status).toBe(400);
    });
  });

  describe('validation', () => {
    it('returns 400 for an unknown task value', async () => {
      const { accessToken } = await registerAndLogin('STUDENT');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({ task: 'do_evil_things', context: 'something' });

      // Zod rejects unknown enum values → 400
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when task field is missing entirely', async () => {
      const { accessToken } = await registerAndLogin('STUDENT');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({ context: 'some text' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for numQuestions exceeding max (20)', async () => {
      const { accessToken } = await registerAndLogin('TEACHER');

      const res = await request(app)
        .post(BASE)
        .set(authHeader(accessToken))
        .send({
          task: 'generate_quiz',
          context: 'Test content for quiz',
          numQuestions: 99,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
