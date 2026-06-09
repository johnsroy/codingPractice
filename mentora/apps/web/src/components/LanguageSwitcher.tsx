'use client';

/**
 * LanguageSwitcher — accessible select dropdown for choosing the UI language.
 * - Shows each language's native name.
 * - aria-label="Choose language"
 * - Min touch target ≥ 48px.
 * - Keyboard operable (native <select> has built-in keyboard support).
 */

import React from 'react';
import { Languages } from 'lucide-react';
import { LANGUAGES } from '@/i18n/languages';
import { useLanguage, useT } from '@/i18n';
import type { LanguageCode } from '@/i18n/languages';

interface LanguageSwitcherProps {
  /** Extra CSS classes, e.g. for positioning in a flex row */
  className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();
  const t = useT();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLang(e.target.value as LanguageCode);
  }

  return (
    <div
      className={`relative flex items-center gap-1.5 ${className}`}
      title={t('nav.chooseLanguage')}
    >
      <Languages
        size={18}
        className="text-stone-500 pointer-events-none shrink-0"
        aria-hidden="true"
      />
      <select
        value={lang}
        onChange={handleChange}
        aria-label={t('nav.chooseLanguage')}
        className={[
          'appearance-none bg-transparent text-sm font-semibold text-stone-600',
          'rounded-lg px-2 py-2 min-h-[48px]',
          'hover:bg-surface-100 hover:text-stone-900',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          'cursor-pointer transition-colors',
          'pr-6',
        ].join(' ')}
      >
        {LANGUAGES.map((lng) => (
          <option key={lng.code} value={lng.code}>
            {lng.native}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow */}
      <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
        ▾
      </span>
    </div>
  );
}
