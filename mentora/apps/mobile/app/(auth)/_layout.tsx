/**
 * Auth group layout — a native stack for Welcome → Login / Signup.
 * Redirects authenticated users back to the main tabs.
 */

import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/lib/auth';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { Colors } from '../../src/components/theme';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  // Already authenticated — skip auth flow.
  if (user) return <Redirect href="/(tabs)/" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
        animation: 'slide_from_right',
        headerTintColor: Colors.primary,
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" options={{ headerShown: true, headerTitle: 'Sign In', headerBackTitle: 'Back' }} />
      <Stack.Screen name="signup" options={{ headerShown: true, headerTitle: 'Create Account', headerBackTitle: 'Back' }} />
    </Stack>
  );
}
