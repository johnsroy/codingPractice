import type { Role } from './roles';

export type ID = string;
export type ISODateString = string;

export interface UserPublic {
  id: ID;
  role: Role;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  /** Teacher-only fields */
  headline?: string | null;
  subjects?: string[];
  grades?: string[];
  yearsExperience?: number | null;
  hourlyRateCents?: number | null;
  verified?: boolean;
  rating?: number | null;
  proTier?: boolean;
  createdAt: ISODateString;
}

export interface AuthResult {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: ID;
  teacherId: ID;
  teacher?: UserPublic;
  title: string;
  description: string;
  subjectId: string;
  gradeId: string;
  coverImageUrl?: string | null;
  status: CourseStatus;
  /** Price per group seat in cents; 0 = free/included with subscription. */
  priceCents: number;
  lessonCount?: number;
  enrolledCount?: number;
  rating?: number | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Lesson {
  id: ID;
  courseId: ID;
  title: string;
  order: number;
  summary?: string | null;
  materialIds: ID[];
  createdAt: ISODateString;
}

export type MaterialKind = 'pdf' | 'image' | 'doc' | 'video' | 'audio' | 'other';
export type OcrStatus = 'pending' | 'processing' | 'done' | 'failed' | 'skipped';

export interface Material {
  id: ID;
  ownerId: ID;
  courseId?: ID | null;
  lessonId?: ID | null;
  kind: MaterialKind;
  title: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  /** OCR-extracted text (when applicable). */
  ocrStatus: OcrStatus;
  extractedText?: string | null;
  /** AI-generated summary of the material. */
  aiSummary?: string | null;
  /** AI "Study Kit" (summary, key terms, flashcards, quiz) when generated. */
  studyKit?: StudyKit | null;
  createdAt: ISODateString;
}

export type SessionKind = 'classroom' | 'one_on_one';
export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface ClassSession {
  id: ID;
  kind: SessionKind;
  teacherId: ID;
  courseId?: ID | null;
  title: string;
  startsAt: ISODateString;
  durationMinutes: number;
  status: SessionStatus;
  /** Per-seat price in cents for 1:1 or paid classrooms. */
  priceCents: number;
  capacity: number;
  /** Realtime room identifier handed to the video adapter. */
  roomName: string;
  createdAt: ISODateString;
}

export interface Enrollment {
  id: ID;
  studentId: ID;
  courseId?: ID | null;
  sessionId?: ID | null;
  status: 'active' | 'completed' | 'refunded' | 'cancelled';
  createdAt: ISODateString;
}

/** Token + connection info returned by the realtime video adapter. */
export interface VideoJoinTicket {
  provider: 'mock' | 'livekit';
  url: string;
  token: string;
  roomName: string;
  identity: string;
  /** Whether the joiner is a publisher (teacher) or subscriber-first (student). */
  canPublish: boolean;
  expiresAt: ISODateString;
}

/** AI assistant capabilities exposed by the LLM adapter. */
export type AiTask =
  | 'summarize_material'
  | 'generate_quiz'
  | 'explain_simply'
  | 'lesson_plan'
  | 'tutor_chat'
  | 'grade_answer'
  /** Agentic: research a new topic on the live web, then synthesize a briefing. */
  | 'research_topic';

export interface AiQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

/** Geolocation result used to suggest a currency/region. */
export interface GeoInfo {
  country: string | null; // ISO-3166 alpha-2
  currency: string; // suggested display currency
  tier: 'T1' | 'T2' | 'T3' | 'T4' | null;
}

/** A single flashcard derived from a material. */
export interface Flashcard {
  front: string;
  back: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

/**
 * The "AI Study Kit" generated from an uploaded material's OCR text:
 * a summary, key terms, flashcards and a practice quiz.
 */
export interface StudyKit {
  summary: string;
  keyTerms: KeyTerm[];
  flashcards: Flashcard[];
  quiz: AiQuizQuestion[];
  /** Reading level the kit was tuned for, e.g. "grade-5". */
  gradeId?: string | null;
  generatedAt?: ISODateString;
}

/** A single web source returned by the research/search adapter. */
export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
  /** Optional published date / site name for display. */
  publishedAt?: string | null;
  siteName?: string | null;
}

/** A section of a generated lesson outline. */
export interface LessonOutlineSection {
  title: string;
  points: string[];
}

/**
 * The structured result of an agentic research run: the AI searches the live
 * web for a topic and synthesizes a teacher-ready briefing with citations.
 */
export interface ResearchBriefing {
  topic: string;
  gradeId?: string | null;
  subjectId?: string | null;
  /** A plain-language overview the teacher can read in under a minute. */
  summary: string;
  /** The most important facts/talking points. */
  keyPoints: string[];
  /** A suggested, ready-to-teach lesson structure. */
  suggestedLessonOutline: LessonOutlineSection[];
  /** Cited web sources the briefing was built from. */
  sources: ResearchSource[];
  /** Which provider produced this (e.g. "anthropic+tavily" or "stub"). */
  provider: string;
  /** True when synthesized from live web results (vs the offline stub). */
  liveWeb: boolean;
}

export interface Payment {
  id: ID;
  payerId: ID;
  amountCents: number;
  currency: string;
  kind: 'subscription' | 'session' | 'course';
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  provider: 'mock' | 'stripe';
  createdAt: ISODateString;
}

export interface Subscription {
  id: ID;
  userId: ID;
  planId: string;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  currentPeriodEnd: ISODateString;
  provider: 'mock' | 'stripe';
}

/**
 * A teacher's payout (Stripe Connect) account status. Teachers must complete
 * onboarding before they can receive payouts to their bank account.
 */
export interface ConnectAccountStatus {
  /** A connected account exists for this teacher. */
  connected: boolean;
  /** The teacher finished the onboarding form. */
  detailsSubmitted: boolean;
  /** Stripe will pay out to their bank. */
  payoutsEnabled: boolean;
  /** The account can accept charges. */
  chargesEnabled: boolean;
  /** True once payouts are fully enabled. */
  onboardingComplete: boolean;
  provider: 'mock' | 'stripe';
}

/** Returned by the onboarding endpoint: where to send the teacher to finish setup. */
export interface ConnectOnboardingLink {
  url: string;
  provider: 'mock' | 'stripe';
}

// ─── Teacher verification ──────────────────────────────────────────────────
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

/** Kinds of supporting documents a teacher uploads to prove they're legit + retired. */
export type VerificationDocKind =
  | 'government_id' // passport / driver's licence / Aadhaar
  | 'retirement_proof' // pension card, retirement/superannuation letter, former-employer ID
  | 'teaching_credential' // teaching licence, degree, B.Ed, professional certificate
  | 'professional_membership' // membership of a professional body / council
  | 'address_proof'
  | 'other';

export const VERIFICATION_DOC_KINDS: { id: VerificationDocKind; label: string; hint: string }[] = [
  { id: 'government_id', label: 'Government photo ID', hint: 'Passport, driver’s licence, or Aadhaar' },
  { id: 'retirement_proof', label: 'Proof of retirement', hint: 'Pension card, retirement letter, or former-employer ID' },
  { id: 'teaching_credential', label: 'Teaching credential', hint: 'Teaching licence, degree, B.Ed or certificate' },
  { id: 'professional_membership', label: 'Professional membership', hint: 'Council / professional-body membership (optional)' },
  { id: 'address_proof', label: 'Address proof', hint: 'Utility bill or bank statement (optional)' },
  { id: 'other', label: 'Other supporting document', hint: 'Anything else that supports your application' },
];

export interface VerificationDocument {
  id: ID;
  userId: ID;
  kind: VerificationDocKind;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: ISODateString;
}

/** A teacher's full verification picture (their own view + admin review view). */
export interface VerificationSummary {
  userId: ID;
  status: VerificationStatus;
  note?: string | null;
  submittedAt?: ISODateString | null;
  reviewedAt?: ISODateString | null;
  documents: VerificationDocument[];
  /** Which identity provider checked them, if any. */
  provider: 'manual' | 'stripe_identity' | 'digilocker';
  /** Teacher summary fields, present in the admin review list. */
  teacherName?: string;
  teacherEmail?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
