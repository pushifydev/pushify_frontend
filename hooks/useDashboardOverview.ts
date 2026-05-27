'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '@/lib/api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
};

export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: async () => {
      const result = await getDashboardOverview();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    refetchInterval: 60_000,
  });
}
