'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDomainSalesConfig,
  getPurchasedDomains,
  purchaseDomain,
  searchDomains,
  setDomainAutoRenew,
  type PurchaseDomainInput,
} from '@/lib/api';

// Query Keys
export const registrarDomainKeys = {
  all: ['registrarDomains'] as const,
  config: () => [...registrarDomainKeys.all, 'config'] as const,
  list: () => [...registrarDomainKeys.all, 'list'] as const,
  search: (q: string) => [...registrarDomainKeys.all, 'search', q] as const,
};

// ============ Queries ============

export function useDomainSalesConfig() {
  return useQuery({
    queryKey: registrarDomainKeys.config(),
    queryFn: async () => {
      const result = await getDomainSalesConfig();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? { enabled: false };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDomainSearch(query: string) {
  return useQuery({
    queryKey: registrarDomainKeys.search(query),
    queryFn: async () => {
      const result = await searchDomains(query);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: query.trim().length >= 2,
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function usePurchasedDomains() {
  return useQuery({
    queryKey: registrarDomainKeys.list(),
    queryFn: async () => {
      const result = await getPurchasedDomains();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

// ============ Mutations ============
// Note: Error handling is done globally in providers.tsx via MutationCache

export function usePurchaseDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PurchaseDomainInput) => {
      const result = await purchaseDomain(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrarDomainKeys.list() });
      queryClient.invalidateQueries({ queryKey: registrarDomainKeys.all });
    },
  });
}

export function useSetDomainAutoRenew() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ domainName, enabled }: { domainName: string; enabled: boolean }) => {
      const result = await setDomainAutoRenew(domainName, enabled);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrarDomainKeys.list() });
    },
  });
}
