/**
 * Mentora API client
 *
 * Typed around API_ROUTES from @mentora/shared. All requests are sent to
 * NEXT_PUBLIC_API_URL/api. The auth token is read from localStorage and
 * injected automatically.
 */

import {
  API_ROUTES,
  type AuthResult,
  type UserPublic,
  type Course,
  type Lesson,
  type Material,
  type ClassSession,
  type VideoJoinTicket,
  type AiQuizQuestion,
  type ResearchBriefing,
  type Paginated,
  type Subscription,
  type ApiError as ApiErrorType,
  type RegisterInput,
  type LoginInput,
  type UpdateProfileInput,
  type CreateCourseInput,
  type CreateLessonInput,
  type CreateSessionInput,
  type AiRequestInput,
  type CheckoutInput,
  type ConnectAccountStatus,
  type ConnectOnboardingLink,
  type VerificationSummary,
  type VerificationDocument,
  type VerificationDocKind,
  type GeoInfo,
  type StudyKit,
  type Flashcard,
  type KeyTerm,
} from '@mentora/shared';

// Re-export for convenience in the rest of the app
export type {
  AuthResult,
  UserPublic,
  Course,
  Lesson,
  Material,
  ClassSession,
  VideoJoinTicket,
  AiQuizQuestion,
  ResearchBriefing,
  Paginated,
  Subscription,
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  CreateCourseInput,
  CreateLessonInput,
  CreateSessionInput,
  AiRequestInput,
  CheckoutInput,
  ConnectAccountStatus,
  ConnectOnboardingLink,
  VerificationSummary,
  VerificationDocument,
  VerificationDocKind,
  GeoInfo,
  StudyKit,
  Flashcard,
  KeyTerm,
};

// ------------------------------------------------------------------ //
// Config
// ------------------------------------------------------------------ //

const BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000') + '/api';

// ------------------------------------------------------------------ //
// Error type
// ------------------------------------------------------------------ //

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ------------------------------------------------------------------ //
// Token management (localStorage)
// ------------------------------------------------------------------ //

const TOKEN_KEY = 'mentora_access_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ------------------------------------------------------------------ //
// Core fetch helper
// ------------------------------------------------------------------ //

