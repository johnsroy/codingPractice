'use client';

/**
 * Currency state helper — backed by localStorage + geo-detection.
 *
 * On first mount (no stored choice) we call geoApi.detect() once to get the
 * user's region-suggested currency, persist it, and reflect it in state.
 * Subsequent visits read from localStorage directly and skip the geo call.
 *
 * SSR-safe: localStorage is never accessed on the server; state starts as
 * USD and hydrates after mount.
 *
 * Exposes { currency, setCurrency, detected } where `detected` is the
 * geo-suggested currency (useful to show an informational note).
 */

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CURRENCY, CURRENCIES, type Currency } from '@mentora/shared';
import { geoApi } from '@/lib/api';

const STORAGE_KEY = 'mentora_currency';

function isValidCurrency(raw: string | null): raw is Currency {
  if (!raw) return false;
  return CURRENCIES.some((c) => c.code === raw);
}

function readStored(): Currency | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return isValidCurrency(raw) ? raw : null;
}

export interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** The geo-suggested currency (same as currency when user has not overridden). */
  detected: Currency;
}

/**
 * Hook — returns { currency, setCurrency, detected }.
 * Defaults to 'USD' immediately (no render blocking).
 * After mount: reads localStorage; if empty, calls the geo endpoint once.
 */
export function useCurrencyState(): CurrencyState {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [detected, setDetected] = useState<Currency>(DEFAULT_CURRENCY);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      // User has an explicit preference — honour it, no geo call needed.
      setCurrencyState(stored);
      setDetected(stored);
      return;
    }

    // No stored preference — ask the server for a geo suggestion.
    let cancelled = false;
    geoApi
      .detect()
      .then((info) => {
        if (cancelled) return;
        const suggested = isValidCurrency(info.currency) ? info.currency : DEFAULT_CURRENCY;
        // Persist so we don't hit the endpoint on every page load.
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, suggested);
        }
        setCurrencyState(suggested);
        setDetected(suggested);
      })
      .catch(() => {
        if (cancelled) return;
        // Geo failed — stay on USD (already the default).
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, DEFAULT_CURRENCY);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, c);
    }
    setCurrencyState(c);
  }, []);

  return { currency, setCurrency, detected };
}
