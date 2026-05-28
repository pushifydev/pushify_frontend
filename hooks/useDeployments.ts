'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccessToast } from '@/lib/toast-i18n';
import {
  getDeployments,
  getDeployment,
  createDeployment,
  cancelDeployment,
  redeployDeployment,
  rollbackDeployment,
  getDeploymentLogs,
  type CreateDeploymentInput,
} from '@/lib/api';
import { projectKeys } from './useProjects';

// Query Keys
export const deploymentKeys = {
  all: ['deployments'] as const,
  lists: () => [...deploymentKeys.all, 'list'] as const,
  list: (projectId: string, filters?: Record<string, unknown>) =>
    [...deploymentKeys.lists(), projectId, filters] as const,
  details: () => [...deploymentKeys.all, 'detail'] as const,
  detail: (projectId: string, deploymentId: string) =>
    [...deploymentKeys.details(), projectId, deploymentId] as const,
  logs: (projectId: string, deploymentId: string, type: 'build' | 'deploy') =>
    [...deploymentKeys.detail(projectId, deploymentId), 'logs', type] as const,
};

// ============ Queries ============

export function useDeployments(projectId: string, options?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: deploymentKeys.list(projectId, options),
    queryFn: async () => {
      const result = await getDeployments(projectId, options);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
  });
}

export function useDeployment(projectId: string, deploymentId: string) {
  return useQuery({
    queryKey: deploymentKeys.detail(projectId, deploymentId),
    queryFn: async () => {
      const result = await getDeployment(projectId, deploymentId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!projectId && !!deploymentId,
  });
}

export function useDeploymentLogs(
  projectId: string,
  deploymentId: string,
  type: 'build' | 'deploy' = 'build'
) {
  return useQuery({
    queryKey: deploymentKeys.logs(projectId, deploymentId, type),
    queryFn: async () => {
      const result = await getDeploymentLogs(projectId, deploymentId, type);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!projectId && !!deploymentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && ['queued', 'building', 'deploying'].includes(status)) {
        return 3000;
      }
      return false;
    },
  });
}

// ============ Mutations ============
// Note: Error handling is done globally in providers.tsx via MutationCache

export function useCreateDeployment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input?: CreateDeploymentInput) => {
      const result = await createDeployment(projectId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deploymentKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      showSuccessToast('deploymentStartedTitle', 'deploymentStartedDesc');
    },
  });
}

export function useCancelDeployment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deploymentId: string) => {
      const result = await cancelDeployment(projectId, deploymentId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data, deploymentId) => {
      queryClient.invalidateQueries({ queryKey: deploymentKeys.list(projectId) });
      queryClient.setQueryData(deploymentKeys.detail(projectId, deploymentId), data);
      showSuccessToast('deploymentCancelledTitle', 'deploymentCancelledDesc');
    },
  });
}

export function useRedeployDeployment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deploymentId: string) => {
      const result = await redeployDeployment(projectId, deploymentId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deploymentKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      showSuccessToast('redeploymentStartedTitle', 'redeploymentStartedDesc');
    },
  });
}

export function useRollbackDeployment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deploymentId: string) => {
      const result = await rollbackDeployment(projectId, deploymentId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deploymentKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      showSuccessToast('rollbackStartedTitle', 'rollbackStartedDesc');
    },
  });
}
