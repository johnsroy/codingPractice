/**
 * Mentora Mobile — API client
 *
 * Wraps fetch with:
 *  - Base URL from EXPO_PUBLIC_API_URL (falls back to localhost:4000)
 *  - Authorization header injected from stored token (provided by caller)
 *  - Typed request/response using @mentora/shared types
 *  - Consistent error normalisation into ApiError shape
 */

import { API_ROUTES } from '@mentora/shared';
import type {
  ApiError,
  AuthResult,
  AiRequestInput,
  AiQuizQuestion,
  ClassSession,
  Course,
  Paginated,
  UserPublic,
  VideoJoinTicket,
  Enrollment,
  Subscription,
} from '@mentora/shared';
import Constants from 'expo-constants';

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------
// expo-constants surfaces EXPO_PUBLIC_* vars on both native and web.
const API_BASE: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:4000';

/** Full prefix including /api segment. */
export const BASE_URL = `${API_BASE}/api`;

// ---------------------------------------------------------------------------
// Typed fetch helper
// ---------------------------------------------------------------------------
export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly apiError: ApiError
  ) {
    super(apiError.message ?? apiError.error);
    this.name = 'ApiRequestError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  // Parse JSON body for both success and error paths
  let body: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    // Normalise error into ApiError shape
    const apiError: ApiError =
      typeof body === 'object' && body !== null && 'error' in body
        ? (body as ApiError)
        : { error: 'unknown_error', message: String(body) };
    throw new ApiRequestError(response.status, apiError);
  }

  return body as T;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    request<AuthResult>(API_ROUTES.auth.register, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResult>(API_ROUTES.auth.login, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    request<AuthResult>(API_ROUTES.auth.refresh, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  me: (token: string) =>
    request<UserPublic>(API_ROUTES.auth.me, { token }),

  logout: (token: string) =>
    request<void>(API_ROUTES.auth.logout, { method: 'POST', token }),
};

// ---------------------------------------------------------------------------
// Users / Teachers
// ---------------------------------------------------------------------------
export const usersApi = {
  getProfile: (token: string) =>
    request<UserPublic>(API_ROUTES.users.profile, { token }),

  updateProfile: (token: string, data: Partial<UserPublic>) =>
    request<UserPublic>(API_ROUTES.users.update, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),

  listTeachers: (
    token: string,
    params: { subject?: string; grade?: string; q?: string } = {}
  ) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][]
    ).toString();
    const path = qs
      ? `${API_ROUTES.users.teachers}?${qs}`
      : API_ROUTES.users.teachers;
    return request<Paginated<UserPublic>>(path, { token });
  },

  getTeacher: (token: string, id: string) =>
    request<UserPublic>(API_ROUTES.users.byId(id), { token }),
};

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------
export const coursesApi = {
  list: (
    token: string,
    params: { subject?: string; grade?: string; q?: string; page?: number } = {}
  ) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    const path = qs ? `${API_ROUTES.courses.list}?${qs}` : API_ROUTES.courses.list;
    return request<Paginated<Course>>(path, { token });
  },

  getById: (token: string, id: string) =>
    request<Course>(API_ROUTES.courses.byId(id), { token }),

  enroll: (token: string, id: string) =>
    request<Enrollment>(API_ROUTES.courses.enroll(id), { method: 'POST', token }),
};

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------
export const sessionsApi = {
  list: (
    token: string,
    params: { mine?: boolean; kind?: string; upcoming?: boolean } = {}
  ) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    const path = qs ? `${API_ROUTES.sessions.list}?${qs}` : API_ROUTES.sessions.list;
    return request<Paginated<ClassSession>>(path, { token });
  },

  getById: (token: string, id: string) =>
    request<ClassSession>(API_ROUTES.sessions.byId(id), { token }),

  book: (token: string, id: string) =>
    request<Enrollment>(API_ROUTES.sessions.book(id), { method: 'POST', token }),

  join: (token: string, id: string) =>
    request<VideoJoinTicket>(API_ROUTES.sessions.join(id), { method: 'POST', token }),
};

// ---------------------------------------------------------------------------
// AI Tutor
// ---------------------------------------------------------------------------
export const aiApi = {
  invoke: (token: string, data: AiRequestInput) =>
    request<{ result: string; questions?: AiQuizQuestion[] }>(API_ROUTES.ai.invoke, {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
};

// ---------------------------------------------------------------------------
// Payments / Subscription
// ---------------------------------------------------------------------------
export const paymentsApi = {
  getSubscription: (token: string) =>
    request<Subscription | null>(API_ROUTES.payments.subscription, { token }),

  getPlans: () => request<{ learner: unknown[]; teacher: unknown[] }>(API_ROUTES.payments.plans),

  checkout: (
    token: string,
    data: { kind: 'subscription' | 'session' | 'course'; planId?: string; interval?: string }
  ) =>
    request<{ checkoutUrl?: string; sessionId?: string }>(API_ROUTES.payments.checkout, {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
};
