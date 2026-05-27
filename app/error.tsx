'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { MarketingShell } from '@/components/landing';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <MarketingShell>
      <div className="lp-container flex flex-col items-center justify-center min-h-[60vh] text-center py-20">
        <div
          className="w-14 h-14 rounded-xl border flex items-center justify-center mb-6"
          style={{ borderColor: 'var(--lp-border)', color: 'var(--lp-ink)' }}
        >
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="lp-section-title mb-3">{t('errors', 'somethingWentWrong')}</h1>
        <p className="lp-lead max-w-sm">{t('errors', 'somethingWentWrongDesc')}</p>
        {error.digest && (
          <p className="mt-4 text-xs font-mono" style={{ color: 'var(--lp-muted)' }}>
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link href="/" className="lp-cta-ghost inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            {t('errors', 'goHome')}
          </Link>
          <button type="button" onClick={reset} className="lp-cta inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            {t('errors', 'tryAgain')}
          </button>
        </div>
      </div>
    </MarketingShell>
  );
}
