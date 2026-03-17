'use client';

import { useState } from 'react';
import { Palette, Globe, Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useThemeStore, type Theme } from '@/stores/theme';
import { useLocaleStore } from '@/stores/locale';
import { type SupportedLocale } from '@/lib/i18n';
import { AlertBox } from './Modal';

const themes: { id: Theme; icon: React.ElementType; labelKey: 'light' | 'dark' | 'system' }[] = [
  { id: 'light', icon: Sun, labelKey: 'light' },
  { id: 'dark', icon: Moon, labelKey: 'dark' },
  { id: 'system', icon: Monitor, labelKey: 'system' },
];

const languages: { id: SupportedLocale; labelKey: 'english' | 'turkish'; flag: string }[] = [
  { id: 'en', labelKey: 'english', flag: '🇺🇸' },
  { id: 'tr', labelKey: 'turkish', flag: '🇹🇷' },
];

export function AppearanceTab() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const { locale, setLocale } = useLocaleStore();
  const [saved, setSaved] = useState(false);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    showSaved();
  };

  const handleLanguageChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('appearance', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('appearance', 'description')}</p>
      </div>

      {saved && (
        <AlertBox variant="success" icon={<Check className="w-4 h-4" />}>
          {t('appearance', 'saved')}
        </AlertBox>
      )}

      {/* Theme Selection */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20">
              <Palette className="w-6 h-6 text-[var(--accent-cyan)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1">{t('appearance', 'theme')}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {t('appearance', 'themeDesc')}
              </p>

              <div className="grid grid-cols-3 gap-3 max-w-md">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isActive = theme === themeOption.id;
                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeChange(themeOption.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-[var(--accent-cyan)]" />
                        </div>
                      )}
                      <Icon
                        className={`w-6 h-6 ${isActive ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}
                      />
                      <span
                        className={`text-sm font-medium ${isActive ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}
                      >
                        {t('appearance', themeOption.labelKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Selection */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <Globe className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1">{t('appearance', 'language')}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {t('appearance', 'languageDesc')}
              </p>

              <div className="flex gap-3 max-w-md">
                {languages.map((lang) => {
                  const isActive = locale === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`relative flex items-center gap-3 px-5 py-3 rounded-xl border transition-all ${
                        isActive
                          ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-[var(--accent-cyan)]" />
                        </div>
                      )}
                      <span className="text-2xl">{lang.flag}</span>
                      <span
                        className={`font-medium ${isActive ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}
                      >
                        {t('appearance', lang.labelKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
