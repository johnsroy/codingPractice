/**
 * Course routes.
 *   GET    /courses                — list published courses (paginated, filterable)
 *   POST   /courses                — create course (TEACHER)
 *   GET    /courses/:id            — get course with teacher + lessons + counts
 *   PATCH  /courses/:id            — update course (owner TEACHER)
 *   POST   /courses/:id/publish    — publish a draft course (owner TEACHER)
 *   POST   /courses/:id/enroll     — enroll authenticated user (payment if priceCents > 0)
 *   GET    /courses/:id/lessons    — list lessons for a course
 */

import { Router } from 'express';
import { createCourseSchema, updateCourseSchema } from '@mentora/shared';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { getPaymentsAdapter } from '../adapters/payments';
import { toUserPublic } from './auth';

export const coursesRouter = Router();

// GET /courses
coursesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      subject,
      grade,
      q,
      page = '1',
      pageSize = '20',
      teacherId,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const skip = (pageNum - 1) * size;

    const where: Prisma.CourseWhereInput = { status: 'published' };
    if (subject) where.subjectId = subject;
    if (grade) where.gradeId = grade;
    if (teacherId) where.teacherId = teacherId;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await prisma.$transaction([
      prisma.course.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: true,
          _count: { select: { lessons: true, enrollments: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      items: courses.map((c) => ({
        id: c.id,
        teacherId: c.teacherId,
        teacher: toUserPublic(c.teacher),
        title: c.title,
        description: c.description,
        subjectId: c.subjectId,
        gradeId: c.gradeId,
        coverImageUrl: c.coverImageUrl,
        status: c.status,
        priceCents: c.priceCents,
        rating: c.rating,
        lessonCount: c._count.lessons,
        enrolledCount: c._count.enrollments,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      total,
      page: pageNum,
      pageSize: size,
    });
  }),
);

// POST /courses — create a new course (TEACHER only)
coursesRouter.post(
  '/',
  authenticate,
  requireRole('TEACHER'),
  validate(createCourseSchema),
  asyncHandler(async (req, res) => {
    const { title, description, subjectId, gradeId, priceCents, coverImageUrl } =
      req.body as {
        title: string;
        description: string;
        subjectId: string;
        gradeId: string;
        priceCents: number;
        coverImageUrl?: string | null;
      };

    const course = await prisma.course.create({
      data: {
        teacherId: req.user!.sub,
        title,
        description,
        subjectId,
        gradeId,
        priceCents: priceCents ?? 0,
        coverImageUrl,
        status: 'draft',
      },
      include: { teacher: true, _count: { select: { lessons: true, enrollments: true } } },
    });

    res.status(201).json({
      id: course.id,
      teacherId: course.teacherId,
      teacher: toUserPublic(course.teacher),
      title: course.title,
      description: course.description,
      subjectId: course.subjectId,
      gradeId: course.gradeId,
      coverImageUrl: course.coverImageUrl,
      status: course.status,
      priceCents: course.priceCents,
      rating: course.rating,
      lessonCount: course._count.lessons,
      enrolledCount: course._count.enrollments,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    });
  }),
);

// GET /courses/:id
coursesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const course = await prisma.course.findUnique({
      where: { id: req.params['id'] },
      include: {
        teacher: true,
        lessons: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) throw notFound('Course');

    res.json({
      id: course.id,
      teacherId: course.teacherId,
      teacher: toUserPublic(course.teacher),
      title: course.title,
      description: course.description,
      subjectId: course.subjectId,
      gradeId: course.gradeId,
      coverImageUrl: course.coverImageUrl,
      status: course.status,
      priceCents: course.priceCents,
      rating: course.rating,
      lessonCount: course.lessons.length,
      enrolledCount: course._count.enrollments,
      lessons: course.lessons.map((l) => ({
        id: l.id,
        courseId: l.courseId,
        title: l.title,
        order: l.order,
        summary: l.summary,
        materialIds: [],
        createdAt: l.createdAt.toISOString(),
      })),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    });
  }),
);

// PATCH /courses/:id — update (owner only)
coursesRouter.patch(
  '/:id',
  authenticate,
  requireRole('TEACHER'),
  validate(updateCourseSchema),
  asyncHandler(async (req, res) => {
    const course = await prisma.course.findUnique({ where: { id: req.params['id'] } });
    if (!course) throw notFound('Course');
    if (course.teacherId !== req.user!.sub) {
      throw forbidden('You can only update your own courses.');
    }

    const { title, description, subjectId, gradeId, priceCents, coverImageUrl, status } =
      req.body as {
        title?: string;
        description?: string;
        subjectId?: string;
        gradeId?: string;
        priceCents?: number;
        coverImageUrl?: string | null;
        status?: 'draft' | 'published' | 'archived';
      };

    const updated = await prisma.course.update({
      where: { id: course.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(subjectId !== undefined && { subjectId }),
        ...(gradeId !== undefined && { gradeId }),
        ...(priceCents !== undefined && { priceCents }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(status !== undefined && { status }),
      },
      include: { teacher: true, _count: { select: { lessons: true, enrollments: true } } },
    });

    res.json({
      id: updated.id,
      teacherId: updated.teacherId,
      teacher: toUserPublic(updated.teacher),
      title: updated.title,
      description: updated.description,
      subjectId: updated.subjectId,
      gradeId: updated.gradeId,
      coverImageUrl: updated.coverImageUrl,
      status: updated.status,
      priceCents: updated.priceCents,
      rating: updated.rating,
      lessonCount: updated._count.lessons,
      enrolledCount: updated._count.enrollments,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  }),
);

// POST /courses/:id/publish
coursesRouter.post(
  '/:id/publish',
  authenticate,
  requireRole('TEACHER'),
  asyncHandler(async (req, res) => {
    const course = await prisma.course.findUnique({ where: { id: req.params['id'] } });
    if (!course) throw notFound('Course');
    if (course.teacherId !== req.user!.sub) {
      throw forbidden('You can only publish your own courses.');
    }

    // Must have at least one lesson to publish
    const lessonCount = await prisma.lesson.count({ where: { courseId: course.id } });
    if (lessonCount === 0) {
      throw badRequest('Please add at least one lesson before publishing this course.');
    }

    const updated = await prisma.course.update({
      where: { id: course.id },
      data: { status: 'published' },
    });

    res.json({ id: updated.id, status: updated.status, updatedAt: updated.updatedAt.toISOString() });
  }),
);

// POST /courses/:id/enroll
coursesRouter.post(
  '/:id/enroll',
  authenticate,
  asyncHandler(async (req, res) => {
    const course = await prisma.course.findUnique({ where: { id: req.params['id'] } });
    if (!course) throw notFound('Course');
    if (course.status !== 'published') {
      throw badRequest('This course is not available for enrollment yet.');
    }

    const userId = req.user!.sub;

    // Free course — enroll directly
    if (course.priceCents === 0) {
      const enrollment = await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId: userId, courseId: course.id } },
        create: { studentId: userId, courseId: course.id, status: 'active' },
        update: { status: 'active' },
      });
      return res.json({ enrolled: true, enrollmentId: enrollment.id });
    }

    // Paid course — go through payment adapter
    const adapter = getPaymentsAdapter();
    const result = await adapter.createCheckout({
      kind: 'course',
      courseId: course.id,
      userId,
      userEmail: req.user!.email,
    });

    res.json({ checkoutUrl: result.url, provider: result.provider });
  }),
);

// GET /courses/:id/lessons
coursesRouter.get(
  '/:id/lessons',
  asyncHandler(async (req, res) => {
    const course = await prisma.course.findUnique({ where: { id: req.params['id'] } });
    if (!course) throw notFound('Course');

    const lessons = await prisma.lesson.findMany({
      where: { courseId: course.id },
      orderBy: { order: 'asc' },
      include: { materials: { select: { id: true } } },
    });

    res.json(
      lessons.map((l) => ({
        id: l.id,
        courseId: l.courseId,
        title: l.title,
        order: l.order,
        summary: l.summary,
        materialIds: l.materials.map((m) => m.id),
        createdAt: l.createdAt.toISOString(),
      })),
    );
  }),
);
