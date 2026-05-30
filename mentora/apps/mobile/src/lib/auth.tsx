/**
 * Mentora Mobile — Auth Context
 *
 * Persists access + refresh tokens in expo-secure-store (hardware-backed
 * keychain/keystore on device).  Provides a React context so any screen
 * can read the current user and call signIn/signOut/signUp.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from './api';
import type { UserPublic, AuthResult } from '@mentora/shared';

// ---------------------------------------------------------------------------
// SecureStore keys
// ---------------------------------------------------------------------------
const ACCESS_TOKEN_KEY = 'mentora_access_token';
const REFRESH_TOKEN_KEY = 'mentora_refresh_token';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
export interface AuthContextValue {
  /** Currently signed-in user, or null if unauthenticated. */
  user: UserPublic | null;
  /** Raw JWT access token (include in Authorization headers). */
  token: string | null;
  /** True while the initial token check is in-flight. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, attempt to restore an existing session from secure storage.
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (stored) {
          // Verify token is still valid by fetching /auth/me.
          const me = await authApi.me(stored);
          setToken(stored);
          setUser(me);
        }
      } catch {
        // Token expired or network error — wipe stale storage.
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** Persist tokens and update state after a successful auth call. */
  const applyAuthResult = useCallback(async (result: AuthResult) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, result.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, result.refreshToken);
    setToken(result.accessToken);
    setUser(result.user);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password });
      await applyAuthResult(result);
    },
    [applyAuthResult]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string, role: string) => {
      const result = await authApi.register({ name, email, password, role });
      await applyAuthResult(result);
    },
    [applyAuthResult]
  );

  const signOut = useCallback(async () => {
    if (token) {
      // Best-effort server logout; ignore errors (e.g. offline).
      try {
        await authApi.logout(token);
      } catch {
        // swallow
      }
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, signIn, signUp, signOut }),
    [user, token, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
