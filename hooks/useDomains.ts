'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getDomains,
  addDomain,
  deleteDomain,
  setPrimaryDomain,
  verifyDomain,
  getDnsSetup,
  getNginxSettings,
  updateNginxSettings,
  type AddDomainInput,
  type NginxSettings,
} from '@/lib/api';
import { projectKeys } from './useProjects';

// Query Keys
export const domainKeys = {
  all: ['domains'] as const,
  lists: () => [...domainKeys.all, 'list'] as const,
  list: (projectId: string) => [...domainKeys.lists(), projectId] as const,
  dnsSetup: (projectId: string, domainId: string) => [...domainKeys.all, 'dns-setup', projectId, domainId] as const,
  nginxSettings: (projectId: string, domainId: string) => [...domainKeys.all, 'nginx-settings', projectId, domainId] as const,
};

// ============ Queries ============

export function useDomains(projectId: string) {
  return useQuery({
    queryKey: domainKeys.list(projectId),
    queryFn: async () => {
      const result = await getDomains(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
  });
}

export function useDnsSetup(projectId: string, domainId: string | null) {
  return useQuery({
    queryKey: domainKeys.dnsSetup(projectId, domainId || ''),
    queryFn: async () => {
      const result = await getDnsSetup(projectId, domainId!);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!projectId && !!domainId,
  });
}

// ============ Mutations ============
// Note: Error handling is done globally in providers.tsx via MutationCache

export function useAddDomain(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddDomainInput) => {
      const result = await addDomain(projectId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: domainKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      toast.success('Domain added', {
        description: `${data?.domain} has been added to your project`,
      });
    },
  });
}

export function useDeleteDomain(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domainId: string) => {
      const result = await deleteDomain(projectId, domainId);
      if (result.error) throw new Error(result.error.message);
      return domainId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      toast.success('Domain removed', {
        description: 'Domain has been removed from your project',
      });
    },
  });
}

export function useSetPrimaryDomain(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domainId: string) => {
      const result = await setPrimaryDomain(projectId, domainId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: domainKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      toast.success('Primary domain updated', {
        description: `${data?.domain} is now the primary domain`,
      });
    },
  });
}

export function useVerifyDomain(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domainId: string) => {
      const result = await verifyDomain(projectId, domainId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: domainKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: domainKeys.dnsSetup(projectId, data?.id || '') });
      toast.success('Domain verified', {
        description: `${data?.domain} has been verified and SSL certificate configured`,
      });
    },
  });
}

// ============ Nginx Settings ============

export function useNginxSettings(projectId: string, domainId: string | null) {
  return useQuery({
    queryKey: domainKeys.nginxSettings(projectId, domainId || ''),
    queryFn: async () => {
      const result = await getNginxSettings(projectId, domainId!);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!projectId && !!domainId,
  });
}

export function useUpdateNginxSettings(projectId: string, domainId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<NginxSettings>) => {
      const result = await updateNginxSettings(projectId, domainId, settings);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.nginxSettings(projectId, domainId) });
      toast.success('Nginx settings updated', {
        description: 'Configuration has been applied to the server',
      });
    },
  });
}
