'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks';
import { serverKeys } from '@/hooks/useServers';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { locale, toggleLocale } = useTranslation();
  const queryClient = useQueryClient();

  // No placeholder while the locale settles: the server renders the visitor's language, so it is
  // already the right one on the first paint.
  return (
    <button
      onClick={() => {
        void queryClient.invalidateQueries({ queryKey: serverKeys.providers });
        toggleLocale();
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
      title={locale === 'en' ? 'Türkçe\'ye geç' : 'Switch to English'}
    >
      <Globe className="w-4 h-4 text-[var(--text-muted)]" />
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {locale}
      </span>
    </button>
  );
}
