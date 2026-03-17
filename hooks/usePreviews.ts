'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getPreviewDeployments,
  getActivePreviewDeployments,
} from '@/lib/api';

// Query Keys
export const previewKeys = {
  all: ['previews'] as const,
  byProject: (projectId: string) => [...previewKeys.all, 'project', projectId] as const,
  activeByProject: (projectId: string) => [...previewKeys.all, 'active', projectId] as const,
};

// ============ Queries ============

export function usePreviewDeployments(projectId: string) {
  return useQuery({
    queryKey: previewKeys.byProject(projectId),
    queryFn: async () => {
      const result = await getPreviewDeployments(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
  });
}

export function useActivePreviewDeployments(projectId: string) {
  return useQuery({
    queryKey: previewKeys.activeByProject(projectId),
    queryFn: async () => {
      const result = await getActivePreviewDeployments(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
