/**
 * Mentora API — Express application factory.
 *
 * Exports `createApp()` so the configured Express instance can be imported
 * by integration tests (via supertest) without starting an HTTP server.
 *
 * Bootstrap order:
 *  1. Helmet, CORS, Morgan, body parsers
 *  2. Static file serving for local storage adapter
 *  3. All API routers mounted under /api
 *  4. Health check + 404 handler + centralised error handler
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';

import { env } from './config/env';
import type { ApiError } from '@mentora/shared';
import { HttpError } from './lib/errors';

// ─── Routers ──────────────────────────────────────────────────────────────────
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { coursesRouter } from './routes/courses';
import { lessonsRouter } from './routes/lessons';
import { materialsRouter } from './routes/materials';
import { sessionsRouter } from './routes/sessions';
import { aiRouter } from './routes/ai';
import { paymentsRouter } from './routes/payments';

// ─── App factory ──────────────────────────────────────────────────────────────

export function createApp(): express.Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — allow the web app origin
  app.use(
    cors({
      origin: [env.WEB_URL, 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Request logging (Apache combined in production, dev format in development)
  // Suppress in test to keep output clean
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Cookies
  app.use(cookieParser());

  // Raw body for Stripe webhook signature verification — MUST come before json()
  app.use(
    '/api/payments/webhook',
    express.raw({ type: 'application/json' }),
  );

  // JSON body parser (skip for webhook route which needs raw)
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // ─── Static file serving for local storage adapter ───────────────────────────

  // Serve uploaded files at /api/files/:key when using STORAGE_DRIVER=local
  const localStorageDir = env.STORAGE_LOCAL_DIR;
  if (!fs.existsSync(localStorageDir)) {
    fs.mkdirSync(localStorageDir, { recursive: true });
  }
  app.use('/api/files', express.static(localStorageDir, {
    // Security: prevent directory listing
    index: false,
    dotfiles: 'deny',
  }));

  // ─── Health check ─────────────────────────────────────────────────────────────

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'mentora-api',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // ─── API Routers ──────────────────────────────────────────────────────────────

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/courses', coursesRouter);
  app.use('/api/lessons', lessonsRouter);
  app.use('/api/materials', materialsRouter);
  app.use('/api/sessions', sessionsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/payments', paymentsRouter);

  // ─── 404 handler ──────────────────────────────────────────────────────────────

  app.use((_req, res) => {
    const body: ApiError = {
      error: 'NOT_FOUND',
      message: "The page or resource you're looking for doesn't exist.",
    };
    res.status(404).json(body);
  });

  // ─── Centralised error handler ────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
    if (err instanceof HttpError) {
      const body: ApiError = {
        error: err.name,
        message: err.message,
        details: err.details,
      };
      res.status(err.statusCode).json(body);
      return;
    }

    // Multer errors (file too large, wrong type, etc.)
    if (err && typeof err === 'object' && 'code' in err) {
      const multerErr = err as { code: string; message: string };
      if (multerErr.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          error: 'FILE_TOO_LARGE',
          message: 'The file you uploaded is too large. Please keep files under 50 MB.',
        } satisfies ApiError);
        return;
      }
    }

    // Zod errors that weren't caught by validate() middleware
    if (err && typeof err === 'object' && 'issues' in err) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'The request data is invalid.',
        details: err,
      } satisfies ApiError);
      return;
    }

    // Unexpected errors
    console.error('[error]', err);
    const isProduction = env.NODE_ENV === 'production';
    const body: ApiError = {
      error: 'INTERNAL_SERVER_ERROR',
      message: isProduction
        ? 'Something went wrong on our end. Our team has been notified. Please try again shortly.'
        : (err instanceof Error ? err.message : String(err)),
    };
    res.status(500).json(body);
  });

  return app;
}

/** Pre-built singleton for production use (src/index.ts). */
export const app = createApp();
