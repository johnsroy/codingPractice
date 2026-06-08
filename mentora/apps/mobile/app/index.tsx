/**
 * Root index — redirects immediately based on auth state.
 *
 * - Not yet bootstrapped → blank white screen (splash is still showing)
 * - Authenticated        → /(tabs)
 * - Not authenticated    → /(auth)/welcome
 */

import { Redirect } from 'expo-router';
import { useAuth } from '../src/lib/auth';
import { LoadingSpinner } from '../src/components/LoadingSpinner';

export default function RootIndex() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Starting Mentora…" />;
  }

  if (user) {
    return <Redirect href="/(tabs)/" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
