import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock next/image — renders a plain <img> so jsdom can handle it without
// the Next.js image-optimisation pipeline.
// ---------------------------------------------------------------------------
vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }) {
    return React.createElement('img', { src, alt, width, height, className });
  },
}));

// ---------------------------------------------------------------------------
// Mock next/link — renders a plain <a> so href / children work as expected
// in jsdom without the Next.js routing context.
// ---------------------------------------------------------------------------
vi.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return React.createElement('a', { href, className }, children);
  },
}));
