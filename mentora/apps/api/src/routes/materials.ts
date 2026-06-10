/**
 * Material routes.
 *   POST /materials                  — upload a file (multipart); triggers async OCR + AI pipeline
 *   GET  /materials                  — list materials (?courseId=)
 *   GET  /materials/:id              — get material by id
 *   GET  /materials/:id/ocr          — get OCR status + extracted text
 *   GET  /materials/:id/study-kit    — get AI Study Kit (404 if not generated)
 *   POST /materials/:id/study-kit    — generate (or regenerate) AI Study Kit from extractedText
 *
 * Upload pipeline (non-blocking):
 *  1. Multer reads file into memory buffer.
 *  2. Storage adapter saves to disk/S3 → fileUrl.
 *  3. Material row created with ocrStatus='processing'.
 *  4. Response sent immediately (201).
 *  5. Background: OCR adapter extracts text → LLM summarises → row updated.
 *  6. If extractedText is substantial (>120 chars), auto-generate the study kit (best-effort).
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../lib/prisma';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import { getStorageAdapter } from '../adapters/storage';
import { getOcrAdapter } from '../adapters/ocr';
import { getLlmAdapter } from '../adapters/llm';
import type { MaterialKind, OcrStatus, StudyKit } from '@mentora/shared';

export const materialsRouter = Router();

// ─── Multer setup ─────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
  fileFilter(_req, file, cb) {
    // Accept all common document/media types
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Plain-text notes and simple documents — many teachers paste lesson
      // notes as .txt/.csv/.rtf, so accept them and use the text directly.
      'text/plain',
      'text/csv',
      'text/markdown',
      'application/rtf',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" is not supported.`));
    }
  },
});

/**
 * Wraps multer so a rejected file type (or size limit) becomes a friendly
 * 400 instead of an unhandled 500 — important for our non-technical teachers.
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

// ─── MIME → MaterialKind helper ───────────────────────────────────────────────

function mimeToKind(mime: string): MaterialKind {
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.includes('word') || mime.includes('document')) return 'doc';
  return 'other';
}

// ─── Background OCR + AI pipeline ────────────────────────────────────────────

async function runOcrPipeline(
  materialId: string,
  filePath: string,
  mimeType: string,
): Promise<void> {
  try {
    const ocr = getOcrAdapter();
    const llm = getLlmAdapter();

    // Plain-text formats ARE the text — read them directly, no OCR needed.
    // Everything else goes through the OCR adapter.
    let extractedText: string;
    if (
      mimeType === 'text/plain' ||
      mimeType === 'text/csv' ||
      mimeType === 'text/markdown'
    ) {
      const fs = await import('fs');
      extractedText = (await fs.promises.readFile(filePath, 'utf8')).trim();
    } else {
      extractedText = await ocr.extractText(filePath, mimeType);
    }

    let aiSummary: string | undefined;
    if (extractedText && extractedText.trim().length > 50) {
      try {
        aiSummary = await llm.summarize(extractedText, { maxSentences: 5 });
      } catch (e) {
        console.error(`[materials] AI summarize failed for ${materialId}:`, e);
      }
    }

    const finalStatus: OcrStatus =
      extractedText.trim().length > 0 ? 'done' : 'skipped';

    await prisma.material.update({
      where: { id: materialId },
      data: {
        ocrStatus: finalStatus,
        extractedText: extractedText || null,
        aiSummary: aiSummary ?? null,
      },
    });

    console.log(`[materials] OCR pipeline complete for ${materialId}: status=${finalStatus}`);

    // Auto-generate the study kit when there's substantial text (best-effort, non-blocking)
    if (finalStatus === 'done' && extractedText.trim().length > 120) {
      setImmediate(async () => {
        try {
          const studyKit = await llm.generateStudyKit({ text: extractedText });
          await prisma.material.update({
            where: { id: materialId },
            data: { studyKit: studyKit as object },
          });
          console.log(`[materials] Study kit auto-generated for ${materialId}`);
        } catch (err) {
          // Best-effort: swallow errors so the OCR pipeline result is not affected
          console.error(`[materials] Auto study-kit generation failed for ${materialId}:`, err);
        }
      });
    }
  } catch (err) {
    console.error(`[materials] OCR pipeline failed for ${materialId}:`, err);
    await prisma.material
      .update({
        where: { id: materialId },
        data: { ocrStatus: 'failed' },
      })
      .catch(() => {/* ignore */});
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /materials — upload
materialsRouter.post(
  '/',
  authenticate,
  uploadSingle,
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Please attach a file (field name: "file").');

    const { courseId, lessonId, title } = req.body as {
      courseId?: string;
      lessonId?: string;
      title?: string;
    };

    // Validate course/lesson ownership if provided
    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) throw notFound('Course');
      if (course.teacherId !== req.user!.sub) {
        throw forbidden('You can only upload materials to your own courses.');
      }
    }
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { course: true },
      });
      if (!lesson) throw notFound('Lesson');
      if (lesson.course.teacherId !== req.user!.sub) {
        throw forbidden('You can only upload materials to your own lessons.');
      }
    }

    const file = req.file;
    const storage = getStorageAdapter();
    const { url, key } = await storage.save(file.buffer, file.originalname, file.mimetype);

    const materialTitle =
      (title as string | undefined)?.trim() ||
      path.basename(file.originalname, path.extname(file.originalname));

    const material = await prisma.material.create({
      data: {
        ownerId: req.user!.sub,
        courseId: courseId || null,
        lessonId: lessonId || null,
        kind: mimeToKind(file.mimetype),
        title: materialTitle,
        fileUrl: url,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        ocrStatus: 'processing',
      },
    });

    // Kick off OCR pipeline asynchronously — do NOT await
    const localPath = storage.getPath(key);
    setImmediate(() => {
      runOcrPipeline(material.id, localPath, file.mimetype);
    });

    res.status(201).json({
      id: material.id,
      ownerId: material.ownerId,
      courseId: material.courseId,
      lessonId: material.lessonId,
      kind: material.kind,
      title: material.title,
      fileUrl: material.fileUrl,
      mimeType: material.mimeType,
      sizeBytes: material.sizeBytes,
      ocrStatus: material.ocrStatus,
      extractedText: null,
      aiSummary: null,
      createdAt: material.createdAt.toISOString(),
    });
  }),
);

