'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjectWorkers,
  getProjectWorkerStatuses,
  createProjectWorker,
  updateProjectWorker,
  deleteProjectWorker,
  getProjectWorkerLogs,
  type CreateWorkerInput,
  type UpdateWorkerInput,
} from '@/lib/api';

// Query Keys
export const projectWorkerKeys = {
  all: ['projectWorkers'] as const,
  list: (projectId: string) => [...projectWorkerKeys.all, 'list', projectId] as const,
  statuses: (projectId: string) => [...projectWorkerKeys.all, 'statuses', projectId] as const,
  logs: (projectId: string, workerId: string) =>
    [...projectWorkerKeys.all, 'logs', projectId, workerId] as const,
};

// ============ Queries ============

export function useProjectWorkers(projectId: string) {
  return useQuery({
    queryKey: projectWorkerKeys.list(projectId),
    queryFn: async () => {
      const result = await getProjectWorkers(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
  });
}

export function useProjectWorkerStatuses(projectId: string, enabled = true) {
  return useQuery({
    queryKey: projectWorkerKeys.statuses(projectId),
    queryFn: async () => {
      const result = await getProjectWorkerStatuses(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? {};
    },
    enabled: !!projectId && enabled,
    refetchInterval: 30_000,
  });
}

export function useProjectWorkerLogs(projectId: string, workerId: string | null, tail = 100) {
  return useQuery({
    queryKey: projectWorkerKeys.logs(projectId, workerId ?? ''),
    queryFn: async () => {
      const result = await getProjectWorkerLogs(projectId, workerId!, tail);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!projectId && !!workerId,
  });
}

// ============ Mutations ============
// Note: Error handling is done globally in providers.tsx via MutationCache

export function useCreateProjectWorker(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateWorkerInput) => {
      const result = await createProjectWorker(projectId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectWorkerKeys.list(projectId) });
    },
  });
}

export function useUpdateProjectWorker(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workerId, input }: { workerId: string; input: UpdateWorkerInput }) => {
      const result = await updateProjectWorker(projectId, workerId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectWorkerKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectWorkerKeys.statuses(projectId) });
    },
  });
}

export function useDeleteProjectWorker(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workerId: string) => {
      const result = await deleteProjectWorker(projectId, workerId);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectWorkerKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectWorkerKeys.statuses(projectId) });
    },
  });
}
