import { en, type TranslationKeys } from './locales/en';
import { tr } from './locales/tr';

// ============ Types ============

export type SupportedLocale = 'en' | 'tr';
export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'tr'];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export type { TranslationKeys };

// ============ Translations Map ============

const translations: Record<SupportedLocale, TranslationKeys> = {
  en,
  tr,
};

// ============ Functions ============

export const getTranslations = (locale: SupportedLocale): TranslationKeys => {
  return translations[locale] || translations[DEFAULT_LOCALE];
};

export const t = <C extends keyof TranslationKeys>(
  locale: SupportedLocale,
  category: C,
  key: keyof TranslationKeys[C]
): string => {
  const categoryTranslations = translations[locale]?.[category];
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
