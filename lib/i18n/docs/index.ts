import type { DocsContent } from './types';
import { docsEn } from './en';
import { docsTr } from './tr';

export function getDocsContent(locale: 'en' | 'tr'): DocsContent {
  return locale === 'tr' ? docsTr : docsEn;
}

export type { DocsContent, DocsSectionId } from './types';
