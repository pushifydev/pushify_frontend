'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useDashboardOverview, useTranslation } from '@/hooks';
import { formatMessage } from '@/lib/i18n/format-message';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/Skeleton';
import { UsageAlerts } from './UsageAlerts';
import { OperationsPanel } from './OperationsPanel';

interface DashboardAttentionZoneProps {
  /** Show when the org already has servers or projects (past pure onboarding). */
  active: boolean;
}

export function DashboardAttentionZone({ active }: DashboardAttentionZoneProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useDashboardOverview();

  if (!active) return null;

  const hasUsage = (data?.usageWarnings.length ?? 0) > 0;
  const hasInfraAlert = !!data?.infraWallet?.isLowBalance;

  if (isLoading) {
    return (
      <section className="mb-5 sm:mb-6 min-w-0" aria-labelledby="dash-attention-heading">
        <h2 id="dash-attention-heading" className="dash-section-label mb-3">
          {t('dashboard', 'attentionZoneTitle')}
        </h2>
        <Skeleton className="h-40 sm:h-48 w-full rounded-xl" />
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="mb-5 sm:mb-6 min-w-0" aria-labelledby="dash-attention-heading">
      <h2 id="dash-attention-heading" className="dash-section-label mb-3">
        {t('dashboard', 'attentionZoneTitle')}
      </h2>
      {hasInfraAlert && data.infraWallet && (
        <div
          className="dash-panel p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3 border-[var(--status-warning)]/30"
          style={{ background: 'color-mix(in srgb, var(--status-warning) 8%, transparent)' }}
        >
          <div className="flex gap-3 min-w-0 flex-1">
            <AlertTriangle className="w-5 h-5 shrink-0 text-[var(--status-warning)]" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t('dashboard', 'infraLowBalanceTitle')}
              </p>
              <p className="text-xs mt-1 text-[var(--text-secondary)] leading-relaxed">
                {t('billing', 'infraLowBalanceWarning')}
                {data.infraWallet.runwayDays != null && data.infraWallet.runwayDays > 0 && (
                  <>
                    {' '}
                    {formatMessage(t('billing', 'infraRunwayDays'), {
                      days: data.infraWallet.runwayDays,
                    })}
                  </>
                )}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="btn btn-primary text-xs shrink-0 inline-flex items-center gap-1"
          >
            {t('billing', 'infraTopUp')}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div
        className={cn(
          'grid gap-4 items-start min-w-0',
          hasUsage ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1',
        )}
      >
        {hasUsage && (
          <UsageAlerts warnings={data.usageWarnings} className="min-w-0 lg:col-span-4" />
        )}
        <OperationsPanel
          data={data}
          className={cn('min-w-0', hasUsage ? 'lg:col-span-8' : 'w-full')}
        />
      </div>
    </section>
  );
}
