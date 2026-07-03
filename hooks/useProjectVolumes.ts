'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjectVolumes,
  createProjectVolume,
  deleteProjectVolume,
  type CreateProjectVolumeInput,
} from '@/lib/api';

// Query Keys
export const projectVolumeKeys = {
  all: ['projectVolumes'] as const,
  list: (projectId: string) => [...projectVolumeKeys.all, 'list', projectId] as const,
};

// ============ Queries ============

export function useProjectVolumes(projectId: string) {
  return useQuery({
    queryKey: projectVolumeKeys.list(projectId),
    queryFn: async () => {
      const result = await getProjectVolumes(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
  });
}

// ============ Mutations ============
// Note: Error handling is done globally in providers.tsx via MutationCache

export function useCreateProjectVolume(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectVolumeInput) => {
      const result = await createProjectVolume(projectId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectVolumeKeys.list(projectId) });
    },
  });
}

export function useDeleteProjectVolume(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (volumeId: string) => {
      const result = await deleteProjectVolume(projectId, volumeId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectVolumeKeys.list(projectId) });
    },
  });
}
