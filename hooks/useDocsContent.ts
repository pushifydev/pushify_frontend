'use client';

import { useLocale } from '@/components/LocaleProvider';
import { getDocsContent, type DocsContent } from '@/lib/i18n/docs';

export function useDocsContent(): { content: DocsContent; locale: 'en' | 'tr' } {
  const locale = useLocale();
  return { content: getDocsContent(locale), locale };
}
