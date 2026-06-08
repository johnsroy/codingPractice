import { describe, it, expect } from 'vitest';
import { API_ROUTES } from '../contract';

// ---------------------------------------------------------------------------
// API_ROUTES — static string paths
// ---------------------------------------------------------------------------
describe('API_ROUTES static paths', () => {
  it('health is "/health"', () => {
    expect(API_ROUTES.health).toBe('/health');
  });

  describe('auth', () => {
    it('register is "/auth/register"', () => {
      expect(API_ROUTES.auth.register).toBe('/auth/register');
    });

    it('login is "/auth/login"', () => {
      expect(API_ROUTES.auth.login).toBe('/auth/login');
    });

    it('refresh is "/auth/refresh"', () => {
      expect(API_ROUTES.auth.refresh).toBe('/auth/refresh');
    });

    it('me is "/auth/me"', () => {
      expect(API_ROUTES.auth.me).toBe('/auth/me');
    });

    it('logout is "/auth/logout"', () => {
      expect(API_ROUTES.auth.logout).toBe('/auth/logout');
    });
  });

  describe('users', () => {
    it('profile is "/users/me"', () => {
      expect(API_ROUTES.users.profile).toBe('/users/me');
    });

    it('update is "/users/me"', () => {
      expect(API_ROUTES.users.update).toBe('/users/me');
    });

    it('teachers is "/users/teachers"', () => {
      expect(API_ROUTES.users.teachers).toBe('/users/teachers');
    });
  });

  describe('courses', () => {
    it('list is "/courses"', () => {
      expect(API_ROUTES.courses.list).toBe('/courses');
    });

    it('create is "/courses"', () => {
      expect(API_ROUTES.courses.create).toBe('/courses');
    });
  });

  describe('lessons', () => {
    it('create is "/lessons"', () => {
      expect(API_ROUTES.lessons.create).toBe('/lessons');
    });
  });

  describe('materials', () => {
    it('upload is "/materials"', () => {
      expect(API_ROUTES.materials.upload).toBe('/materials');
    });

    it('list is "/materials"', () => {
      expect(API_ROUTES.materials.list).toBe('/materials');
    });
  });

  describe('sessions', () => {
    it('list is "/sessions"', () => {
      expect(API_ROUTES.sessions.list).toBe('/sessions');
    });

    it('create is "/sessions"', () => {
      expect(API_ROUTES.sessions.create).toBe('/sessions');
    });
  });

  describe('ai', () => {
    it('invoke is "/ai"', () => {
      expect(API_ROUTES.ai.invoke).toBe('/ai');
    });

    it('tutorStream is "/ai/tutor/stream"', () => {
      expect(API_ROUTES.ai.tutorStream).toBe('/ai/tutor/stream');
    });
  });

  describe('payments', () => {
    it('plans is "/payments/plans"', () => {
      expect(API_ROUTES.payments.plans).toBe('/payments/plans');
    });

    it('checkout is "/payments/checkout"', () => {
      expect(API_ROUTES.payments.checkout).toBe('/payments/checkout');
    });

    it('webhook is "/payments/webhook"', () => {
      expect(API_ROUTES.payments.webhook).toBe('/payments/webhook');
    });

    it('subscription is "/payments/subscription"', () => {
      expect(API_ROUTES.payments.subscription).toBe('/payments/subscription');
    });

    it('earnings is "/payments/earnings"', () => {
      expect(API_ROUTES.payments.earnings).toBe('/payments/earnings');
    });
  });
});

