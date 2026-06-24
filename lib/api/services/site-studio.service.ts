import { api } from '../client';
import type { ApiResponse } from '../types';

export type SiteStudioCategory =
  | 'ecommerce'
  | 'corporate'
  | 'blog'
  | 'portfolio'
  | 'restaurant'
  | 'newsletter'
  | 'booking'
  | 'saas';

export type SiteStudioStack =
  | 'static'
  | 'wordpress'
  | 'ghost'
  | 'strapi'
  | 'directus'
  | 'pocketbase'
  | 'calcom';

export interface SiteStudioLaunchField {
  envKey: string;
  label: string;
  description: string;
  type: 'email' | 'text';
  required: boolean;
}

export interface PaymentIntegrationInfo {
  id: string;
  name: string;
  region: 'tr' | 'global';
  setupNote: string;
}

export interface SetupGuideStep {
  title: string;
  description: string;
}

export interface SiteStudioTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: SiteStudioCategory;
  stack: SiteStudioStack;
  icon: string;
  launchFields?: SiteStudioLaunchField[];
  accent: string;
  /** 'static' = Pushify-native site served as static HTML (no CMS app); 'cms' otherwise. */
  deployment?: 'cms' | 'static';
  marketplaceTemplateId?: string;
  featured: boolean;
  estimatedMinutes: number;
  features: string[];
  paymentIntegrations?: PaymentIntegrationInfo[];
  setupGuide: SetupGuideStep[];
  presetEnvVars?: Record<string, string>;
  suggestedPlugins?: string[];
}

export interface LaunchSiteInput {
  siteTemplateId: string;
  serverId: string;
  name: string;
  domain?: string;
  envVars?: Record<string, string>;
}

export interface LaunchSiteResult {
  project: { id: string; name: string; slug: string };
  deployment: { id: string; status: string };
  siteTemplate: SiteStudioTemplate;
  setupGuide: SetupGuideStep[];
  paymentIntegrations: PaymentIntegrationInfo[];
  suggestedPlugins: string[];
  domain?: { id: string; domain: string } | null;
}

export async function getSiteStudioStacks(): Promise<
  ApiResponse<{ stacks: SiteStudioStack[]; summary: { stack: SiteStudioStack; count: number }[] }>
> {
  try {
    const { data } = await api.get('/site-studio/stacks');
    return { data };
  } catch (err: any) {
    return {
      error: err.response?.data?.error || { code: 'UNKNOWN', message: 'Failed to fetch stacks' },
    };
  }
}

export async function getSiteStudioTemplates(params?: {
  category?: string;
  search?: string;
  stack?: string;
}): Promise<ApiResponse<SiteStudioTemplate[]>> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.stack) queryParams.set('stack', params.stack);
    const query = queryParams.toString();
    const url = `/site-studio/templates${query ? `?${query}` : ''}`;
    const { data } = await api.get(url);
    return { data };
  } catch (err: any) {
    return {
      error: err.response?.data?.error || { code: 'UNKNOWN', message: 'Failed to fetch site templates' },
    };
  }
}

export async function getSiteStudioTemplate(
  templateId: string
): Promise<ApiResponse<SiteStudioTemplate>> {
  try {
    const { data } = await api.get(`/site-studio/templates/${templateId}`);
    return { data };
  } catch (err: any) {
    return {
      error: err.response?.data?.error || { code: 'UNKNOWN', message: 'Site template not found' },
    };
  }
}

export async function launchSite(
  input: LaunchSiteInput
): Promise<ApiResponse<LaunchSiteResult>> {
  try {
    const { data } = await api.post('/site-studio/launch', input);
    return { data };
  } catch (err: any) {
    return {
      error: err.response?.data?.error || { code: 'UNKNOWN', message: 'Launch failed' },
    };
  }
}

export const siteStudioService = {
  getTemplates: getSiteStudioTemplates,
  getTemplate: getSiteStudioTemplate,
  launch: launchSite,
};
