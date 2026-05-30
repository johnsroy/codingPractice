/**
 * Signup screen — name, email, password, and role chooser.
 *
 * Role cards are large tap targets with clear descriptions to help
 * both the senior teacher and the child/guardian choose correctly.
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

type PickableRole = 'STUDENT' | 'TEACHER';

const ROLE_OPTIONS: { role: PickableRole; icon: string; title: string; desc: string }[] = [
  {
    role: 'STUDENT',
    icon: '🎓',
    title: 'I want to learn',
    desc: 'Browse courses, book sessions, and get AI homework help.',
  },
  {
    role: 'TEACHER',
    icon: '🏫',
    title: 'I want to teach',
    desc: 'Share your expertise, host live classes, and earn.',
  },
];

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<PickableRole>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup() {
    setError(null);

    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password, role);
      // AuthLayout redirects to tabs on success.
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Heading level={2} style={styles.heading}>Create your account</Heading>
      <AppText style={styles.subtext}>Join thousands of learners and mentors on Mentora.</AppText>

      {/* Role chooser */}
      <Text style={styles.label} nativeID="role-label">I am joining as…</Text>
      <View style={styles.roleRow} accessibilityLabelledBy="role-label">
        {ROLE_OPTIONS.map((opt) => {
          const selected = role === opt.role;
          return (
            <TouchableOpacity
              key={opt.role}
              onPress={() => setRole(opt.role)}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${opt.title}: ${opt.desc}`}
              style={[styles.roleCard, selected && styles.roleCardSelected]}
            >
              <Text style={styles.roleIcon}>{opt.icon}</Text>
              <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>
                {opt.title}
              </Text>
              <Text style={styles.roleDesc}>{opt.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorBox} accessibilityLiveRegion="assertive" accessible>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label} nativeID="name-label">Full name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          textContentType="name"
          accessibilityLabelledBy="name-label"
          placeholder="Your name"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="next"
        />
      </View>

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
          accessibilityLabelledBy="email-label"
          placeholder="you@example.com"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="next"
        />
      </View>

      {/* Password */}
      <View style={styles.field}>
        <Text style={styles.label} nativeID="pw-label">Password (min 8 characters)</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
          accessibilityLabelledBy="pw-label"
          placeholder="Choose a strong password"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="done"
          onSubmitEditing={handleSignup}
        />
      </View>

      <Button
        label="Create my account"
        onPress={handleSignup}
        loading={loading}
        disabled={loading}
        fullWidth
        size="lg"
        style={styles.submitBtn}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          accessible
          accessibilityRole="link"
          accessibilityLabel="Sign in"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.footerLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: Spacing.xs },
  subtext: { color: Colors.textSecondary, marginBottom: Spacing.lg },
  roleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  roleCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    minHeight: 120,
  },
  roleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleIcon: { fontSize: 28 },
  roleTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  roleTitleSelected: { color: Colors.primary },
  roleDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: FontSize.base },
  field: { marginBottom: Spacing.md },
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
  submitBtn: { marginTop: Spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: { fontSize: FontSize.base, color: Colors.textSecondary },
  footerLink: {
    fontSize: FontSize.base,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
