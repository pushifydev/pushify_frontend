'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getSiteStudioTemplates,
  getSiteStudioTemplate,
  getSiteStudioStacks,
  launchSite,
  type LaunchSiteInput,
} from '@/lib/api';

export const siteStudioKeys = {
  all: ['site-studio'] as const,
  templates: () => [...siteStudioKeys.all, 'templates'] as const,
  templateList: (filters?: { category?: string; search?: string; stack?: string }) =>
    [...siteStudioKeys.templates(), filters] as const,
  stacks: () => [...siteStudioKeys.all, 'stacks'] as const,
  template: (id: string) => [...siteStudioKeys.all, 'template', id] as const,
};

export function useSiteStudioStacks() {
  return useQuery({
    queryKey: siteStudioKeys.stacks(),
    queryFn: async () => {
      const result = await getSiteStudioStacks();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
  });
}

export function useSiteStudioTemplates(filters?: {
  category?: string;
  search?: string;
  stack?: string;
}) {
  return useQuery({
    queryKey: siteStudioKeys.templateList(filters),
    queryFn: async () => {
      const result = await getSiteStudioTemplates(filters);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

export function useSiteStudioTemplate(templateId: string) {
  return useQuery({
    queryKey: siteStudioKeys.template(templateId),
    queryFn: async () => {
      const result = await getSiteStudioTemplate(templateId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!templateId,
  });
}

export function useLaunchSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LaunchSiteInput) => {
      const result = await launchSite(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
