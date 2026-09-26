'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks';
import { useBillingInfo } from '@/hooks';

const COPY = {
  en: { plan: 'Current plan', redirect: 'Back to billing in {n}s', go: 'Go to billing' },
  tr: { plan: 'Mevcut plan', redirect: '{n} sn içinde faturalandırmaya dönülüyor', go: 'Faturalandırmaya git' },
};

export default function BillingSuccessPage() {
  const { t, locale } = useTranslation();
  const copy = COPY[locale === 'tr' ? 'tr' : 'en'];
  const router = useRouter();
  const { data: billingInfo, refetch } = useBillingInfo();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.push('/dashboard/billing');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="dash-page max-w-xl min-w-0 flex items-center min-h-[60vh] animate-slide-in">
      <div className="dash-empty w-full" role="status">
        <span className="dash-eyebrow inline-flex items-center gap-2">{t('billing', 'title')}</span>
        <span className="dash-status-dot is-success w-2! h-2! mb-4" aria-hidden />
        <h1 className="dash-empty-title text-[1.375rem]!">
          {t('billing', 'paymentSuccess') || 'Payment successful'}
        </h1>
        <p className="dash-empty-text">
          {t('billing', 'planUpgraded') || 'Your plan has been upgraded.'}
        </p>

        {billingInfo && (
          <div className="dash-card w-full max-w-xs mt-6 px-4 py-1.5 text-left">
            <div className="dash-kv">
              <span>{copy.plan}</span>
              <span className="uppercase">{billingInfo.planName}</span>
            </div>
          </div>
        )}

        <div className="dash-empty-action flex flex-col items-center gap-3">
          <button type="button" onClick={() => router.push('/dashboard/billing')} className="btn btn-primary">
            {copy.go}
          </button>
          <p className="terminal-text text-[11px] text-[var(--text-muted)] tabular-nums" aria-live="polite">
            {copy.redirect.replace('{n}', String(countdown))}
          </p>
        </div>
      </div>
    </div>
  );
}
