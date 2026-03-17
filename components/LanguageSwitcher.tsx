'use client';

import { useTranslation } from '@/hooks';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { locale, toggleLocale, isHydrated } = useTranslation();

  if (!isHydrated) {
    return (
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-[var(--bg-tertiary)]">
        <Globe className="w-4 h-4 text-[var(--text-muted)]" />
        <span className="text-xs font-medium text-[var(--text-muted)] w-6">--</span>
      </div>
    );
  }

  return (
    <button
      onClick={toggleLocale}
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
