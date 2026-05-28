'use client';

import { useDashboardOverview, useTranslation } from '@/hooks';
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
