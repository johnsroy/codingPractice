import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      // App path alias
      '@': path.resolve(__dirname, './src'),
      // Shared package — resolve directly to source so Vitest can transpile it
      '@mentora/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      // Next.js modules that require the framework runtime — replaced with
      // lightweight stubs so components render in jsdom without a Next.js server.
      'next/image': path.resolve(__dirname, './src/test/mocks/next-image.tsx'),
      'next/link': path.resolve(__dirname, './src/test/mocks/next-link.tsx'),
    },
  },
});
