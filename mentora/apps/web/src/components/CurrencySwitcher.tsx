'use client';

/**
 * CurrencySwitcher — accessible dropdown listing ALL 21 currencies.
 *
 * Each option is shown as "{flag} {code} — {name}" so screen readers and
 * sighted users both have enough context.
 *
 * Accessibility:
 *  - <select> has aria-label="Choose currency" (plus a visually-hidden <label>).
 *  - min-height 44px (WCAG 2.5.8 touch target).
 *  - Visible focus ring via focus-visible (ring-2 ring-brand-500).
 */

import React from 'react';
import { CURRENCIES, type Currency } from '@mentora/shared';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

interface CurrencySwitcherProps {
  value: Currency;
  onChange: (c: Currency) => void;
  className?: string;
}

export function CurrencySwitcher({ value, onChange, className }: CurrencySwitcherProps) {
  const current = CURRENCIES.find((c) => c.code === value) ?? CURRENCIES[0]!;

  return (
    <div className={clsx('relative inline-flex items-center', className)}>
      {/* Visually-hidden label satisfies SC 1.3.1; aria-label satisfies SC 4.1.2 */}
      <label htmlFor="currency-switcher" className="sr-only">
        Choose currency
      </label>
      <select
        id="currency-switcher"
        aria-label="Choose currency"
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
        className={clsx(
          'appearance-none bg-white border-2 border-surface-200 rounded-full',
          'pl-10 pr-9 py-2.5 text-sm font-semibold text-ink-800',
          // min-height ≥ 44px for WCAG 2.5.8 touch target
          'min-h-[44px]',
          // Hover + focus-visible ring
          'hover:border-brand-400',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
          'cursor-pointer shadow-soft transition-colors duration-150',
        )}
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} — {c.name}
          </option>
        ))}
      </select>
      {/* Decorative flag overlay — hidden from AT */}
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base leading-none"
        aria-hidden="true"
      >
        {current.flag}
      </span>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
        aria-hidden="true"
      />
    </div>
  );
}
