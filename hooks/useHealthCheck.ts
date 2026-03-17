'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHealthCheckConfig,
  updateHealthCheckConfig,
  deleteHealthCheckConfig,
  getHealthCheckLogs,
  type HealthCheckConfigInput,
} from '@/lib/api';

// Query Keys
export const healthCheckKeys = {
  all: ['healthCheck'] as const,
  config: (projectId: string) => [...healthCheckKeys.all, 'config', projectId] as const,
  logs: (projectId: string) => [...healthCheckKeys.all, 'logs', projectId] as const,
};

// ============ Queries ============

export function useHealthCheckConfig(projectId: string) {
  return useQuery({
    queryKey: healthCheckKeys.config(projectId),
    queryFn: async () => {
      const result = await getHealthCheckConfig(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
    enabled: !!projectId,
  });
}

export function useHealthCheckLogs(projectId: string) {
  return useQuery({
    queryKey: healthCheckKeys.logs(projectId),
    queryFn: async () => {
      const result = await getHealthCheckLogs(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// ============ Mutations ============

export function useUpdateHealthCheckConfig(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: HealthCheckConfigInput) => {
      const result = await updateHealthCheckConfig(projectId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthCheckKeys.config(projectId) });
    },
  });
}

export function useDeleteHealthCheckConfig(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteHealthCheckConfig(projectId);
      if (result.error) throw new Error(result.error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthCheckKeys.config(projectId) });
    },
  });
}
