'use client';

import { useTranslation } from '@/hooks';
import { Check, X, Scale } from 'lucide-react';

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

  const renderCell = (val: Cell, isHighlight: boolean) => {
    if (typeof val === 'string') {
      return (
        <span className={`text-sm font-semibold ${isHighlight ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}>
          {val}
        </span>
      );
    }
    return val ? (
      <Check className={`w-5 h-5 mx-auto ${isHighlight ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`} strokeWidth={2.5} />
    ) : (
      <X className="w-5 h-5 mx-auto text-[var(--text-muted)]/40" strokeWidth={2} />
    );
  };

  return (
    <section id="comparison" className="relative py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20 mb-5">
            <Scale className="w-3.5 h-3.5 text-[var(--accent-green)]" />
            <span className="text-xs text-[var(--accent-green)] terminal-text uppercase tracking-wider">
              {t('homepage', 'comparisonEyebrow')}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t('homepage', 'comparisonTitle')}
          </h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            {t('homepage', 'comparisonSubtitle')}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 px-4 md:px-6 py-4 border-b border-[var(--glass-border)] bg-[var(--bg-primary)]/50">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Feature
            </div>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
                <span className="text-xs font-bold text-[var(--accent-cyan)]">
                  {t('homepage', 'colPushify')}
                </span>
              </span>
            </div>
            <div className="text-center text-xs font-semibold text-[var(--text-secondary)]">
              {t('homepage', 'colVercel')}
            </div>
            <div className="text-center text-xs font-semibold text-[var(--text-secondary)]">
              {t('homepage', 'colCoolify')}
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-4 items-center px-4 md:px-6 py-4 ${
                i % 2 === 0 ? '' : 'bg-[var(--bg-primary)]/30'
              } ${i < rows.length - 1 ? 'border-b border-[var(--glass-divider)]' : ''}`}
            >
              <div className="text-sm text-[var(--text-secondary)] font-medium pr-2">
                {row.label}
              </div>
              <div className="text-center">{renderCell(row.pushify, true)}</div>
              <div className="text-center">{renderCell(row.vercel, false)}</div>
              <div className="text-center">{renderCell(row.coolify, false)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
