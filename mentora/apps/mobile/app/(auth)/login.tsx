/**
 * Login screen — email + password form.
 *
 * Large inputs and clear error messages for accessibility.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/lib/auth';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { Heading, AppText } from '../../src/components/Typography';
import {
  Colors,
  FontSize,
  FontWeight,
  MIN_TOUCH_TARGET,
  Radius,
  Spacing,
} from '../../src/components/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      // AuthLayout will redirect to tabs on success.
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Heading level={2} style={styles.heading}>Welcome back</Heading>
      <AppText style={styles.subtext}>
        Sign in to continue to Mentora.
      </AppText>

      {error ? (
        <View style={styles.errorBox} accessibilityLiveRegion="assertive" accessible>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Email */}
      <View style={styles.field}>
        <Text style={styles.label} nativeID="email-label">Email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          accessibilityLabel="Email address"
          accessibilityLabelledBy="email-label"
          placeholder="you@example.com"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="next"
        />
      </View>

      {/* Password */}
      <View style={styles.field}>
        <Text style={styles.label} nativeID="password-label">Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          accessibilityLabel="Password"
          accessibilityLabelledBy="password-label"
          placeholder="Your password"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
      </View>

      <Button
        label="Sign In"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        fullWidth
        size="lg"
        style={styles.submitBtn}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/signup')}
          accessible
          accessibilityRole="link"
          accessibilityLabel="Create an account"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.footerLink}>Create one</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: Spacing.xs,
  },
  subtext: {
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.base,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    minHeight: MIN_TOUCH_TARGET + 4,
  },
  submitBtn: {
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: FontSize.base,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
