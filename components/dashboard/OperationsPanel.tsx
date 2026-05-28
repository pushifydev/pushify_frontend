'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowUpRight, ListChecks } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/formatters';
import type {
  ActionSeverity,
  DashboardOverview,
} from '@/lib/api/services/dashboard.service';

const severityDotClass: Record<ActionSeverity, string> = {
  critical: 'is-error',
  warning: 'is-warning',
  info: '',
};

interface OperationsPanelProps {
  data: DashboardOverview;
  className?: string;
}

export function OperationsPanel({ data, className }: OperationsPanelProps) {
  const { t } = useTranslation();

  const { deployments, actionItems, recentFailures } = data;
  const hasFailures = recentFailures.length > 0;
  const hasFailedCount = deployments.failed > 0 || deployments.failedLast24h > 0;
  const allClear =
    actionItems.length === 0 && !hasFailedCount && !hasFailures;

  const deployStats: {
    key: string;
    label: string;
    value: number;
    critical?: boolean;
  }[] = [
    {
      key: 'running',
      label: t('dashboard', 'opsRunning'),
      value: deployments.running,
    },
    {
      key: 'inProgress',
      label: t('dashboard', 'opsInProgress'),
      value: deployments.inProgress,
    },
    {
      key: 'failed24h',
      label: t('dashboard', 'opsFailed24h'),
      value: deployments.failedLast24h,
      critical: deployments.failedLast24h > 0,
    },
    {
      key: 'failedTotal',
      label: t('dashboard', 'opsFailedTotal'),
      value: deployments.failed,
      critical: deployments.failed > 0,
    },
  ];

  return (
    <div className={cn('dash-panel p-4 sm:p-5 min-w-0', className)} aria-labelledby="dash-ops-title">
      <div className="dash-panel-header">
        <div className="dash-panel-title" id="dash-ops-title">
          <ListChecks className="w-4 h-4 text-[var(--text-secondary)]" />
          {t('dashboard', 'opsPanelTitle')}
        </div>
        <Link href="/dashboard/activity" className="dash-link flex items-center gap-1">
          {t('navigation', 'activity')}
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-4 min-w-0">
        {deployStats.map((stat) => (
          <div key={stat.key} className="dash-stat-mini">
            <p
              className={cn(
                'dash-stat-mini-value stat-number tabular-nums',
                stat.critical && 'text-[var(--accent-red)]',
              )}
            >
              {stat.value}
            </p>
            <p className="dash-stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      {allClear ? (
        <div className="dash-callout">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--text-secondary)]" />
          <p className="text-sm text-[var(--text-secondary)]">{t('dashboard', 'opsAllClear')}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {actionItems.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="group dash-alert-row">
                <span className={cn('dash-status-dot mt-1.5', severityDotClass[item.severity])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] group-hover:underline underline-offset-2">
                    {item.title}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed text-[var(--text-muted)]">
                    {item.description}
                  </p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)] opacity-40 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hasFailures && (
        <div className="dash-subpanel">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="dash-section-label">{t('dashboard', 'opsRecentFailures')}</p>
            <span className="dash-mono-caption tabular-nums">{recentFailures.length}</span>
          </div>
          <ul className="space-y-2">
            {recentFailures.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/dashboard/projects/${f.projectId}?tab=deployments`}
                  className="group dash-list-row dash-list-row--failure !py-2.5"
                >
                  <span className="dash-status-dot is-error mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-[var(--text-primary)] group-hover:underline underline-offset-2">
                      {f.projectName}
                    </p>
                    <p className="text-xs mt-0.5 line-clamp-2 sm:truncate text-[var(--text-muted)]">
                      {f.errorMessage || t('dashboard', 'opsNoErrorMessage')}
                    </p>
                  </div>
                  <span className="dash-caption dash-failure-time shrink-0">
                    {formatTimeAgo(f.createdAt, t)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/activity"
            className="dash-link mt-3 inline-flex items-center gap-1 text-xs"
          >
            {t('dashboard', 'opsViewAllActivity')}
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
