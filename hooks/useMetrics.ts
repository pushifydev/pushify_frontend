'use client';

import { useQuery } from '@tanstack/react-query';
import { getMetricsSummary, getMetricsTimeSeries, getMetricsOverview } from '@/lib/api';

// Query Keys
export const metricsKeys = {
  all: ['metrics'] as const,
  overview: () => [...metricsKeys.all, 'overview'] as const,
  summary: (projectId: string) => [...metricsKeys.all, 'summary', projectId] as const,
  timeSeries: (projectId: string, hours: number) =>
    [...metricsKeys.all, 'timeSeries', projectId, hours] as const,
};

// ============ Queries ============

export function useMetricsOverview() {
  return useQuery({
    queryKey: metricsKeys.overview(),
    queryFn: async () => {
      const result = await getMetricsOverview();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? { totalProjects: 0, runningContainers: 0, aggregate: { totalCpuPercent: 0, totalMemoryUsageMB: 0, totalMemoryLimitMB: 0, totalNetworkRxMB: 0, totalNetworkTxMB: 0, avgCpuPercent: 0, avgMemoryPercent: 0 }, projects: [] };
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

export function useMetricsSummary(projectId: string) {
  return useQuery({
    queryKey: metricsKeys.summary(projectId),
    queryFn: async () => {
      const result = await getMetricsSummary(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? { current: null, stats24h: null };
    },
    enabled: !!projectId,
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

export function useMetricsTimeSeries(projectId: string, hours: number = 1) {
  return useQuery({
    queryKey: metricsKeys.timeSeries(projectId, hours),
    queryFn: async () => {
      const result = await getMetricsTimeSeries(projectId, hours);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}
