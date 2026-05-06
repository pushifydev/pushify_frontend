'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import type { ReactNode } from 'react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, lastUpdated = '3 Mayıs 2026', children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <LandingNavbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-12 pb-6 border-b border-[var(--glass-border)]">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Son güncelleme: {lastUpdated}
          </p>
        </header>

        <article className="legal-content space-y-6 text-[var(--text-secondary)] leading-relaxed">
          {children}
        </article>
      </main>

      <style jsx global>{`
        .legal-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .legal-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
        }
        .legal-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .legal-content ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .legal-content ul li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }
        .legal-content strong {
          color: var(--text-primary);
          font-weight: 600;
        }
        .legal-content a {
          color: var(--accent-cyan);
          text-decoration: underline;
        }
        .legal-content a:hover {
          color: var(--accent-cyan-dim);
        }
      `}</style>

      <LandingFooter />
    </div>
  );
}
