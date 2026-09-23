'use client';

import { useLocaleStore } from '@/stores/locale';
import { useLocale } from '@/components/LocaleProvider';
import { getTranslations, type TranslationKeys, type SupportedLocale } from '@/lib/i18n';

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? K extends string
          ? K
          : never
        : K extends string
          ? K
          : never;
    }[keyof T]
  : never;

export function useTranslation() {
  // Reading from context, writing to the store: the store's server snapshot is fixed at its
  // initial value (zustand v5), so it cannot be what the server renders from.
  const locale = useLocale();
  const { setLocale, toggleLocale } = useLocaleStore();
  const translations = getTranslations(locale);

  const t = <C extends keyof TranslationKeys>(
    category: C,
    key: keyof TranslationKeys[C]
  ): string => {
    const categoryTranslations = translations[category];
    if (!categoryTranslations) {
      return String(key);
    }
    const value = (categoryTranslations as Record<string, unknown>)[key as string];
    return typeof value === 'string' ? value : String(key);
  };

  return {
    t,
    locale,
    setLocale,
    toggleLocale,
  };
}

// Export types for convenience
export type { SupportedLocale, TranslationKeys };
