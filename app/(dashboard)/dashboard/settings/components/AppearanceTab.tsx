'use client';

import { useQueryClient } from '@tanstack/react-query';
import { serverKeys } from '@/hooks/useServers';
import { Check } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useThemeStore, type Theme } from '@/stores/theme';
import { useLocaleStore } from '@/stores/locale';
import { type SupportedLocale } from '@/lib/i18n';
import { showSuccessToast } from '@/lib/toast-i18n';
import { SettingsCard } from './SettingsCard';

const themes: { id: Theme; labelKey: 'light' | 'dark' | 'system' }[] = [
  { id: 'light', labelKey: 'light' },
  { id: 'dark', labelKey: 'dark' },
  { id: 'system', labelKey: 'system' },
];

const languages: { id: SupportedLocale; labelKey: 'english' | 'turkish'; flag: string }[] = [
  { id: 'en', labelKey: 'english', flag: '🇺🇸' },
  { id: 'tr', labelKey: 'turkish', flag: '🇹🇷' },
];

const PREVIEW_COLORS = {
  dark: { bg: '#0b0b10', panel: '#16161d', line: '#2b2b35', accent: '#6366f1' },
  light: { bg: '#f3f4f6', panel: '#ffffff', line: '#e5e7eb', accent: '#6366f1' },
};

/** Tiny dashboard mock rendered in the theme's own colors — the option shows itself. */
function ThemeMiniPreview({ mode }: { mode: 'light' | 'dark' }) {
  const c = PREVIEW_COLORS[mode];
  return (
    <div className="w-full h-full flex" style={{ background: c.bg }}>
      {/* sidebar */}
      <div className="w-[26%] h-full p-1.5 space-y-1" style={{ background: c.panel }}>
        <div className="h-1 rounded-full w-3/4" style={{ background: c.accent }} />
        <div className="h-1 rounded-full w-full" style={{ background: c.line }} />
        <div className="h-1 rounded-full w-2/3" style={{ background: c.line }} />
      </div>
      {/* content */}
      <div className="flex-1 p-1.5 space-y-1">
        <div className="h-1.5 rounded-full w-1/2" style={{ background: c.line }} />
        <div className="rounded-sm h-6" style={{ background: c.panel, border: `1px solid ${c.line}` }} />
        <div className="rounded-sm h-3" style={{ background: c.panel, border: `1px solid ${c.line}` }} />
      </div>
    </div>
  );
}

function ThemePreview({ theme }: { theme: Theme }) {
  if (theme === 'system') {
    // Half dark, half light — exactly what "system" means
    return (
      <div className="w-full h-full flex">
        <div className="w-1/2 h-full"><ThemeMiniPreview mode="dark" /></div>
        <div className="w-1/2 h-full"><ThemeMiniPreview mode="light" /></div>
      </div>
    );
  }
  return <ThemeMiniPreview mode={theme} />;
}

export function AppearanceTab() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const { locale, setLocale } = useLocaleStore();
  const queryClient = useQueryClient();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    showSuccessToast('preferencesSavedTitle', 'preferencesSavedDesc');
  };

  const handleLanguageChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    void queryClient.invalidateQueries({ queryKey: serverKeys.providers });
    showSuccessToast('preferencesSavedTitle', 'preferencesSavedDesc');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('appearance', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('appearance', 'description')}</p>
      </div>

      {/* Theme Selection — each option previews itself */}
      <SettingsCard title={t('appearance', 'theme')} description={t('appearance', 'themeDesc')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
          {themes.map((themeOption) => {
            const isActive = theme === themeOption.id;
            return (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                aria-pressed={isActive}
                className={`group relative rounded-xl border overflow-hidden text-left transition-colors ${
                  isActive
                    ? 'border-[var(--accent-cyan)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                }`}
              >
                <div className="aspect-[16/10]">
                  <ThemePreview theme={themeOption.id} />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  <span
                    className={`text-sm ${
                      isActive
                        ? 'font-medium text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {t('appearance', themeOption.labelKey)}
                  </span>
                  {isActive && (
                    <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-[var(--accent-cyan)]">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SettingsCard>

      {/* Language Selection */}
      <SettingsCard title={t('appearance', 'language')} description={t('appearance', 'languageDesc')}>
        <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
          {languages.map((lang) => {
            const isActive = locale === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                aria-pressed={isActive}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border flex-1 transition-colors ${
                  isActive
                    ? 'border-[var(--accent-cyan)] bg-[var(--bg-tertiary)]/40'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-tertiary)]/40'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span
                  className={`text-sm ${
                    isActive
                      ? 'font-medium text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {t('appearance', lang.labelKey)}
                </span>
                {isActive && (
                  <span className="ml-auto flex items-center justify-center w-4.5 h-4.5 rounded-full bg-[var(--accent-cyan)]">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}
