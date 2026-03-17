'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApiKeys,
  getApiKeyScopes,
  createApiKey,
  updateApiKey,
  revokeApiKey,
  type CreateApiKeyInput,
  type UpdateApiKeyInput,
} from '@/lib/api';

// Query Keys
export const apiKeyKeys = {
  all: ['apiKeys'] as const,
  list: () => [...apiKeyKeys.all, 'list'] as const,
  scopes: () => [...apiKeyKeys.all, 'scopes'] as const,
};

// ============ Queries ============

export function useApiKeys() {
  return useQuery({
    queryKey: apiKeyKeys.list(),
    queryFn: async () => {
      const result = await getApiKeys();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

export function useApiKeyScopes() {
  return useQuery({
    queryKey: apiKeyKeys.scopes(),
    queryFn: async () => {
      const result = await getApiKeyScopes();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? {};
    },
    staleTime: Infinity, // Scopes don't change
  });
}

// ============ Mutations ============

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateApiKeyInput) => {
      const result = await createApiKey(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() });
    },
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ keyId, input }: { keyId: string; input: UpdateApiKeyInput }) => {
      const result = await updateApiKey(keyId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const result = await revokeApiKey(keyId);
      if (result.error) throw new Error(result.error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() });
    },
  });
}
