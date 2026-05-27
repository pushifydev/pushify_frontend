'use client';

import Link from 'next/link';
import { ArrowRight, Menu, X, Github, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LogoMark } from '@/components/logo';
import { useThemeStore } from '@/stores/theme';

export function LandingNavbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark =
    !mounted ||
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const navLinks = [
    { href: '/features', label: t('landing', 'features') },
    { href: '/pricing', label: t('landing', 'pricing') },
    { href: '/open-source', label: t('landing', 'openSource') },
    { href: '/docs', label: t('branding', 'documentation'), external: true },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--lp-border)] bg-[var(--bg-primary)]/90 backdrop-blur-md">
      <div className="lp-container flex items-center justify-between h-14 md:h-16">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <LogoMark size={28} />
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--lp-ink)' }}>
            Pushify
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="px-3 py-2 text-sm font-medium rounded-md transition-colors"
              style={{ color: 'var(--lp-body)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--lp-ink)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--lp-body)';
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex items-center justify-center w-9 h-9 rounded-md transition-colors"
            style={{ color: 'var(--lp-muted)' }}
            title={isDark ? t('common', 'themeSwitchToLight') : t('common', 'themeSwitchToDark')}
            aria-label={t('common', 'toggleThemeAria')}
          >
            {mounted && (isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
          </button>
          <a
            href="https://github.com/pushifydev"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md transition-colors"
            style={{ color: 'var(--lp-muted)' }}
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium px-3 py-2 transition-colors"
            style={{ color: 'var(--lp-body)' }}
          >
            {t('auth', 'signIn')}
          </Link>
          <Link href="/register" className="lp-cta h-9 px-4 text-sm hidden sm:inline-flex">
            {t('auth', 'signUp')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md"
            style={{ color: 'var(--lp-ink)' }}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t border-[var(--lp-border)] px-6 py-4 space-y-1"
          style={{ background: 'var(--bg-primary)' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-sm font-medium"
              style={{ color: 'var(--lp-body)' }}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 mt-2 border-t border-[var(--lp-border)] flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">
              {t('auth', 'signIn')}
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="lp-cta w-full">
              {t('auth', 'signUp')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
