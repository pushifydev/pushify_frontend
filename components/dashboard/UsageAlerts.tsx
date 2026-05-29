'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import type { UsageWarning, UsageWarningKey } from '@/lib/api/services/dashboard.service';

const usageLabelKeys: Record<
  UsageWarningKey,
  | 'usageResourceServers'
  | 'usageResourceDatabases'
  | 'usageResourceProjects'
  | 'usageResourceDeployments'
  | 'usageResourceTeamMembers'
  | 'usageResourceCustomDomains'
  | 'usageResourceBuildMinutes'
  | 'usageResourceStorage'
  | 'usageResourceBandwidth'
> = {
  servers: 'usageResourceServers',
  databases: 'usageResourceDatabases',
  projects: 'usageResourceProjects',
  deploymentsThisMonth: 'usageResourceDeployments',
  teamMembers: 'usageResourceTeamMembers',
  customDomains: 'usageResourceCustomDomains',
  buildMinutesThisMonth: 'usageResourceBuildMinutes',
  storageGb: 'usageResourceStorage',
  bandwidthGb: 'usageResourceBandwidth',
};

function usageFillLevel(percent: number): 'is-critical' | 'is-warning' | 'is-low' {
  if (percent >= 95) return 'is-critical';
  if (percent >= 80) return 'is-warning';
  return 'is-low';
}

interface UsageAlertsProps {
  warnings: UsageWarning[];
  className?: string;
}

export function UsageAlerts({ warnings, className }: UsageAlertsProps) {
  const { t } = useTranslation();

  if (!warnings.length) return null;

  const sorted = [...warnings].sort((a, b) => b.percent - a.percent);

  return (
    <aside
      className={cn('dash-panel dash-callout-attention p-4 sm:p-5 h-full min-w-0', className)}
      aria-labelledby="dash-usage-alerts-title"
    >
      <div className="dash-panel-header !mb-3">
        <div className="dash-panel-title" id="dash-usage-alerts-title">
          <AlertTriangle className="w-4 h-4 text-[var(--text-secondary)]" />
          <span>{t('dashboard', 'usageAlertsTitle')}</span>
        </div>
        <Link href="/dashboard/billing/plans" className="dash-link flex items-center gap-1 shrink-0">
          {t('dashboard', 'usageAlertsUpgrade')}
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <p className="text-xs leading-relaxed text-[var(--text-muted)] mb-4">
        {t('dashboard', 'usageAlertsDesc')}
      </p>

      <ul className="space-y-3.5">
        {sorted.map((w) => (
          <li key={w.key}>
            <div className="flex justify-between gap-2 mb-1.5">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {t('dashboard', usageLabelKeys[w.key])}
              </span>
              <span className="dash-mono-caption text-[var(--text-secondary)] tabular-nums">
                {w.used}/{w.limit}
              </span>
            </div>
            <div className="dash-metric-track">
              <div
                className={cn('dash-metric-fill bar-grow', usageFillLevel(w.percent))}
                style={{ width: `${Math.min(w.percent, 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <Link
        href="/dashboard/billing"
        className="dash-link mt-4 inline-flex items-center gap-1 text-xs"
      >
        {t('billing', 'title')}
        <ArrowUpRight className="w-3 h-3" />
      </Link>
    </aside>
  );
}
