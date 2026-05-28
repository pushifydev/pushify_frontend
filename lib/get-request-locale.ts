import { useLocaleStore } from '@/stores/locale';
import type { SupportedLocale } from '@/lib/i18n';

/** Locale for API `Accept-Language` — matches dashboard language, not browser default. */
export function getRequestLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  return useLocaleStore.getState().locale;
}
