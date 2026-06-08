import { z } from 'zod';
import { ALL_ROLES } from './roles';

/** Validation schemas shared by the API (request validation) and web (forms). */

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(ALL_ROLES as [string, ...string[]]).default('STUDENT'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(2000).optional(),
  headline: z.string().max(160).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  subjects: z.array(z.string()).max(20).optional(),
  grades: z.array(z.string()).max(12).optional(),
  yearsExperience: z.number().int().min(0).max(70).optional(),
  hourlyRateCents: z.number().int().min(0).max(100000).optional(),
});

export const createCourseSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(5000),
  subjectId: z.string(),
  gradeId: z.string(),
  priceCents: z.number().int().min(0).max(1000000).default(0),
  coverImageUrl: z.string().url().optional().nullable(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const createLessonSchema = z.object({
  courseId: z.string(),
  title: z.string().min(2).max(140),
  order: z.number().int().min(0).default(0),
  summary: z.string().max(2000).optional(),
});

export const createSessionSchema = z.object({
  kind: z.enum(['classroom', 'one_on_one']),
  courseId: z.string().optional().nullable(),
  title: z.string().min(2).max(140),
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(240).default(60),
  priceCents: z.number().int().min(0).max(1000000).default(0),
  capacity: z.number().int().min(1).max(500).default(1),
});

export const aiRequestSchema = z.object({
  task: z.enum([
    'summarize_material',
    'generate_quiz',
    'explain_simply',
    'lesson_plan',
    'tutor_chat',
    'grade_answer',
    'research_topic',
  ]),
  materialId: z.string().optional(),
  prompt: z.string().max(8000).optional(),
  gradeId: z.string().optional(),
  subjectId: z.string().optional(),
  context: z.string().max(20000).optional(),
  numQuestions: z.number().int().min(1).max(20).optional(),
  /** The subject/topic to research (used by research_topic). */
  topic: z.string().min(2).max(300).optional(),
});

/** Dedicated payload for the agentic topic-research endpoint. */
export const researchRequestSchema = z.object({
  topic: z.string().min(2).max(300),
  gradeId: z.string().optional(),
  subjectId: z.string().optional(),
});

export const checkoutSchema = z.object({
  kind: z.enum(['subscription', 'session', 'course']),
  planId: z.string().optional(),
  sessionId: z.string().optional(),
  courseId: z.string().optional(),
  interval: z.enum(['month', 'year']).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type AiRequestInput = z.infer<typeof aiRequestSchema>;
export type ResearchRequestInput = z.infer<typeof researchRequestSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
