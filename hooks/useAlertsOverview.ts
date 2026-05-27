'use client';

import { useQuery } from '@tanstack/react-query';
import { getAlertsOverview } from '@/lib/api';

export const alertsKeys = {
  all: ['alerts'] as const,
  overview: () => [...alertsKeys.all, 'overview'] as const,
};

export function useAlertsOverview() {
  return useQuery({
    queryKey: alertsKeys.overview(),
    queryFn: async () => {
      const result = await getAlertsOverview();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    refetchInterval: 60_000,
  });
}
