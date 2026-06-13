'use client';

import { useTranslation } from '@/hooks';

export function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    { num: '100%', label: t('homepage', 'statsTrusted') },
    { num: '24+', label: t('homepage', 'statsApps') },
    { num: '<60s', label: t('homepage', 'statsDeployed') },
    { num: '0', label: t('homepage', 'statsUptime') },
  ];

  return (
    <section className="lp-section py-16 md:py-20 border-t-0">
      <div className="lp-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="lp-stat-value">{s.num}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
