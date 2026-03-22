'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getMarketplaceTemplates,
  getMarketplaceTemplate,
  deployMarketplaceApp,
  getMarketplaceDeployments,
  type MarketplaceTemplate,
  type DeployMarketplaceInput,
  type MarketplaceDeployment,
} from '@/lib/api';

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  templates: () => [...marketplaceKeys.all, 'templates'] as const,
  templateList: (filters?: { category?: string; search?: string }) =>
    [...marketplaceKeys.templates(), filters] as const,
  template: (id: string) => [...marketplaceKeys.all, 'template', id] as const,
  deployments: () => [...marketplaceKeys.all, 'deployments'] as const,
};

export function useMarketplaceTemplates(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: marketplaceKeys.templateList(filters),
    queryFn: async () => {
      const result = await getMarketplaceTemplates(filters);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

export function useMarketplaceTemplate(templateId: string) {
  return useQuery({
    queryKey: marketplaceKeys.template(templateId),
    queryFn: async () => {
      const result = await getMarketplaceTemplate(templateId);
      if (result.error) throw new Error(result.error.message);
      return result.data as MarketplaceTemplate;
    },
    enabled: !!templateId,
  });
}

export function useDeployMarketplaceApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeployMarketplaceInput) => {
      const result = await deployMarketplaceApp(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.deployments() });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useMarketplaceDeployments() {
  return useQuery({
    queryKey: marketplaceKeys.deployments(),
    queryFn: async () => {
      const result = await getMarketplaceDeployments();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}
