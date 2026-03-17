'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getWebhookInfo,
  regenerateWebhookSecret,
  updateProjectSettings,
  type Project,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectStatus,
  type ProjectSettings,
} from '@/lib/api';

// Query Keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  webhook: (id: string) => [...projectKeys.all, 'webhook', id] as const,
};

// ============ Queries ============

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      const result = await getProjects();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const result = await getProject(id);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });
}

// ============ Mutations ============
// Note: Error handling is done globally in providers.tsx via MutationCache

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const result = await createProject(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project created', {
        description: `${data?.name} has been created`,
      });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProjectInput) => {
      const result = await updateProject(id, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(id), data);
      toast.success('Project updated', {
        description: 'Project settings have been saved',
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProject(id);
      if (result.error) throw new Error(result.error.message);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      toast.success('Project deleted', {
        description: 'Project has been deleted',
      });
    },
  });
}

export function useUpdateProjectStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: ProjectStatus) => {
      const result = await updateProjectStatus(id, status);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(id), data);
      const statusMessage = data?.status === 'active' ? 'resumed' : 'paused';
      toast.success(`Project ${statusMessage}`, {
        description: `Project has been ${statusMessage}`,
      });
    },
  });
}

// ============ Webhook Hooks ============

export function useWebhookInfo(projectId: string) {
  return useQuery({
    queryKey: projectKeys.webhook(projectId),
    queryFn: async () => {
      const result = await getWebhookInfo(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!projectId,
  });
}

export function useRegenerateWebhookSecret(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await regenerateWebhookSecret(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.webhook(projectId) });
      toast.success('Webhook secret regenerated', {
        description: 'Remember to update your webhook configuration',
      });
    },
  });
}

// ============ Settings Hooks ============

export function useUpdateProjectSettings(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: ProjectSettings) => {
      const result = await updateProjectSettings(projectId, settings);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(projectId), data);
      toast.success('Settings saved', {
        description: 'Project settings have been updated',
      });
    },
  });
}
