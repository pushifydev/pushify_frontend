import type { DashboardOverview } from '@/lib/api/services/dashboard.service';

export function dashboardNeedsAttention(data: DashboardOverview): boolean {
  const { deployments } = data;
  return (
    !!data.infraWallet?.isLowBalance ||
    data.usageWarnings.length > 0 ||
    data.actionItems.length > 0 ||
    data.recentFailures.length > 0 ||
    deployments.failed > 0 ||
    deployments.failedLast24h > 0
  );
}

export function countAttentionIssues(data: DashboardOverview): number {
  let count = 0;
  if (data.infraWallet?.isLowBalance) count += 1;
  count += data.usageWarnings.length;
  count += data.actionItems.length;
  if (
    data.recentFailures.length > 0 &&
    !data.actionItems.some((a) => a.id.startsWith('failed'))
  ) {
    count += 1;
  }
  return count;
}
