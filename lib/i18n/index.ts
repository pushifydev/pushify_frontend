import { en, type TranslationKeys } from './locales/en';

// ============ Types ============

export type SupportedLocale = 'en' | 'tr';
export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'tr'];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export type { TranslationKeys };

// ============ Translations Map ============

// Only the default (en) dictionary ships in the bundle. The tr dictionary is a
// separate lazy chunk (~300KB raw across both would otherwise load on EVERY page
// for EVERY visitor) — it's fetched on demand when the locale is tr. Until it
// arrives, lookups fall back to en; `loadLocale` resolves and the locale store
// bumps `dictVersion` so subscribed components re-render with Turkish text.
const translations: Partial<Record<SupportedLocale, TranslationKeys>> = {
  en,
};

let trPromise: Promise<void> | null = null;

/** Ensure a locale's dictionary is in memory. Resolves immediately for en/loaded. */
export const loadLocale = (locale: SupportedLocale): Promise<void> => {
  if (locale !== 'tr' || translations.tr) return Promise.resolve();
  trPromise ??= import('./locales/tr').then((m) => {
    translations.tr = m.tr;
  });
  return trPromise;
};

export const isLocaleLoaded = (locale: SupportedLocale): boolean => !!translations[locale];

// The server always renders the default locale (it cannot see localStorage), so the first client
// render must produce the same text or React reports a hydration mismatch, regenerates the tree
// on the client and, as a side effect, resets <html class> — wiping the theme class the boot
// script added (the pricing page came up dark for Turkish visitors). Until AfterHydration flips
// this flag from a post-mount effect, every lookup answers from the default dictionary.
let hydrated = false;

export const markHydrated = (): void => {
  hydrated = true;
};

// ============ Functions ============

export const getTranslations = (locale: SupportedLocale): TranslationKeys => {
  if (!hydrated) return translations[DEFAULT_LOCALE]!;
  return translations[locale] ?? translations[DEFAULT_LOCALE]!;
};

export const t = <C extends keyof TranslationKeys>(
  locale: SupportedLocale,
  category: C,
  key: keyof TranslationKeys[C]
): string => {
  // getTranslations falls back to en while a lazy dictionary is still loading
  const categoryTranslations = getTranslations(locale)[category];
  if (!categoryTranslations) {
    return String(key);
  }
  return (categoryTranslations as Record<string, unknown>)[key as string] as string || String(key);
};

// ============ Helpers ============

export const detectBrowserLocale = (): SupportedLocale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LOCALES.includes(browserLang as SupportedLocale)) {
    return browserLang as SupportedLocale;
  }
  return DEFAULT_LOCALE;
};
