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

function StripLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5 text-[var(--text-muted)]">
      {children}
    </p>
  );
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
    <section className="dash-panel p-5 sm:p-6">
      <div className="dash-panel-header">
        <div className="dash-panel-title min-w-0">
          <Wallet className="w-4 h-4 shrink-0 text-[var(--text-secondary)]" />
          <span className="truncate">{t('billing', 'infraWalletTitle')}</span>
        </div>
        <Link href="/dashboard/servers/new" className="dash-link flex items-center gap-1 shrink-0">
          {t('servers', 'newServer')}
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {wallet.isLowBalance && (
        <div className="dash-callout dash-callout-attention mb-4">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--status-warning)' }} />
          <div className="space-y-1 min-w-0">
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
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

      {/* Balance ledger strip: balance · burn · top-up */}
      <div
        className="grid grid-cols-1 sm:grid-cols-[auto_auto_1fr] gap-4 sm:gap-0 rounded-lg p-4"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <div className="min-w-0 sm:pr-6">
          <StripLabel>{t('billing', 'infraBalance')}</StripLabel>
          <p
            className="text-[1.75rem] leading-none font-semibold tabular-nums"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
          >
            {wallet.balanceUsd}
          </p>
        </div>
        <div
          className="min-w-0 sm:px-6 sm:border-l border-t sm:border-t-0 pt-4 sm:pt-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <StripLabel>{t('billing', 'infraEstimatedBurn')}</StripLabel>
          <p
            className="text-sm font-medium tabular-nums"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
          >
            {formatUsd(wallet.estimatedMonthlyBurnCents)}
            {t('billing', 'infraPerMonth')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('billing', 'infraRunningServers').replace('{count}', String(wallet.runningManagedServers))}
          </p>
        </div>
        <div
          className="min-w-0 sm:pl-6 sm:border-l border-t sm:border-t-0 pt-4 sm:pt-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <StripLabel>{t('billing', 'infraTopUpHint')}</StripLabel>
          <div className="flex flex-wrap gap-2">
            {wallet.topUpAmountsCents.map((amount: number) => {
              const isAmountLoading = topUp.isPending && topUp.variables === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  disabled={topUp.isPending}
                  aria-busy={isAmountLoading}
                  onClick={() => topUp.mutate(amount)}
                  className={cn(
                    'inline-flex items-center justify-center gap-1.5 min-w-[4.25rem] px-3 py-1.5 rounded-md text-sm font-medium tabular-nums transition-colors',
                    topUp.isPending && !isAmountLoading && 'opacity-50',
                  )}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {isAmountLoading ? (
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
              className="text-xs mt-2 flex items-center gap-2"
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
        <div className="dash-subpanel">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2 text-[var(--text-muted)]">
            {t('billing', 'infraTransactions')}
          </p>
          <ul className="max-h-48 overflow-y-auto divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {transactions.map((tx: InfraWalletTransaction) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-3 text-sm py-2"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <span className="truncate" style={{ color: 'var(--text-secondary)' }}>
                  {tx.description || tx.type}
                </span>
                <span
                  className="tabular-nums shrink-0"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: tx.amountCents >= 0 ? 'var(--accent-green)' : 'var(--text-primary)',
                  }}
                >
                  {tx.amountCents >= 0 ? '+' : '−'}
                  {formatUsd(Math.abs(tx.amountCents))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
