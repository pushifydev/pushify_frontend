'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { useDashboardOverview, useTranslation } from '@/hooks';
import { formatMessage } from '@/lib/i18n/format-message';
import {
  countAttentionIssues,
  dashboardNeedsAttention,
} from '@/lib/dashboard-attention';
import { Skeleton } from '@/components/Skeleton';
import { UsageAlerts } from './UsageAlerts';
import { OperationsPanel } from './OperationsPanel';
import {
  AttentionSheetSection,
  DashboardAttentionSheet,
} from './DashboardAttentionSheet';

interface DashboardAttentionZoneProps {
  /** Show when the org already has servers or projects (past pure onboarding). */
  active: boolean;
}

export function DashboardAttentionZone({ active }: DashboardAttentionZoneProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useDashboardOverview();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!active) return null;

  if (isLoading) {
    return (
      <div className="mb-4 min-w-0">
        <Skeleton className="h-9 w-full max-w-xs rounded-lg" />
      </div>
    );
  }

  if (!data || !dashboardNeedsAttention(data)) return null;

  const issueCount = countAttentionIssues(data);
  const hasUsage = data.usageWarnings.length > 0;
  const hasInfraAlert = !!data.infraWallet?.isLowBalance;
  const showOps = data.actionItems.length > 0 || data.recentFailures.length > 0;

  return (
    <>
      <div className="mb-4 min-w-0">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="group w-full flex items-center justify-between gap-3 py-2 text-left rounded-lg hover:bg-[var(--hover-overlay)] transition-colors"
          aria-label={formatMessage(t('dashboard', 'attentionIssueCount'), { count: issueCount })}
        >
          <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            {t('dashboard', 'attentionZoneTitle')}
            <span className="text-[var(--text-muted)] tabular-nums">
              {' '}
              · {issueCount}
            </span>
          </span>
          <ChevronRight className="w-4 h-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />
        </button>
      </div>

      <DashboardAttentionSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="flex flex-col min-w-0">
          {hasInfraAlert && data.infraWallet && (
            <AttentionSheetSection>
              <div className="dash-callout dash-callout-attention flex-col !items-stretch gap-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t('dashboard', 'infraLowBalanceTitle')}
                </p>
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
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
                <Link
                  href="/dashboard/billing"
                  className="btn btn-primary text-xs w-fit inline-flex items-center gap-1 mt-1"
                  onClick={() => setSheetOpen(false)}
                >
                  {t('billing', 'infraTopUp')}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </AttentionSheetSection>
          )}

          {hasUsage && (
            <AttentionSheetSection>
              <UsageAlerts warnings={data.usageWarnings} variant="sheet" />
            </AttentionSheetSection>
          )}

          {showOps && (
            <AttentionSheetSection>
              <OperationsPanel data={data} variant="sheet" />
            </AttentionSheetSection>
          )}
        </div>
      </DashboardAttentionSheet>
    </>
  );
}
