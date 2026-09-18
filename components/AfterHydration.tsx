'use client';

import { useEffect } from 'react';
import { useLocaleStore } from '@/stores/locale';
import { useThemeStore, applyTheme } from '@/stores/theme';
import { markHydrated } from '@/lib/i18n';

/**
 * Runs once React has hydrated the page, then keeps two <html> attributes in sync.
 *
 * - Locale: the first client render is forced to the default dictionary so it matches the
 *   server HTML; only now may the real locale show (see `markHydrated` in lib/i18n).
 * - Theme: the boot script in app/layout.tsx adds `light`/`dark` to <html> before React runs.
 *   If hydration ever has to regenerate the tree, React rewrites <html class> from its own
 *   props, which never included that class — so re-apply it here.
 */
export function AfterHydration() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    markHydrated();
    // Re-render translated UI now that the real locale may be shown.
    useLocaleStore.setState((s) => ({ dictVersion: s.dictVersion + 1 }));
    applyTheme(useThemeStore.getState().theme);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'tr' ? 'tr' : 'en';
  }, [locale]);

  return null;
}
