/**
 * Welcome screen — landing page for unauthenticated users.
 *
 * Large, high-contrast layout works for both seniors (60+) and young learners.
 */

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BRAND } from '@mentora/shared';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { Heading } from '../../src/components/Typography';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/components/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen scrollable={false} noPadding>
      {/* Hero section */}
      <View style={styles.hero}>
        {/* Brand logo placeholder — replace with <Image> once icon assets are added */}
        <View style={styles.logoPlaceholder} accessible accessibilityLabel="Mentora logo">
          <Text style={styles.logoText}>M</Text>
        </View>

        <Heading level={1} style={styles.appName}>
          {BRAND.name}
        </Heading>

        <Text style={styles.tagline}>{BRAND.shortTagline}</Text>
      </View>

      {/* Value props */}
      <View style={styles.features}>
        {[
          { icon: '🎓', title: 'Expert Mentors', desc: 'Learn from retired professionals with decades of real-world experience.' },
          { icon: '🤖', title: 'AI Tutor', desc: 'Get instant homework help powered by AI, available 24/7.' },
          { icon: '📅', title: 'Live Classes', desc: 'Join live group sessions or book a private 1:1 coaching call.' },
        ].map((f) => (
          <View key={f.title} style={styles.featureRow} accessible accessibilityRole="text">
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View style={styles.actions}>
        <Button
          label="Get started — it's free"
          onPress={() => router.push('/(auth)/signup')}
          size="lg"
          fullWidth
        />
        <Button
          label="I already have an account"
          onPress={() => router.push('/(auth)/login')}
          variant="ghost"
          size="lg"
          fullWidth
        />
        <Text style={styles.legal} accessibilityRole="text">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: 44,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  appName: {
    color: '#fff',
    fontSize: FontSize['3xl'],
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSize.lg,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: FontSize.lg * 1.45,
  },
  features: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 28,
    lineHeight: 36,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: FontSize.base * 1.5,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  legal: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingTop: Spacing.xs,
  },
});
