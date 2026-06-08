/**
 * Account tab — user profile overview + subscription status + sign out.
 *
 * Teachers also see their earnings summary link.
 * Designed with large text and clear sections for the 60+ audience.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BRAND, ALL_PLANS, formatPrice } from '@mentora/shared';
import type { Subscription } from '@mentora/shared';
import { useAuth } from '../../src/lib/auth';
import { paymentsApi } from '../../src/lib/api';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Heading, AppText } from '../../src/components/Typography';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/components/theme';

export default function AccountScreen() {
  const { user, token, signOut } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);

  const loadSubscription = useCallback(async () => {
    if (!token) return;
    setLoadingSub(true);
    try {
      const sub = await paymentsApi.getSubscription(token);
      setSubscription(sub);
    } catch {
      // Subscription data is non-critical — fail silently.
    } finally {
      setLoadingSub(false);
    }
  }, [token]);

  useEffect(() => { loadSubscription(); }, [loadSubscription]);

  async function handleSignOut() {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out of Mentora?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            // Root index.tsx will redirect to /(auth)/welcome.
          },
        },
      ]
    );
  }

  if (!user) return null;

  const isTeacher = user.role === 'TEACHER';
  const currentPlan = subscription
    ? ALL_PLANS.find((p) => p.id === subscription.planId)
    : null;

  return (
    <Screen onRefresh={loadSubscription} refreshing={loadingSub}>
      {/* Profile card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Avatar name={user.name} uri={user.avatarUrl} size={64} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Badge
              label={isTeacher ? 'Teacher' : 'Learner'}
              color={isTeacher ? 'amber' : 'blue'}
            />
          </View>
        </View>

        {isTeacher && user.headline ? (
          <Text style={styles.profileHeadline}>{user.headline}</Text>
        ) : null}

        {isTeacher && user.bio ? (
          <Text style={styles.profileBio} numberOfLines={3}>{user.bio}</Text>
        ) : null}

        {isTeacher && user.yearsExperience != null ? (
          <Text style={styles.profileMeta}>
            {user.yearsExperience} years of experience
          </Text>
        ) : null}
      </Card>

      {/* Subscription / Plan */}
      <View style={styles.section}>
        <Heading level={3} style={styles.sectionTitle}>Your plan</Heading>
        {subscription ? (
          <Card style={styles.planCard}>
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>
                  {currentPlan?.name ?? subscription.planId}
                </Text>
                <Text style={styles.planStatus}>
                  Status: <Text style={styles.planStatusValue}>{subscription.status}</Text>
                </Text>
                <Text style={styles.planRenew}>
                  Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </Text>
              </View>
              {currentPlan?.popular && <Badge label="Popular" color="amber" />}
            </View>
            {currentPlan && (
              <Text style={styles.planPrice}>
                {currentPlan.priceCents === 0
                  ? 'Free forever'
                  : `${formatPrice(currentPlan.priceCents)} / ${currentPlan.interval}`}
              </Text>
            )}
          </Card>
        ) : (
          <Card style={styles.planCard}>
            <Text style={styles.planName}>Explorer (Free)</Text>
            <AppText style={styles.planDesc}>
              Upgrade to Scholar or Family for unlimited classes and AI tutoring.
            </AppText>
            <Button
              label="View plans"
              onPress={() => {
                // In production: push to a Pricing screen or open web checkout.
                Alert.alert(
                  'Upgrade plans',
                  'Open mentora.app in your browser to upgrade your plan.',
                  [{ text: 'OK' }]
                );
              }}
              variant="primary"
              size="sm"
              style={{ alignSelf: 'flex-start', marginTop: Spacing.sm }}
            />
          </Card>
        )}
      </View>

      {/* Teacher earnings link */}
      {isTeacher && (
        <View style={styles.section}>
          <Heading level={3} style={styles.sectionTitle}>Earnings</Heading>
          <Card style={styles.infoCard}>
            <Text style={styles.infoText}>
              Your detailed payout reports and analytics are available in the Mentora web dashboard.
            </Text>
            <Text style={styles.infoMeta}>
              You keep {user.proTier ? '90%' : '85%'} of every session you teach.
            </Text>
          </Card>
        </View>
      )}

      {/* About section */}
      <View style={styles.section}>
        <Heading level={3} style={styles.sectionTitle}>About Mentora</Heading>
        <Card style={styles.infoCard}>
          <Text style={styles.infoText}>{BRAND.tagline}</Text>
          <Text style={styles.infoMeta}>Support: {BRAND.supportEmail}</Text>
        </Card>
      </View>

      {/* Sign out */}
      <Button
        label="Sign out"
        onPress={handleSignOut}
        variant="ghost"
        fullWidth
        style={styles.signOut}
        accessibilityLabel="Sign out of Mentora"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { marginBottom: Spacing.lg },
  profileRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textSecondary },
  profileHeadline: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  profileBio: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: FontSize.sm * 1.55,
  },
  profileMeta: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { marginBottom: Spacing.sm },
  planCard: {},
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  planName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  planStatus: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  planStatusValue: { color: Colors.success, fontWeight: FontWeight.semibold },
  planRenew: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  planPrice: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  planDesc: { color: Colors.textSecondary, marginTop: Spacing.xs },
  infoCard: {},
  infoText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: FontSize.base * 1.55,
  },
  infoMeta: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xs },
  signOut: { marginTop: Spacing.sm, marginBottom: Spacing.xl },
});
