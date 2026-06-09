/**
 * i18n — supported languages for Mentora India.
 * Add a new entry here (+ a matching locales/<code>.ts) to support more languages.
 */

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];
