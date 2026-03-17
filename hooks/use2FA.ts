'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  get2faStatus,
  setup2fa,
  enable2fa,
  disable2fa,
  regenerateBackupCodes,
  type TwoFactorSetup,
  type TwoFactorStatus,
} from '@/lib/api/services/auth.service';

// Query Keys
export const twoFactorKeys = {
  all: ['2fa'] as const,
  status: () => [...twoFactorKeys.all, 'status'] as const,
};

// ============ Queries ============

export function use2FAStatus() {
  return useQuery({
    queryKey: twoFactorKeys.status(),
    queryFn: async () => {
      const result = await get2faStatus();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}

// ============ Mutations ============

export function useSetup2FA() {
  return useMutation({
    mutationFn: async () => {
      const result = await setup2fa();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}

export function useEnable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, backupCodes }: { code: string; backupCodes: string[] }) => {
      const result = await enable2fa(code, backupCodes);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.status() });
    },
  });
}

export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      const result = await disable2fa(password);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.status() });
    },
  });
}

export function useRegenerateBackupCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      const result = await regenerateBackupCodes(password);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.status() });
    },
  });
}
