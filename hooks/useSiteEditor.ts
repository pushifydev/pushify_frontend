'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api/get-error-message';
import { appT } from '@/lib/i18n/app-translate';
import {
  getSiteEditorState,
  updateSiteSeo,
  updateSiteBlocks,
  updateSiteTheme,
  updateSiteCmsConfig,
  publishSite,
  type SiteSeo,
  type SiteBlock,
  type SiteTheme,
  type CmsMode,
} from '@/lib/api';

export const siteEditorKeys = {
  all: ['site-editor'] as const,
  state: (projectId: string) => [...siteEditorKeys.all, projectId] as const,
};

export function useSiteEditor(projectId: string) {
  return useQuery({
    queryKey: siteEditorKeys.state(projectId),
    queryFn: async () => {
      const result = await getSiteEditorState(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    enabled: !!projectId,
  });
}

export function useUpdateSiteSeo(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (seo: Partial<SiteSeo>) => {
      const result = await updateSiteSeo(projectId, seo);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteEditorKeys.state(projectId) });
      toast.success(appT('siteEditor', 'seoSaved'));
    },
    onError: (error: Error) => {
      toast.error(appT('errors', 'somethingWentWrong'), {
        description: getApiErrorMessage(error),
      });
    },
  });
}

export function useUpdateSiteBlocks(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blocks: SiteBlock[]) => {
      const result = await updateSiteBlocks(projectId, blocks);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteEditorKeys.state(projectId) });
      toast.success(appT('siteEditor', 'blocksSaved'));
    },
    onError: (error: Error) => {
      toast.error(appT('errors', 'somethingWentWrong'), {
        description: getApiErrorMessage(error),
      });
    },
  });
}

export function useUpdateSiteTheme(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: Partial<SiteTheme>) => {
      const result = await updateSiteTheme(projectId, theme);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteEditorKeys.state(projectId) });
      toast.success(appT('siteEditor', 'themeSaved'));
    },
    onError: (error: Error) => {
      toast.error(appT('errors', 'somethingWentWrong'), {
        description: getApiErrorMessage(error),
      });
    },
  });
}

export function useUpdateSiteCms(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: {
      mode: CmsMode;
      apiUrl?: string;
      apiToken?: string;
      collection?: string;
    }) => {
      const result = await updateSiteCmsConfig(projectId, config);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteEditorKeys.state(projectId) });
      toast.success(appT('siteEditor', 'cmsSaved'));
    },
    onError: (error: Error) => {
      toast.error(appT('errors', 'somethingWentWrong'), {
        description: getApiErrorMessage(error),
      });
    },
  });
}

export function usePublishSite(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await publishSite(projectId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: siteEditorKeys.state(projectId) });
      toast.success(appT('siteEditor', 'publishSuccess'), {
        description: data?.cmsSync?.message,
      });
    },
    onError: (error: Error) => {
      toast.error(appT('errors', 'somethingWentWrong'), {
        description: getApiErrorMessage(error),
      });
    },
  });
}
