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
    <div className="lp-page hp min-h-screen flex flex-col overflow-x-clip">
      <LandingNavbar />
      <main className={noPad ? undefined : 'flex-1'}>{children}</main>
      <LandingFooter lit />
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
  const alignClass = align === 'center' ? 'text-center mx-auto max-w-4xl' : 'max-w-3xl';

  return (
    <header className={`lp-container hp-page-hero ${alignClass}`}>
      {label && <p className="lp-label mb-6">{label}</p>}
      <h1 className="lp-hero-title">{title}</h1>
      {description && <p className="lp-lead mt-6">{description}</p>}
    </header>
  );
}
