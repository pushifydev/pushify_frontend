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

/**
 * A dictionary parked on `globalThis`, by whoever got there first.
 *
 * In the browser that is the blocking script the layout emits for a Turkish visitor
 * (`/i18n/tr`), which runs before React hydrates. On the server it is `ensureDictionaryOnServer`,
 * called by the layout — and `globalThis` is the only thing the two graphs there share: server
 * components and client-components-rendered-on-the-server each get their own copy of this file,
 * so a plain import in one of them would never reach the other.
 *
 * Read lazily rather than at module evaluation, because whoever parks it may run afterwards.
 */
type DictionaryHost = { __PUSHIFY_I18N_TR?: TranslationKeys };

const adoptParkedDictionary = (): void => {
  if (translations.tr) return;
  const parked = (globalThis as DictionaryHost).__PUSHIFY_I18N_TR;
  if (parked) translations.tr = parked;
};

/** Make a dictionary available to every module graph in this process. */
export const installDictionary = (locale: SupportedLocale, dictionary: TranslationKeys): void => {
  translations[locale] = dictionary;
  if (locale === 'tr') (globalThis as DictionaryHost).__PUSHIFY_I18N_TR = dictionary;
};

let trPromise: Promise<void> | null = null;

/** Ensure a locale's dictionary is in memory. Resolves immediately for en/loaded. */
export const loadLocale = (locale: SupportedLocale): Promise<void> => {
  adoptParkedDictionary();
  if (locale !== 'tr' || translations.tr) return Promise.resolve();
  trPromise ??= import('./locales/tr').then((m) => {
    translations.tr = m.tr;
  });
  return trPromise;
};

export const isLocaleLoaded = (locale: SupportedLocale): boolean => !!translations[locale];

// ============ Functions ============

// The server renders the visitor's language and seeds the store with it, so this answers the same
// way on both sides. The fallback only applies while a dictionary is genuinely not loaded — after
// a language switched at runtime, before its chunk arrives.
export const getTranslations = (locale: SupportedLocale): TranslationKeys => {
  if (!translations[locale]) adoptParkedDictionary();
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
