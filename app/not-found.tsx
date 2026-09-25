'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { MarketingShell } from '@/components/landing';

const copy = {
  en: { home: 'Go home', dashboard: 'Open dashboard', request: 'Request', status: 'Not found' },
  tr: { home: 'Ana sayfaya dön', dashboard: 'Panele git', request: 'İstek', status: 'Bulunamadı' },
};

export default function NotFound() {
  const { t, locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const pathname = usePathname() || '/';

  return (
    <MarketingShell noPad>
      <section className="lp-container hp-page-hero flex flex-col items-center justify-center min-h-[70vh] text-center">
        <p className="lp-label">404</p>
        <h1 className="lp-hero-title mt-6 max-w-3xl">{t('errors', 'pageNotFound')}</h1>
        <p className="lp-lead mt-6 max-w-md">{t('errors', 'pageNotFoundDesc')}</p>

        {/* The request that missed, as the proxy would log it. */}
        <div className="hp-card mt-10 text-left" style={{ width: '100%', maxWidth: '26rem' }}>
          <div className="hp-card-head">
            <span>
              <span className="hp-dot" data-tone="event" aria-hidden="true" />
              {c.request}
            </span>
            <span>HTTP 404</span>
          </div>
          <div className="px-4 py-3.5" style={{ color: 'var(--hp-body)' }}>
            <p className="truncate">
              <span style={{ color: 'var(--hp-ink)' }}>GET</span> {pathname}
            </p>
            <p>
              <span style={{ color: 'var(--hp-muted)' }}>&larr;</span> 404 {c.status}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          <Link href="/" className="lp-cta-ghost">
            {c.home}
          </Link>
          <Link href="/dashboard" className="lp-cta group">
            {c.dashboard}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
