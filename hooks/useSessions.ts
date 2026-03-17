'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSessions,
  terminateSession,
  terminateOtherSessions,
  type Session,
} from '@/lib/api/services/auth.service';
import { getRefreshToken } from '@/lib/api/client';

// Query Keys
export const sessionKeys = {
  all: ['sessions'] as const,
  list: () => [...sessionKeys.all, 'list'] as const,
};

// ============ Queries ============

export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: async () => {
      const result = await getSessions();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}

// ============ Mutations ============

export function useTerminateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const result = await terminateSession(sessionId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
    },
  });
}

export function useTerminateOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token found');

      const result = await terminateOtherSessions(refreshToken);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
    },
  });
}
