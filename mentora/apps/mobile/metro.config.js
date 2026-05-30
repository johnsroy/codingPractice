/**
 * Metro configuration for the Mentora mobile app inside an npm workspaces
 * monorepo.  The two critical settings are:
 *
 *  1. watchFolders  — tell Metro to watch the whole repo root so it sees
 *     changes to packages/shared without a separate build step.
 *  2. resolver.nodeModulesPaths — make Metro resolve hoisted node_modules
 *     from the repo root first, so there are no duplicate React / RN copies.
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Root of the monorepo (two dirs up from apps/mobile).
const repoRoot = path.resolve(__dirname, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// ── Watch the entire monorepo so Metro sees edits to packages/shared. ──────
config.watchFolders = [repoRoot];

// ── Resolver: prefer hoisted modules, then fall back to local. ──────────────
config.resolver.nodeModulesPaths = [
  path.resolve(repoRoot, 'node_modules'),
  path.resolve(__dirname, 'node_modules'),
];

// ── Ensure .ts / .tsx are tried before .js so TypeScript files resolve. ──
// (expo/metro-config usually handles this, but be explicit for the workspace.)
config.resolver.sourceExts = [
  'tsx',
  'ts',
  'jsx',
  'js',
  'json',
  'cjs',
  'mjs',
];

module.exports = config;
