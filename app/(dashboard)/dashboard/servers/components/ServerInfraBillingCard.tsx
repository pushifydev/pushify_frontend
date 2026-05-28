'use client';

import Link from 'next/link';
import { Wallet, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks';
import type { Server } from '@/lib/api';

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface ServerInfraBillingCardProps {
  server: Server;
}

export function ServerInfraBillingCard({ server }: ServerInfraBillingCardProps) {
  const { t } = useTranslation();
  const infra = server.infraBilling;

  if (!infra || !server.isManaged) return null;

  const needsTopUp = !infra.canStart && server.status === 'stopped';

  return (
    <div className="dash-panel p-4 sm:p-5">
      <div className="dash-panel-header !mb-4">
        <div className="dash-panel-title">
          <Wallet className="w-4 h-4 text-[var(--text-secondary)]" />
          {t('servers', 'infraBillingTitle')}
        </div>
        <Link href="/dashboard/billing" className="dash-link flex items-center gap-1 shrink-0">
          {t('billing', 'title')}
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="dash-stat-mini">
          <p className="dash-stat-label">{t('servers', 'infraWalletBalance')}</p>
          <p className="dash-stat-mini-value mt-1">{formatUsd(infra.walletBalanceCents)}</p>
        </div>
        <div className="dash-stat-mini">
          <p className="dash-stat-label">{t('servers', 'infraMonthlyCost')}</p>
          <p className="dash-stat-mini-value mt-1">{formatUsd(infra.estimatedMonthlyCents)}</p>
        </div>
        <div className="dash-stat-mini">
          <p className="dash-stat-label">{t('servers', 'infraStartRequires')}</p>
          <p className="dash-stat-mini-value mt-1">{formatUsd(infra.requiredStartCents)}</p>
        </div>
      </div>

      {needsTopUp && (
        <p className="mt-4 text-sm flex items-start gap-2 text-[var(--text-secondary)]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
          {t('servers', 'infraInsufficientForStart')}
        </p>
      )}

      {server.status === 'stopped' && infra.canStart && (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">{t('servers', 'infraReadyToStart')}</p>
      )}
    </div>
  );
}
