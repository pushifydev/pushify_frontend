'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useDashboardOverview, useTranslation } from '@/hooks';
import { STATUS_COLORS } from '@/lib/constants';
import type { UsageWarningKey } from '@/lib/api/services/dashboard.service';

const usageLabelKeys: Record<
  UsageWarningKey,
  'usageResourceServers' | 'usageResourceDatabases' | 'usageResourceProjects' | 'usageResourceDeployments' | 'usageResourceTeamMembers' | 'usageResourceCustomDomains'
> = {
  servers: 'usageResourceServers',
  databases: 'usageResourceDatabases',
  projects: 'usageResourceProjects',
  deploymentsThisMonth: 'usageResourceDeployments',
  teamMembers: 'usageResourceTeamMembers',
  customDomains: 'usageResourceCustomDomains',
};

export function UsageAlerts() {
  const { t } = useTranslation();
  const { data } = useDashboardOverview();

  if (!data?.usageWarnings.length) return null;

  return (
    <div
      className="rounded-xl p-4 mb-5"
      style={{
        background: `${STATUS_COLORS.orange}08`,
        border: `1px solid ${STATUS_COLORS.orange}35`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: STATUS_COLORS.orange }} />
          <span className="text-sm font-semibold">{t('dashboard', 'usageAlertsTitle')}</span>
        </div>
        <Link
          href="/dashboard/billing"
          className="flex items-center gap-1 text-xs shrink-0"
          style={{ color: 'var(--accent-cyan)' }}
        >
          {t('billing', 'title')}
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {data.usageWarnings.map((w) => (
          <div key={w.key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard', usageLabelKeys[w.key])}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {w.used} / {w.limit} ({w.percent}%)
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(w.percent, 100)}%`,
                  background: w.percent >= 95 ? STATUS_COLORS.error : STATUS_COLORS.orange,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
