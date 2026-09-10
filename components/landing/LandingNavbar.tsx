'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X, Github, Sun, Moon, ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@/hooks';
import { useSignedIn } from '@/hooks/useSignedIn';
import { LogoMark } from '@/components/logo';
import { useThemeStore } from '@/stores/theme';

export function LandingNavbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const signedIn = useSignedIn();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark =
    !mounted ||
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, closeMobile]);

  const navLinks = [
    { href: '/features', label: t('landing', 'features'), external: false },
    { href: '/sites', label: t('landing', 'sites'), external: false },
    { href: '/domains', label: t('domainSales', 'title'), external: false },
    { href: '/pricing', label: t('landing', 'pricing'), external: false },
    { href: '/open-source', label: t('landing', 'openSource'), external: false },
    { href: '/docs', label: t('branding', 'documentation'), external: true },
  ];

  const iconBtnClass =
    'flex items-center justify-center w-11 h-11 rounded-md transition-colors shrink-0';

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 pt-3 supports-[padding:max(0px)]:pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        <div className="lp-container">
          <div className="lp-nav-capsule flex items-center justify-between h-14 rounded-full border backdrop-blur-md px-4 sm:px-5">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
            <LogoMark size={28} />
            <span
              className="text-[15px] font-semibold tracking-tight truncate"
              style={{ color: 'var(--lp-ink)' }}
            >
              Pushify
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
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

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={iconBtnClass}
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
              className={iconBtnClass}
              style={{ color: 'var(--lp-muted)' }}
              aria-label={t('common', 'githubAria')}
            >
              <Github className="w-4 h-4" />
            </a>
            {signedIn ? (
              <Link href="/dashboard" className="lp-cta h-9 px-4 text-sm inline-flex">
                {t('landing', 'openDashboard')}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-3 py-2 transition-colors"
                  style={{ color: 'var(--lp-body)' }}
                >
                  {t('auth', 'signIn')}
                </Link>
                <Link href="/register" className="lp-cta h-9 px-4 text-sm inline-flex">
                  {t('auth', 'signUp')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile: menu only */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className={`md:hidden ${iconBtnClass}`}
            style={{ color: 'var(--lp-ink)' }}
            aria-label={mobileOpen ? t('common', 'closeMenu') : t('common', 'openMenu')}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      <div
        role="presentation"
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-[60] md:hidden bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
      />

      {/* Mobile drawer panel */}
      <aside
        id="landing-mobile-menu"
        aria-hidden={!mobileOpen}
        className={`fixed top-0 right-0 z-[70] md:hidden flex flex-col w-[min(100vw,20rem)] max-w-full h-[100dvh] border-l border-[var(--lp-border)] bg-[var(--bg-primary)] shadow-2xl transition-transform duration-300 ease-out supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)] ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--lp-border)] shrink-0">
          <span className="text-sm font-semibold" style={{ color: 'var(--lp-ink)' }}>
            {t('common', 'menuTitle')}
          </span>
          <button
            type="button"
            onClick={closeMobile}
            className={iconBtnClass}
            style={{ color: 'var(--lp-ink)' }}
            aria-label={t('common', 'closeMenu')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-3" aria-label="Main">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  onClick={closeMobile}
                  className="flex items-center justify-between min-h-11 px-3 rounded-lg text-[15px] font-medium transition-colors active:bg-[var(--hover-overlay-md)]"
                  style={{ color: 'var(--lp-body)' }}
                >
                  <span>{link.label}</span>
                  {link.external && (
                    <ExternalLink className="w-4 h-4 shrink-0 opacity-50" aria-hidden />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 p-4 border-t border-[var(--lp-border)] space-y-3 bg-[var(--bg-primary)]">
          {signedIn ? (
            <Link href="/dashboard" onClick={closeMobile} className="lp-cta w-full min-h-11 text-[15px] inline-flex">
              {t('landing', 'openDashboard')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={closeMobile}
                className="flex items-center justify-center min-h-11 w-full text-sm font-medium rounded-lg border border-[var(--lp-border)] transition-colors active:bg-[var(--hover-overlay-md)]"
                style={{ color: 'var(--lp-ink)' }}
              >
                {t('auth', 'signIn')}
              </Link>
              <Link
                href="/register"
                onClick={closeMobile}
                className="lp-cta w-full min-h-11 text-[15px] inline-flex"
              >
                {t('auth', 'signUp')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={iconBtnClass}
                style={{ color: 'var(--lp-muted)' }}
                aria-label={t('common', 'toggleThemeAria')}
              >
                {mounted && (isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
              </button>
              <a
                href="https://github.com/pushifydev"
                target="_blank"
                rel="noopener noreferrer"
                className={iconBtnClass}
                style={{ color: 'var(--lp-muted)' }}
                aria-label={t('common', 'githubAria')}
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
