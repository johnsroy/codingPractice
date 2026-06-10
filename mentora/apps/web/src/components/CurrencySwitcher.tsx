'use client';

/**
 * CurrencySwitcher — an accessible dropdown that lets the user pick
 * USD / CAD / INR. Renders each option with its emoji flag and code.
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
  const current = CURRENCIES.find((c) => c.code === value) ?? CURRENCIES[0];

  return (
    <div className={clsx('relative inline-flex items-center', className)}>
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
          'pl-10 pr-9 py-2 text-sm font-semibold text-ink-800',
          'hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
          'cursor-pointer min-h-[40px] shadow-soft transition-colors duration-150',
        )}
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      {/* Flag overlay — purely decorative, hidden from AT via aria-hidden */}
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
