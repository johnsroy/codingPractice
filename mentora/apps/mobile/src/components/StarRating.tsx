/**
 * StarRating — read-only display of a 0–5 star rating.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize } from './theme';

export interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showValue?: boolean;
}

export function StarRating({ rating, maxStars = 5, size = 16, showValue = true }: StarRatingProps) {
  const stars = Array.from({ length: maxStars }, (_, i) => {
    const filled = i + 1 <= Math.round(rating);
    return filled ? '★' : '☆';
  });

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Rating: ${rating.toFixed(1)} out of ${maxStars}`}
    >
      {stars.map((s, i) => (
        <Text
          key={i}
          style={[
            styles.star,
            { fontSize: size, color: s === '★' ? Colors.amber : Colors.border },
          ]}
        >
          {s}
        </Text>
      ))}
      {showValue ? (
        <Text style={[styles.value, { fontSize: size - 2 }]}>{rating.toFixed(1)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    lineHeight: FontSize.lg * 1.2,
  },
  value: {
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});
