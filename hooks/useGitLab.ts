'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGitLabStatus,
  getGitLabAuthUrl,
  connectGitLab,
  disconnectGitLab,
  getGitLabRepos,
  getGitLabBranches,
  detectGitLabFramework,
  type GitLabStatus,
  type GitLabRepo,
  type GitLabBranch,
  type GitLabFrameworkDetection,
} from '@/lib/api/services/gitlab.service';

export const gitlabKeys = {
  all: ['gitlab'] as const,
  status: () => [...gitlabKeys.all, 'status'] as const,
  repos: () => [...gitlabKeys.all, 'repos'] as const,
  reposList: (filters?: Record<string, unknown>) => [...gitlabKeys.repos(), filters] as const,
  branches: (projectId: number) => [...gitlabKeys.all, 'branches', projectId] as const,
  detect: (projectId: number, branch?: string) =>
    [...gitlabKeys.all, 'detect', projectId, branch] as const,
};

export function useGitLabStatus() {
  return useQuery({
    queryKey: gitlabKeys.status(),
    queryFn: async () => {
      const result = await getGitLabStatus();
      if (result.error) throw new Error(result.error.message);
      return result.data as GitLabStatus;
    },
  });
}

export function useGitLabRepos(options?: { perPage?: number; enabled?: boolean }) {
  const { enabled = true, perPage = 30 } = options || {};

  const query = useInfiniteQuery({
    queryKey: gitlabKeys.reposList({ perPage }),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getGitLabRepos({ page: pageParam, perPage });
      if (result.error) throw new Error(result.error.message);
      return {
        repos: result.data as GitLabRepo[],
        page: pageParam,
        hasMore: (result.data as GitLabRepo[]).length === perPage,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled,
  });

  const allRepos = query.data?.pages.flatMap((page) => page.repos) ?? [];

  return {
    ...query,
    data: allRepos,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
}

export function useGitLabBranches(projectId: number, enabled = true) {
  return useQuery({
    queryKey: gitlabKeys.branches(projectId),
    queryFn: async () => {
      const result = await getGitLabBranches(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data as GitLabBranch[];
    },
    enabled: enabled && projectId > 0,
  });
}

export function useGitLabFrameworkDetection(
  projectId: number,
  branch?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: gitlabKeys.detect(projectId, branch),
    queryFn: async () => {
      const result = await detectGitLabFramework(projectId, branch);
      if (result.error) throw new Error(result.error.message);
      return result.data as GitLabFrameworkDetection;
    },
    enabled: enabled && projectId > 0,
  });
}

export function useGitLabConnect() {
  return useMutation({
    mutationFn: async () => {
      const result = await getGitLabAuthUrl();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        localStorage.setItem('gitlab_oauth_state', data.state);
        window.location.href = data.url;
      }
    },
  });
}

export function useGitLabCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const result = await connectGitLab(code, state);
      if (result.error) throw new Error(result.error.message);
      return result.data as GitLabStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gitlabKeys.all });
    },
  });
}

export function useGitLabDisconnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await disconnectGitLab();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gitlabKeys.all });
    },
  });
}
