'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getEnvVars,
  createEnvVar,
  updateEnvVar,
  deleteEnvVar,
  bulkCreateEnvVars,
  type Environment,
  type CreateEnvVarInput,
  type UpdateEnvVarInput,
} from '@/lib/api';

// Query Keys
export const envVarKeys = {
  all: ['envVars'] as const,
  lists: () => [...envVarKeys.all, 'list'] as const,
  list: (projectId: string, environment?: Environment) =>
    [...envVarKeys.lists(), projectId, environment] as const,
};

// ============ Queries ============

export function useEnvVars(projectId: string, environment?: Environment) {
  return useQuery({
    queryKey: envVarKeys.list(projectId, environment),
    queryFn: async () => {
      const result = await getEnvVars(projectId, environment);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
  });
}

// ============ Mutations ============
// Note: Error handling is done globally in providers.tsx via MutationCache

export function useCreateEnvVar(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEnvVarInput) => {
      const result = await createEnvVar(projectId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: envVarKeys.list(projectId) });
      toast.success('Variable added', {
        description: `${data?.key} has been added`,
      });
    },
  });
}

export function useUpdateEnvVar(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ envVarId, input }: { envVarId: string; input: UpdateEnvVarInput }) => {
      const result = await updateEnvVar(projectId, envVarId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: envVarKeys.list(projectId) });
      toast.success('Variable updated', {
        description: `${data?.key} has been updated`,
      });
    },
  });
}

export function useDeleteEnvVar(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (envVarId: string) => {
      const result = await deleteEnvVar(projectId, envVarId);
      if (result.error) throw new Error(result.error.message);
      return envVarId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: envVarKeys.list(projectId) });
      toast.success('Variable deleted', {
        description: 'Environment variable has been deleted',
      });
    },
  });
}

export function useBulkCreateEnvVars(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (envVars: CreateEnvVarInput[]) => {
      const result = await bulkCreateEnvVars(projectId, envVars);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: envVarKeys.list(projectId) });
      toast.success('Variables added', {
        description: `${data?.length || 0} variables have been added`,
      });
    },
  });
}
