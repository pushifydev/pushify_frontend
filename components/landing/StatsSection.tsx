'use client';

import { useTranslation } from '@/hooks';

export function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    { num: '1.2k', sup: '+', label: t('homepage', 'statsTrusted') },
    { num: '50k',  sup: '+', label: t('homepage', 'statsDeployed') },
    { num: '24',   sup: '+', label: t('homepage', 'statsApps') },
    { num: '99.9', sup: '%', label: t('homepage', 'statsUptime') },
  ];

  return (
    <section className="relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-3">
            <span className="lp-crosshair" />
            <span className="lp-eyebrow">By the numbers</span>
          </div>
          <div className="lp-eyebrow opacity-60 hidden sm:block">
            {t('homepage', 'stats')}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`relative px-0 md:px-8 py-6 ${
                i > 0 ? 'md:border-l md:border-[var(--glass-border)]' : ''
              }`}
            >
              <div className="lp-editorial leading-[0.9] flex items-start text-[var(--text-primary)]">
                <span className="text-[64px] md:text-[88px] lg:text-[104px] tabular-nums">
                  {s.num}
                </span>
                <span className="lp-editorial text-2xl md:text-3xl mt-2 md:mt-3 ml-1 text-[var(--accent-cyan)]">
                  {s.sup}
                </span>
              </div>
              <div className="mt-3 lp-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
