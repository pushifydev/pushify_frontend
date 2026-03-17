'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listServers,
  getServer,
  createServer,
  deleteServer,
  startServer,
  stopServer,
  rebootServer,
  syncServer,
  getProviderRegions,
  getProviderImages,
  getProviderSizes,
  getProviderServerTypes,
  type CreateServerInput,
  type ServerProvider,
} from '@/lib/api';

// Query Keys
export const serverKeys = {
  all: ['servers'] as const,
  list: () => [...serverKeys.all, 'list'] as const,
  detail: (id: string) => [...serverKeys.all, 'detail', id] as const,
  providers: ['providers'] as const,
  regions: (provider: ServerProvider) => [...serverKeys.providers, provider, 'regions'] as const,
  images: (provider: ServerProvider) => [...serverKeys.providers, provider, 'images'] as const,
  sizes: (provider: ServerProvider) => [...serverKeys.providers, provider, 'sizes'] as const,
  serverTypes: (provider: ServerProvider, location?: string) =>
    [...serverKeys.providers, provider, 'serverTypes', location || 'all'] as const,
};

// ============ Queries ============

export function useServers() {
  return useQuery({
    queryKey: serverKeys.list(),
    queryFn: async () => {
      const result = await listServers();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    // Auto-refetch every 5 seconds if any server is provisioning, rebooting, or setting up
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const needsPolling = data.some(
        (server) =>
          server.status === 'provisioning' ||
          server.status === 'rebooting' ||
          server.setupStatus === 'pending' ||
          server.setupStatus === 'installing'
      );
      return needsPolling ? 5000 : false;
    },
  });
}

export function useServer(serverId: string) {
  return useQuery({
    queryKey: serverKeys.detail(serverId),
    queryFn: async () => {
      const result = await getServer(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!serverId,
    // Auto-refetch every 5 seconds if server is provisioning, rebooting, or setting up
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const needsPolling =
        data.status === 'provisioning' ||
        data.status === 'rebooting' ||
        data.setupStatus === 'pending' ||
        data.setupStatus === 'installing';
      return needsPolling ? 5000 : false;
    },
  });
}

export function useProviderRegions(provider: ServerProvider) {
  return useQuery({
    queryKey: serverKeys.regions(provider),
    queryFn: async () => {
      const result = await getProviderRegions(provider);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!provider,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useProviderImages(provider: ServerProvider) {
  return useQuery({
    queryKey: serverKeys.images(provider),
    queryFn: async () => {
      const result = await getProviderImages(provider);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!provider,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useProviderSizes(provider: ServerProvider) {
  return useQuery({
    queryKey: serverKeys.sizes(provider),
    queryFn: async () => {
      const result = await getProviderSizes(provider);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!provider,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useProviderServerTypes(provider: ServerProvider, location?: string) {
  return useQuery({
    queryKey: serverKeys.serverTypes(provider, location),
    queryFn: async () => {
      const result = await getProviderServerTypes(provider, location);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!provider,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// ============ Mutations ============
// Note: Error handling is done globally in providers.tsx via MutationCache

export function useCreateServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateServerInput) => {
      const result = await createServer(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.list() });
      toast.success('Server created', {
        description: `${data.name} is being provisioned`,
      });
    },
  });
}

export function useDeleteServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const result = await deleteServer(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serverKeys.list() });
      toast.success('Server deleted', {
        description: 'Server has been deleted successfully',
      });
    },
  });
}

export function useStartServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const result = await startServer(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.list() });
      queryClient.setQueryData(serverKeys.detail(data.id), data);
      toast.success('Server starting', {
        description: `${data.name} is starting up`,
      });
    },
  });
}

export function useStopServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const result = await stopServer(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.list() });
      queryClient.setQueryData(serverKeys.detail(data.id), data);
      toast.success('Server stopping', {
        description: `${data.name} is shutting down`,
      });
    },
  });
}

export function useRebootServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const result = await rebootServer(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.list() });
      queryClient.setQueryData(serverKeys.detail(data.id), data);
      toast.success('Server rebooting', {
        description: `${data.name} is rebooting`,
      });
    },
  });
}

export function useSyncServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const result = await syncServer(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.list() });
      queryClient.setQueryData(serverKeys.detail(data.id), data);
      toast.success('Server synced', {
        description: `${data.name} has been synced with provider`,
      });
    },
  });
}
