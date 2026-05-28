import { t as translate, type TranslationKeys } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/get-request-locale';

/** Translate using the current UI locale (outside React components). */
export function appT<C extends keyof TranslationKeys>(
  category: C,
  key: keyof TranslationKeys[C],
): string {
  return translate(getRequestLocale(), category, key);
}
