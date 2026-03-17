'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateProfile,
  changePassword,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type ProfileUser,
} from '@/lib/api/services/auth.service';
import { useAuthStore } from '@/stores/auth';

// ============ Mutations ============

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore.getState();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const result = await updateProfile(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      // Update the user in the auth store
      if (user) {
        useAuthStore.setState({
          user: {
            ...user,
            name: data.name,
            avatarUrl: data.avatarUrl,
          },
        });
      }
      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      const result = await changePassword(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}
