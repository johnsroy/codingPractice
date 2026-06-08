import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createCourseSchema,
  updateCourseSchema,
  createLessonSchema,
  createSessionSchema,
  aiRequestSchema,
  checkoutSchema,
} from '../schemas';

// ---------------------------------------------------------------------------
// registerSchema
// ---------------------------------------------------------------------------
describe('registerSchema', () => {
  const valid = {
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'securePass1',
    role: 'STUDENT',
  };

  it('accepts a fully valid input', () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('applies default role "STUDENT" when role is omitted', () => {
    const { role: _role, ...withoutRole } = valid;
    const result = registerSchema.safeParse(withoutRole);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('STUDENT');
    }
  });

  it('accepts TEACHER as a valid role', () => {
    const result = registerSchema.safeParse({ ...valid, role: 'TEACHER' });
    expect(result.success).toBe(true);
  });

  it('accepts GUARDIAN as a valid role', () => {
    const result = registerSchema.safeParse({ ...valid, role: 'GUARDIAN' });
    expect(result.success).toBe(true);
  });

  it('accepts ADMIN as a valid role', () => {
    const result = registerSchema.safeParse({ ...valid, role: 'ADMIN' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid role enum value', () => {
    const result = registerSchema.safeParse({ ...valid, role: 'SUPERUSER' });
    expect(result.success).toBe(false);
  });

  it('rejects a bad email address', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects an email without a TLD', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'user@domain' });
    expect(result.success).toBe(false);
  });

  it('rejects a name that is too short (1 char)', () => {
    const result = registerSchema.safeParse({ ...valid, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('accepts a name at the minimum length (2 chars)', () => {
    const result = registerSchema.safeParse({ ...valid, name: 'Al' });
    expect(result.success).toBe(true);
  });

  it('rejects a name that is too long (> 80 chars)', () => {
    const result = registerSchema.safeParse({ ...valid, name: 'A'.repeat(81) });
    expect(result.success).toBe(false);
  });

  it('accepts a name at the maximum length (80 chars)', () => {
    const result = registerSchema.safeParse({ ...valid, name: 'A'.repeat(80) });
    expect(result.success).toBe(true);
  });

  it('rejects a password that is too short (< 8 chars)', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'short1' });
    expect(result.success).toBe(false);
  });

  it('accepts a password exactly at min length (8 chars)', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'exactlyy' });
    expect(result.success).toBe(true);
  });

  it('rejects a password that is too long (> 128 chars)', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'p'.repeat(129) });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const { name: _name, ...without } = valid;
    const result = registerSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const { email: _email, ...without } = valid;
    const result = registerSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const { password: _pw, ...without } = valid;
    const result = registerSchema.safeParse(without);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
