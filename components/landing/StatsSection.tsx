'use client';

import { useTranslation } from '@/hooks';
import { Reveal } from './Reveal';

export function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    { num: '100%', label: t('homepage', 'statsTrusted') },
    { num: '24+', label: t('homepage', 'statsApps') },
    { num: '<60s', label: t('homepage', 'statsDeployed') },
    { num: '0', label: t('homepage', 'statsUptime') },
  ];

  // 2×2 on mobile, one divided strip on md+
  const cellBorders = [
    '',
    'border-l',
    'max-md:border-t md:border-l',
    'border-l max-md:border-t',
  ];

  return (
    <section className="lp-section py-14 md:py-16 border-t-0">
      <div className="lp-container">
        <Reveal>
          <div className="lp-card overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`px-6 py-6 md:py-7 text-center border-[var(--lp-border)] ${cellBorders[i]}`}
                >
                  <div className="lp-stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {s.num}
                  </div>
                  <div className="lp-stat-label mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
