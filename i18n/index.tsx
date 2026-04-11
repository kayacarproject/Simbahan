/**
 * Lightweight i18n system — zero external dependencies.
 *
 * Follows the same Context + hook pattern as ThemeContext.
 * Reacts to language changes from countryStore automatically.
 *
 * Usage:
 *   const { t } = useI18n();
 *   t('home.greeting')          → "Good morning"
 *   t('common.save')            → "Save"
 */

import React, { createContext, useContext, useCallback } from 'react';
import { useCountryStore } from '../store/countryStore';
import type { LanguageCode } from '../store/countryStore';

// — Static locale imports (bundled at build time, no async loading) —
import en from './locales/en.json';
import fil from './locales/fil.json';
import hi from './locales/hi.json';

// ─── Types ────────────────────────────────────────────────────────────────────

type LocaleTree = typeof en;

// Produces all valid dot-notation key paths, e.g. 'home.greeting' | 'common.save'
type DotPath<T, P extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? DotPath<T[K], P extends '' ? `${string & K}` : `${P}.${string & K}`>
    : P extends ''
    ? `${string & K}`
    : `${P}.${string & K}`;
}[keyof T];

export type TranslationKey = DotPath<LocaleTree>;

// ─── Locale map ───────────────────────────────────────────────────────────────

const LOCALES: Record<LanguageCode, LocaleTree> = {
  en,
  fil,
  // hi shares the same shape; cast is safe because we validated keys match
  hi: hi as unknown as LocaleTree,
  // te / ta fall back to English until translation files are added
  te: en,
  ta: en,
};

// ─── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Resolves a dot-notation key against a nested locale object.
 * Returns the key itself if not found (visible in UI = easy to spot missing keys).
 */
function resolve(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return key;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : key;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface I18nContextValue {
  /** Translate a dot-notation key: t('home.greeting') */
  t: (key: TranslationKey | string) => string;
  /** Current active language code */
  language: LanguageCode;
}

const I18nContext = createContext<I18nContextValue>({
  t: (key) => key,
  language: 'fil',
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const language = useCountryStore((s) => s.language);

  const locale = LOCALES[language] ?? en;

  const t = useCallback(
    (key: TranslationKey | string): string =>
      resolve(locale as unknown as Record<string, unknown>, key),
    [locale],
  );

  return (
    <I18nContext.Provider value={{ t, language }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
