'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { MarketingShell } from '@/components/landing';

const copy = {
  en: { label: 'Error', home: 'Go home', retry: 'Try again', errorId: 'Error ID', none: 'none recorded', report: 'Send this ID to support@pushify.dev if it keeps happening.' },
  tr: { label: 'Hata', home: 'Ana sayfaya dön', retry: 'Tekrar dene', errorId: 'Hata kimliği', none: 'kaydedilmedi', report: 'Tekrarlarsa bu kimliği support@pushify.dev adresine gönderin.' },
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t, locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];

  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <MarketingShell noPad>
      <section className="lp-container hp-page-hero flex flex-col items-center justify-center min-h-[70vh] text-center">
        <p className="lp-label">{c.label}</p>
        <h1 className="lp-hero-title mt-6 max-w-3xl">{t('errors', 'somethingWentWrong')}</h1>
        <p className="lp-lead mt-6 max-w-md">{t('errors', 'somethingWentWrongDesc')}</p>

        {/* What support needs to find this error in the server logs. */}
        <div className="hp-card mt-10 text-left" style={{ width: '100%', maxWidth: '26rem' }}>
          <div className="hp-card-head">
            <span>
              <span className="hp-dot" data-tone="event" aria-hidden="true" />
              {c.errorId}
            </span>
          </div>
          <div className="px-4 py-3.5" style={{ color: 'var(--hp-body)' }}>
            <p className="break-all" style={{ color: error.digest ? 'var(--hp-ink)' : 'var(--hp-muted)' }}>
              {error.digest ?? c.none}
            </p>
            {error.digest && (
              <p className="mt-2 font-sans text-[13px] leading-relaxed" style={{ color: 'var(--hp-muted)' }}>
                {c.report}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          <Link href="/" className="lp-cta-ghost">
            {c.home}
          </Link>
          <button type="button" onClick={reset} className="lp-cta">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {c.retry}
          </button>
        </div>
      </section>
    </MarketingShell>
  );
}