type RequestOptions = {
  method?: string;
  body?: unknown;
  /** Override auth token (used during login/register before context update) */
  token?: string | null;
  /** Allow multipart — skip JSON content-type */
  multipart?: boolean;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, multipart = false } = opts;
  // Use explicitly-passed token or fall back to stored one
  const token = opts.token !== undefined ? opts.token : getStoredToken();

  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !multipart) headers['Content-Type'] = 'application/json';

  let fetchBody: BodyInit | undefined;
  if (body) {
    fetchBody = multipart
      ? (body as FormData)
      : JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: fetchBody,
      credentials: 'include',
    });
  } catch (networkErr) {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Please check your connection.');
  }

  if (!res.ok) {
    let errBody: ApiErrorType | null = null;
    try {
      errBody = await res.json();
    } catch {
      // non-JSON error body
    }
    throw new ApiError(
      res.status,
      errBody?.error ?? 'API_ERROR',
      errBody?.message ?? `Request failed with status ${res.status}`,
      errBody?.details,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ------------------------------------------------------------------ //
// Auth
// ------------------------------------------------------------------ //

export const authApi = {
  register: (data: RegisterInput) =>
    request<AuthResult>(API_ROUTES.auth.register, { method: 'POST', body: data }),

  login: (data: LoginInput) =>
    request<AuthResult>(API_ROUTES.auth.login, { method: 'POST', body: data }),

  refresh: (refreshToken: string) =>
    request<AuthResult>(API_ROUTES.auth.refresh, { method: 'POST', body: { refreshToken } }),

  me: () => request<UserPublic>(API_ROUTES.auth.me),

  logout: () => request<void>(API_ROUTES.auth.logout, { method: 'POST' }),
};

// ------------------------------------------------------------------ //
// Users
// ------------------------------------------------------------------ //

export const usersApi = {
  profile: () => request<UserPublic>(API_ROUTES.users.profile),

  update: (data: UpdateProfileInput) =>
    request<UserPublic>(API_ROUTES.users.update, { method: 'PATCH', body: data }),

  teachers: (params?: { subject?: string; grade?: string; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.subject) qs.set('subject', params.subject);
    if (params?.grade) qs.set('grade', params.grade);
    if (params?.q) qs.set('q', params.q);
    const search = qs.toString();
    return request<UserPublic[]>(`${API_ROUTES.users.teachers}${search ? '?' + search : ''}`);
  },

  byId: (id: string) => request<UserPublic>(API_ROUTES.users.byId(id)),
};

// ------------------------------------------------------------------ //
// Courses
// ------------------------------------------------------------------ //

export const coursesApi = {
  list: (params?: { subject?: string; grade?: string; q?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.subject) qs.set('subject', params.subject);
    if (params?.grade) qs.set('grade', params.grade);
    if (params?.q) qs.set('q', params.q);
    if (params?.page) qs.set('page', String(params.page));
    const search = qs.toString();
    return request<Paginated<Course>>(`${API_ROUTES.courses.list}${search ? '?' + search : ''}`);
  },

  create: (data: CreateCourseInput) =>
    request<Course>(API_ROUTES.courses.create, { method: 'POST', body: data }),

  byId: (id: string) => request<Course>(API_ROUTES.courses.byId(id)),

  update: (id: string, data: Partial<CreateCourseInput>) =>
    request<Course>(API_ROUTES.courses.update(id), { method: 'PATCH', body: data }),

  publish: (id: string) =>
    request<Course>(API_ROUTES.courses.publish(id), { method: 'POST' }),

  enroll: (id: string) =>
    request<{ enrolled: boolean }>(API_ROUTES.courses.enroll(id), { method: 'POST' }),

  lessons: (id: string) => request<Lesson[]>(API_ROUTES.courses.lessons(id)),
};

// ------------------------------------------------------------------ //
// Lessons
// ------------------------------------------------------------------ //

export const lessonsApi = {
  create: (data: CreateLessonInput) =>
    request<Lesson>(API_ROUTES.lessons.create, { method: 'POST', body: data }),

  byId: (id: string) => request<Lesson>(API_ROUTES.lessons.byId(id)),
};

// ------------------------------------------------------------------ //
// Materials
// ------------------------------------------------------------------ //

export const materialsApi = {
  upload: (formData: FormData) =>
    request<Material>(API_ROUTES.materials.upload, {
      method: 'POST',
      body: formData,
      multipart: true,
    }),

  byId: (id: string) => request<Material>(API_ROUTES.materials.byId(id)),

  ocrStatus: (id: string) => request<Pick<Material, 'id' | 'ocrStatus' | 'extractedText' | 'aiSummary'>>(
    API_ROUTES.materials.ocrStatus(id),
  ),

  list: (courseId?: string) => {
    const qs = courseId ? `?courseId=${courseId}` : '';
    return request<Material[]>(`${API_ROUTES.materials.list}${qs}`);
  },

  /** Fetch the AI Study Kit for a material (404 if not generated yet). */
  getStudyKit: (id: string) =>
    request<StudyKit>(API_ROUTES.materials.studyKit(id)),

  /** Generate (or regenerate) the AI Study Kit from the material's text. */
  generateStudyKit: (id: string) =>
    request<StudyKit>(API_ROUTES.materials.studyKit(id), { method: 'POST' }),
};

// ------------------------------------------------------------------ //
// Geolocation (suggested currency by region)
// ------------------------------------------------------------------ //

export const geoApi = {
  detect: () => request<GeoInfo>(API_ROUTES.geo),
};

// ------------------------------------------------------------------ //
// Sessions
// ------------------------------------------------------------------ //

export const sessionsApi = {
  list: (params?: { mine?: boolean; kind?: string; upcoming?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.mine) qs.set('mine', 'true');
    if (params?.kind) qs.set('kind', params.kind);
    if (params?.upcoming) qs.set('upcoming', 'true');
    const search = qs.toString();
    return request<ClassSession[]>(`${API_ROUTES.sessions.list}${search ? '?' + search : ''}`);
  },

  create: (data: CreateSessionInput) =>
    request<ClassSession>(API_ROUTES.sessions.create, { method: 'POST', body: data }),

  byId: (id: string) => request<ClassSession>(API_ROUTES.sessions.byId(id)),

  book: (id: string) =>
    request<{ booked: boolean }>(API_ROUTES.sessions.book(id), { method: 'POST' }),

  join: (id: string) =>
    request<VideoJoinTicket>(API_ROUTES.sessions.join(id), { method: 'POST' }),

  start: (id: string) =>
    request<ClassSession>(API_ROUTES.sessions.start(id), { method: 'POST' }),

  end: (id: string) =>
    request<ClassSession>(API_ROUTES.sessions.end(id), { method: 'POST' }),
};

// ------------------------------------------------------------------ //
// AI
// ------------------------------------------------------------------ //

export const aiApi = {
  invoke: (data: AiRequestInput) =>
    // `result` is a string for most tasks, but an AiQuizQuestion[] for generate_quiz.
    request<{ result: string | AiQuizQuestion[]; questions?: AiQuizQuestion[] }>(API_ROUTES.ai.invoke, {
      method: 'POST',
      body: data,
    }),

  /** Returns a ReadableStream for SSE tutor chat. */
  tutorStream: (prompt: string, context?: string): EventSource => {
    const token = getStoredToken();
    const qs = new URLSearchParams({ prompt });
    if (context) qs.set('context', context);
    if (token) qs.set('token', token); // pass token as query for SSE
    return new EventSource(`${BASE}${API_ROUTES.ai.tutorStream}?${qs}`);
  },

  /** Agentic web research: searches the live web and returns a teacher-ready briefing. */
  research: (input: { topic: string; gradeId?: string; subjectId?: string }) =>
    request<ResearchBriefing>(API_ROUTES.ai.research, { method: 'POST', body: input }),
};

// ------------------------------------------------------------------ //
// Payments
// ------------------------------------------------------------------ //

export const paymentsApi = {
  plans: () => request<{ plans: import('@mentora/shared').Plan[] }>(API_ROUTES.payments.plans),

  checkout: (data: CheckoutInput) =>
    request<{ url: string }>(API_ROUTES.payments.checkout, { method: 'POST', body: data }),

  subscription: () => request<Subscription | null>(API_ROUTES.payments.subscription),

  earnings: () =>
    request<{
      totalPayoutCents: number;
      totalGrossCents: number;
      totalPlatformFeeCents: number;
      paymentCount: number;
      commissionPct: number;
      currency: string;
    }>(API_ROUTES.payments.earnings),

  connectStatus: () =>
    request<ConnectAccountStatus>(API_ROUTES.payments.connectStatus),

  connectOnboard: () =>
    request<ConnectOnboardingLink>(API_ROUTES.payments.connectOnboard, { method: 'POST' }),
};

// ------------------------------------------------------------------ //
// Teacher verification
// ------------------------------------------------------------------ //

export const verificationApi = {
  /** The signed-in teacher's verification summary (status + documents). */
  status: () => request<VerificationSummary>(API_ROUTES.verification.status),

  /** Upload one supporting document (multipart: fields `file` + `kind`). */
  uploadDocument: (kind: VerificationDocKind, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('kind', kind);
    return request<VerificationDocument>(API_ROUTES.verification.documents, {
      method: 'POST',
      body: fd,
      multipart: true,
    });
  },

  /** Submit the uploaded documents for review. */
  submit: (note?: string) =>
    request<VerificationSummary>(API_ROUTES.verification.submit, {
      method: 'POST',
      body: { note },
    }),

  /** Begin an automated identity check (returns a provider link when configured). */
  start: () =>
    request<{ url: string | null; provider: string }>(API_ROUTES.verification.start, {
      method: 'POST',
    }),

  /** Admin: list pending verification submissions. */
  adminList: () =>
    request<VerificationSummary[]>(API_ROUTES.verification.adminList),

  /** Admin: approve or reject a teacher's submission. */
  adminReview: (userId: string, decision: 'approve' | 'reject', note?: string) =>
    request<VerificationSummary>(API_ROUTES.verification.adminReview(userId), {
      method: 'POST',
      body: { decision, note },
    }),
};
