'use client';

import { useLocaleStore } from '@/stores/locale';
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
  const { locale, setLocale, toggleLocale, isHydrated } = useLocaleStore();
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
    isHydrated,
  };
}

// Export types for convenience
export type { SupportedLocale, TranslationKeys };
