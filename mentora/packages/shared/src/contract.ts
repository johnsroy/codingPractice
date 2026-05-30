/**
 * The API contract — the canonical list of REST endpoints.
 * Both the API (route registration) and the web/mobile clients import
 * these so the two sides can never drift apart.
 *
 * All routes are prefixed with /api by the server.
 */
export const API_ROUTES = {
  health: '/health',

  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    me: '/auth/me',
    logout: '/auth/logout',
  },

  users: {
    profile: '/users/me',
    update: '/users/me',
    teachers: '/users/teachers', // public teacher directory (supports ?subject=&grade=&q=)
    byId: (id: string) => `/users/${id}`,
  },

  courses: {
    list: '/courses', // ?subject=&grade=&q=&page=
    create: '/courses',
    byId: (id: string) => `/courses/${id}`,
    update: (id: string) => `/courses/${id}`,
    publish: (id: string) => `/courses/${id}/publish`,
    enroll: (id: string) => `/courses/${id}/enroll`,
    lessons: (id: string) => `/courses/${id}/lessons`,
  },

  lessons: {
    create: '/lessons',
    byId: (id: string) => `/lessons/${id}`,
  },

  materials: {
    upload: '/materials', // multipart/form-data; triggers OCR pipeline
    byId: (id: string) => `/materials/${id}`,
    ocrStatus: (id: string) => `/materials/${id}/ocr`,
    list: '/materials', // ?courseId=
  },

  sessions: {
    list: '/sessions', // ?mine=&kind=&upcoming=
    create: '/sessions',
    byId: (id: string) => `/sessions/${id}`,
    book: (id: string) => `/sessions/${id}/book`,
    join: (id: string) => `/sessions/${id}/join`, // returns VideoJoinTicket
    start: (id: string) => `/sessions/${id}/start`,
    end: (id: string) => `/sessions/${id}/end`,
  },

  ai: {
    invoke: '/ai', // body: AiRequestInput
    tutorStream: '/ai/tutor/stream', // SSE chat for the AI tutor
  },

  payments: {
    plans: '/payments/plans',
    checkout: '/payments/checkout',
    webhook: '/payments/webhook',
    subscription: '/payments/subscription',
    earnings: '/payments/earnings', // teacher payout summary
  },
} as const;
