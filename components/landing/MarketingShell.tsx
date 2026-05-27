'use client';

import type { ReactNode } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { LandingFooter } from './LandingFooter';

interface MarketingShellProps {
  children: ReactNode;
  /** Skip default top padding when page has its own hero */
  noPad?: boolean;
}

export function MarketingShell({ children, noPad }: MarketingShellProps) {
  return (
    <div className="lp-page min-h-screen flex flex-col">
      <LandingNavbar />
      <main className={noPad ? undefined : 'flex-1'}>{children}</main>
      <LandingFooter />
    </div>
  );
}

interface MarketingPageHeroProps {
  label?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
}

export function MarketingPageHero({
  label,
  title,
  description,
  align = 'center',
}: MarketingPageHeroProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl';

  return (
    <header className={`lp-container pt-12 md:pt-16 pb-12 md:pb-14 ${alignClass}`}>
      {label && <p className="lp-label mb-4">{label}</p>}
      <h1 className="lp-hero-title">{title}</h1>
      {description && <p className="lp-lead mt-5">{description}</p>}
    </header>
  );
}
