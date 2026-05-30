/**
 * Badge — small pill label for status, subject, grade, etc.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from './theme';

export type BadgeColor = 'blue' | 'amber' | 'green' | 'red' | 'grey';

export interface BadgeProps {
  label: string;
  color?: BadgeColor;
}

const colorMap: Record<BadgeColor, { bg: string; text: string }> = {
  blue: { bg: Colors.primaryLight, text: Colors.primary },
  amber: { bg: Colors.amberLight, text: Colors.amber },
  green: { bg: Colors.successLight, text: Colors.success },
  red: { bg: Colors.errorLight, text: Colors.error },
  grey: { bg: Colors.border, text: Colors.textSecondary },
};

export function Badge({ label, color = 'blue' }: BadgeProps) {
  const { bg, text } = colorMap[color];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
