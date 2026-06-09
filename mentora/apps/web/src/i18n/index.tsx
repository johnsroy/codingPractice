'use client';

/**
 * i18n — LanguageProvider, useLanguage(), useT()
 *
 * Design principles:
 * - Default language is ALWAYS English.
 * - useT() works WITHOUT a provider mounted (many component tests render in
 *   isolation with no app wrapper). The context has a safe default = English,
 *   so it never throws.
 * - Persists choice to localStorage key `mentora_lang`.
 * - Sets document.documentElement.lang on change.
 * - Supports simple variable interpolation: t('key', { name: 'Asha' })
 *   replaces {{name}} in the string.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { LANGUAGES, type LanguageCode } from './languages';
import type { Dict } from './locales/en';
import en from './locales/en';

// ---------------------------------------------------------------------------
// Lazy locale loader — avoids bundling all locales unless needed
// ---------------------------------------------------------------------------

const localeLoaders: Record<Exclude<LanguageCode, 'en'>, () => Promise<{ default: Dict }>> = {
  hi: () => import('./locales/hi'),
  pa: () => import('./locales/pa'),
  bn: () => import('./locales/bn'),
};

// ---------------------------------------------------------------------------
// Dot-notation key lookup — walks the nested dict safely
// ---------------------------------------------------------------------------

type DotKeys = {
  [K in keyof Dict]: {
    [SK in keyof Dict[K]]: `${K & string}.${SK & string}`;
  }[keyof Dict[K]];
}[keyof Dict];

function lookup(dict: Dict, key: string): string {
  const parts = key.split('.');
  let node: unknown = dict;
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return key;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : key;
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`));
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface LanguageContextValue {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  dict: Dict;
}

// Safe default — English always available synchronously
const defaultContextValue: LanguageContextValue = {
  lang: 'en',
  setLang: () => {},
  dict: en,
};

const LanguageContext = createContext<LanguageContextValue>(defaultContextValue);

const STORAGE_KEY = 'mentora_lang';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>('en');
  const [dict, setDict] = useState<Dict>(en);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    const valid = LANGUAGES.find((l) => l.code === saved);
    if (valid && valid.code !== 'en') {
      loadAndSetLocale(valid.code);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAndSetLocale = useCallback(async (code: LanguageCode) => {
    if (code === 'en') {
      setLangState('en');
      setDict(en);
      if (typeof document !== 'undefined') document.documentElement.lang = 'en';
      return;
    }
    try {
      const mod = await localeLoaders[code]();
      setLangState(code);
      setDict(mod.default);
      if (typeof document !== 'undefined') document.documentElement.lang = code;
    } catch {
      // Fallback to English if locale fails to load
      setLangState('en');
      setDict(en);
    }
  }, []);

  const setLang = useCallback(
    (code: LanguageCode) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, code);
      }
      loadAndSetLocale(code);
    },
    [loadAndSetLocale],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, dict }),
    [lang, setLang, dict],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Returns { lang, setLang } — requires LanguageProvider, or falls back gracefully. */
export function useLanguage(): { lang: LanguageCode; setLang: (code: LanguageCode) => void } {
  const { lang, setLang } = useContext(LanguageContext);
  return { lang, setLang };
}

/** Returns t(key, vars?) — works without a LanguageProvider (defaults to English). */
export function useT(): (key: DotKeys, vars?: Record<string, string | number>) => string {
  const { dict } = useContext(LanguageContext);
  return useCallback(
    (key: DotKeys, vars?: Record<string, string | number>) => {
      const raw = lookup(dict, key);
      // If key not found in current dict, fall back to English
      const val = raw === key ? lookup(en, key) : raw;
      return interpolate(val, vars);
    },
    [dict],
  );
}
