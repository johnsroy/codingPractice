/**
 * Session integration tests.
 *
 * Covers:
 *  - Teacher creates a one_on_one session
 *  - Student books a free session
 *  - GET /sessions/:id/join returns a VideoJoinTicket (provider='mock', token present,
 *    teacher canPublish=true, student canPublish=false)
 *  - Student cannot join without booking first
 *  - Teacher can start/end a session
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndLogin, authHeader } from './helpers';

const BASE = '/api/sessions';

/** Returns a future ISO datetime string (1 day from now). */
function futureDatetime(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

const sessionBody = {
  kind: 'one_on_one',
  title: 'Maths Tutoring Session',
  startsAt: futureDatetime(),
  durationMinutes: 60,
  priceCents: 0,
  capacity: 1,
};

describe('POST /api/sessions (create)', () => {
  it('STUDENT cannot create a session (403)', async () => {
    const student = await registerAndLogin('STUDENT');

    const res = await request(app)
      .post(BASE)
      .set(authHeader(student.accessToken))
      .send(sessionBody);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('unauthenticated request returns 401', async () => {
    const res = await request(app).post(BASE).send(sessionBody);
    expect(res.status).toBe(401);
  });

  it('TEACHER creates a session successfully', async () => {
    const teacher = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(sessionBody);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      kind: 'one_on_one',
      title: sessionBody.title,
      status: 'scheduled',
      priceCents: 0,
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('roomName');
    expect(res.body.teacherId).toBe(teacher.user.id);
  });

  it('validation error for bad startsAt format', async () => {
    const teacher = await registerAndLogin('TEACHER');

    const res = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send({ ...sessionBody, startsAt: 'not-a-date' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/sessions/:id/book (student books)', () => {
  it('student books a free session successfully', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const student = await registerAndLogin('STUDENT');

    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(sessionBody);

    const sessionId: string = createRes.body.id;

    const bookRes = await request(app)
      .post(`${BASE}/${sessionId}/book`)
      .set(authHeader(student.accessToken));

    expect(bookRes.status).toBe(200);
    expect(bookRes.body.booked).toBe(true);
    expect(bookRes.body).toHaveProperty('enrollmentId');
  });

  it('returns 404 when session does not exist', async () => {
    const student = await registerAndLogin('STUDENT');

    const res = await request(app)
      .post(`${BASE}/no-such-session/book`)
      .set(authHeader(student.accessToken));

    expect(res.status).toBe(404);
  });
});

describe('GET /api/sessions/:id/join (VideoJoinTicket)', () => {
  it('teacher receives a ticket with canPublish=true', async () => {
    const teacher = await registerAndLogin('TEACHER');

    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(sessionBody);

    const sessionId: string = createRes.body.id;

    const joinRes = await request(app)
      .get(`${BASE}/${sessionId}/join`)
      .set(authHeader(teacher.accessToken));

    expect(joinRes.status).toBe(200);
    const ticket = joinRes.body as {
      provider: string;
      token: string;
      roomName: string;
      identity: string;
      canPublish: boolean;
      url: string;
      expiresAt: string;
    };
    expect(ticket.provider).toBe('mock');
    expect(typeof ticket.token).toBe('string');
    expect(ticket.token.length).toBeGreaterThan(0);
    expect(ticket.canPublish).toBe(true);
    expect(ticket.roomName).toBe(createRes.body.roomName);
    expect(ticket.identity).toBe(teacher.user.id);
    expect(typeof ticket.expiresAt).toBe('string');
  });

  it('enrolled student receives a ticket with canPublish=false', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const student = await registerAndLogin('STUDENT');

    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(sessionBody);

    const sessionId: string = createRes.body.id;

    // Book the session first
    await request(app)
      .post(`${BASE}/${sessionId}/book`)
      .set(authHeader(student.accessToken))
      .expect(200);

    const joinRes = await request(app)
      .get(`${BASE}/${sessionId}/join`)
      .set(authHeader(student.accessToken));

    expect(joinRes.status).toBe(200);
    expect(joinRes.body.canPublish).toBe(false);
    expect(joinRes.body.provider).toBe('mock');
  });

  it('un-enrolled student gets 403', async () => {
    const teacher = await registerAndLogin('TEACHER');
    const student = await registerAndLogin('STUDENT');

    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(sessionBody);

    const sessionId: string = createRes.body.id;

    const joinRes = await request(app)
      .get(`${BASE}/${sessionId}/join`)
      .set(authHeader(student.accessToken));

    expect(joinRes.status).toBe(403);
    expect(joinRes.body).toHaveProperty('error');
  });
});

describe('Session lifecycle (start/end)', () => {
  it('teacher can start then end a session', async () => {
    const teacher = await registerAndLogin('TEACHER');

    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(sessionBody);

    const sessionId: string = createRes.body.id;

    const startRes = await request(app)
      .post(`${BASE}/${sessionId}/start`)
      .set(authHeader(teacher.accessToken));

    expect(startRes.status).toBe(200);
    expect(startRes.body.status).toBe('live');

    const endRes = await request(app)
      .post(`${BASE}/${sessionId}/end`)
      .set(authHeader(teacher.accessToken));

    expect(endRes.status).toBe(200);
    expect(endRes.body.status).toBe('completed');
  });

  it('cannot join a completed session', async () => {
    const teacher = await registerAndLogin('TEACHER');

    const createRes = await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(sessionBody);

    const sessionId: string = createRes.body.id;

    // Immediately end (skip start — /end allows 'scheduled' too)
    await request(app)
      .post(`${BASE}/${sessionId}/end`)
      .set(authHeader(teacher.accessToken))
      .expect(200);

    // Teacher trying to join a completed session should get 400
    const joinRes = await request(app)
      .get(`${BASE}/${sessionId}/join`)
      .set(authHeader(teacher.accessToken));

    expect(joinRes.status).toBe(400);
  });
});

describe('GET /api/sessions (list)', () => {
  it('requires authentication', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
  });

  it('returns a session list as an array with pagination metadata in headers', async () => {
    const teacher = await registerAndLogin('TEACHER');

    await request(app)
      .post(BASE)
      .set(authHeader(teacher.accessToken))
      .send(sessionBody);

    const res = await request(app)
      .get(BASE)
      .set(authHeader(teacher.accessToken));

    expect(res.status).toBe(200);
    // The list endpoint returns a bare array (the client contract); pagination
    // metadata is carried in response headers.
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.headers['x-total-count']).toBeDefined();
  });
});
