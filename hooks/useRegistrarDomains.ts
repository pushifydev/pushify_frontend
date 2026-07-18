'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmDomainPurchase,
  createDomainPurchaseCheckout,
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

export function useDomainPurchaseCheckout() {
  return useMutation({
    mutationFn: async (input: PurchaseDomainInput) => {
      const result = await createDomainPurchaseCheckout(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}

export function useConfirmDomainPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const result = await confirmDomainPurchase(sessionId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrarDomainKeys.list() });
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

// ============ Domain management ============

import {
  addDomainEmailForwarding,
  createDomainDns,
  deleteDomainDns,
  deleteDomainEmailForwarding,
  getDomainAuthCode,
  getDomainDetails,
  getTransferQuote,
  listDomainDns,
  listDomainEmailForwarding,
  publicSearchDomains,
  setDomainLock,
  setDomainNameservers,
  startDomainTransfer,
  updateDomainDns,
  type DnsRecordInput,
} from '@/lib/api';

export const domainManageKeys = {
  details: (d: string) => [...registrarDomainKeys.all, 'details', d] as const,
  dns: (d: string) => [...registrarDomainKeys.all, 'dns', d] as const,
  forwarding: (d: string) => [...registrarDomainKeys.all, 'forwarding', d] as const,
  publicSearch: (q: string) => ['publicDomainSearch', q] as const,
};

export function useDomainDetails(domainName: string) {
  return useQuery({
    queryKey: domainManageKeys.details(domainName),
    queryFn: async () => {
      const result = await getDomainDetails(domainName);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!domainName,
  });
}

export function useDomainDns(domainName: string, enabled = true) {
  return useQuery({
    queryKey: domainManageKeys.dns(domainName),
    queryFn: async () => {
      const result = await listDomainDns(domainName);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!domainName && enabled,
  });
}

export function useDnsMutations(domainName: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: domainManageKeys.dns(domainName) });
  const create = useMutation({
    mutationFn: async (record: DnsRecordInput) => {
      const result = await createDomainDns(domainName, record);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ recordId, record }: { recordId: string; record: DnsRecordInput }) => {
      const result = await updateDomainDns(domainName, recordId, record);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (recordId: string) => {
      const result = await deleteDomainDns(domainName, recordId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

export function useDomainSettingsMutations(domainName: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: domainManageKeys.details(domainName) });
  const lock = useMutation({
    mutationFn: async (locked: boolean) => {
      const result = await setDomainLock(domainName, locked);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: invalidate,
  });
  const nameservers = useMutation({
    mutationFn: async (ns: string[]) => {
      const result = await setDomainNameservers(domainName, ns);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: invalidate,
  });
  const authCode = useMutation({
    mutationFn: async () => {
      const result = await getDomainAuthCode(domainName);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: invalidate,
  });
  return { lock, nameservers, authCode };
}

export function useDomainForwarding(domainName: string, enabled = true) {
  return useQuery({
    queryKey: domainManageKeys.forwarding(domainName),
    queryFn: async () => {
      const result = await listDomainEmailForwarding(domainName);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!domainName && enabled,
  });
}

export function useForwardingMutations(domainName: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: domainManageKeys.forwarding(domainName) });
  const add = useMutation({
    mutationFn: async (fwd: { emailBox: string; emailTo: string }) => {
      const result = await addDomainEmailForwarding(domainName, fwd);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (emailBox: string) => {
      const result = await deleteDomainEmailForwarding(domainName, emailBox);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: invalidate,
  });
  return { add, remove };
}

export function useTransferQuote() {
  return useMutation({
    mutationFn: async (domainName: string) => {
      const result = await getTransferQuote(domainName);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}

export function useStartTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { domainName: string; authCode: string }) => {
      const result = await startDomainTransfer(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: registrarDomainKeys.list() }),
  });
}

export function usePublicDomainSearch(query: string) {
  return useQuery({
    queryKey: domainManageKeys.publicSearch(query),
    queryFn: async () => {
      const result = await publicSearchDomains(query);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: query.trim().length >= 2,
    staleTime: 60 * 1000,
    retry: false,
  });
}
