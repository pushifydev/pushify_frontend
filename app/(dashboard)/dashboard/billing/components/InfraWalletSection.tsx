'use client';

import { Wallet, Loader2, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { formatMessage } from '@/lib/i18n/format-message';
import Link from 'next/link';
import { useTranslation, useInfraBilling, useInfraTopUp } from '@/hooks';
import { cn } from '@/lib/utils';
import type { InfraWalletTransaction } from '@/lib/api';

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function InfraWalletSection() {
  const { t } = useTranslation();
  const { data, isLoading } = useInfraBilling();
  const topUp = useInfraTopUp();

  if (isLoading) {
    return (
      <div className="dash-panel p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  if (!data) return null;

  const { wallet, transactions } = data;

  return (
    <div className="dash-panel p-4 sm:p-6 space-y-5">
      {wallet.isLowBalance && (
        <div
          className="rounded-lg p-3 flex gap-2 items-start text-sm"
          style={{
            background: 'color-mix(in srgb, var(--status-warning) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--status-warning) 35%, transparent)',
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--status-warning)' }} />
          <div className="space-y-1">
            <p style={{ color: 'var(--text-primary)' }}>
              {formatMessage(t('billing', 'infraLowBalanceWarning'), {
                balance: wallet.balanceUsd,
              })}
            </p>
            {wallet.runwayDays != null && wallet.runwayDays > 0 && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatMessage(t('billing', 'infraRunwayDays'), {
                  days: String(wallet.runwayDays),
                })}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--dash-accent-bg)' }}
        >
          <Wallet className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('billing', 'infraWalletTitle')}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('billing', 'infraWalletDesc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)' }}>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
            {t('billing', 'infraBalance')}
          </p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {wallet.balanceUsd}
          </p>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)' }}>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
            {t('billing', 'infraEstimatedBurn')}
          </p>
          <p className="text-lg font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {formatUsd(wallet.estimatedMonthlyBurnCents)}
            {t('billing', 'infraPerMonth')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('billing', 'infraRunningServers').replace('{count}', String(wallet.runningManagedServers))}
          </p>
        </div>
        <div
          className={cn(
            'rounded-lg p-4 flex flex-col justify-between relative',
            topUp.isPending && 'pointer-events-none',
          )}
          style={{ background: 'var(--bg-tertiary)' }}
        >
          {topUp.isPending && (
            <div
              className="absolute inset-0 rounded-lg flex items-center justify-center z-10"
              style={{ background: 'color-mix(in srgb, var(--bg-tertiary) 88%, transparent)' }}
              aria-hidden
            />
          )}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('billing', 'infraTopUpHint')}
          </p>
          <div className="flex flex-wrap gap-2 mt-3 relative z-[1]">
            {wallet.topUpAmountsCents.map((amount: number) => {
              const isLoading = topUp.isPending && topUp.variables === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  disabled={topUp.isPending}
                  aria-busy={isLoading}
                  onClick={() => topUp.mutate(amount)}
                  className={cn(
                    'inline-flex items-center justify-center gap-1.5 min-w-[4.5rem] px-3 py-1.5 rounded-md text-sm font-medium transition-opacity',
                    topUp.isPending && !isLoading && 'opacity-50',
                  )}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  ) : (
                    <>+{formatUsd(amount)}</>
                  )}
                </button>
              );
            })}
          </div>
          {topUp.isPending && (
            <p
              className="text-xs mt-3 flex items-center gap-2 relative z-[1]"
              style={{ color: 'var(--text-secondary)' }}
              role="status"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden />
              {t('billing', 'infraTopUpRedirecting')}
            </p>
          )}
        </div>
      </div>

      {transactions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('billing', 'infraTransactions')}
          </h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {transactions.map((tx: InfraWalletTransaction) => (
              <li
                key={tx.id}
                className="flex items-center justify-between text-sm py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{tx.description || tx.type}</span>
                <span
                  className="font-mono tabular-nums"
                  style={{ color: tx.amountCents >= 0 ? 'var(--accent-green)' : 'var(--text-primary)' }}
                >
                  {tx.amountCents >= 0 ? '+' : ''}
                  {formatUsd(Math.abs(tx.amountCents))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/dashboard/servers/new"
        className="inline-flex items-center gap-1 text-sm font-medium"
        style={{ color: 'var(--accent-cyan)' }}
      >
        {t('servers', 'newServer')}
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
