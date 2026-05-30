/**
 * Course integration tests.
 *
 * Covers:
 *  - RBAC: STUDENT cannot create a course (403); TEACHER can (201)
 *  - Course lifecycle: create (draft) → must add a lesson → publish → list shows it
 *  - Enroll as student in a free published course
 *  - Course not found returns 404 ApiError shape
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndLogin, authHeader } from './helpers';

const BASE = '/api/courses';
const LESSONS_BASE = '/api/lessons';

/** Minimal valid course body. */
const courseBody = {
  title: 'Introduction to Algebra',
  description: 'A beginner-friendly algebra course for middle schoolers.',
  subjectId: 'math',
  gradeId: 'grade-7',
  priceCents: 0,
};

// ─── RBAC ─────────────────────────────────────────────────────────────────────

describe('Course RBAC', () => {
  it('STUDENT receives 403 when trying to create a course', async () => {
    const { accessToken } = await registerAndLogin('STUDENT');

    const res = await request(app)
      .post(BASE)
      .set(authHeader(accessToken))
      .send(courseBody);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('unauthenticated request to create a course returns 401', async () => {
    const res = await request(app).post(BASE).send(courseBody);
    expect(res.status).toBe(401);
  });

  it('TEACHER can create a course', async () => {
    const { accessToken } = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(BASE)
      .set(authHeader(accessToken))
      .send(courseBody);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('draft');
    expect(res.body.title).toBe(courseBody.title);
    expect(res.body).toHaveProperty('id');
  });
});

// ─── Course lifecycle ─────────────────────────────────────────────────────────

describe('Course lifecycle', () => {
  it('create (draft) → add lesson → publish → list shows it → enroll as student', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const student = await registerAndLogin('STUDENT');

    // 1. Create course — starts as draft
    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(courseBody);

    expect(createRes.status).toBe(201);
    const courseId: string = createRes.body.id;
    expect(createRes.body.status).toBe('draft');

    // 2. Attempting to publish with no lessons should fail
    const pubNoLessons = await request(app)
      .post(`${BASE}/${courseId}/publish`)
      .set(authHeader(teacher.accessToken));

    expect(pubNoLessons.status).toBe(400);
    expect(pubNoLessons.body).toHaveProperty('error');

    // 3. Add a lesson
    const lessonRes = await request(app)
      .post(LESSONS_BASE)
      .set(authHeader(teacher.accessToken))
      .send({ courseId, title: 'Lesson 1: Variables', order: 1 });

    expect(lessonRes.status).toBe(201);

    // 4. Publish the course
    const publishRes = await request(app)
      .post(`${BASE}/${courseId}/publish`)
      .set(authHeader(teacher.accessToken));

    expect(publishRes.status).toBe(200);
    expect(publishRes.body.status).toBe('published');

    // 5. GET /courses lists published courses and includes this one
    const listRes = await request(app).get(BASE);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.items)).toBe(true);
    const found = (listRes.body.items as { id: string }[]).find((c) => c.id === courseId);
    expect(found).toBeDefined();
    expect((found as { status: string }).status).toBe('published');

    // 6. GET /courses/:id returns full course details
    const getRes = await request(app).get(`${BASE}/${courseId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(courseId);
    expect(Array.isArray(getRes.body.lessons)).toBe(true);
    expect(getRes.body.lessons).toHaveLength(1);

    // 7. Enroll as student (free course — immediate enrollment)
    const enrollRes = await request(app)
      .post(`${BASE}/${courseId}/enroll`)
      .set(authHeader(student.accessToken));

    expect(enrollRes.status).toBe(200);
    expect(enrollRes.body.enrolled).toBe(true);
    expect(enrollRes.body).toHaveProperty('enrollmentId');
  });

  it('draft course is NOT listed by GET /courses', async () => {
    const teacher = await registerAndLogin('TEACHER');

    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send({ ...courseBody, title: 'Draft Only Course' });

    expect(createRes.status).toBe(201);
    const courseId: string = createRes.body.id;

    const listRes = await request(app).get(BASE);
    const found = (listRes.body.items as { id: string }[]).find((c) => c.id === courseId);
    expect(found).toBeUndefined();
  });

  it('enrolling in a non-existent course returns 404', async () => {
    const student = await registerAndLogin('STUDENT');
    const res = await request(app)
      .post(`${BASE}/non-existent-id/enroll`)
      .set(authHeader(student.accessToken));

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('cannot publish another teacher\'s course', async () => {
    const teacher1 = await registerAndLogin('TEACHER');
    const teacher2 = await registerAndLogin('TEACHER');

    // teacher1 creates a course and adds a lesson
    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher1.accessToken))
      .send(courseBody);
    const courseId: string = createRes.body.id;

    await request(app)
      .post(LESSONS_BASE)
      .set(authHeader(teacher1.accessToken))
      .send({ courseId, title: 'Lesson A', order: 1 });

    // teacher2 attempts to publish it
    const res = await request(app)
      .post(`${BASE}/${courseId}/publish`)
      .set(authHeader(teacher2.accessToken));

    expect(res.status).toBe(403);
  });

  it('PATCH /courses/:id updates the course (owner only)', async () => {
    const teacher = await registerAndLogin('TEACHER');

    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(courseBody);
    const courseId: string = createRes.body.id;

    const patchRes = await request(app)
      .patch(`${BASE}/${courseId}`)
      .set(authHeader(teacher.accessToken))
      .send({ title: 'Updated Algebra Course' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.title).toBe('Updated Algebra Course');
  });

  it('GET /courses/:id/lessons returns the lesson list', async () => {
    const teacher = await registerAndLogin('TEACHER');

    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(courseBody);
    const courseId: string = createRes.body.id;

    await request(app)
      .post(LESSONS_BASE)
      .set(authHeader(teacher.accessToken))
      .send({ courseId, title: 'Lesson One', order: 1 });

    const lessonsRes = await request(app).get(`${BASE}/${courseId}/lessons`);
    expect(lessonsRes.status).toBe(200);
    expect(Array.isArray(lessonsRes.body)).toBe(true);
    expect(lessonsRes.body).toHaveLength(1);
    expect(lessonsRes.body[0].title).toBe('Lesson One');
  });

  it('GET /courses returns 404-shaped error for non-existent course', async () => {
    const res = await request(app).get(`${BASE}/does-not-exist`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
