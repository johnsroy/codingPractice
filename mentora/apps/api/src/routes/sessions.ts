/**
 * Session routes — live classrooms and 1:1 coaching sessions.
 *   GET  /sessions           — list sessions (?mine=&kind=&upcoming=)
 *   POST /sessions           — create session (TEACHER)
 *   GET  /sessions/:id       — get session by id
 *   POST /sessions/:id/book  — student books a session (payment if priceCents > 0)
 *   GET  /sessions/:id/join  — get VideoJoinTicket (authenticated participants only)
 *   POST /sessions/:id/start — mark as live (TEACHER, owner)
 *   POST /sessions/:id/end   — mark as completed (TEACHER, owner)
 */

import { Router } from 'express';
import crypto from 'crypto';
import { createSessionSchema } from '@mentora/shared';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { getVideoAdapter } from '../adapters/video';
import { getPaymentsAdapter } from '../adapters/payments';
import { toUserPublic } from './auth';

export const sessionsRouter = Router();

/** Generate a unique room name for a session. */
function generateRoomName(prefix = 'mentora'): string {
  return `${prefix}-${crypto.randomBytes(6).toString('hex')}`;
}

function serializeSession(s: {
  id: string;
  kind: string;
  teacherId: string;
  teacher?: Parameters<typeof toUserPublic>[0];
  courseId: string | null;
  title: string;
  startsAt: Date;
  durationMinutes: number;
  status: string;
  priceCents: number;
  capacity: number;
  roomName: string;
  createdAt: Date;
  _count?: { enrollments: number };
}) {
  return {
    id: s.id,
    kind: s.kind,
    teacherId: s.teacherId,
    teacher: s.teacher ? toUserPublic(s.teacher) : undefined,
    courseId: s.courseId,
    title: s.title,
    startsAt: s.startsAt.toISOString(),
    durationMinutes: s.durationMinutes,
    status: s.status,
    priceCents: s.priceCents,
    capacity: s.capacity,
    roomName: s.roomName,
    enrolledCount: s._count?.enrollments,
    createdAt: s.createdAt.toISOString(),
  };
}

// GET /sessions
sessionsRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { mine, kind, upcoming, page = '1', pageSize = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const skip = (pageNum - 1) * size;

    const where: Prisma.ClassSessionWhereInput = {};

    if (mine === 'true') {
      // Teacher sees own sessions; students see sessions they're enrolled in
      if (req.user!.role === 'TEACHER') {
        where.teacherId = req.user!.sub;
      } else {
        where.enrollments = { some: { studentId: req.user!.sub } };
      }
    }

    if (kind) where.kind = kind as 'classroom' | 'one_on_one';

    if (upcoming === 'true') {
      where.startsAt = { gte: new Date() };
      where.status = { in: ['scheduled', 'live'] };
    }

    const [sessions, total] = await prisma.$transaction([
      prisma.classSession.findMany({
        where,
        skip,
        take: size,
        orderBy: { startsAt: 'asc' },
        include: {
          teacher: true,
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.classSession.count({ where }),
    ]);

    res.json({
      items: sessions.map(serializeSession),
      total,
      page: pageNum,
      pageSize: size,
    });
  }),
);

// POST /sessions — create
sessionsRouter.post(
  '/',
  authenticate,
  requireRole('TEACHER'),
  validate(createSessionSchema),
  asyncHandler(async (req, res) => {
    const { kind, courseId, title, startsAt, durationMinutes, priceCents, capacity } =
      req.body as {
        kind: 'classroom' | 'one_on_one';
        courseId?: string | null;
        title: string;
        startsAt: string;
        durationMinutes: number;
        priceCents: number;
        capacity: number;
      };

    // Generate a globally unique room name
    let roomName = generateRoomName();
    // Ensure uniqueness (extremely unlikely to collide, but guard anyway)
    let attempts = 0;
    while (await prisma.classSession.findUnique({ where: { roomName } })) {
      roomName = generateRoomName();
      if (++attempts > 10) throw new Error('Could not generate unique room name.');
    }

    // Pre-create the video room
    const video = getVideoAdapter();
    await video.createRoom(roomName);

    const session = await prisma.classSession.create({
      data: {
        kind,
        teacherId: req.user!.sub,
        courseId: courseId ?? null,
        title,
        startsAt: new Date(startsAt),
        durationMinutes: durationMinutes ?? 60,
        priceCents: priceCents ?? 0,
        capacity: capacity ?? 1,
        roomName,
        status: 'scheduled',
      },
      include: {
        teacher: true,
        _count: { select: { enrollments: true } },
      },
    });

    res.status(201).json(serializeSession(session));
  }),
);

// GET /sessions/:id
sessionsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const session = await prisma.classSession.findUnique({
      where: { id: req.params['id'] },
      include: {
        teacher: true,
        _count: { select: { enrollments: true } },
      },
    });
    if (!session) throw notFound('Session');
    res.json(serializeSession(session));
  }),
);

