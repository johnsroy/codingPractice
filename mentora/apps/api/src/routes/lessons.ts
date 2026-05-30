/**
 * Lesson routes.
 *   POST /lessons      — create a lesson (TEACHER, must own the course)
 *   GET  /lessons/:id  — get lesson by id (with materials)
 */

import { Router } from 'express';
import { createLessonSchema } from '@mentora/shared';
import { prisma } from '../lib/prisma';
import { forbidden, notFound } from '../lib/errors';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';

export const lessonsRouter = Router();

// POST /lessons
lessonsRouter.post(
  '/',
  authenticate,
  requireRole('TEACHER'),
  validate(createLessonSchema),
  asyncHandler(async (req, res) => {
    const { courseId, title, order, summary } = req.body as {
      courseId: string;
      title: string;
      order: number;
      summary?: string;
    };

    // Verify ownership
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw notFound('Course');
    if (course.teacherId !== req.user!.sub) {
      throw forbidden('You can only add lessons to your own courses.');
    }

    const lesson = await prisma.lesson.create({
      data: { courseId, title, order: order ?? 0, summary },
      include: { materials: { select: { id: true } } },
    });

    res.status(201).json({
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      order: lesson.order,
      summary: lesson.summary,
      materialIds: lesson.materials.map((m) => m.id),
      createdAt: lesson.createdAt.toISOString(),
    });
  }),
);

// GET /lessons/:id
lessonsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params['id'] },
      include: { materials: { select: { id: true } } },
    });
    if (!lesson) throw notFound('Lesson');

    res.json({
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      order: lesson.order,
      summary: lesson.summary,
      materialIds: lesson.materials.map((m) => m.id),
      createdAt: lesson.createdAt.toISOString(),
    });
  }),
);
