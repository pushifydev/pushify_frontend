'use client';

import { useLocaleStore } from '@/stores/locale';
import { getDocsContent, type DocsContent } from '@/lib/i18n/docs';

export function useDocsContent(): { content: DocsContent; locale: 'en' | 'tr' } {
  const locale = useLocaleStore((s) => s.locale);
  return { content: getDocsContent(locale), locale };
}
