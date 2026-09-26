'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import type { Server } from '@/lib/api';

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function estimateRunwayDays(walletCents: number, monthlyCents: number): number | null {
  if (monthlyCents <= 0 || walletCents <= 0) return null;
  const daily = monthlyCents / 30;
  if (daily <= 0) return null;
  return Math.floor(walletCents / daily);
}

interface ServerInfraBillingCardProps {
  server: Server;
}

export function ServerInfraBillingCard({ server }: ServerInfraBillingCardProps) {
  const { t } = useTranslation();
  const infra = server.infraBilling;

  if (!infra || !server.isManaged) return null;

  const needsTopUp = !infra.canStart && server.status === 'stopped';
  const runwayDays = estimateRunwayDays(infra.walletBalanceCents, infra.estimatedMonthlyCents);

  return (
    <section className="min-w-0" aria-labelledby="server-infra-billing-title">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <h2 id="server-infra-billing-title" className="dash-section-label">
          {t('servers', 'infraBillingTitle')}
        </h2>
        <Link href="/dashboard/billing" className="dash-link inline-flex items-center gap-1 shrink-0">
          {t('billing', 'title')}
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: t('servers', 'infraWalletBalance'), value: infra.walletBalanceCents },
          { label: t('servers', 'infraMonthlyCost'), value: infra.estimatedMonthlyCents },
          { label: t('servers', 'infraStartRequires'), value: infra.requiredStartCents },
        ].map((stat) => (
          <div key={stat.label} className="dash-stat-card p-4 min-w-0">
            <p className="text-xl font-medium tabular-nums tracking-[-0.02em] text-[var(--text-primary)]">
              {formatUsd(stat.value)}
            </p>
            <p className="dash-stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      {needsTopUp && (
        <p className="mt-3 text-[13px] flex items-center gap-2 text-[var(--text-secondary)]">
          <span className="dash-status-dot is-warning" aria-hidden />
          {t('servers', 'infraInsufficientForStart')}
        </p>
      )}

      {server.status === 'stopped' && infra.canStart && (
        <p className="mt-3 text-[13px] text-[var(--text-secondary)]">{t('servers', 'infraReadyToStart')}</p>
      )}

      {runwayDays !== null && (
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {t('servers', 'hubRunwayDays').replace('{days}', String(runwayDays))}
        </p>
      )}
    </section>
  );
}
