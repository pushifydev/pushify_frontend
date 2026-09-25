'use client';

import Link from 'next/link';
import { MarketingLink } from './MarketingLink';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X, Github, ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@/hooks';
import { useSignedIn } from '@/hooks/useSignedIn';
import { LogoMark } from '@/components/logo';

export function LandingNavbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const signedIn = useSignedIn();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    'flex items-center justify-center w-11 h-11 rounded-full transition-colors shrink-0';
  // Desktop icons are pointer targets; the drawer keeps the 44px touch size.
  const deskIconClass =
    'flex items-center justify-center w-9 h-9 rounded-full transition-colors shrink-0';
  // Monospace, uppercase, spaced: the navigation reads like labels on an instrument.
  const monoLink = 'uppercase tracking-[0.025em] text-[14px]';
  const monoButton = 'uppercase tracking-[0.1em] text-[13px]';
  const pill =
    'inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full border transition-colors whitespace-nowrap';

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]"
        style={{
          borderColor: scrolled ? 'var(--lp-border)' : 'transparent',
          background: scrolled ? 'color-mix(in srgb, var(--bg-primary) 72%, transparent)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px) saturate(1.4)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(14px) saturate(1.4)' : 'none',
        }}
      >
        {/* Wider than the page content (72rem on most pages), as on developer.x.com: the
            monospace labels need the room, in Turkish especially. */}
        <div className="mx-auto w-full max-w-[80rem] px-6">
          <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
            <LogoMark size={28} tone="page" />
            <span
              className="text-[15px] font-semibold tracking-tight truncate"
              style={{ color: 'var(--lp-ink)' }}
            >
              Pushify
            </span>
          </Link>

          {/* From 1280px only: the monospace labels are wide, and in Turkish they collided with the
              buttons at 1024px. Below that the menu button takes over. */}
          <nav className="hidden xl:flex items-center gap-1 min-w-0" aria-label="Main">
            {navLinks.map((link) => (
              <MarketingLink
                key={link.href}
                href={link.href}
                external={link.external}
                className={`px-2 py-2 rounded-md transition-colors whitespace-nowrap ${monoLink}`}
                style={{ color: 'var(--lp-muted)', fontFamily: 'var(--font-label)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--lp-ink)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--lp-muted)';
                }}
              >
                {link.label}
              </MarketingLink>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden xl:flex items-center gap-1 shrink-0">
            <a
              href="https://github.com/pushifydev"
              target="_blank"
              rel="noopener noreferrer"
              className={deskIconClass}
              style={{ color: 'var(--lp-muted)' }}
              aria-label={t('common', 'githubAria')}
            >
              <Github className="w-4 h-4" />
            </a>
            {signedIn ? (
              <Link
                href="/dashboard"
                className={`${pill} ${monoButton} ml-1`}
                style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)', borderColor: 'var(--lp-btn)', fontFamily: 'var(--font-label)' }}
              >
                {t('landing', 'openDashboard')}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${pill} ${monoButton} ml-1`}
                  style={{ color: 'var(--lp-ink)', borderColor: 'color-mix(in srgb, var(--lp-ink) 22%, transparent)', fontFamily: 'var(--font-label)' }}
                >
                  {t('auth', 'signIn')}
                </Link>
                <Link
                  href="/register"
                  className={`${pill} ${monoButton}`}
                  style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)', borderColor: 'var(--lp-btn)', fontFamily: 'var(--font-label)' }}
                >
                  {t('auth', 'signUp')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile: menu only */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className={`xl:hidden ${iconBtnClass}`}
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

      {/* Mobile menu: a full-screen sheet in the same language as the desktop bar — monospace
          labels between hairlines, pill buttons. It sits in the header's own row, so the logo
          and the close button land exactly where the logo and the menu button were. */}
      <div
        id="landing-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('common', 'menuTitle')}
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-[70] xl:hidden flex flex-col bg-[var(--bg-primary)] transition-opacity duration-200 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)] ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto w-full max-w-[80rem] px-6 shrink-0">
          <div className="flex items-center justify-between h-16 border-b border-[var(--lp-border)]">
            <Link href="/" onClick={closeMobile} className="flex items-center gap-2.5" tabIndex={mobileOpen ? 0 : -1}>
              <LogoMark size={28} tone="page" />
              <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--lp-ink)' }}>
                Pushify
              </span>
            </Link>
            <button
              type="button"
              onClick={closeMobile}
              className={iconBtnClass}
              style={{ color: 'var(--lp-ink)' }}
              aria-label={t('common', 'closeMenu')}
              tabIndex={mobileOpen ? 0 : -1}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto mx-auto w-full max-w-[80rem] px-6" aria-label="Main">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href} className="border-b border-[var(--lp-border)]">
                <MarketingLink
                  href={link.href}
                  external={link.external}
                  onClick={closeMobile}
                  tabIndex={mobileOpen ? 0 : -1}
                  className="flex items-center justify-between min-h-14 uppercase tracking-[0.08em] text-[15px] transition-colors"
                  style={{ color: 'var(--lp-ink)', fontFamily: 'var(--font-label)' }}
                >
                  <span>{link.label}</span>
                  {link.external ? (
                    <ExternalLink className="w-4 h-4 shrink-0" style={{ color: 'var(--lp-muted)' }} aria-hidden />
                  ) : (
                    <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--lp-muted)' }} aria-hidden />
                  )}
                </MarketingLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 mx-auto w-full max-w-[80rem] px-6 pt-4 pb-6 space-y-3">
          {signedIn ? (
            <Link
              href="/dashboard"
              onClick={closeMobile}
              tabIndex={mobileOpen ? 0 : -1}
              className={`${pill} ${monoButton} w-full h-12`}
              style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)', borderColor: 'var(--lp-btn)', fontFamily: 'var(--font-label)' }}
            >
              {t('landing', 'openDashboard')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={closeMobile}
                tabIndex={mobileOpen ? 0 : -1}
                className={`${pill} ${monoButton} w-full h-12`}
                style={{ color: 'var(--lp-ink)', borderColor: 'color-mix(in srgb, var(--lp-ink) 22%, transparent)', fontFamily: 'var(--font-label)' }}
              >
                {t('auth', 'signIn')}
              </Link>
              <Link
                href="/register"
                onClick={closeMobile}
                tabIndex={mobileOpen ? 0 : -1}
                className={`${pill} ${monoButton} w-full h-12`}
                style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)', borderColor: 'var(--lp-btn)', fontFamily: 'var(--font-label)' }}
              >
                {t('auth', 'signUp')}
              </Link>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-1">
            <a
              href="https://github.com/pushifydev"
              target="_blank"
              rel="noopener noreferrer"
              className={iconBtnClass}
              style={{ color: 'var(--lp-muted)' }}
              aria-label={t('common', 'githubAria')}
              tabIndex={mobileOpen ? 0 : -1}
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
