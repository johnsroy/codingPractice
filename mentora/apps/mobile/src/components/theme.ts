/**
 * Design tokens for Mentora Mobile.
 *
 * Colour palette is the same deep-blue / amber brand used on the web app.
 * All colours pass WCAG AA on their intended backgrounds.
 */

export const Colors = {
  // Brand primaries
  primary: '#1a56db',       // Mentora blue — used for CTAs
  primaryDark: '#1346b5',
  primaryLight: '#dbeafe',

  // Accent
  amber: '#d97706',
  amberLight: '#fef3c7',

  // Neutrals
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  background: '#f9fafb',
  surface: '#ffffff',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',

  // Semantic
  success: '#059669',
  successLight: '#d1fae5',
  error: '#dc2626',
  errorLight: '#fee2e2',
  warning: '#d97706',
  warningLight: '#fef3c7',
  info: '#0284c7',
  infoLight: '#e0f2fe',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const FontSize = {
  // Minimum 16 pt body text — important for older-adult readability.
  xs: 13,
  sm: 15,
  base: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
} as const;

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/** Minimum touch target per Apple HIG / Google Material = 44 × 44 pt. */
export const MIN_TOUCH_TARGET = 48;