// POST /sessions/:id/book — student books
sessionsRouter.post(
  '/:id/book',
  authenticate,
  asyncHandler(async (req, res) => {
    const session = await prisma.classSession.findUnique({
      where: { id: req.params['id'] },
    });
    if (!session) throw notFound('Session');
    if (session.status !== 'scheduled') {
      throw badRequest('This session is no longer available for booking.');
    }

    // Check capacity
    const enrolledCount = await prisma.enrollment.count({
      where: { sessionId: session.id, status: { not: 'cancelled' } },
    });
    if (enrolledCount >= session.capacity) {
      throw badRequest('Sorry, this session is fully booked. Check back for more sessions!');
    }

    const userId = req.user!.sub;

    if (session.priceCents === 0) {
      // Free session — enroll directly
      const enrollment = await prisma.enrollment.upsert({
        where: { studentId_sessionId: { studentId: userId, sessionId: session.id } },
        create: { studentId: userId, sessionId: session.id, status: 'active' },
        update: { status: 'active' },
      });
      return res.json({ booked: true, enrollmentId: enrollment.id });
    }

    // Paid session — route through payments adapter
    const adapter = getPaymentsAdapter();
    const result = await adapter.createCheckout({
      kind: 'session',
      sessionId: session.id,
      userId,
      userEmail: req.user!.email,
    });

    res.json({ checkoutUrl: result.url, provider: result.provider });
  }),
);

// GET /sessions/:id/join — return video ticket
sessionsRouter.get(
  '/:id/join',
  authenticate,
  asyncHandler(async (req, res) => {
    const session = await prisma.classSession.findUnique({
      where: { id: req.params['id'] },
    });
    if (!session) throw notFound('Session');

    const userId = req.user!.sub;
    const isTeacher = session.teacherId === userId;

    // Non-teachers must be enrolled
    if (!isTeacher) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: userId, sessionId: session.id, status: { not: 'cancelled' } },
      });
      if (!enrollment) {
        throw forbidden('You need to book this session before joining.');
      }
    }

    if (session.status === 'cancelled') {
      throw badRequest('This session has been cancelled.');
    }
    if (session.status === 'completed') {
      throw badRequest('This session has already ended.');
    }

    const video = getVideoAdapter();
    const ticket = await video.joinTicket({
      roomName: session.roomName,
      identity: userId,
      canPublish: isTeacher,
    });

    res.json(ticket);
  }),
);

// POST /sessions/:id/start — teacher starts session
sessionsRouter.post(
  '/:id/start',
  authenticate,
  requireRole('TEACHER'),
  asyncHandler(async (req, res) => {
    const session = await prisma.classSession.findUnique({ where: { id: req.params['id'] } });
    if (!session) throw notFound('Session');
    if (session.teacherId !== req.user!.sub) {
      throw forbidden('Only the teacher who created this session can start it.');
    }
    if (session.status !== 'scheduled') {
      throw badRequest(`Cannot start a session that is currently "${session.status}".`);
    }

    const updated = await prisma.classSession.update({
      where: { id: session.id },
      data: { status: 'live' },
    });

    res.json({ id: updated.id, status: updated.status });
  }),
);

// POST /sessions/:id/end — teacher ends session
sessionsRouter.post(
  '/:id/end',
  authenticate,
  requireRole('TEACHER'),
  asyncHandler(async (req, res) => {
    const session = await prisma.classSession.findUnique({ where: { id: req.params['id'] } });
    if (!session) throw notFound('Session');
    if (session.teacherId !== req.user!.sub) {
      throw forbidden('Only the teacher who created this session can end it.');
    }
    if (!['scheduled', 'live'].includes(session.status)) {
      throw badRequest(`Cannot end a session that is currently "${session.status}".`);
    }

    // Mark all active enrollments as completed
    await prisma.enrollment.updateMany({
      where: { sessionId: session.id, status: 'active' },
      data: { status: 'completed' },
    });

    const updated = await prisma.classSession.update({
      where: { id: session.id },
      data: { status: 'completed' },
    });

    res.json({ id: updated.id, status: updated.status });
  }),
);
