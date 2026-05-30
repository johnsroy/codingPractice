/**
 * Typography — shared text components.
 *
 * Min body size 17 pt for accessibility; headings scale up from there.
 * All colours meet WCAG AA on the white/grey-50 backgrounds we use.
 */

import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { Colors, FontSize, FontWeight } from './theme';

// ── Primitive style map ───────────────────────────────────────────────────────
export const TextStyles = StyleSheet.create({
  h1: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: FontSize['3xl'] * 1.25,
  },
  h2: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: FontSize['2xl'] * 1.3,
  },
  h3: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: FontSize.xl * 1.35,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.normal,
    color: Colors.textPrimary,
    lineHeight: FontSize.base * 1.55,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.normal,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.normal,
    color: Colors.textMuted,
  },
});

// ── Component wrappers ────────────────────────────────────────────────────────
export function AppText({
  style,
  ...props
}: TextProps) {
  return <Text style={[TextStyles.body, style]} {...props} />;
}

export function Heading({
  level = 2,
  style,
  ...props
}: TextProps & { level?: 1 | 2 | 3 }) {
  const baseStyle =
    level === 1 ? TextStyles.h1 : level === 3 ? TextStyles.h3 : TextStyles.h2;
  return (
    <Text
      accessibilityRole="header"
      style={[baseStyle, style]}
      {...props}
    />
  );
}

export function Label({ style, ...props }: TextProps) {
  return <Text style={[TextStyles.label, style]} {...props} />;
}

export function Caption({ style, ...props }: TextProps) {
  return <Text style={[TextStyles.caption, style]} {...props} />;
}
