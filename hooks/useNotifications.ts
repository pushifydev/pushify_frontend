'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getNotificationChannels,
  createNotificationChannel,
  updateNotificationChannel,
  deleteNotificationChannel,
  testNotificationChannel,
  getNotificationLogs,
  type CreateNotificationChannelInput,
  type UpdateNotificationChannelInput,
} from '@/lib/api';

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  channels: (projectId: string) => [...notificationKeys.all, 'channels', projectId] as const,
  logs: (projectId: string, channelId: string) =>
    [...notificationKeys.all, 'logs', projectId, channelId] as const,
};

// ============ Queries ============

export function useNotificationChannels(projectId: string) {
  return useQuery({
    queryKey: notificationKeys.channels(projectId),
    queryFn: async () => {
      const result = await getNotificationChannels(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
  });
}

export function useNotificationLogs(projectId: string, channelId: string) {
  return useQuery({
    queryKey: notificationKeys.logs(projectId, channelId),
    queryFn: async () => {
      const result = await getNotificationLogs(projectId, channelId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId && !!channelId,
  });
}

// ============ Mutations ============
// Note: Error handling is done globally in providers.tsx via MutationCache

export function useCreateNotificationChannel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateNotificationChannelInput) => {
      const result = await createNotificationChannel(projectId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.channels(projectId) });
      toast.success('Channel created', {
        description: `${data?.name} notification channel has been created`,
      });
    },
  });
}

export function useUpdateNotificationChannel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      channelId,
      input,
    }: {
      channelId: string;
      input: UpdateNotificationChannelInput;
    }) => {
      const result = await updateNotificationChannel(projectId, channelId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.channels(projectId) });
      toast.success('Channel updated', {
        description: `${data?.name} has been updated`,
      });
    },
  });
}

export function useDeleteNotificationChannel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: string) => {
      const result = await deleteNotificationChannel(projectId, channelId);
      if (result.error) throw new Error(result.error.message);
      return channelId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.channels(projectId) });
      toast.success('Channel deleted', {
        description: 'Notification channel has been deleted',
      });
    },
  });
}

export function useTestNotificationChannel(projectId: string) {
  return useMutation({
    mutationFn: async (channelId: string) => {
      const result = await testNotificationChannel(projectId, channelId);
      if (result.error) throw new Error(result.error.message);
      return true;
    },
    onSuccess: () => {
      toast.success('Test sent', {
        description: 'Test notification has been sent',
      });
    },
  });
}
