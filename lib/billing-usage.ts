import type { UsageItem, UsageStats } from '@/lib/api/services/billing.service';

export const USAGE_DISPLAY_ORDER: (keyof UsageStats)[] = [
  'servers',
  'databases',
  'projects',
  'deploymentsThisMonth',
  'buildMinutesThisMonth',
  'storageGb',
  'bandwidthGb',
  'teamMembers',
  'customDomains',
];

export type UsageLevel = 'ok' | 'warning' | 'danger' | 'unavailable';

export interface UsageMetricWarning {
  key: keyof UsageStats;
  used: number;
  limit: number;
  percent: number;
  level: UsageLevel;
}

export function usagePercent(used: number, limit: number, unlimited: boolean): number {
  if (unlimited) return Math.min(used > 0 ? 12 : 0, 100);
  if (limit <= 0) return used > 0 ? 100 : 0;
  return Math.min(Math.round((used / limit) * 100), 100);
}

export function usageLevel(
  used: number,
  limit: number,
  unlimited: boolean,
): UsageLevel {
  if (unlimited) return 'ok';
  if (limit <= 0) return used > 0 ? 'danger' : 'unavailable';
  const percent = usagePercent(used, limit, unlimited);
  if (percent >= 100) return 'danger';
  if (percent >= 80) return 'warning';
  return 'ok';
}

export function collectUsageWarnings(usage: UsageStats): UsageMetricWarning[] {
  const warnings: UsageMetricWarning[] = [];

  for (const key of USAGE_DISPLAY_ORDER) {
    const item = usage[key];
    const level = usageLevel(item.used, item.limit, item.unlimited);
    if (level === 'warning' || level === 'danger') {
      warnings.push({
        key,
        used: item.used,
        limit: item.limit,
        percent: usagePercent(item.used, item.limit, item.unlimited),
        level,
      });
    }
  }

  return warnings.sort((a, b) => b.percent - a.percent);
}

export function hasUsagePressure(usage: UsageStats): boolean {
  return collectUsageWarnings(usage).length > 0;
}

export function formatUsageLimit(item: UsageItem, unlimitedLabel: string): string {
  if (item.unlimited) return unlimitedLabel;
  if (item.limit <= 0) return '0';
  return String(item.limit);
}

export function hasPlanLimitBonus(item: UsageItem): boolean {
  return item.planLimit !== undefined && item.planLimit !== item.limit;
}
