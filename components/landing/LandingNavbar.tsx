'use client';

import Link from 'next/link';
import { ArrowRight, Menu, X, Github } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LogoMark } from '@/components/logo';

export function LandingNavbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/features', label: t('landing', 'features') },
    { href: '/pricing', label: t('landing', 'pricing') },
    { href: '/open-source', label: t('landing', 'openSource') },
    { href: '/docs', label: t('branding', 'documentation'), external: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <div className="w-full max-w-7xl flex items-center justify-between h-14 px-5 rounded-2xl bg-[var(--bg-secondary)]/85 backdrop-blur-2xl border border-[var(--glass-border-md)] shadow-lg shadow-black/5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <LogoMark size={30} className="group-hover:scale-110 transition-transform duration-200" />
          <span className="text-[15px] font-bold tracking-tight hidden sm:block">Pushify</span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="px-3.5 py-1.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--hover-overlay-md)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <a
            href="https://github.com/pushifydev"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay-md)] transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
          <Link
            href="/login"
            className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block px-3 py-1.5 rounded-lg hover:bg-[var(--hover-overlay-md)]"
          >
            {t('auth', 'signIn')}
          </Link>
          <Link href="/register" className="btn btn-primary h-8 px-3.5 text-[13px] rounded-xl">
            {t('auth', 'signUp')}
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-[var(--hover-overlay-md)]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[4.5rem] left-4 right-4 bg-[var(--bg-secondary)] border border-[var(--glass-border-md)] rounded-2xl shadow-xl shadow-black/10 px-5 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay-md)] rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-[var(--glass-divider)] my-2" />
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="block py-2.5 px-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg"
          >
            {t('auth', 'signIn')}
          </Link>
        </div>
      )}
    </nav>
  );
}
