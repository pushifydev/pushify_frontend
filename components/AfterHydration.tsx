'use client';

import { useEffect } from 'react';
import { useLocaleStore, migrateLegacyLocale } from '@/stores/locale';
import { useThemeStore, applyTheme } from '@/stores/theme';

/**
 * Two bits of tidying that can only happen once React has hydrated.
 *
 * The language is no longer one of them: middleware.ts resolves it, the root layout renders the
 * page in it and seeds the store with the same value, so the first client render already matches.
 * What is left is carrying over a preference from before the language lived in a cookie, and
 * putting the theme class back if hydration had to regenerate the tree — React rewrites
 * <html class> from its own props, which never included the class the boot script added.
 */
export function AfterHydration() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    migrateLegacyLocale();
    applyTheme(useThemeStore.getState().theme);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
