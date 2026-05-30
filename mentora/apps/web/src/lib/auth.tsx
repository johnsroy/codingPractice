'use client';

/**
 * AuthContext — provides current user, login/register/logout, role helpers.
 * Token is stored in localStorage; user object is in React state (memory).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  authApi,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  ApiError,
  type UserPublic,
  type LoginInput,
  type RegisterInput,
} from './api';
import { ROLES } from '@mentora/shared';

// ------------------------------------------------------------------ //
// Context shape
// ------------------------------------------------------------------ //

interface AuthContextValue {
  user: UserPublic | null;
  isLoading: boolean;
  error: string | null;
  /** Returns the logged-in user on success; throws ApiError on failure. */
  login: (data: LoginInput) => Promise<UserPublic>;
  /** Returns the registered user on success; throws ApiError on failure. */
  register: (data: RegisterInput) => Promise<UserPublic>;
  logout: () => Promise<void>;
  /** Imperatively refresh user from /auth/me */
  refreshUser: () => Promise<void>;
  isTeacher: boolean;
  isStudent: boolean;
  isGuardian: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

// ------------------------------------------------------------------ //
// Context
// ------------------------------------------------------------------ //

const AuthContext = createContext<AuthContextValue | null>(null);

// ------------------------------------------------------------------ //
// Provider
// ------------------------------------------------------------------ //

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount: if a token exists in localStorage, hydrate the user
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        // Token may be expired — clear it silently
        clearStoredToken();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (data: LoginInput): Promise<UserPublic> => {
    setError(null);
    const result = await authApi.login(data); // throws on error
    setStoredToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (data: RegisterInput): Promise<UserPublic> => {
    setError(null);
    const result = await authApi.register(data);
    setStoredToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort
    }
    clearStoredToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authApi.me();
      setUser(u);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        clearStoredToken();
        setUser(null);
      }
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      login,
      register,
      logout,
      refreshUser,
      isTeacher: user?.role === ROLES.TEACHER,
      isStudent: user?.role === ROLES.STUDENT,
      isGuardian: user?.role === ROLES.GUARDIAN,
      isAdmin: user?.role === ROLES.ADMIN,
      isAuthenticated: Boolean(user),
    }),
    [user, isLoading, error, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ------------------------------------------------------------------ //
// Hook
// ------------------------------------------------------------------ //

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
