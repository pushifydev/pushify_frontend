'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MarketingShell } from '@/components/landing/MarketingShell';
import { useTranslation } from '@/hooks';
import type { ReactNode } from 'react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

const DOCS = [
  { href: '/terms', en: 'Terms', tr: 'Koşullar' },
  { href: '/privacy', en: 'Privacy', tr: 'Gizlilik' },
  { href: '/refund', en: 'Refunds', tr: 'İadeler' },
] as const;

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  const { locale } = useTranslation();
  const pathname = usePathname();
  const tr = locale === 'tr';
  const date = lastUpdated ?? (tr ? '3 Mayıs 2026' : 'May 3, 2026');
  const meta = 'hp-mono text-[11px] uppercase tracking-[0.1em]';

  return (
    <MarketingShell>
      <div className="lp-container max-w-3xl pt-32 md:pt-40 pb-20 md:pb-28">
        <header className="mb-12">
          <p className="lp-label mb-5">{tr ? 'Yasal' : 'Legal'}</p>
          <h1 className="lp-hero-title">{title}</h1>

          {/* The document's details, and the other legal documents beside it. */}
          <div
            className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-4 border-y"
            style={{ borderColor: 'var(--hp-line)' }}
          >
            <nav aria-label={tr ? 'Yasal belgeler' : 'Legal documents'} className="flex flex-wrap gap-x-5 gap-y-2">
              {DOCS.map((d) => {
                const active = pathname === d.href;
                return (
                  <Link
                    key={d.href}
                    href={d.href}
                    aria-current={active ? 'page' : undefined}
                    className={`${meta} underline-offset-4 hover:underline`}
                    style={{ color: active ? 'var(--hp-ink)' : 'var(--hp-muted)' }}
                  >
                    {tr ? d.tr : d.en}
                  </Link>
                );
              })}
            </nav>
            <p className={meta} style={{ color: 'var(--hp-muted)' }}>
              {tr ? 'Son güncelleme' : 'Last updated'}: <span style={{ color: 'var(--hp-body)' }}>{date}</span>
            </p>
          </div>
        </header>

        <article className="legal-content">{children}</article>
      </div>
    </MarketingShell>
  );
}
