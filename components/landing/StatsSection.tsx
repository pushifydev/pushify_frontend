'use client';

import { useTranslation } from '@/hooks';

export function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    { num: '1.2k+', label: t('homepage', 'statsTrusted') },
    { num: '50k+', label: t('homepage', 'statsDeployed') },
    { num: '24+', label: t('homepage', 'statsApps') },
    { num: '99.9%', label: t('homepage', 'statsUptime') },
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
