/**
 * Button — large-touch-target primary/secondary/ghost variants.
 *
 * Minimum 48 pt height (Apple HIG + WCAG 2.5.5 Target Size) with clear
 * visual states for pressed, disabled, and loading.
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, FontSize, FontWeight, MIN_TOUCH_TARGET, Radius, Spacing } from './theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Accessible label override when label alone is not descriptive. */
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#fff' : Colors.primary}
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], styles[`label_${size}`]]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ── Row of two equally-wide buttons (e.g. Cancel / Confirm) ──────────────────
export function ButtonRow({ children }: { children: React.ReactNode }) {
  return <View style={rowStyles.row}>{children}</View>;
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: Spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },

  // ── Variants ─────────────────────────────────────────────────────────────
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.primaryLight,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.error,
  },

  // ── Sizes ────────────────────────────────────────────────────────────────
  sm: {
    paddingHorizontal: Spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    paddingVertical: Spacing.xs,
  },
  md: {
    paddingVertical: Spacing.sm + 2,
  },
  lg: {
    paddingVertical: Spacing.md,
    minHeight: 56,
  },

  // ── Label text ───────────────────────────────────────────────────────────
  label: {
    fontWeight: FontWeight.semibold,
  },
  label_primary: { color: '#fff' },
  label_secondary: { color: Colors.primary },
  label_ghost: { color: Colors.primary },
  label_danger: { color: '#fff' },

  label_sm: { fontSize: FontSize.sm },
  label_md: { fontSize: FontSize.base },
  label_lg: { fontSize: FontSize.lg },
});
