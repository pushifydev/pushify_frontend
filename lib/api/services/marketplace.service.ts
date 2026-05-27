import { api } from '../client';
import type { ApiResponse } from '../types';

// ============ Types ============

export type MarketplaceCategory = 'cms' | 'automation' | 'monitoring' | 'storage' | 'devtools' | 'analytics' | 'database';

export interface MarketplaceEnvVar {
  key: string;
  label: string;
  description: string;
  required: boolean;
  default?: string;
  type: 'text' | 'password' | 'number' | 'url' | 'email';
  generate?: 'password' | 'secret';
}

export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  category: MarketplaceCategory;
  tags: string[];
  website: string;
  documentation: string;
  dockerImage: string;
  port: number;
  healthCheckPath: string;
  envVars: MarketplaceEnvVar[];
  minMemoryMb: number;
  minDiskGb: number;
  requiresDatabase?: { type: 'postgresql' | 'mysql' | 'mongodb' | 'redis'; version?: string };
  version: string;
  appVersion: string;
  featured: boolean;
}

export interface DeployMarketplaceInput {
  templateId: string;
  serverId: string;
  name: string;
  envVars: Record<string, string>;
  domain?: string;
}

export interface MarketplaceDeploymentProject {
  id: string;
  name: string;
  slug: string;
  status: string;
  serverId: string | null;
  productionUrl: string | null;
}

export interface MarketplaceDeployment {
  id: string;
  projectId: string;
  templateId: string;
  templateName?: string;
  templateIcon?: string;
  templateCategory?: string | null;
  templateVersion: string;
  appVersion: string;
  configuration: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  project?: MarketplaceDeploymentProject;
}

// ============ API Functions ============

export async function getMarketplaceTemplates(params?: {
  category?: string;
  search?: string;
}): Promise<ApiResponse<MarketplaceTemplate[]>> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.search) queryParams.set('search', params.search);
    const query = queryParams.toString();
    const url = `/marketplace/templates${query ? `?${query}` : ''}`;
    const { data } = await api.get(url);
    return { data };
  } catch (err: any) {
    return { error: err.response?.data?.error || { code: 'UNKNOWN', message: 'Failed to fetch templates' } };
  }
}

export async function getMarketplaceTemplate(templateId: string): Promise<ApiResponse<MarketplaceTemplate>> {
  try {
    const { data } = await api.get(`/marketplace/templates/${templateId}`);
    return { data };
  } catch (err: any) {
    return { error: err.response?.data?.error || { code: 'UNKNOWN', message: 'Template not found' } };
  }
}

export async function deployMarketplaceApp(input: DeployMarketplaceInput): Promise<ApiResponse<{ project: any; deployment: any; marketplaceDeployment: any }>> {
  try {
    const { data } = await api.post('/marketplace/deploy', input);
    return { data };
  } catch (err: any) {
    return { error: err.response?.data?.error || { code: 'UNKNOWN', message: 'Deploy failed' } };
  }
}

export async function getMarketplaceDeployments(): Promise<ApiResponse<MarketplaceDeployment[]>> {
  try {
    const { data } = await api.get('/marketplace/deployments');
    return { data };
  } catch (err: any) {
    return { error: err.response?.data?.error || { code: 'UNKNOWN', message: 'Failed to fetch deployments' } };
  }
}

export const marketplaceService = {
  getTemplates: getMarketplaceTemplates,
  getTemplate: getMarketplaceTemplate,
  deploy: deployMarketplaceApp,
  getDeployments: getMarketplaceDeployments,
};
