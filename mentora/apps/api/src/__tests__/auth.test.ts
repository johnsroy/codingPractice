/**
 * Auth integration tests.
 *
 * Covers:
 *  - register → login → /auth/me → refresh
 *  - Duplicate email returns 400 (BadRequest with friendly message)
 *  - Wrong password returns 401
 *  - Validation errors return the ApiError shape with details
 *  - Logout revokes the refresh token
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndLogin, authHeader } from './helpers';

const BASE = '/api/auth';

// ─── Registration ─────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('creates a new STUDENT account and returns tokens + user', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({
        name: 'Alice Student',
        email: 'alice-student@example.com',
        password: 'Password123!',
        role: 'STUDENT',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user).toMatchObject({
      role: 'STUDENT',
      name: 'Alice Student',
      email: 'alice-student@example.com',
    });
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('creates a TEACHER account', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({
        name: 'Bob Teacher',
        email: 'bob-teacher@example.com',
        password: 'Password123!',
        role: 'TEACHER',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('TEACHER');
  });

  it('returns 400 for duplicate email', async () => {
    const body = {
      name: 'Dup User',
      email: 'dup@example.com',
      password: 'Password123!',
      role: 'STUDENT',
    };

    // First registration succeeds
    await request(app).post(`${BASE}/register`).send(body).expect(201);

    // Second with the same email fails
    const res = await request(app).post(`${BASE}/register`).send(body);

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: expect.any(String) });
    expect(typeof res.body.message).toBe('string');
  });

  it('returns 400 with ApiError details for validation errors (short name)', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ name: 'X', email: 'bad', password: 'short', role: 'STUDENT' });

    expect(res.status).toBe(400);
    // validate() middleware sets error to HttpError name, message, and details
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('message');
    // details is an array of field errors
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ email: 'no-name@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('returns tokens and user on correct credentials', async () => {
    // Register first
    await request(app)
      .post(`${BASE}/register`)
      .send({
        name: 'Login Test',
        email: 'login-test@example.com',
        password: 'Password123!',
        role: 'STUDENT',
      })
      .expect(201);

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'login-test@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe('login-test@example.com');
  });

  it('returns 401 for wrong password', async () => {
    await request(app)
      .post(`${BASE}/register`)
      .send({
        name: 'Wrong Pass',
        email: 'wrong-pass@example.com',
        password: 'CorrectPass1!',
        role: 'STUDENT',
      })
      .expect(201);

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'wrong-pass@example.com', password: 'WrongPass999!' });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: expect.any(String) });
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'nobody@nowhere.com', password: 'SomePass1!' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for missing password (validation)', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'someone@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns the authenticated user profile', async () => {
    const { accessToken, user } = await registerAndLogin('STUDENT');

    const res = await request(app)
      .get(`${BASE}/me`)
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(user.id);
    expect(res.body.email).toBe(user.email);
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get(`${BASE}/me`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 for an invalid token', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', 'Bearer this.is.not.valid');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  it('exchanges a valid refresh token for a new access token and rotates', async () => {
    const { refreshToken: originalRefresh } = await registerAndLogin('STUDENT');

    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken: originalRefresh });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    // New refresh token should differ from the original (rotation)
    expect(res.body.refreshToken).not.toBe(originalRefresh);
    // user info should also be returned
    expect(res.body.user).toHaveProperty('id');

    // Using the old refresh token again should fail (revoked)
    const reuse = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken: originalRefresh });
    expect(reuse.status).toBe(401);
  });

  it('returns 400 when refresh token is missing', async () => {
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 401 for a garbage token string', async () => {
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken: 'not-a-real-token' });

    expect(res.status).toBe(401);
  });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('revokes the refresh token so subsequent refresh calls fail', async () => {
    const { refreshToken } = await registerAndLogin('STUDENT');

    const logoutRes = await request(app)
      .post(`${BASE}/logout`)
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toBeTruthy();

    // Refresh should now fail
    const refreshRes = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });

  it('succeeds even when no refresh token is provided (graceful no-op)', async () => {
    const res = await request(app).post(`${BASE}/logout`).send({});
    expect(res.status).toBe(200);
  });
});
