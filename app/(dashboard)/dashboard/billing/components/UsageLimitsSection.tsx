'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, CircleHelp } from 'lucide-react';
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
import { SettingsSection } from '@/components/dashboard/SettingsParts';

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

/** Metric-track fill modifier per usage level (ink when fine, colour only near the limit). */
const FILL_CLASS: Record<UsageLevel, string> = {
  ok: '',
  warning: ' is-warning',
  danger: ' is-critical',
  unavailable: ' is-low',
};

export function UsageLimitsAlert({ usage }: { usage: UsageStats }) {
  const { t } = useTranslation();
  const warnings = collectUsageWarnings(usage);
  if (!warnings.length) return null;

  const hasDanger = warnings.some((w) => w.level === 'danger');

  return (
    <div className="dash-callout dash-callout-attention flex-col gap-3 sm:flex-row sm:items-center" role="status">
      <div className="flex gap-2.5 min-w-0 flex-1">
        <AlertTriangle
          className="w-4 h-4 shrink-0 mt-0.5"
          style={{ color: hasDanger ? 'var(--status-error)' : 'var(--status-warning)' }}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {hasDanger ? t('billing', 'usageAtLimitTitle') : t('billing', 'usageNearLimitTitle')}
          </p>
          <p className="text-[13px] mt-0.5 text-[var(--text-secondary)] leading-relaxed">
            {t('billing', 'usageNearLimitDesc')}
          </p>
        </div>
      </div>
      <Link href="/dashboard/billing/plans" className="btn btn-primary btn-sm shrink-0">
        {t('billing', 'usageUpgradeCta')}
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export function UsageLimitsSection({ usage, id }: { usage: UsageStats; id?: string }) {
  const { t } = useTranslation();
  const unlimitedLabel = t('billing', 'unlimited');

  return (
    <SettingsSection
      id={id}
      title={t('billing', 'usage')}
      action={
        <Link href="/dashboard/billing/plans" className="btn btn-secondary btn-sm">
          {t('billing', 'comparePlans')}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <ul className="-mx-5">
        {USAGE_DISPLAY_ORDER.map((key) => {
          const item = usage[key];
          const level = usageLevel(item.used, item.limit, item.unlimited);
          const percent = usagePercent(item.used, item.limit, item.unlimited);
          const hintKey = USAGE_HINT_KEYS[key];
          const label = t('billing', USAGE_LABEL_KEYS[key]);

          return (
            <li
              key={key}
              className="dash-row grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto] items-center gap-x-5 gap-y-2"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)] flex items-center gap-1.5 min-w-0">
                  <span className="truncate">{label}</span>
                  {hintKey && (
                    <span className="inline-flex shrink-0 text-[var(--text-muted)]" title={t('billing', hintKey)}>
                      <CircleHelp className="w-3.5 h-3.5" aria-hidden />
                      <span className="sr-only">{t('billing', hintKey)}</span>
                    </span>
                  )}
                </p>
                {hasPlanLimitBonus(item) && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 tabular-nums">
                    {formatMessage(t('billing', 'usagePlanLimitNote'), {
                      planLimit: String(item.planLimit),
                    })}
                  </p>
                )}
                {level === 'unavailable' && item.limit <= 0 && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{t('billing', 'usageNotOnPlan')}</p>
                )}
              </div>

              <div
                className="dash-metric-track col-span-2 sm:col-span-1 row-start-2 sm:row-start-auto"
                role="progressbar"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <div
                  className={`dash-metric-fill${FILL_CLASS[level]}`}
                  style={{ width: `${item.unlimited ? Math.min(percent, 100) : percent}%` }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                {(level === 'warning' || level === 'danger') && (
                  <span className={`badge ${level === 'danger' ? 'badge-error' : 'badge-warning'}`}>
                    {level === 'danger' ? t('billing', 'usageBadgeLimit') : t('billing', 'usageBadgeNear')}
                  </span>
                )}
                <span className="terminal-text text-xs tabular-nums text-[var(--text-primary)] whitespace-nowrap">
                  {item.used}
                  <span className="text-[var(--text-muted)]">
                    {' / '}
                    {formatUsageLimit(item, unlimitedLabel)}
                    {key === 'buildMinutesThisMonth' && !item.unlimited && item.limit > 0 && (
                      <> {t('billing', 'usageMinutesUnit')}</>
                    )}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </SettingsSection>
  );
}
