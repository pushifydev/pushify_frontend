'use client';

import { useTranslation } from '@/hooks';

type Cell = boolean | string;

export function ComparisonSection() {
  const { t } = useTranslation();

  const rows: { label: string; pushify: Cell; vercel: Cell; coolify: Cell }[] = [
    { label: t('homepage', 'rowSelfHost'),     pushify: true, vercel: false, coolify: true },
    { label: t('homepage', 'rowOpenSource'),   pushify: true, vercel: false, coolify: true },
    { label: t('homepage', 'rowMarketplace'),  pushify: true, vercel: false, coolify: false },
    { label: t('homepage', 'rowDatabaseMgmt'), pushify: true, vercel: true,  coolify: true },
    { label: t('homepage', 'rowOwnServers'),   pushify: true, vercel: false, coolify: true },
    { label: t('homepage', 'rowAIAssistant'),  pushify: true, vercel: false, coolify: false },
    { label: t('homepage', 'rowFreeTier'),     pushify: true, vercel: true,  coolify: true },
    {
      label: t('homepage', 'rowPricing'),
      pushify: t('homepage', 'pricingPushify'),
      vercel:  t('homepage', 'pricingFromVercel'),
      coolify: t('homepage', 'pricingCoolify'),
    },
  ];

  const cellRender = (val: Cell, highlight: boolean) => {
    if (typeof val === 'string') {
      return (
        <span
          className="lp-mono text-[12px] tracking-[0.04em]"
          style={{ color: highlight ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
        >
          {val}
        </span>
      );
    }
    return val ? (
      <span
        className="lp-editorial text-[28px] leading-none"
        style={{ color: highlight ? 'var(--accent-cyan)' : 'var(--text-primary)' }}
      >
        ✓
      </span>
    ) : (
      <span className="text-[18px] opacity-30">—</span>
    );
  };

  return (
    <section id="comparison" className="relative border-t border-[var(--glass-border)]">
      <div className="absolute right-2 md:right-10 top-10 lp-index select-none" aria-hidden>
        04
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        {/* Header */}
        <div className="grid grid-cols-12 gap-6 mb-14 md:mb-16">
          <div className="col-span-12 md:col-span-3 flex items-start gap-3">
            <span className="lp-crosshair mt-2" />
            <div className="lp-eyebrow">§&nbsp;04 / {t('homepage', 'comparisonEyebrow')}</div>
          </div>

          <h2 className="col-span-12 md:col-span-9 lp-editorial text-[40px] md:text-[72px] lg:text-[92px] leading-[0.98] tracking-[-0.025em]">
            <span className="block">{t('homepage', 'comparisonHeadline1')}</span>
            <span className="block">
              {t('homepage', 'comparisonHeadline2a')}
              <em>{t('homepage', 'comparisonHeadline2Em')}</em>
              {t('homepage', 'comparisonHeadline2b')}
            </span>
          </h2>

          <p className="col-span-12 md:col-start-4 md:col-span-7 text-[16px] md:text-[18px] leading-[1.55] text-[var(--text-muted)] max-w-[58ch]">
            {t('homepage', 'comparisonSubtitle')}
          </p>
        </div>

        {/* Spec table */}
        <div className="border-t border-[var(--glass-border-strong)]">
          {/* Header row */}
          <div className="grid grid-cols-12 items-end gap-4 py-5 border-b border-[var(--glass-border-strong)]">
            <div className="col-span-6 lp-mono text-[10px] uppercase tracking-[0.16em] opacity-50">
              {t('homepage', 'comparisonColumnFeature')}
            </div>
            <div className="col-span-2 text-center">
              <div className="lp-eyebrow text-[var(--accent-cyan)]" style={{ color: 'var(--accent-cyan)' }}>
                ◆ {t('homepage', 'colPushify')}
              </div>
            </div>
            <div className="col-span-2 text-center lp-mono text-[11px] uppercase tracking-[0.14em] opacity-70">
              {t('homepage', 'colVercel')}
            </div>
            <div className="col-span-2 text-center lp-mono text-[11px] uppercase tracking-[0.14em] opacity-70">
              {t('homepage', 'colCoolify')}
            </div>
          </div>

          {/* Rows */}
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-12 items-center gap-4 py-5 border-b border-[var(--glass-border)] transition-colors hover:bg-[rgba(99,102,241,0.05)]"
            >
              <div className="col-span-6 text-[14px] md:text-[15px] text-[var(--text-primary)] leading-[1.4]">
                {row.label}
              </div>
              <div className="col-span-2 flex justify-center items-center min-h-[28px]">
                {cellRender(row.pushify, true)}
              </div>
              <div className="col-span-2 flex justify-center items-center min-h-[28px]">
                {cellRender(row.vercel, false)}
              </div>
              <div className="col-span-2 flex justify-center items-center min-h-[28px]">
                {cellRender(row.coolify, false)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
