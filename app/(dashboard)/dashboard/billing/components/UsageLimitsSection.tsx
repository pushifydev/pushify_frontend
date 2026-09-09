'use client';

import Link from 'next/link';
import {
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Server,
  Database,
  Folder,
  Rocket,
  Users,
  Globe,
  Clock,
  HardDrive,
  Activity,
  CircleHelp,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import type { UsageStats } from '@/lib/api/services/billing.service';
import type { TranslationKeys } from '@/lib/i18n/locales/en';
import {
  USAGE_DISPLAY_ORDER,
  collectUsageWarnings,
  usageLevel,
  usagePercent,
  formatUsageLimit,
  hasPlanLimitBonus,
  type UsageLevel,
} from '@/lib/billing-usage';
import { formatMessage } from '@/lib/i18n/format-message';
import { STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const USAGE_ICONS: Record<keyof UsageStats, LucideIcon> = {
  servers: Server,
  databases: Database,
  projects: Folder,
  deploymentsThisMonth: Rocket,
  buildMinutesThisMonth: Clock,
  storageGb: HardDrive,
  bandwidthGb: Activity,
  teamMembers: Users,
  customDomains: Globe,
};

type BillingUsageLabelKey = keyof Pick<
  TranslationKeys['billing'],
  | 'servers'
  | 'databases'
  | 'projects'
  | 'deploymentsThisMonth'
  | 'buildMinutesThisMonth'
  | 'storageGb'
  | 'bandwidthGb'
  | 'teamMembers'
  | 'customDomains'
>;

const USAGE_HINT_KEYS: Partial<Record<keyof UsageStats, 'usageStorageHint' | 'usageBandwidthHint'>> = {
  storageGb: 'usageStorageHint',
  bandwidthGb: 'usageBandwidthHint',
};

const USAGE_LABEL_KEYS: Record<keyof UsageStats, BillingUsageLabelKey> = {
  servers: 'servers',
  databases: 'databases',
  projects: 'projects',
  deploymentsThisMonth: 'deploymentsThisMonth',
  buildMinutesThisMonth: 'buildMinutesThisMonth',
  storageGb: 'storageGb',
  bandwidthGb: 'bandwidthGb',
  teamMembers: 'teamMembers',
  customDomains: 'customDomains',
};

const BAR_COLORS: Record<UsageLevel, string> = {
  ok: 'var(--accent-cyan)',
  warning: STATUS_COLORS.warning,
  danger: STATUS_COLORS.error,
  unavailable: 'var(--text-muted)',
};

export function UsageLimitsAlert({ usage }: { usage: UsageStats }) {
  const { t } = useTranslation();
  const warnings = collectUsageWarnings(usage);
  if (!warnings.length) return null;

  const hasDanger = warnings.some((w) => w.level === 'danger');

  return (
    <div
      className={cn(
        'dash-panel p-4 flex flex-col sm:flex-row sm:items-center gap-3',
        hasDanger ? 'dash-callout-attention' : 'border-[var(--border-subtle)]',
      )}
      style={
        hasDanger
          ? undefined
          : {
              background: `${STATUS_COLORS.warning}10`,
              borderColor: `${STATUS_COLORS.warning}33`,
            }
      }
    >
      <div className="flex gap-3 min-w-0 flex-1">
        <AlertTriangle
          className="w-5 h-5 shrink-0 mt-0.5"
          style={{ color: hasDanger ? STATUS_COLORS.error : STATUS_COLORS.warning }}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {hasDanger ? t('billing', 'usageAtLimitTitle') : t('billing', 'usageNearLimitTitle')}
          </p>
          <p className="text-xs mt-1 text-[var(--text-secondary)] leading-relaxed">
            {t('billing', 'usageNearLimitDesc')}
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/billing/plans"
        className="btn btn-primary text-xs shrink-0 inline-flex items-center gap-1"
      >
        {t('billing', 'usageUpgradeCta')}
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export function UsageLimitsSection({ usage }: { usage: UsageStats }) {
  const { t } = useTranslation();
  const unlimitedLabel = t('billing', 'unlimited');

  return (
    <section className="dash-panel p-5 sm:p-6">
      <div className="dash-panel-header">
        <div className="dash-panel-title min-w-0">
          <TrendingUp className="w-4 h-4 shrink-0 text-[var(--text-secondary)]" />
          <span className="truncate">{t('billing', 'usage')}</span>
        </div>
        <Link href="/dashboard/billing/plans" className="dash-link flex items-center gap-1 shrink-0">
          {t('billing', 'comparePlans')}
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {USAGE_DISPLAY_ORDER.map((key) => {
          const item = usage[key];
          const Icon = USAGE_ICONS[key];
          const level = usageLevel(item.used, item.limit, item.unlimited);
          const percent = usagePercent(item.used, item.limit, item.unlimited);
          const barColor = BAR_COLORS[level];

          return (
            <div
              key={key}
              className={cn(
                'rounded-lg p-3.5 border border-transparent',
                level === 'danger' && 'border-[var(--status-error)]/25',
                level === 'warning' && 'border-[var(--status-warning)]/20',
              )}
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 text-[var(--text-muted)]" strokeWidth={2} />
                  <p className="text-xs font-medium text-[var(--text-secondary)] truncate flex items-center gap-1">
                    {t('billing', USAGE_LABEL_KEYS[key])}
                    {USAGE_HINT_KEYS[key] && (
                      <span
                        className="inline-flex shrink-0 text-[var(--text-muted)]"
                        title={t('billing', USAGE_HINT_KEYS[key]!)}
                      >
                        <CircleHelp className="w-3.5 h-3.5" aria-hidden />
                      </span>
                    )}
                  </p>
                </div>
                {(level === 'warning' || level === 'danger') && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide shrink-0"
                    style={{
                      color: level === 'danger' ? STATUS_COLORS.error : STATUS_COLORS.warning,
                    }}
                  >
                    {level === 'danger'
                      ? t('billing', 'usageBadgeLimit')
                      : t('billing', 'usageBadgeNear')}
                  </span>
                )}
              </div>

              <p
                className="text-base font-semibold tabular-nums text-[var(--text-primary)] mb-2"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {item.used}
                <span className="text-sm font-normal text-[var(--text-muted)]">
                  {' '}
                  / {formatUsageLimit(item, unlimitedLabel)}
                  {key === 'buildMinutesThisMonth' && !item.unlimited && item.limit > 0 && (
                    <span className="text-xs"> {t('billing', 'usageMinutesUnit')}</span>
                  )}
                </span>
              </p>

              <div className="h-1.5 rounded-full overflow-hidden bg-[var(--glass-border)]">
                <div
                  className="h-full rounded-full bar-grow transition-[width] duration-300"
                  style={{
                    width: `${item.unlimited ? Math.min(percent, 100) : percent}%`,
                    background: barColor,
                    opacity: level === 'unavailable' ? 0.35 : 1,
                  }}
                />
              </div>

              {!item.unlimited && item.limit > 0 && (
                <p className="text-[11px] text-[var(--text-muted)] mt-2 tabular-nums">
                  {percent}% {t('billing', 'used')}
                </p>
              )}

              {hasPlanLimitBonus(item) && (
                <p className="text-[11px] text-[var(--accent-cyan)] mt-1 tabular-nums">
                  {formatMessage(t('billing', 'usagePlanLimitNote'), {
                    planLimit: String(item.planLimit),
                  })}
                </p>
              )}

              {level === 'unavailable' && item.limit <= 0 && (
                <p className="text-[11px] text-[var(--text-muted)] mt-2">
                  {t('billing', 'usageNotOnPlan')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
