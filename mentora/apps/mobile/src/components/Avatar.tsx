/**
 * Avatar — circular user image with name-based fallback initials.
 */

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, FontWeight } from './theme';

export interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.[0] ?? '').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, containerStyle]}
        accessibilityLabel={`${name}'s avatar`}
      />
    );
  }

  return (
    <View
      style={[styles.fallback, containerStyle]}
      accessible
      accessibilityLabel={`${name}'s avatar`}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});