describe('loginSchema', () => {
  const valid = { email: 'alice@example.com', password: 'anything' };

  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a bad email', () => {
    const result = loginSchema.safeParse({ ...valid, email: 'bad-email' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ ...valid, password: '' });
    expect(result.success).toBe(false);
  });

  it('accepts a single-char password (min is 1)', () => {
    const result = loginSchema.safeParse({ ...valid, password: 'x' });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const { email: _e, ...without } = valid;
    expect(loginSchema.safeParse(without).success).toBe(false);
  });

  it('rejects missing password', () => {
    const { password: _p, ...without } = valid;
    expect(loginSchema.safeParse(without).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateProfileSchema
// ---------------------------------------------------------------------------
describe('updateProfileSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a full valid update', () => {
    const result = updateProfileSchema.safeParse({
      name: 'Bob Jones',
      bio: 'A great teacher.',
      headline: 'Maths PhD',
      avatarUrl: 'https://example.com/avatar.png',
      subjects: ['math', 'science'],
      grades: ['grade-1', 'grade-2'],
      yearsExperience: 10,
      hourlyRateCents: 5000,
    });
    expect(result.success).toBe(true);
  });

  it('accepts null for avatarUrl', () => {
    const result = updateProfileSchema.safeParse({ avatarUrl: null });
    expect(result.success).toBe(true);
  });

  it('rejects a name that is too short (1 char)', () => {
    const result = updateProfileSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 80 chars', () => {
    const result = updateProfileSchema.safeParse({ name: 'B'.repeat(81) });
    expect(result.success).toBe(false);
  });

  it('rejects bio longer than 2000 chars', () => {
    const result = updateProfileSchema.safeParse({ bio: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('accepts bio at exactly 2000 chars', () => {
    const result = updateProfileSchema.safeParse({ bio: 'x'.repeat(2000) });
    expect(result.success).toBe(true);
  });

  it('rejects headline longer than 160 chars', () => {
    const result = updateProfileSchema.safeParse({ headline: 'h'.repeat(161) });
    expect(result.success).toBe(false);
  });

  it('accepts headline at exactly 160 chars', () => {
    const result = updateProfileSchema.safeParse({ headline: 'h'.repeat(160) });
    expect(result.success).toBe(true);
  });

  it('rejects a non-URL avatarUrl', () => {
    const result = updateProfileSchema.safeParse({ avatarUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects subjects with more than 20 items', () => {
    const result = updateProfileSchema.safeParse({ subjects: Array(21).fill('math') });
    expect(result.success).toBe(false);
  });

  it('accepts subjects with exactly 20 items', () => {
    const result = updateProfileSchema.safeParse({ subjects: Array(20).fill('math') });
    expect(result.success).toBe(true);
  });

  it('rejects grades with more than 12 items', () => {
    const result = updateProfileSchema.safeParse({ grades: Array(13).fill('grade-1') });
    expect(result.success).toBe(false);
  });

  it('accepts grades with exactly 12 items', () => {
    const result = updateProfileSchema.safeParse({ grades: Array(12).fill('grade-1') });
    expect(result.success).toBe(true);
  });

  it('rejects yearsExperience below 0', () => {
    const result = updateProfileSchema.safeParse({ yearsExperience: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects yearsExperience above 70', () => {
    const result = updateProfileSchema.safeParse({ yearsExperience: 71 });
    expect(result.success).toBe(false);
  });

  it('accepts yearsExperience at boundary values 0 and 70', () => {
    expect(updateProfileSchema.safeParse({ yearsExperience: 0 }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ yearsExperience: 70 }).success).toBe(true);
  });

  it('rejects yearsExperience that is a float', () => {
    const result = updateProfileSchema.safeParse({ yearsExperience: 5.5 });
    expect(result.success).toBe(false);
  });

  it('rejects hourlyRateCents below 0', () => {
    const result = updateProfileSchema.safeParse({ hourlyRateCents: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects hourlyRateCents above 100000', () => {
    const result = updateProfileSchema.safeParse({ hourlyRateCents: 100001 });
    expect(result.success).toBe(false);
  });

  it('accepts hourlyRateCents at boundary values 0 and 100000', () => {
    expect(updateProfileSchema.safeParse({ hourlyRateCents: 0 }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ hourlyRateCents: 100000 }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createCourseSchema
// ---------------------------------------------------------------------------
describe('createCourseSchema', () => {
  const valid = {
    title: 'Algebra Fundamentals',
    description: 'A thorough intro to algebra for beginners.',
    subjectId: 'math',
    gradeId: 'grade-7',
    priceCents: 0,
  };

  it('accepts a fully valid course', () => {
    expect(createCourseSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults priceCents to 0 when omitted', () => {
    const { priceCents: _p, ...without } = valid;
    const result = createCourseSchema.safeParse(without);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priceCents).toBe(0);
    }
  });

  it('accepts a coverImageUrl', () => {
    const result = createCourseSchema.safeParse({
      ...valid,
      coverImageUrl: 'https://cdn.example.com/cover.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('accepts null coverImageUrl', () => {
    const result = createCourseSchema.safeParse({ ...valid, coverImageUrl: null });
    expect(result.success).toBe(true);
  });

  it('rejects a non-URL coverImageUrl', () => {
    const result = createCourseSchema.safeParse({ ...valid, coverImageUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects title shorter than 3 chars', () => {
    const result = createCourseSchema.safeParse({ ...valid, title: 'ab' });
    expect(result.success).toBe(false);
  });

  it('accepts title at minimum length (3 chars)', () => {
    const result = createCourseSchema.safeParse({ ...valid, title: 'abc' });
    expect(result.success).toBe(true);
  });

  it('rejects title longer than 140 chars', () => {
    const result = createCourseSchema.safeParse({ ...valid, title: 't'.repeat(141) });
    expect(result.success).toBe(false);
  });

  it('rejects description shorter than 10 chars', () => {
    const result = createCourseSchema.safeParse({ ...valid, description: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects description longer than 5000 chars', () => {
    const result = createCourseSchema.safeParse({ ...valid, description: 'd'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('accepts description at boundary values (10 and 5000 chars)', () => {
    expect(createCourseSchema.safeParse({ ...valid, description: 'd'.repeat(10) }).success).toBe(true);
    expect(createCourseSchema.safeParse({ ...valid, description: 'd'.repeat(5000) }).success).toBe(true);
  });

  it('rejects priceCents below 0', () => {
    const result = createCourseSchema.safeParse({ ...valid, priceCents: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects priceCents above 1000000', () => {
    const result = createCourseSchema.safeParse({ ...valid, priceCents: 1000001 });
    expect(result.success).toBe(false);
  });

  it('accepts priceCents at boundary (0 and 1000000)', () => {
    expect(createCourseSchema.safeParse({ ...valid, priceCents: 0 }).success).toBe(true);
    expect(createCourseSchema.safeParse({ ...valid, priceCents: 1000000 }).success).toBe(true);
  });

  it('rejects priceCents that is a float', () => {
    const result = createCourseSchema.safeParse({ ...valid, priceCents: 9.99 });
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const { title: _t, ...without } = valid;
    expect(createCourseSchema.safeParse(without).success).toBe(false);
  });

  it('rejects missing description', () => {
    const { description: _d, ...without } = valid;
    expect(createCourseSchema.safeParse(without).success).toBe(false);
  });

  it('rejects missing subjectId', () => {
    const { subjectId: _s, ...without } = valid;
    expect(createCourseSchema.safeParse(without).success).toBe(false);
  });

  it('rejects missing gradeId', () => {
    const { gradeId: _g, ...without } = valid;
    expect(createCourseSchema.safeParse(without).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCourseSchema
// ---------------------------------------------------------------------------
describe('updateCourseSchema', () => {
  it('accepts an empty object (all base fields are partial)', () => {
    expect(updateCourseSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a valid status update', () => {
    const result = updateCourseSchema.safeParse({ status: 'published' });
    expect(result.success).toBe(true);
  });

  it('accepts status "draft"', () => {
    expect(updateCourseSchema.safeParse({ status: 'draft' }).success).toBe(true);
  });

  it('accepts status "archived"', () => {
    expect(updateCourseSchema.safeParse({ status: 'archived' }).success).toBe(true);
  });

  it('rejects an invalid status value', () => {
    const result = updateCourseSchema.safeParse({ status: 'deleted' });
    expect(result.success).toBe(false);
  });

  it('accepts a partial title update', () => {
    const result = updateCourseSchema.safeParse({ title: 'New Title Here' });
    expect(result.success).toBe(true);
  });

  it('still enforces title min length when title is provided', () => {
    const result = updateCourseSchema.safeParse({ title: 'ab' });
    expect(result.success).toBe(false);
  });

  it('still enforces priceCents integer when provided', () => {
    const result = updateCourseSchema.safeParse({ priceCents: 9.99 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createLessonSchema
// ---------------------------------------------------------------------------
describe('createLessonSchema', () => {
  const valid = {
    courseId: 'course-abc',
    title: 'Introduction',
    order: 0,
  };

  it('accepts a valid lesson', () => {
    expect(createLessonSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults order to 0 when omitted', () => {
    const { order: _o, ...without } = valid;
    const result = createLessonSchema.safeParse(without);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe(0);
    }
  });

  it('accepts an optional summary', () => {
    const result = createLessonSchema.safeParse({ ...valid, summary: 'Intro to the topic.' });
    expect(result.success).toBe(true);
  });

  it('rejects summary longer than 2000 chars', () => {
    const result = createLessonSchema.safeParse({ ...valid, summary: 's'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('accepts summary at exactly 2000 chars', () => {
    const result = createLessonSchema.safeParse({ ...valid, summary: 's'.repeat(2000) });
    expect(result.success).toBe(true);
  });

  it('rejects title shorter than 2 chars', () => {
    const result = createLessonSchema.safeParse({ ...valid, title: 'A' });
    expect(result.success).toBe(false);
  });

  it('accepts title at minimum length (2 chars)', () => {
    const result = createLessonSchema.safeParse({ ...valid, title: 'AB' });
    expect(result.success).toBe(true);
  });

  it('rejects title longer than 140 chars', () => {
    const result = createLessonSchema.safeParse({ ...valid, title: 't'.repeat(141) });
    expect(result.success).toBe(false);
  });

  it('rejects order below 0', () => {
    const result = createLessonSchema.safeParse({ ...valid, order: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects order that is a float', () => {
    const result = createLessonSchema.safeParse({ ...valid, order: 1.5 });
    expect(result.success).toBe(false);
  });

  it('rejects missing courseId', () => {
    const { courseId: _c, ...without } = valid;
    expect(createLessonSchema.safeParse(without).success).toBe(false);
  });

  it('rejects missing title', () => {
    const { title: _t, ...without } = valid;
    expect(createLessonSchema.safeParse(without).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createSessionSchema
// ---------------------------------------------------------------------------
describe('createSessionSchema', () => {
  const valid = {
    kind: 'classroom',
    title: 'Live Math Session',
    startsAt: '2026-06-01T09:00:00Z',
    durationMinutes: 60,
    priceCents: 0,
    capacity: 30,
  };

  it('accepts a valid classroom session', () => {
    expect(createSessionSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts kind "one_on_one"', () => {
    const result = createSessionSchema.safeParse({ ...valid, kind: 'one_on_one' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid kind', () => {
    const result = createSessionSchema.safeParse({ ...valid, kind: 'group_video' });
    expect(result.success).toBe(false);
  });

  it('defaults durationMinutes to 60 when omitted', () => {
    const { durationMinutes: _d, ...without } = valid;
    const result = createSessionSchema.safeParse(without);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMinutes).toBe(60);
    }
  });

  it('defaults priceCents to 0 when omitted', () => {
    const { priceCents: _p, ...without } = valid;
    const result = createSessionSchema.safeParse(without);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priceCents).toBe(0);
    }
  });

  it('defaults capacity to 1 when omitted', () => {
    const { capacity: _c, ...without } = valid;
    const result = createSessionSchema.safeParse(without);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capacity).toBe(1);
    }
  });

  it('accepts an optional courseId', () => {
    const result = createSessionSchema.safeParse({ ...valid, courseId: 'course-xyz' });
    expect(result.success).toBe(true);
  });

  it('accepts null courseId', () => {
    const result = createSessionSchema.safeParse({ ...valid, courseId: null });
    expect(result.success).toBe(true);
  });

  it('rejects a non-datetime startsAt string', () => {
    const result = createSessionSchema.safeParse({ ...valid, startsAt: '2026-06-01' });
    expect(result.success).toBe(false);
  });

  it('rejects durationMinutes below 15', () => {
    const result = createSessionSchema.safeParse({ ...valid, durationMinutes: 14 });
    expect(result.success).toBe(false);
  });

  it('accepts durationMinutes at minimum (15)', () => {
    const result = createSessionSchema.safeParse({ ...valid, durationMinutes: 15 });
    expect(result.success).toBe(true);
  });

  it('rejects durationMinutes above 240', () => {
    const result = createSessionSchema.safeParse({ ...valid, durationMinutes: 241 });
    expect(result.success).toBe(false);
  });

  it('accepts durationMinutes at maximum (240)', () => {
    const result = createSessionSchema.safeParse({ ...valid, durationMinutes: 240 });
    expect(result.success).toBe(true);
  });

  it('rejects durationMinutes that is a float', () => {
    const result = createSessionSchema.safeParse({ ...valid, durationMinutes: 30.5 });
    expect(result.success).toBe(false);
  });

  it('rejects capacity below 1', () => {
    const result = createSessionSchema.safeParse({ ...valid, capacity: 0 });
    expect(result.success).toBe(false);
  });

  it('accepts capacity at minimum (1)', () => {
    const result = createSessionSchema.safeParse({ ...valid, capacity: 1 });
    expect(result.success).toBe(true);
  });

  it('rejects capacity above 500', () => {
    const result = createSessionSchema.safeParse({ ...valid, capacity: 501 });
    expect(result.success).toBe(false);
  });

  it('accepts capacity at maximum (500)', () => {
    const result = createSessionSchema.safeParse({ ...valid, capacity: 500 });
    expect(result.success).toBe(true);
  });

  it('rejects priceCents below 0', () => {
    const result = createSessionSchema.safeParse({ ...valid, priceCents: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects priceCents above 1000000', () => {
    const result = createSessionSchema.safeParse({ ...valid, priceCents: 1000001 });
    expect(result.success).toBe(false);
  });

  it('rejects title shorter than 2 chars', () => {
    const result = createSessionSchema.safeParse({ ...valid, title: 'X' });
    expect(result.success).toBe(false);
  });

  it('rejects missing kind', () => {
    const { kind: _k, ...without } = valid;
    expect(createSessionSchema.safeParse(without).success).toBe(false);
  });

  it('rejects missing title', () => {
    const { title: _t, ...without } = valid;
    expect(createSessionSchema.safeParse(without).success).toBe(false);
  });

  it('rejects missing startsAt', () => {
    const { startsAt: _s, ...without } = valid;
    expect(createSessionSchema.safeParse(without).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// aiRequestSchema
// ---------------------------------------------------------------------------
describe('aiRequestSchema', () => {
  const valid = { task: 'tutor_chat' as const };

  it('accepts a minimal valid request (task only)', () => {
    expect(aiRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts task "summarize_material"', () => {
    expect(aiRequestSchema.safeParse({ task: 'summarize_material' }).success).toBe(true);
  });

  it('accepts task "generate_quiz"', () => {
    expect(aiRequestSchema.safeParse({ task: 'generate_quiz' }).success).toBe(true);
  });

  it('accepts task "explain_simply"', () => {
    expect(aiRequestSchema.safeParse({ task: 'explain_simply' }).success).toBe(true);
  });

  it('accepts task "lesson_plan"', () => {
    expect(aiRequestSchema.safeParse({ task: 'lesson_plan' }).success).toBe(true);
  });

  it('accepts task "grade_answer"', () => {
    expect(aiRequestSchema.safeParse({ task: 'grade_answer' }).success).toBe(true);
  });

  it('rejects an unknown task value', () => {
    const result = aiRequestSchema.safeParse({ task: 'do_magic' });
    expect(result.success).toBe(false);
  });

  it('rejects missing task', () => {
    expect(aiRequestSchema.safeParse({}).success).toBe(false);
  });

  it('accepts optional fields when provided', () => {
    const result = aiRequestSchema.safeParse({
      task: 'generate_quiz',
      materialId: 'mat-1',
      prompt: 'Focus on fractions',
      gradeId: 'grade-5',
      subjectId: 'math',
      context: 'Chapter 3 content',
      numQuestions: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rejects prompt longer than 8000 chars', () => {
    const result = aiRequestSchema.safeParse({ task: 'tutor_chat', prompt: 'p'.repeat(8001) });
    expect(result.success).toBe(false);
  });

  it('accepts prompt at exactly 8000 chars', () => {
    const result = aiRequestSchema.safeParse({ task: 'tutor_chat', prompt: 'p'.repeat(8000) });
    expect(result.success).toBe(true);
  });

  it('rejects context longer than 20000 chars', () => {
    const result = aiRequestSchema.safeParse({ task: 'tutor_chat', context: 'c'.repeat(20001) });
    expect(result.success).toBe(false);
  });

  it('accepts context at exactly 20000 chars', () => {
    const result = aiRequestSchema.safeParse({ task: 'tutor_chat', context: 'c'.repeat(20000) });
    expect(result.success).toBe(true);
  });

  it('rejects numQuestions below 1', () => {
    const result = aiRequestSchema.safeParse({ task: 'generate_quiz', numQuestions: 0 });
    expect(result.success).toBe(false);
  });

  it('accepts numQuestions at minimum (1)', () => {
    const result = aiRequestSchema.safeParse({ task: 'generate_quiz', numQuestions: 1 });
    expect(result.success).toBe(true);
  });

  it('rejects numQuestions above 20', () => {
    const result = aiRequestSchema.safeParse({ task: 'generate_quiz', numQuestions: 21 });
    expect(result.success).toBe(false);
  });

  it('accepts numQuestions at maximum (20)', () => {
    const result = aiRequestSchema.safeParse({ task: 'generate_quiz', numQuestions: 20 });
    expect(result.success).toBe(true);
  });

  it('rejects numQuestions that is a float', () => {
    const result = aiRequestSchema.safeParse({ task: 'generate_quiz', numQuestions: 5.5 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkoutSchema
// ---------------------------------------------------------------------------
describe('checkoutSchema', () => {
  it('accepts a subscription checkout', () => {
    const result = checkoutSchema.safeParse({
      kind: 'subscription',
      planId: 'scholar',
      interval: 'month',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a session checkout', () => {
    const result = checkoutSchema.safeParse({ kind: 'session', sessionId: 'ses-1' });
    expect(result.success).toBe(true);
  });

  it('accepts a course checkout', () => {
    const result = checkoutSchema.safeParse({ kind: 'course', courseId: 'crs-1' });
    expect(result.success).toBe(true);
  });

  it('accepts kind "subscription" with interval "year"', () => {
    const result = checkoutSchema.safeParse({
      kind: 'subscription',
      planId: 'family',
      interval: 'year',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid kind', () => {
    const result = checkoutSchema.safeParse({ kind: 'gift' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid interval', () => {
    const result = checkoutSchema.safeParse({ kind: 'subscription', interval: 'week' });
    expect(result.success).toBe(false);
  });

  it('rejects missing kind', () => {
    const result = checkoutSchema.safeParse({ planId: 'scholar' });
    expect(result.success).toBe(false);
  });

  it('accepts all optional fields omitted (just kind)', () => {
    const result = checkoutSchema.safeParse({ kind: 'course' });
    expect(result.success).toBe(true);
  });
});
