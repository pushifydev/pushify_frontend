'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useThemeStore } from '@/stores/theme';

export function AuthThemeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark =
    !mounted ||
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-center w-9 h-9 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
      title={isDark ? t('common', 'themeSwitchToLight') : t('common', 'themeSwitchToDark')}
      aria-label={t('common', 'toggleThemeAria')}
    >
      {mounted && (isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
    </button>
  );
}
