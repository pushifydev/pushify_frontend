'use client';

import { Loader2, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { formatMessage } from '@/lib/i18n/format-message';
import Link from 'next/link';
import { useTranslation, useInfraBilling, useInfraTopUp } from '@/hooks';
import { cn } from '@/lib/utils';
import { SettingsField, SettingsSection } from '@/components/dashboard/SettingsParts';
import type { InfraWalletTransaction } from '@/lib/api';

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function InfraWalletSection({ id }: { id?: string }) {
  const { t, locale } = useTranslation();
  const { data, isLoading } = useInfraBilling();
  const topUp = useInfraTopUp();

  if (isLoading) {
    return (
      <div className="dash-card p-6 flex items-center justify-center" aria-busy>
        <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" aria-hidden />
      </div>
    );
  }

  if (!data) return null;

  const { wallet, transactions } = data;

  return (
    <SettingsSection
      id={id}
      title={t('billing', 'infraWalletTitle')}
      description={t('billing', 'infraTopUpHint')}
      action={
        <Link href="/dashboard/servers/new" className="btn btn-secondary btn-sm">
          {t('servers', 'newServer')}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {wallet.isLowBalance && (
        <div className="py-4">
          <div className="dash-callout dash-callout-attention">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--status-warning)]" aria-hidden />
            <div className="space-y-1 min-w-0">
              <p className="text-[13px] text-[var(--text-primary)]">
                {formatMessage(t('billing', 'infraLowBalanceWarning'), {
                  balance: wallet.balanceUsd,
                })}
              </p>
              {wallet.runwayDays != null && wallet.runwayDays > 0 && (
                <p className="text-xs text-[var(--text-muted)]">
                  {formatMessage(t('billing', 'infraRunwayDays'), {
                    days: String(wallet.runwayDays),
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <SettingsField label={t('billing', 'infraBalance')}>
        <p className="dash-stat-value md:pt-1">{wallet.balanceUsd}</p>
      </SettingsField>

      {(wallet.includedCreditMonthlyCents ?? 0) > 0 && (
        <SettingsField
          label={t('billing', 'infraIncludedCredit')}
          hint={
            wallet.includedCreditPeriodEnd
              ? formatMessage(t('billing', 'infraIncludedCreditResets'), {
                  date: new Date(wallet.includedCreditPeriodEnd).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                  }),
                })
              : t('billing', 'infraIncludedCreditHint')
          }
        >
          <p className="terminal-text text-[13px] text-[var(--text-primary)] tabular-nums md:pt-2">
            {formatMessage(t('billing', 'infraIncludedCreditValue'), {
              left: formatUsd(wallet.includedCreditCents ?? 0),
              total: formatUsd(wallet.includedCreditMonthlyCents ?? 0),
            })}
          </p>
        </SettingsField>
      )}

      <SettingsField
        label={t('billing', 'infraEstimatedBurn')}
        hint={t('billing', 'infraRunningServers').replace('{count}', String(wallet.runningManagedServers))}
      >
        <p className="terminal-text text-[13px] text-[var(--text-primary)] tabular-nums md:pt-2">
          {formatUsd(wallet.estimatedMonthlyBurnCents)}
          {t('billing', 'infraPerMonth')}
        </p>
      </SettingsField>

      <SettingsField label={t('billing', 'infraTopUp')}>
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
                  'btn btn-secondary min-w-[4.75rem] justify-center terminal-text tabular-nums',
                  topUp.isPending && !isAmountLoading && 'opacity-50',
                )}
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
          <p className="text-xs mt-2 flex items-center gap-2 text-[var(--text-secondary)]" role="status">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden />
            {t('billing', 'infraTopUpRedirecting')}
          </p>
        )}
      </SettingsField>

      {transactions.length > 0 && (
        <div className="border-t border-[var(--border-subtle)] py-4">
          <h4 className="dash-section-label mb-1">{t('billing', 'infraTransactions')}</h4>
          <ul className="max-h-52 overflow-y-auto pr-1">
            {transactions.map((tx: InfraWalletTransaction) => {
              // A server charge paid (partly) from included credit: the ledger amount is only the
              // wallet part, so show the whole charge and how much the credit covered.
              const fromIncluded = tx.metadata?.fromIncludedCents ?? 0;
              const charge = fromIncluded > 0 ? (tx.metadata?.chargeCents ?? fromIncluded - tx.amountCents) : null;
              const credit = charge === null && tx.amountCents >= 0;
              return (
                <li key={tx.id} className="dash-kv">
                  <span className="truncate text-[var(--text-secondary)]!">
                    {tx.description || tx.type}
                    {fromIncluded > 0 && (
                      <span className="text-[var(--text-muted)]">
                        {' · '}
                        {formatMessage(t('billing', 'infraFromIncludedCredit'), { amount: formatUsd(fromIncluded) })}
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums shrink-0" style={credit ? { color: 'var(--status-success)' } : undefined}>
                    {credit ? '+' : '−'}
                    {formatUsd(charge ?? Math.abs(tx.amountCents))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </SettingsSection>
  );
}