// GET /materials — list (optionally filter by courseId)
materialsRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { courseId, lessonId } = req.query as { courseId?: string; lessonId?: string };

    const where: Record<string, unknown> = {};

    // Teachers see their own materials; students see materials for enrolled courses
    if (courseId) {
      where['courseId'] = courseId;
    } else if (lessonId) {
      where['lessonId'] = lessonId;
    } else {
      // Default: only own materials
      where['ownerId'] = req.user!.sub;
    }

    const materials = await prisma.material.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      materials.map((m) => ({
        id: m.id,
        ownerId: m.ownerId,
        courseId: m.courseId,
        lessonId: m.lessonId,
        kind: m.kind,
        title: m.title,
        fileUrl: m.fileUrl,
        mimeType: m.mimeType,
        sizeBytes: m.sizeBytes,
        ocrStatus: m.ocrStatus,
        extractedText: m.extractedText,
        aiSummary: m.aiSummary,
        createdAt: m.createdAt.toISOString(),
      })),
    );
  }),
);

// GET /materials/:id
materialsRouter.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const material = await prisma.material.findUnique({ where: { id: req.params['id'] } });
    if (!material) throw notFound('Material');

    res.json({
      id: material.id,
      ownerId: material.ownerId,
      courseId: material.courseId,
      lessonId: material.lessonId,
      kind: material.kind,
      title: material.title,
      fileUrl: material.fileUrl,
      mimeType: material.mimeType,
      sizeBytes: material.sizeBytes,
      ocrStatus: material.ocrStatus,
      extractedText: material.extractedText,
      aiSummary: material.aiSummary,
      createdAt: material.createdAt.toISOString(),
    });
  }),
);

// GET /materials/:id/ocr — polling endpoint for OCR status
materialsRouter.get(
  '/:id/ocr',
  authenticate,
  asyncHandler(async (req, res) => {
    const material = await prisma.material.findUnique({
      where: { id: req.params['id'] },
      select: {
        id: true,
        ocrStatus: true,
        extractedText: true,
        aiSummary: true,
      },
    });
    if (!material) throw notFound('Material');

    res.json({
      id: material.id,
      ocrStatus: material.ocrStatus,
      extractedText: material.extractedText,
      aiSummary: material.aiSummary,
    });
  }),
);

// GET /materials/:id/study-kit — return the generated study kit (404 if not generated)
materialsRouter.get(
  '/:id/study-kit',
  authenticate,
  asyncHandler(async (req, res) => {
    const material = await prisma.material.findUnique({
      where: { id: req.params['id'] },
      select: { id: true, ownerId: true, studyKit: true },
    });
    if (!material) throw notFound('Material');
    // RBAC: only the owner can read their material's study kit
    if (material.ownerId !== req.user!.sub) throw forbidden('Access denied.');

    if (!material.studyKit) {
      throw notFound('Study kit has not been generated for this material yet.');
    }

    res.json(material.studyKit as unknown as StudyKit);
  }),
);

// POST /materials/:id/study-kit — generate (or regenerate) the AI Study Kit
materialsRouter.post(
  '/:id/study-kit',
  authenticate,
  asyncHandler(async (req, res) => {
    const material = await prisma.material.findUnique({
      where: { id: req.params['id'] },
      select: { id: true, ownerId: true, extractedText: true },
    });
    if (!material) throw notFound('Material');
    // RBAC: only the owner can generate
    if (material.ownerId !== req.user!.sub) throw forbidden('Access denied.');

    if (!material.extractedText || material.extractedText.trim().length === 0) {
      throw badRequest(
        'This material has no extracted text. Please wait for OCR to complete before generating a study kit.',
      );
    }

    const llm = getLlmAdapter();
    const studyKit = await llm.generateStudyKit({ text: material.extractedText });

    await prisma.material.update({
      where: { id: material.id },
      data: { studyKit: studyKit as object },
    });

    res.json(studyKit);
  }),
);
