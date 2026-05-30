/**
 * Typed environment configuration for Mentora API.
 * All vars sourced from .env (loaded by dotenv in src/index.ts).
 * Every field has a documented default so the server boots with zero config.
 */

import path from 'path';

function get(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value !== undefined && value !== '') return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${key}`);
}

function getInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (isNaN(n)) throw new Error(`Env var ${key} must be an integer, got: ${raw}`);
  return n;
}

function getBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (!raw) return fallback;
  return raw.toLowerCase() === 'true' || raw === '1';
}

export const env = {
  // Core
  NODE_ENV: get('NODE_ENV', 'development'),
  API_PORT: getInt('API_PORT', 4000),
  WEB_URL: get('WEB_URL', 'http://localhost:3000'),
  API_URL: get('API_URL', 'http://localhost:4000'),

  // Database
  DATABASE_URL: get('DATABASE_URL', 'postgresql://mentora:mentora@localhost:5432/mentora?schema=public'),

  // Auth
  JWT_SECRET: get('JWT_SECRET', 'dev-only-change-me-in-production'),
  JWT_EXPIRES_IN: get('JWT_EXPIRES_IN', '7d'),
  REFRESH_TOKEN_EXPIRES_IN: get('REFRESH_TOKEN_EXPIRES_IN', '30d'),

  // Storage
  STORAGE_DRIVER: get('STORAGE_DRIVER', 'local') as 'local' | 's3',
  STORAGE_LOCAL_DIR: path.resolve(get('STORAGE_LOCAL_DIR', './storage')),
  AWS_REGION: get('AWS_REGION', 'us-east-1'),
  AWS_S3_BUCKET: get('AWS_S3_BUCKET', ''),
  AWS_ACCESS_KEY_ID: get('AWS_ACCESS_KEY_ID', ''),
  AWS_SECRET_ACCESS_KEY: get('AWS_SECRET_ACCESS_KEY', ''),

  // OCR
  OCR_DRIVER: get('OCR_DRIVER', 'tesseract') as 'tesseract' | 'textract',

  // LLM
  LLM_DRIVER: get('LLM_DRIVER', 'stub') as 'stub' | 'anthropic' | 'openai',
  ANTHROPIC_API_KEY: get('ANTHROPIC_API_KEY', ''),
  ANTHROPIC_MODEL: get('ANTHROPIC_MODEL', 'claude-sonnet-4-6'),
  OPENAI_API_KEY: get('OPENAI_API_KEY', ''),
  OPENAI_MODEL: get('OPENAI_MODEL', 'gpt-4o-mini'),

  // Video
  VIDEO_DRIVER: get('VIDEO_DRIVER', 'mock') as 'mock' | 'livekit',
  LIVEKIT_URL: get('LIVEKIT_URL', ''),
  LIVEKIT_API_KEY: get('LIVEKIT_API_KEY', ''),
  LIVEKIT_API_SECRET: get('LIVEKIT_API_SECRET', ''),

  // Payments
  PAYMENTS_DRIVER: get('PAYMENTS_DRIVER', 'mock') as 'mock' | 'stripe',
  STRIPE_SECRET_KEY: get('STRIPE_SECRET_KEY', ''),
  STRIPE_WEBHOOK_SECRET: get('STRIPE_WEBHOOK_SECRET', ''),
  STRIPE_PUBLISHABLE_KEY: get('STRIPE_PUBLISHABLE_KEY', ''),

  // Commission (can override via env)
  PLATFORM_COMMISSION_PCT: getInt('PLATFORM_COMMISSION_PCT', 15),
  PLATFORM_COMMISSION_PCT_PRO: getInt('PLATFORM_COMMISSION_PCT_PRO', 10),

  // Feature flags
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

export type Env = typeof env;
