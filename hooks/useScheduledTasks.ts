'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getScheduledTasks,
  createScheduledTask,
  updateScheduledTask,
  deleteScheduledTask,
  runScheduledTask,
  getScheduledTaskRuns,
  type CreateScheduledTaskInput,
  type UpdateScheduledTaskInput,
} from '@/lib/api';

// Query Keys
export const scheduledTaskKeys = {
  all: ['scheduledTasks'] as const,
  list: (projectId: string) => [...scheduledTaskKeys.all, 'list', projectId] as const,
  runs: (projectId: string, taskId: string) =>
    [...scheduledTaskKeys.all, 'runs', projectId, taskId] as const,
};

// ============ Queries ============

export function useScheduledTasks(projectId: string) {
  return useQuery({
    queryKey: scheduledTaskKeys.list(projectId),
    queryFn: async () => {
      const result = await getScheduledTasks(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId,
  });
}

export function useScheduledTaskRuns(projectId: string, taskId: string | null) {
  return useQuery({
    queryKey: scheduledTaskKeys.runs(projectId, taskId ?? ''),
    queryFn: async () => {
      const result = await getScheduledTaskRuns(projectId, taskId!);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!projectId && !!taskId,
  });
}

// ============ Mutations ============
// Note: Error handling is done globally in providers.tsx via MutationCache

export function useCreateScheduledTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateScheduledTaskInput) => {
      const result = await createScheduledTask(projectId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.list(projectId) });
    },
  });
}

export function useUpdateScheduledTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, input }: { taskId: string; input: UpdateScheduledTaskInput }) => {
      const result = await updateScheduledTask(projectId, taskId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.list(projectId) });
    },
  });
}

export function useDeleteScheduledTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const result = await deleteScheduledTask(projectId, taskId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.list(projectId) });
    },
  });
}

export function useRunScheduledTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const result = await runScheduledTask(projectId, taskId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: scheduledTaskKeys.runs(projectId, taskId) });
    },
  });
}
