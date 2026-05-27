'use client';

import { useEffect } from 'react';
import { useLocaleStore } from '@/stores/locale';

/** Syncs document lang with UI locale (accessibility + light SEO signal). */
export function LocaleHtmlLang() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale === 'tr' ? 'tr' : 'en';
  }, [locale]);

  return null;
}
