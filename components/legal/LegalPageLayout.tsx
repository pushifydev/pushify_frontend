'use client';

import { MarketingShell } from '@/components/landing/MarketingShell';
import type { ReactNode } from 'react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, lastUpdated = '3 Mayıs 2026', children }: LegalPageLayoutProps) {
  return (
    <MarketingShell>
      <div className="lp-container max-w-3xl pt-12 md:pt-16 pb-20 md:pb-24">
        <header className="mb-12 pb-6 border-b" style={{ borderColor: 'var(--lp-border)' }}>
          <h1 className="lp-hero-title text-3xl md:text-4xl">{title}</h1>
          <p className="text-sm mt-3" style={{ color: 'var(--lp-muted)' }}>
            Son güncelleme: {lastUpdated}
          </p>
        </header>

        <article className="legal-content space-y-6 leading-relaxed">{children}</article>
      </div>
    </MarketingShell>
  );
}
