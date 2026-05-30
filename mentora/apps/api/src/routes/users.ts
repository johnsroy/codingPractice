/**
 * User routes.
 *   GET  /users/me          — authenticated user's own profile
 *   PATCH /users/me         — update own profile
 *   GET  /users/teachers    — public teacher directory (filterable)
 *   GET  /users/:id         — any public user profile
 */

import { Router } from 'express';
import { updateProfileSchema } from '@mentora/shared';
import { prisma } from '../lib/prisma';
import { notFound } from '../lib/errors';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import { toUserPublic } from './auth';

export const usersRouter = Router();

// GET /users/me
usersRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw notFound('User');
    res.json(toUserPublic(user));
  }),
);

// PATCH /users/me
usersRouter.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const {
      name,
      bio,
      headline,
      avatarUrl,
      subjects,
      grades,
      yearsExperience,
      hourlyRateCents,
    } = req.body as {
      name?: string;
      bio?: string;
      headline?: string;
      avatarUrl?: string | null;
      subjects?: string[];
      grades?: string[];
      yearsExperience?: number;
      hourlyRateCents?: number;
    };

    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(headline !== undefined && { headline }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(subjects !== undefined && { subjects }),
        ...(grades !== undefined && { grades }),
        ...(yearsExperience !== undefined && { yearsExperience }),
        ...(hourlyRateCents !== undefined && { hourlyRateCents }),
      },
    });

    res.json(toUserPublic(user));
  }),
);

// GET /users/teachers — public directory of all verified/active teachers
// Supports: ?subject=math&grade=grade-5&q=science&page=1&pageSize=20
usersRouter.get(
  '/teachers',
  asyncHandler(async (req, res) => {
    const { subject, grade, q, page = '1', pageSize = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const skip = (pageNum - 1) * size;

    // Build Prisma where clause
    const where: Record<string, unknown> = { role: 'TEACHER' };

    if (subject) {
      where['subjects'] = { has: subject };
    }
    if (grade) {
      where['grades'] = { has: grade };
    }
    if (q) {
      where['OR'] = [
        { name: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { headline: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: size,
        orderBy: [{ proTier: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      items: users.map(toUserPublic),
      total,
      page: pageNum,
      pageSize: size,
    });
  }),
);

// GET /users/:id — public profile
usersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params['id'] } });
    if (!user) throw notFound('User');
    res.json(toUserPublic(user));
  }),
);
