'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Rocket,
  XCircle,
  ArrowUpRight,
  ListChecks,
} from 'lucide-react';
import { useDashboardOverview, useTranslation } from '@/hooks';
import { STATUS_COLORS } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/formatters';
import { Skeleton } from '@/components/Skeleton';
import type { ActionSeverity } from '@/lib/api/services/dashboard.service';

const severityStyles: Record<
  ActionSeverity,
  { border: string; dot: string; icon: typeof AlertTriangle }
> = {
  critical: { border: STATUS_COLORS.error, dot: STATUS_COLORS.error, icon: XCircle },
  warning: { border: '#f59e0b', dot: '#f59e0b', icon: AlertTriangle },
  info: { border: STATUS_COLORS.cyan, dot: STATUS_COLORS.cyan, icon: Rocket },
};

export function OperationsPanel() {
  const { t } = useTranslation();
  const { data, isLoading } = useDashboardOverview();

  if (isLoading) {
    return (
      <div
        className="rounded-xl p-5 mb-5 space-y-4"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
      >
        <Skeleton className="h-4 w-40 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-20 rounded-lg" />
      </div>
    );
  }

  if (!data) return null;

  const { deployments, actionItems, recentFailures, usageWarnings } = data;
  const allClear =
    actionItems.length === 0 &&
    deployments.failed === 0 &&
    usageWarnings.length === 0;

  const deployStats = [
    {
      label: t('dashboard', 'opsRunning'),
      value: deployments.running,
      color: STATUS_COLORS.success,
    },
    {
      label: t('dashboard', 'opsInProgress'),
      value: deployments.inProgress,
      color: STATUS_COLORS.cyan,
    },
    {
      label: t('dashboard', 'opsFailed24h'),
      value: deployments.failedLast24h,
      color: deployments.failedLast24h > 0 ? STATUS_COLORS.error : STATUS_COLORS.neutral,
    },
    {
      label: t('dashboard', 'opsFailedTotal'),
      value: deployments.failed,
      color: deployments.failed > 0 ? '#f59e0b' : STATUS_COLORS.neutral,
    },
  ];

  return (
    <div
      className="rounded-xl p-5 mb-5"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
          <span className="text-sm font-semibold">{t('dashboard', 'opsPanelTitle')}</span>
        </div>
        <Link
          href="/dashboard/activity"
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: 'var(--accent-cyan)' }}
        >
          {t('navigation', 'activity')}
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {deployStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg px-3 py-2.5"
            style={{
              background: 'var(--bg-tertiary)',
              border: `1px solid ${stat.value > 0 && stat.label.includes('Failed') ? `${stat.color}35` : 'var(--glass-border)'}`,
            }}
          >
            <p
              className="stat-number"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: stat.value > 0 ? stat.color : 'var(--text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginTop: 4,
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {allClear ? (
        <div
          className="flex items-center gap-3 rounded-lg px-4 py-3"
          style={{ background: `${STATUS_COLORS.success}10`, border: `1px solid ${STATUS_COLORS.success}25` }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: STATUS_COLORS.success }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard', 'opsAllClear')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {actionItems.map((item) => {
            const style = severityStyles[item.severity];
            const Icon = style.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-start gap-3 rounded-lg px-4 py-3 transition-all"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: `1px solid ${style.border}30`,
                }}
              >
                <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: style.dot }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-[var(--accent-cyan)] transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {item.description}
                  </p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      )}

      {recentFailures.length > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <p
            style={{
              fontSize: 10.5,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            {t('dashboard', 'opsRecentFailures')}
          </p>
          <div className="space-y-1.5">
            {recentFailures.map((f) => (
              <Link
                key={f.id}
                href={`/dashboard/projects/${f.projectId}?tab=deployments`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--bg-tertiary)]"
              >
                <Rocket className="w-3.5 h-3.5 shrink-0" style={{ color: STATUS_COLORS.error }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.projectName}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {f.errorMessage || t('dashboard', 'opsNoErrorMessage')}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatTimeAgo(f.createdAt, t)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
