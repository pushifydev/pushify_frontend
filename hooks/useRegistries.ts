'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRegistries,
  createRegistry,
  deleteRegistry,
  type CreateRegistryInput,
} from '@/lib/api';

// Query Keys
export const registryKeys = {
  all: ['registries'] as const,
  list: () => [...registryKeys.all, 'list'] as const,
};

// ============ Queries ============

export function useRegistries() {
  return useQuery({
    queryKey: registryKeys.list(),
    queryFn: async () => {
      const result = await getRegistries();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

// ============ Mutations ============

export function useCreateRegistry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRegistryInput) => {
      const result = await createRegistry(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registryKeys.list() });
    },
  });
}

export function useDeleteRegistry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteRegistry(id);
      if (result.error) throw new Error(result.error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registryKeys.list() });
    },
  });
}
