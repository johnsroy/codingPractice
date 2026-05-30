/**
 * Auth routes — register, login, refresh, me, logout.
 * Access tokens are short-lived JWTs (default 7d but configurable).
 * Refresh tokens are stored in the DB and can be revoked server-side.
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '@mentora/shared';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { badRequest, unauthorized, notFound } from '../lib/errors';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import type { JwtPayload } from '../middleware/auth';
import type { UserPublic } from '@mentora/shared';

export const authRouter = Router();

/** Convert a Prisma User to the public-safe UserPublic shape. */
function toUserPublic(user: {
  id: string;
  role: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  headline: string | null;
  subjects: string[];
  grades: string[];
  yearsExperience: number | null;
  hourlyRateCents: number | null;
  verified: boolean;
  rating: number | null;
  proTier: boolean;
  createdAt: Date;
}): UserPublic {
  return {
    id: user.id,
    role: user.role as UserPublic['role'],
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    headline: user.headline,
    subjects: user.subjects,
    grades: user.grades,
    yearsExperience: user.yearsExperience,
    hourlyRateCents: user.hourlyRateCents,
    verified: user.verified,
    rating: user.rating,
    proTier: user.proTier,
    createdAt: user.createdAt.toISOString(),
  };
}

/** Mint a new access token (short-lived JWT). */
function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/** Create and persist a refresh token. Returns the raw token string. */
async function createRefreshToken(userId: string): Promise<string> {
  const raw = jwt.sign({ sub: userId, type: 'refresh' }, env.JWT_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  // Decode to get expiry
  const decoded = jwt.decode(raw) as { exp?: number };
  const expiresAt = decoded.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token: raw, userId, expiresAt },
  });

  return raw;
}

// POST /auth/register
authRouter.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role: string;
    };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw badRequest('An account with that email already exists. Please sign in instead.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: role as never },
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role as never, email: user.email });
    const refreshToken = await createRefreshToken(user.id);

    res.status(201).json({
      user: toUserPublic(user),
      accessToken,
      refreshToken,
    });
  }),
);

// POST /auth/login
authRouter.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Use same message for both "not found" and "wrong password" to avoid enumeration
      throw unauthorized('Incorrect email or password. Please try again.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw unauthorized('Incorrect email or password. Please try again.');
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role as never, email: user.email });
    const refreshToken = await createRefreshToken(user.id);

    res.json({
      user: toUserPublic(user),
      accessToken,
      refreshToken,
    });
  }),
);

// POST /auth/refresh — exchange a valid refresh token for a new access token
authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      throw badRequest('Refresh token is required.');
    }

    // Verify the JWT signature first
    let decoded: { sub?: string };
    try {
      decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { sub?: string };
    } catch {
      throw unauthorized('Your session has expired. Please sign in again.');
    }

    // Then check it's in the DB and not revoked
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw unauthorized('This session is no longer valid. Please sign in again.');
    }

    const user = stored.user;
    const accessToken = signAccessToken({ sub: user.id, role: user.role as never, email: user.email });

    // Rotate: issue a new refresh token and revoke the old one
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    const newRefreshToken = await createRefreshToken(user.id);

    res.json({ accessToken, refreshToken: newRefreshToken, user: toUserPublic(user) });
  }),
);

// GET /auth/me — return the authenticated user's profile
authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw notFound('User');
    res.json(toUserPublic(user));
  }),
);

// POST /auth/logout — revoke the refresh token
authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await prisma.refreshToken
        .update({ where: { token: refreshToken }, data: { revoked: true } })
        .catch(() => {
          /* Token may not exist — that's fine */
        });
    }
    res.json({ message: 'Signed out successfully.' });
  }),
);

export { toUserPublic };
