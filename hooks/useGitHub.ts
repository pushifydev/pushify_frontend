'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGitHubStatus,
  getGitHubAuthUrl,
  connectGitHub,
  disconnectGitHub,
  getGitHubRepos,
  getGitHubBranches,
  detectFramework,
  type GitHubStatus,
  type GitHubRepo,
  type GitHubBranch,
  type FrameworkDetection,
} from '@/lib/api';

// Query Keys
export const githubKeys = {
  all: ['github'] as const,
  status: () => [...githubKeys.all, 'status'] as const,
  repos: () => [...githubKeys.all, 'repos'] as const,
  reposList: (filters?: Record<string, unknown>) => [...githubKeys.repos(), filters] as const,
  branches: (owner: string, repo: string) => [...githubKeys.all, 'branches', owner, repo] as const,
  detect: (owner: string, repo: string, branch?: string) => [...githubKeys.all, 'detect', owner, repo, branch] as const,
};

// ============ Queries ============

/**
 * Get GitHub connection status
 */
export function useGitHubStatus() {
  return useQuery({
    queryKey: githubKeys.status(),
    queryFn: async () => {
      const result = await getGitHubStatus();
      if (result.error) throw new Error(result.error.message);
      return result.data as GitHubStatus;
    },
  });
}

/**
 * Get GitHub repositories with infinite scroll support
 */
export function useGitHubRepos(options?: {
  perPage?: number;
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  enabled?: boolean;
}) {
  const { enabled = true, perPage = 30, sort = 'pushed' } = options || {};

  const query = useInfiniteQuery({
    queryKey: githubKeys.reposList({ perPage, sort }),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getGitHubRepos({ page: pageParam, perPage, sort });
      if (result.error) throw new Error(result.error.message);
      return {
        repos: result.data as GitHubRepo[],
        page: pageParam,
        hasMore: (result.data as GitHubRepo[]).length === perPage,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    enabled,
  });

  // Flatten all pages into a single array
  const allRepos = query.data?.pages.flatMap((page) => page.repos) ?? [];

  return {
    ...query,
    data: allRepos,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
}

/**
 * Get repository branches
 */
export function useGitHubBranches(owner: string, repo: string, enabled = true) {
  return useQuery({
    queryKey: githubKeys.branches(owner, repo),
    queryFn: async () => {
      const result = await getGitHubBranches(owner, repo);
      if (result.error) throw new Error(result.error.message);
      return result.data as GitHubBranch[];
    },
    enabled: enabled && !!owner && !!repo,
  });
}

/**
 * Detect framework from repository
 */
export function useFrameworkDetection(owner: string, repo: string, branch?: string, enabled = true) {
  return useQuery({
    queryKey: githubKeys.detect(owner, repo, branch),
    queryFn: async () => {
      const result = await detectFramework(owner, repo, branch);
      if (result.error) throw new Error(result.error.message);
      return result.data as FrameworkDetection;
    },
    enabled: enabled && !!owner && !!repo,
  });
}

// ============ Mutations ============

/**
 * Initiate GitHub OAuth flow
 */
export function useGitHubConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await getGitHubAuthUrl();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      // Store state in sessionStorage for callback verification
      if (data) {
        sessionStorage.setItem('github_oauth_state', data.state);
        // Redirect to GitHub OAuth
        window.location.href = data.url;
      }
    },
  });
}

/**
 * Complete GitHub OAuth callback
 */
export function useGitHubCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const result = await connectGitHub(code, state);
      if (result.error) throw new Error(result.error.message);
      return result.data as GitHubStatus;
    },
    onSuccess: () => {
      // Invalidate all GitHub queries
      queryClient.invalidateQueries({ queryKey: githubKeys.all });
    },
  });
}

/**
 * Disconnect GitHub
 */
export function useGitHubDisconnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await disconnectGitHub();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      // Invalidate all GitHub queries
      queryClient.invalidateQueries({ queryKey: githubKeys.all });
    },
  });
}
