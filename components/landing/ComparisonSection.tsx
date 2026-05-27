'use client';

import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';
import { Check } from 'lucide-react';

type Cell = boolean | string;

export function ComparisonSection() {
  const { t } = useTranslation();

  const rows: { label: string; pushify: Cell; vercel: Cell; coolify: Cell }[] = [
    { label: t('homepage', 'rowSelfHost'), pushify: true, vercel: false, coolify: true },
    { label: t('homepage', 'rowOpenSource'), pushify: true, vercel: false, coolify: true },
    { label: t('homepage', 'rowMarketplace'), pushify: true, vercel: false, coolify: false },
    { label: t('homepage', 'rowDatabaseMgmt'), pushify: true, vercel: true, coolify: true },
    { label: t('homepage', 'rowOwnServers'), pushify: true, vercel: false, coolify: true },
    { label: t('homepage', 'rowAIAssistant'), pushify: true, vercel: false, coolify: false },
    { label: t('homepage', 'rowFreeTier'), pushify: true, vercel: true, coolify: true },
    {
      label: t('homepage', 'rowPricing'),
      pushify: t('homepage', 'pricingPushify'),
      vercel: t('homepage', 'pricingFromVercel'),
      coolify: t('homepage', 'pricingCoolify'),
    },
  ];

  const cellRender = (val: Cell, highlight: boolean) => {
    if (typeof val === 'string') {
      return (
        <span className="text-sm" style={{ color: highlight ? 'var(--lp-ink)' : 'var(--lp-body)' }}>
          {val}
        </span>
      );
    }
    return val ? (
      <Check className="w-5 h-5 mx-auto" style={{ color: highlight ? 'var(--lp-ink)' : 'var(--lp-muted)' }} strokeWidth={2} />
    ) : (
      <span className="text-[var(--lp-muted)] opacity-40">—</span>
    );
  };

  return (
    <section id="comparison" className="lp-section">
      <div className="lp-container">
        <LandingSectionHeader
          label={t('homepage', 'comparisonEyebrow')}
          title={
            <>
              {t('homepage', 'comparisonHeadline1')}{' '}
              {t('homepage', 'comparisonHeadline2a')}
              {t('homepage', 'comparisonHeadline2Em')}
              {t('homepage', 'comparisonHeadline2b')}
            </>
          }
          description={t('homepage', 'comparisonSubtitle')}
        />

        <div className="lp-card overflow-hidden">
          <div
            className="hidden md:grid grid-cols-4 gap-4 px-6 py-4 text-sm font-medium border-b border-[var(--lp-border)]"
            style={{ color: 'var(--lp-muted)', background: 'var(--bg-tertiary)' }}
          >
            <div>{t('homepage', 'comparisonColumnFeature')}</div>
            <div className="text-center" style={{ color: 'var(--lp-ink)' }}>
              {t('homepage', 'colPushify')}
            </div>
            <div className="text-center">{t('homepage', 'colVercel')}</div>
            <div className="text-center">{t('homepage', 'colCoolify')}</div>
          </div>

          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 px-6 py-4 border-b border-[var(--lp-border)] last:border-b-0"
            >
              <div className="text-sm font-medium md:font-normal" style={{ color: 'var(--lp-ink)' }}>
                {row.label}
              </div>
              <div className="flex md:justify-center items-center gap-2 md:block text-center">
                <span className="md:hidden text-xs" style={{ color: 'var(--lp-muted)' }}>
                  {t('homepage', 'colPushify')}
                </span>
                {cellRender(row.pushify, true)}
              </div>
              <div className="flex md:justify-center items-center gap-2 md:block text-center">
                <span className="md:hidden text-xs" style={{ color: 'var(--lp-muted)' }}>
                  {t('homepage', 'colVercel')}
                </span>
                {cellRender(row.vercel, false)}
              </div>
              <div className="flex md:justify-center items-center gap-2 md:block text-center">
                <span className="md:hidden text-xs" style={{ color: 'var(--lp-muted)' }}>
                  {t('homepage', 'colCoolify')}
                </span>
                {cellRender(row.coolify, false)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
