'use client';

/**
 * Currency state helper — backed by localStorage.
 * Deliberately self-contained: no global provider, no context.
 * Import `useCurrencyState` wherever you need currency selection.
 */

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CURRENCY, type Currency } from '@mentora/shared';

const STORAGE_KEY = 'mentora_currency';

function readStored(): Currency {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === 'USD' || raw === 'CAD' || raw === 'INR') return raw;
  return DEFAULT_CURRENCY;
}

/**
 * Hook — returns [currency, setCurrency].
 * Defaults to 'USD'. Persists across reloads via localStorage.
 */
export function useCurrencyState(): [Currency, (c: Currency) => void] {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setCurrencyState(readStored());
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, c);
    }
    setCurrencyState(c);
  }, []);

  return [currency, setCurrency];
}
