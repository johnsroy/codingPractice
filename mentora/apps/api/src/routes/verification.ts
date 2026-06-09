/**
 * Verification routes.
 *
 *  Teacher self-service:
 *   GET  /verification/status     — own VerificationSummary
 *   POST /verification/documents  — upload a supporting document (multipart)
 *   POST /verification/submit     — submit for admin review (requires ≥1 doc)
 *   POST /verification/start      — kick off automated identity check (returns provider URL)
 *
 *  Admin review queue:
 *   GET  /admin/verifications          — list all users with status=pending
 *   POST /admin/verifications/:userId  — approve or reject a submission
 *
 * Document upload reuses the same multer + friendly-400 pattern as materials.ts.
 */

import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { getStorageAdapter } from '../adapters/storage';
import { getVerificationAdapter } from '../adapters/verification';
import {
  submitVerificationSchema,
  reviewVerificationSchema,
  VERIFICATION_DOC_KINDS,
} from '@mentora/shared';
import type { VerificationSummary, VerificationDocument } from '@mentora/shared';

export const verificationRouter = Router();

// ─── Multer setup ──────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
  fileFilter(_req, file, cb) {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/tiff',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" is not supported. Please upload a PDF, image, or Word document.`));
    }
  },
});

/**
 * Wraps multer so a rejected file type/size becomes a friendly 400
 * rather than an unhandled 500 — mirrors the pattern in materials.ts.
 */
const uploadSingle: import('express').RequestHandler = (req, res, next) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'File upload failed.';
      return next(badRequest(message));
    }
    next();
  });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map a Prisma VerificationDocument to the shared VerificationDocument type. */
function mapDoc(d: {
  id: string;
  userId: string;
  kind: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  createdAt: Date;
}): VerificationDocument {
  return {
    id: d.id,
    userId: d.userId,
    kind: d.kind as VerificationDocument['kind'],
    fileUrl: d.fileUrl,
    fileName: d.fileName,
    mimeType: d.mimeType,
    sizeBytes: d.sizeBytes,
    status: d.status as VerificationDocument['status'],
    createdAt: d.createdAt.toISOString(),
  };
}

/** Build a VerificationSummary from a user row + their documents. */
function buildSummary(
  user: {
    id: string;
    name: string;
    email: string;
    verificationStatus: string;
    verificationNote: string | null;
    verificationProvider: string;
    verificationSubmittedAt: Date | null;
    verificationReviewedAt: Date | null;
    verificationDocuments: Parameters<typeof mapDoc>[0][];
  },
  includeTeacherFields = false,
): VerificationSummary {
  return {
    userId: user.id,
    status: user.verificationStatus as VerificationSummary['status'],
    note: user.verificationNote,
    submittedAt: user.verificationSubmittedAt?.toISOString() ?? null,
    reviewedAt: user.verificationReviewedAt?.toISOString() ?? null,
    documents: user.verificationDocuments.map(mapDoc),
    provider: user.verificationProvider as VerificationSummary['provider'],
    ...(includeTeacherFields ? { teacherName: user.name, teacherEmail: user.email } : {}),
  };
}

// ─── Teacher self-service routes ──────────────────────────────────────────────

// GET /verification/status — own summary
verificationRouter.get(
  '/verification/status',
  authenticate,
  requireRole('TEACHER'),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      include: { verificationDocuments: { orderBy: { createdAt: 'asc' } } },
    });
    if (!user) throw notFound('User');

    res.json(buildSummary(user));
  }),
);

// POST /verification/documents — upload a supporting doc
verificationRouter.post(
  '/verification/documents',
  authenticate,
  requireRole('TEACHER'),
  uploadSingle,
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Please attach a file (field name: "file").');

    const { kind } = req.body as { kind?: string };

    // Validate the document kind
    const validKinds = VERIFICATION_DOC_KINDS.map((k) => k.id);
    if (!kind || !validKinds.includes(kind as typeof validKinds[number])) {
      throw badRequest(
        `"kind" must be one of: ${validKinds.join(', ')}.`,
      );
    }

    const file = req.file;
    const storage = getStorageAdapter();
    const { url } = await storage.save(file.buffer, file.originalname, file.mimetype);

    const doc = await prisma.verificationDocument.create({
      data: {
        userId: req.user!.sub,
        kind: kind as import('@prisma/client').VerificationDocKind,
        fileUrl: url,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        status: 'pending',
      },
    });

    res.status(201).json(mapDoc(doc));
  }),
);

// POST /verification/submit — submit for admin review
verificationRouter.post(
  '/verification/submit',
  authenticate,
  requireRole('TEACHER'),
  validate(submitVerificationSchema),
  asyncHandler(async (req, res) => {
    const { note } = req.body as { note?: string };

    // Require at least one uploaded document
    const docCount = await prisma.verificationDocument.count({
      where: { userId: req.user!.sub },
    });
    if (docCount === 0) {
      throw badRequest(
        'Please upload at least one supporting document before submitting for verification.',
      );
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.sub },
      data: {
        verificationStatus: 'pending',
        verificationSubmittedAt: new Date(),
        verificationNote: note ?? null,
      },
      include: { verificationDocuments: { orderBy: { createdAt: 'asc' } } },
    });

    res.json(buildSummary(updated));
  }),
);

// POST /verification/start — initiate automated identity check
verificationRouter.post(
  '/verification/start',
  authenticate,
  requireRole('TEACHER'),
  asyncHandler(async (req, res) => {
    // Fetch current user public profile for the adapter
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
    });
    if (!user) throw notFound('User');

    const adapter = getVerificationAdapter();
    const { url, provider } = await adapter.startIdentityCheck({
      id: user.id,
      role: user.role as import('@mentora/shared').UserPublic['role'],
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    });

    // Persist the chosen provider on the user record
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationProvider: provider },
    });

    res.json({ url, provider });
  }),
);

// ─── Admin routes ─────────────────────────────────────────────────────────────

// GET /admin/verifications — list pending submissions
verificationRouter.get(
  '/admin/verifications',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      where: { verificationStatus: 'pending' },
      include: { verificationDocuments: { orderBy: { createdAt: 'asc' } } },
      orderBy: { verificationSubmittedAt: 'asc' },
    });

    const summaries: VerificationSummary[] = users.map((u) => buildSummary(u, true));
    res.json(summaries);
  }),
);

// POST /admin/verifications/:userId — approve or reject
verificationRouter.post(
  '/admin/verifications/:userId',
  authenticate,
  requireRole('ADMIN'),
  validate(reviewVerificationSchema),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { decision, note } = req.body as {
      decision: 'approve' | 'reject';
      note?: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw notFound('User');
    if (user.role !== 'TEACHER') {
      throw forbidden('Verification reviews only apply to TEACHER accounts.');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: decision === 'approve' ? 'verified' : 'rejected',
        verified: decision === 'approve',
        verificationReviewedAt: new Date(),
        verificationNote: note ?? null,
      },
      include: { verificationDocuments: { orderBy: { createdAt: 'asc' } } },
    });

    res.json(buildSummary(updated, true));
  }),
);
