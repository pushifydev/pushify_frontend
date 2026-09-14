'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getAdminOverview,
  getAdminUsers,
  getAdminUser,
  getAdminActivity,
  getAdminAuthEvents,
  type AdminUserSort,
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
  users: (params: { search: string; sort: AdminUserSort; page: number; pageSize: number }) =>
    [...adminKeys.all, 'users', params] as const,
  user: (userId: string) => [...adminKeys.all, 'user', userId] as const,
  activity: (page: number, pageSize: number) => [...adminKeys.all, 'activity', page, pageSize] as const,
  authEvents: (page: number, pageSize: number) => [...adminKeys.all, 'auth-events', page, pageSize] as const,
};

export function useAdminOverview() {
  return useQuery({
    queryKey: adminKeys.overview(),
    queryFn: async () => unwrap(await getAdminOverview()),
    refetchInterval: 60_000,
  });
}

export function useAdminUsers(params: { search: string; sort: AdminUserSort; page: number; pageSize?: number }) {
  const pageSize = params.pageSize ?? 50;
  const key = { search: params.search, sort: params.sort, page: params.page, pageSize };
  return useQuery({
    queryKey: adminKeys.users(key),
    queryFn: async () =>
      unwrap(
        await getAdminUsers({
          search: params.search,
          sort: params.sort,
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
