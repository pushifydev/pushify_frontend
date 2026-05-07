'use client';

import { useTranslation } from '@/hooks';
import { Star, Rocket, Package, ShieldCheck } from 'lucide-react';

export function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    { value: '1.2k+', label: t('homepage', 'statsTrusted'), Icon: Star },
    { value: '50k+', label: t('homepage', 'statsDeployed'), Icon: Rocket },
    { value: '24+', label: t('homepage', 'statsApps'), Icon: Package },
    { value: '99.9%', label: t('homepage', 'statsUptime'), Icon: ShieldCheck },
  ];

  return (
    <section className="py-12 border-y border-[var(--glass-border)] bg-[var(--bg-secondary)]/40">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-8 terminal-text">
          {t('homepage', 'stats')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label, Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-primary)]/40 hover:border-[var(--accent-cyan)]/30 transition-colors"
            >
              <Icon className="w-5 h-5 text-[var(--accent-cyan)] mb-2" />
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {value}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
