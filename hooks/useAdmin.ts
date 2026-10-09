'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  getAdminOverview,
  getAdminUsers,
  getAdminUser,
  getAdminActivity,
  getAdminAuthEvents,
  getAdminAbuseFlags,
  getAdminAbuseClauses,
  dismissAdminAbuseFlag,
  suspendAdminProject,
  unsuspendAdminProject,
  type AbuseFlagStatus,
  type AbuseSuspendInput,
  type AdminUserSort,
  type AdminUserFilter,
} from '@/lib/api';
import type { ApiError, ApiResponse } from '@/lib/api';

/** Keeps the API error code so the admin pages can tell "enable 2FA" (403) from a real failure. */
export class AdminRequestError extends Error {
  code: string;
  constructor(error: ApiError) {
    super(error.message);
    this.name = 'AdminRequestError';
    this.code = error.code;
  }
}

const unwrap = <T,>(result: ApiResponse<T>): T => {
  if (result.error) throw new AdminRequestError(result.error);
  return result.data as T;
};

export const adminKeys = {
  all: ['admin'] as const,
  overview: () => [...adminKeys.all, 'overview'] as const,
  users: (params: { search: string; sort: AdminUserSort; filter: AdminUserFilter; page: number; pageSize: number }) =>
    [...adminKeys.all, 'users', params] as const,
  user: (userId: string) => [...adminKeys.all, 'user', userId] as const,
  activity: (page: number, pageSize: number) => [...adminKeys.all, 'activity', page, pageSize] as const,
  authEvents: (page: number, pageSize: number) => [...adminKeys.all, 'auth-events', page, pageSize] as const,
  abuse: (status: string, page: number, pageSize: number) => [...adminKeys.all, 'abuse', status, page, pageSize] as const,
  abuseClauses: () => [...adminKeys.all, 'abuse-clauses'] as const,
};

export function useAdminOverview() {
  return useQuery({
    queryKey: adminKeys.overview(),
    queryFn: async () => unwrap(await getAdminOverview()),
    refetchInterval: 60_000,
  });
}

export function useAdminUsers(params: {
  search: string;
  sort: AdminUserSort;
  filter?: AdminUserFilter;
  page: number;
  pageSize?: number;
}) {
  const pageSize = params.pageSize ?? 50;
  const filter = params.filter ?? 'all';
  const key = { search: params.search, sort: params.sort, filter, page: params.page, pageSize };
  return useQuery({
    queryKey: adminKeys.users(key),
    queryFn: async () =>
      unwrap(
        await getAdminUsers({
          search: params.search,
          sort: params.sort,
          filter,
          limit: pageSize,
          offset: (params.page - 1) * pageSize,
        })
      ),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: adminKeys.user(userId),
    queryFn: async () => unwrap(await getAdminUser(userId)),
    enabled: !!userId,
  });
}

export function useAdminActivity(page: number, pageSize = 50) {
  return useQuery({
    queryKey: adminKeys.activity(page, pageSize),
    queryFn: async () => unwrap(await getAdminActivity({ limit: pageSize, offset: (page - 1) * pageSize })),
    placeholderData: keepPreviousData,
  });
}

export function useAdminAuthEvents(page: number, pageSize = 50) {
  return useQuery({
    queryKey: adminKeys.authEvents(page, pageSize),
    queryFn: async () => unwrap(await getAdminAuthEvents({ limit: pageSize, offset: (page - 1) * pageSize })),
    placeholderData: keepPreviousData,
  });
}

export function useAdminAbuseFlags(status: AbuseFlagStatus | 'all', page: number, pageSize = 50) {
  return useQuery({
    queryKey: adminKeys.abuse(status, page, pageSize),
    queryFn: async () => unwrap(await getAdminAbuseFlags({ status, limit: pageSize, offset: (page - 1) * pageSize })),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useAdminAbuseClauses() {
  return useQuery({
    queryKey: adminKeys.abuseClauses(),
    queryFn: async () => unwrap(await getAdminAbuseClauses()),
    staleTime: Infinity,
    retry: false,
  });
}

/** Dismiss, suspend and unsuspend all refresh the queue. */
export function useAdminAbuseActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'abuse'] });
  return {
    dismiss: useMutation({
      mutationFn: async (v: { flagId: string; note: string | null }) => unwrap(await dismissAdminAbuseFlag(v.flagId, v.note)),
      onSuccess: refresh,
    }),
    suspend: useMutation({
      mutationFn: async (v: { projectId: string; input: AbuseSuspendInput }) => unwrap(await suspendAdminProject(v.projectId, v.input)),
      onSuccess: refresh,
    }),
    unsuspend: useMutation({
      mutationFn: async (v: { projectId: string; note: string | null }) => unwrap(await unsuspendAdminProject(v.projectId, v.note)),
      onSuccess: refresh,
    }),
  };
}
