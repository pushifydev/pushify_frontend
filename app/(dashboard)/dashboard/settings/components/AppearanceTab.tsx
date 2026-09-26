'use client';

import { useQueryClient } from '@tanstack/react-query';
import { serverKeys } from '@/hooks/useServers';
import { Check } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useThemeStore, type Theme } from '@/stores/theme';
import { useLocaleStore } from '@/stores/locale';
import { useLocale } from '@/components/LocaleProvider';
import { type SupportedLocale } from '@/lib/i18n';
import { showSuccessToast } from '@/lib/toast-i18n';
import { SettingsField, SettingsSection } from '@/components/dashboard/SettingsParts';

const themes: { id: Theme; labelKey: 'light' | 'dark' | 'system' }[] = [
  { id: 'light', labelKey: 'light' },
  { id: 'dark', labelKey: 'dark' },
  { id: 'system', labelKey: 'system' },
];

const languages: { id: SupportedLocale; labelKey: 'english' | 'turkish' }[] = [
  { id: 'en', labelKey: 'english' },
  { id: 'tr', labelKey: 'turkish' },
];

const PREVIEW_COLORS = {
  dark: { bg: '#030303', panel: '#0a0a0a', line: '#27272a', accent: '#f4f4f5' },
  light: { bg: '#fafafa', panel: '#ffffff', line: '#e4e4e7', accent: '#09090b' },
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
  const locale = useLocale();
  const { setLocale } = useLocaleStore();
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
    <SettingsSection
      id="appearance"
      title={t('appearance', 'title')}
      description={t('appearance', 'description')}
    >
      {/* Theme — each option previews itself */}
      <SettingsField label={t('appearance', 'theme')} hint={t('appearance', 'themeDesc')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="group" aria-label={t('appearance', 'theme')}>
          {themes.map((themeOption) => {
            const isActive = theme === themeOption.id;
            return (
              <button
                key={themeOption.id}
                type="button"
                onClick={() => handleThemeChange(themeOption.id)}
                aria-pressed={isActive}
                className={`group relative rounded-[10px] border overflow-hidden text-left transition-colors ${
                  isActive
                    ? 'border-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                }`}
              >
                <div className="aspect-[16/10]" aria-hidden>
                  <ThemePreview theme={themeOption.id} />
                </div>
                <div className="flex items-center justify-between gap-2 px-3 h-9 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  <span
                    className={`text-[13px] ${
                      isActive ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {t('appearance', themeOption.labelKey)}
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 text-[var(--text-primary)]" aria-hidden />}
                </div>
              </button>
            );
          })}
        </div>
      </SettingsField>

      <SettingsField label={t('appearance', 'language')} hint={t('appearance', 'languageDesc')}>
        <div className="dash-segmented" role="group" aria-label={t('appearance', 'language')}>
          {languages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => handleLanguageChange(lang.id)}
              aria-pressed={locale === lang.id}
            >
              {t('appearance', lang.labelKey)}
            </button>
          ))}
        </div>
      </SettingsField>
    </SettingsSection>
  );
}
