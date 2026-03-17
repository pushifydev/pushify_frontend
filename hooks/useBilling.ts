'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBillingInfo,
  getAvailablePlans,
  updateBillingEmail,
  type UpdateBillingEmailInput,
} from '@/lib/api';

// Query Keys
export const billingKeys = {
  all: ['billing'] as const,
  info: () => [...billingKeys.all, 'info'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
};

// ============ Queries ============

export function useBillingInfo() {
  return useQuery({
    queryKey: billingKeys.info(),
    queryFn: async () => {
      const result = await getBillingInfo();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}

export function useAvailablePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: async () => {
      const result = await getAvailablePlans();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    staleTime: 1000 * 60 * 60, // Plans don't change often - cache for 1 hour
  });
}

// ============ Mutations ============

export function useUpdateBillingEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBillingEmailInput) => {
      const result = await updateBillingEmail(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.info() });
    },
  });
}
