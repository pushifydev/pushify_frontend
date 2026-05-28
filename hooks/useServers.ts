'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccessToast } from '@/lib/toast-i18n';
import { useLocaleStore } from '@/stores/locale';
import {
  listServers,
  getServer,
  createServer,
  deleteServer,
  startServer,
  stopServer,
  rebootServer,
  syncServer,
  updateServer,
  getServerResizeOptions,
  resizeServer,
  listServerSnapshots,
  createServerSnapshot,
  deleteServerSnapshot,
  getServerTimeline,
  getServerSshInfo,
  getServerSshKey,
  getProviderRegions,
  type ServerSize,
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
  resizeOptions: (id: string) => [...serverKeys.all, 'resizeOptions', id] as const,
  snapshots: (id: string) => [...serverKeys.all, 'snapshots', id] as const,
  timeline: (id: string) => [...serverKeys.all, 'timeline', id] as const,
  sshInfo: (id: string) => [...serverKeys.all, 'sshInfo', id] as const,
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
          server.statusMessage === 'resizing' ||
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
        data.statusMessage === 'resizing' ||
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

export function useProviderSizes(provider: ServerProvider, region?: string) {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({
    queryKey: [...serverKeys.sizes(provider), region || 'default', locale],
    queryFn: async () => {
      const result = await getProviderSizes(provider, region);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!provider,
    staleTime: 1000 * 60 * 5,
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
      showSuccessToast('serverCreatedTitle', 'serverCreatedDesc', { name: data.name });
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
      showSuccessToast('serverDeletedTitle', 'serverDeletedDesc');
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
      showSuccessToast('serverStartingTitle', 'serverStartingDesc', { name: data.name });
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
      showSuccessToast('serverStoppingTitle', 'serverStoppingDesc', { name: data.name });
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
      showSuccessToast('serverRebootingTitle', 'serverRebootingDesc', { name: data.name });
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
      showSuccessToast('serverSyncedTitle', 'serverSyncedDesc', { name: data.name });
    },
  });
}

export function useServerResizeOptions(serverId: string, enabled: boolean) {
  return useQuery({
    queryKey: serverKeys.resizeOptions(serverId),
    queryFn: async () => {
      const result = await getServerResizeOptions(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!serverId && enabled,
  });
}

export function useResizeServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, size }: { serverId: string; size: ServerSize }) => {
      const result = await resizeServer(serverId, size);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.list() });
      queryClient.invalidateQueries({ queryKey: serverKeys.resizeOptions(data.id) });
      queryClient.setQueryData(serverKeys.detail(data.id), data);
      showSuccessToast('serverResizedTitle', 'serverResizedDesc', { name: data.name });
    },
  });
}

export function useUpdateServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      input,
    }: {
      serverId: string;
      input: { name?: string; description?: string | null };
    }) => {
      const result = await updateServer(serverId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.list() });
      queryClient.setQueryData(serverKeys.detail(data.id), data);
      showSuccessToast('serverUpdatedTitle', 'serverUpdatedDesc', { name: data.name });
    },
  });
}

export function useServerSnapshots(serverId: string, enabled: boolean) {
  return useQuery({
    queryKey: serverKeys.snapshots(serverId),
    queryFn: async () => {
      const result = await listServerSnapshots(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!serverId && enabled,
    refetchInterval: 15000,
  });
}

export function useCreateServerSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      input,
    }: {
      serverId: string;
      input?: { name?: string; description?: string };
    }) => {
      const result = await createServerSnapshot(serverId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (_, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.snapshots(serverId) });
      showSuccessToast('serverSnapshotCreatedTitle', 'serverSnapshotCreatedDesc');
    },
  });
}

export function useDeleteServerSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      snapshotId,
    }: {
      serverId: string;
      snapshotId: string;
    }) => {
      const result = await deleteServerSnapshot(serverId, snapshotId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.snapshots(serverId) });
      showSuccessToast('serverSnapshotDeletedTitle', 'serverSnapshotDeletedDesc');
    },
  });
}

export function useServerTimeline(serverId: string) {
  return useQuery({
    queryKey: serverKeys.timeline(serverId),
    queryFn: async () => {
      const result = await getServerTimeline(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!serverId,
    staleTime: 30_000,
  });
}

export function useServerSshInfo(serverId: string) {
  return useQuery({
    queryKey: serverKeys.sshInfo(serverId),
    queryFn: async () => {
      const result = await getServerSshInfo(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!serverId,
  });
}

export function useDownloadServerSshKey() {
  return useMutation({
    mutationFn: async (serverId: string) => {
      const result = await getServerSshKey(serverId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}
