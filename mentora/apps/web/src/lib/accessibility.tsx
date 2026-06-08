'use client';

/**
 * AccessibilityContext — manages the "Larger text" toggle.
 * The preference is persisted to localStorage and applied as
 * a data-font-size attribute on <html> (CSS reacts via --font-scale).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type FontSize = 'normal' | 'large';

interface AccessibilityContextValue {
  fontSize: FontSize;
  toggleFontSize: () => void;
  isLarge: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const STORAGE_KEY = 'mentora_font_size';

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>('normal');

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY) as FontSize | null;
    if (saved === 'large') {
      setFontSize('large');
      document.documentElement.setAttribute('data-font-size', 'large');
    }
  }, []);

  const toggleFontSize = useCallback(() => {
    setFontSize((prev) => {
      const next: FontSize = prev === 'normal' ? 'large' : 'normal';
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next);
        if (next === 'large') {
          document.documentElement.setAttribute('data-font-size', 'large');
        } else {
          document.documentElement.removeAttribute('data-font-size');
        }
      }
      return next;
    });
  }, []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({ fontSize, toggleFontSize, isLarge: fontSize === 'large' }),
    [fontSize, toggleFontSize],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
