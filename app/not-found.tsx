'use client';

import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { MarketingShell } from '@/components/landing';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <MarketingShell>
      <div className="lp-container flex flex-col items-center justify-center min-h-[60vh] text-center py-20">
        <p className="text-[120px] sm:text-[160px] font-semibold leading-none tracking-tighter opacity-[0.08]" style={{ color: 'var(--lp-ink)' }}>
          404
        </p>
        <h1 className="lp-section-title -mt-16 sm:-mt-20 mb-3">{t('errors', 'pageNotFound')}</h1>
        <p className="lp-lead max-w-sm">{t('errors', 'pageNotFoundDesc')}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link href="/" className="lp-cta-ghost inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            {t('errors', 'goHome')}
          </Link>
          <Link href="/dashboard" className="lp-cta inline-flex items-center gap-2">
            {t('errors', 'goDashboard')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