// ---------------------------------------------------------------------------
// API_ROUTES — dynamic path builder functions
// ---------------------------------------------------------------------------
describe('API_ROUTES dynamic path builders', () => {
  describe('users.byId', () => {
    it('produces "/users/x" for id "x"', () => {
      expect(API_ROUTES.users.byId('x')).toBe('/users/x');
    });

    it('produces "/users/user-42" for id "user-42"', () => {
      expect(API_ROUTES.users.byId('user-42')).toBe('/users/user-42');
    });

    it('embeds the id correctly in a UUID-like string', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      expect(API_ROUTES.users.byId(id)).toBe(`/users/${id}`);
    });
  });

  describe('courses.byId', () => {
    it('produces "/courses/x" for id "x"', () => {
      expect(API_ROUTES.courses.byId('x')).toBe('/courses/x');
    });

    it('produces "/courses/course-1" for id "course-1"', () => {
      expect(API_ROUTES.courses.byId('course-1')).toBe('/courses/course-1');
    });
  });

  describe('courses.update', () => {
    it('produces "/courses/x" for id "x"', () => {
      expect(API_ROUTES.courses.update('x')).toBe('/courses/x');
    });

    it('update and byId produce the same path for the same id', () => {
      const id = 'abc123';
      expect(API_ROUTES.courses.update(id)).toBe(API_ROUTES.courses.byId(id));
    });
  });

  describe('courses.publish', () => {
    it('produces "/courses/x/publish" for id "x"', () => {
      expect(API_ROUTES.courses.publish('x')).toBe('/courses/x/publish');
    });

    it('produces "/courses/course-1/publish"', () => {
      expect(API_ROUTES.courses.publish('course-1')).toBe('/courses/course-1/publish');
    });
  });

  describe('courses.enroll', () => {
    it('produces "/courses/x/enroll" for id "x"', () => {
      expect(API_ROUTES.courses.enroll('x')).toBe('/courses/x/enroll');
    });
  });

  describe('courses.lessons', () => {
    it('produces "/courses/x/lessons" for id "x"', () => {
      expect(API_ROUTES.courses.lessons('x')).toBe('/courses/x/lessons');
    });
  });

  describe('lessons.byId', () => {
    it('produces "/lessons/x" for id "x"', () => {
      expect(API_ROUTES.lessons.byId('x')).toBe('/lessons/x');
    });

    it('produces "/lessons/lesson-99"', () => {
      expect(API_ROUTES.lessons.byId('lesson-99')).toBe('/lessons/lesson-99');
    });
  });

  describe('materials.byId', () => {
    it('produces "/materials/x" for id "x"', () => {
      expect(API_ROUTES.materials.byId('x')).toBe('/materials/x');
    });
  });

  describe('materials.ocrStatus', () => {
    it('produces "/materials/x/ocr" for id "x"', () => {
      expect(API_ROUTES.materials.ocrStatus('x')).toBe('/materials/x/ocr');
    });

    it('produces "/materials/mat-5/ocr"', () => {
      expect(API_ROUTES.materials.ocrStatus('mat-5')).toBe('/materials/mat-5/ocr');
    });
  });

  describe('sessions.byId', () => {
    it('produces "/sessions/x" for id "x"', () => {
      expect(API_ROUTES.sessions.byId('x')).toBe('/sessions/x');
    });
  });

  describe('sessions.book', () => {
    it('produces "/sessions/x/book" for id "x"', () => {
      expect(API_ROUTES.sessions.book('x')).toBe('/sessions/x/book');
    });

    it('produces "/sessions/ses-10/book"', () => {
      expect(API_ROUTES.sessions.book('ses-10')).toBe('/sessions/ses-10/book');
    });
  });

  describe('sessions.join', () => {
    it('produces "/sessions/x/join" for id "x"', () => {
      expect(API_ROUTES.sessions.join('x')).toBe('/sessions/x/join');
    });
  });

  describe('sessions.start', () => {
    it('produces "/sessions/x/start" for id "x"', () => {
      expect(API_ROUTES.sessions.start('x')).toBe('/sessions/x/start');
    });
  });

  describe('sessions.end', () => {
    it('produces "/sessions/x/end" for id "x"', () => {
      expect(API_ROUTES.sessions.end('x')).toBe('/sessions/x/end');
    });
  });
});

// ---------------------------------------------------------------------------
// Path structure invariants
// ---------------------------------------------------------------------------
describe('API_ROUTES path structure invariants', () => {
  it('all static string paths start with "/"', () => {
    const staticPaths = [
      API_ROUTES.health,
      API_ROUTES.auth.register,
      API_ROUTES.auth.login,
      API_ROUTES.auth.refresh,
      API_ROUTES.auth.me,
      API_ROUTES.auth.logout,
      API_ROUTES.users.profile,
      API_ROUTES.users.update,
      API_ROUTES.users.teachers,
      API_ROUTES.courses.list,
      API_ROUTES.courses.create,
      API_ROUTES.lessons.create,
      API_ROUTES.materials.upload,
      API_ROUTES.materials.list,
      API_ROUTES.sessions.list,
      API_ROUTES.sessions.create,
      API_ROUTES.ai.invoke,
      API_ROUTES.ai.tutorStream,
      API_ROUTES.payments.plans,
      API_ROUTES.payments.checkout,
      API_ROUTES.payments.webhook,
      API_ROUTES.payments.subscription,
      API_ROUTES.payments.earnings,
    ];
    for (const path of staticPaths) {
      expect(path.startsWith('/')).toBe(true);
    }
  });

  it('all dynamic builders embed the id in the path', () => {
    const testId = 'test-id-123';
    const dynamicResults = [
      API_ROUTES.users.byId(testId),
      API_ROUTES.courses.byId(testId),
      API_ROUTES.courses.update(testId),
      API_ROUTES.courses.publish(testId),
      API_ROUTES.courses.enroll(testId),
      API_ROUTES.courses.lessons(testId),
      API_ROUTES.lessons.byId(testId),
      API_ROUTES.materials.byId(testId),
      API_ROUTES.materials.ocrStatus(testId),
      API_ROUTES.sessions.byId(testId),
      API_ROUTES.sessions.book(testId),
      API_ROUTES.sessions.join(testId),
      API_ROUTES.sessions.start(testId),
      API_ROUTES.sessions.end(testId),
    ];
    for (const result of dynamicResults) {
      expect(result).toContain(testId);
      expect(result.startsWith('/')).toBe(true);
    }
  });

  it('no path contains double slashes', () => {
    const testId = 'abc';
    const allPaths = [
      API_ROUTES.health,
      API_ROUTES.auth.register,
      API_ROUTES.courses.list,
      API_ROUTES.users.byId(testId),
      API_ROUTES.courses.byId(testId),
      API_ROUTES.courses.publish(testId),
      API_ROUTES.sessions.join(testId),
      API_ROUTES.materials.ocrStatus(testId),
    ];
    for (const path of allPaths) {
      expect(path).not.toContain('//');
    }
  });
});
