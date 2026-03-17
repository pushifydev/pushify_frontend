'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDatabases,
  getDatabase,
  getDatabaseCredentials,
  getDatabaseTypes,
  createDatabase,
  updateDatabase,
  deleteDatabase,
  connectDatabaseToProject,
  disconnectDatabase,
  toggleExternalAccess,
  startDatabase,
  stopDatabase,
  restartDatabase,
  resetDatabasePassword,
  getDatabaseBackups,
  createDatabaseBackup,
  restoreDatabaseBackup,
  deleteDatabaseBackup,
  type CreateDatabaseInput,
  type UpdateDatabaseInput,
  type ConnectDatabaseInput,
} from '@/lib/api';

// Query Keys
export const databaseKeys = {
  all: ['databases'] as const,
  list: () => [...databaseKeys.all, 'list'] as const,
  detail: (id: string) => [...databaseKeys.all, 'detail', id] as const,
  credentials: (id: string) => [...databaseKeys.all, 'credentials', id] as const,
  types: () => [...databaseKeys.all, 'types'] as const,
  backups: (id: string) => [...databaseKeys.all, 'backups', id] as const,
};

// ============ Queries ============

export function useDatabases() {
  return useQuery({
    queryKey: databaseKeys.list(),
    queryFn: async () => {
      const result = await getDatabases();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

export function useDatabase(databaseId: string) {
  return useQuery({
    queryKey: databaseKeys.detail(databaseId),
    queryFn: async () => {
      const result = await getDatabase(databaseId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!databaseId,
  });
}

export function useDatabaseCredentials(databaseId: string) {
  return useQuery({
    queryKey: databaseKeys.credentials(databaseId),
    queryFn: async () => {
      const result = await getDatabaseCredentials(databaseId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!databaseId,
  });
}

export function useDatabaseTypes() {
  return useQuery({
    queryKey: databaseKeys.types(),
    queryFn: async () => {
      const result = await getDatabaseTypes();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

// ============ Mutations ============

export function useCreateDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDatabaseInput) => {
      const result = await createDatabase(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.list() });
    },
  });
}

export function useUpdateDatabase(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateDatabaseInput) => {
      const result = await updateDatabase(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.list() });
      queryClient.invalidateQueries({ queryKey: databaseKeys.detail(databaseId) });
    },
  });
}

export function useDeleteDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (databaseId: string) => {
      const result = await deleteDatabase(databaseId);
      if (result.error) throw new Error(result.error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.list() });
    },
  });
}

export function useConnectDatabase(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ConnectDatabaseInput) => {
      const result = await connectDatabaseToProject(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.detail(databaseId) });
    },
  });
}

export function useDisconnectDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const result = await disconnectDatabase(connectionId);
      if (result.error) throw new Error(result.error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.all });
    },
  });
}

export function useToggleExternalAccess(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const result = await toggleExternalAccess(databaseId, enabled);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.list() });
      queryClient.invalidateQueries({ queryKey: databaseKeys.detail(databaseId) });
    },
  });
}

export function useStartDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (databaseId: string) => {
      const result = await startDatabase(databaseId);
      if (result.error) throw new Error(result.error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.all });
    },
  });
}

export function useStopDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (databaseId: string) => {
      const result = await stopDatabase(databaseId);
      if (result.error) throw new Error(result.error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.all });
    },
  });
}

export function useRestartDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (databaseId: string) => {
      const result = await restartDatabase(databaseId);
      if (result.error) throw new Error(result.error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.all });
    },
  });
}

export function useResetDatabasePassword(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await resetDatabasePassword(databaseId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.credentials(databaseId) });
    },
  });
}

// ============ Backup Hooks ============

export function useDatabaseBackups(databaseId: string) {
  return useQuery({
    queryKey: databaseKeys.backups(databaseId),
    queryFn: async () => {
      const result = await getDatabaseBackups(databaseId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!databaseId,
    refetchInterval: 30000,
  });
}

export function useCreateDatabaseBackup(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await createDatabaseBackup(databaseId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.backups(databaseId) });
    },
  });
}

export function useRestoreDatabaseBackup(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backupId: string) => {
      const result = await restoreDatabaseBackup(databaseId, backupId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.backups(databaseId) });
    },
  });
}

export function useDeleteDatabaseBackup(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backupId: string) => {
      const result = await deleteDatabaseBackup(databaseId, backupId);
      if (result.error) throw new Error(result.error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.backups(databaseId) });
    },
  });
}
