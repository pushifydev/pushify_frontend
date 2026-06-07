import { api } from '../client';
import type { ApiResponse } from '../types';

export interface SiteSeo {
  title: string;
  description: string;
  ogImage: string;
  keywords: string;
}

export type SiteBlockType =
  | 'hero'
  | 'features'
  | 'text'
  | 'cta'
  | 'faq'
  | 'pricing'
  | 'banner'
  | 'stats'
  | 'footer';

export type SiteFontFamily = 'system' | 'serif' | 'rounded' | 'mono';
export type SiteBorderRadius = 'none' | 'sm' | 'md' | 'lg';
export type SiteMaxWidth = 'narrow' | 'default' | 'wide';

export interface SiteTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  fontFamily: SiteFontFamily;
  borderRadius: SiteBorderRadius;
  maxWidth: SiteMaxWidth;
}

export interface HeroBlock {
  id: string;
  type: 'hero';
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaUrl: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FeaturesBlock {
  id: string;
  type: 'features';
  title: string;
  items: FeatureItem[];
}

export interface TextBlock {
  id: string;
  type: 'text';
  title: string;
  body: string;
}

export interface CtaBlock {
  id: string;
  type: 'cta';
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqBlock {
  id: string;
  type: 'faq';
  title: string;
  items: FaqItem[];
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
  highlighted: boolean;
}

export interface PricingBlock {
  id: string;
  type: 'pricing';
  title: string;
  plans: PricingPlan[];
}

export interface BannerBlock {
  id: string;
  type: 'banner';
  imageUrl: string;
  headline: string;
  subheadline: string;
  overlayOpacity: number;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface StatsBlock {
  id: string;
  type: 'stats';
  items: StatItem[];
}

export interface FooterBlock {
  id: string;
  type: 'footer';
  copyright: string;
  links: FooterLink[];
}

export type SiteBlock =
  | HeroBlock
  | FeaturesBlock
  | TextBlock
  | CtaBlock
  | FaqBlock
  | PricingBlock
  | BannerBlock
  | StatsBlock
  | FooterBlock;

export type CmsMode = 'builtin' | 'strapi' | 'directus';

export interface CmsConfig {
  mode: CmsMode;
  apiUrl?: string;
  collection?: string;
  hasApiToken?: boolean;
}

export interface CmsBridgeUrls {
  adminUrl: string | null;
  previewUrl: string | null;
  docsUrl: string | null;
  label: string;
}

export interface SiteEditorState {
  projectId: string;
  siteName: string;
  siteTemplateId: string;
  stack: string | null;
  seo: SiteSeo;
  blocks: SiteBlock[];
  theme: SiteTheme;
  cmsConfig: CmsConfig;
  publishedAt: string | null;
  hasPublishedHtml: boolean;
  cmsBridge: CmsBridgeUrls;
  previewUrl: string | null;
  pushifyPreviewPath: string;
}

export interface PublishResult {
  publishedAt: string;
  cmsSync: { ok: boolean; message: string };
  sshPublish: { publishedPath: string; publicPath: string } | null;
  liveUrl: string | null;
}

export async function getSiteEditorState(
  projectId: string,
): Promise<ApiResponse<SiteEditorState>> {
  try {
    const { data } = await api.get<{ data: SiteEditorState }>(
      `/projects/${projectId}/site-editor`,
    );
    return { data: data.data };
  } catch (error) {
    return { error: error as ApiResponse<never>['error'] };
  }
}

export async function updateSiteSeo(
  projectId: string,
  seo: Partial<SiteSeo>,
): Promise<ApiResponse<{ seo: SiteSeo }>> {
  try {
    const { data } = await api.patch<{ data: { seo: SiteSeo } }>(
      `/projects/${projectId}/site-editor/seo`,
      seo,
    );
    return { data: data.data };
  } catch (error) {
    return { error: error as ApiResponse<never>['error'] };
  }
}

export async function updateSiteBlocks(
  projectId: string,
  blocks: SiteBlock[],
): Promise<ApiResponse<{ blocks: SiteBlock[] }>> {
  try {
    const { data } = await api.put<{ data: { blocks: SiteBlock[] } }>(
      `/projects/${projectId}/site-editor/blocks`,
      { blocks },
    );
    return { data: data.data };
  } catch (error) {
    return { error: error as ApiResponse<never>['error'] };
  }
}

export async function updateSiteTheme(
  projectId: string,
  theme: Partial<SiteTheme>,
): Promise<ApiResponse<{ theme: SiteTheme }>> {
  try {
    const { data } = await api.patch<{ data: { theme: SiteTheme } }>(
      `/projects/${projectId}/site-editor/theme`,
      theme,
    );
    return { data: data.data };
  } catch (error) {
    return { error: error as ApiResponse<never>['error'] };
  }
}

export async function updateSiteCmsConfig(
  projectId: string,
  config: { mode: CmsMode; apiUrl?: string; apiToken?: string; collection?: string },
): Promise<ApiResponse<{ cmsConfig: CmsConfig }>> {
  try {
    const { data } = await api.put<{ data: { cmsConfig: CmsConfig } }>(
      `/projects/${projectId}/site-editor/cms`,
      config,
    );
    return { data: data.data };
  } catch (error) {
    return { error: error as ApiResponse<never>['error'] };
  }
}

export async function publishSite(projectId: string): Promise<ApiResponse<PublishResult>> {
  try {
    const { data } = await api.post<{ data: PublishResult }>(
      `/projects/${projectId}/site-editor/publish`,
    );
    return { data: data.data };
  } catch (error) {
    return { error: error as ApiResponse<never>['error'] };
  }
}

export interface SiteImageUploadResult {
  path: string;
  url: string | null;
  dataUrl?: string;
  imageUrl: string;
}

export async function uploadSiteImage(
  projectId: string,
  file: File,
): Promise<ApiResponse<SiteImageUploadResult>> {
  try {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<{ data: SiteImageUploadResult }>(
      `/projects/${projectId}/site-editor/upload`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return { data: data.data };
  } catch (error) {
    return { error: error as ApiResponse<never>['error'] };
  }
}

export async function fetchSitePreviewHtml(
  projectId: string,
  published = false,
): Promise<string> {
  const { data } = await api.get<string>(`/projects/${projectId}/site-editor/preview`, {
    params: published ? { published: '1' } : undefined,
    responseType: 'text',
    transformResponse: [(r) => r],
  });
  return typeof data === 'string' ? data : String(data);
}

export const siteEditorService = {
  getState: getSiteEditorState,
  updateSeo: updateSiteSeo,
  updateBlocks: updateSiteBlocks,
  updateTheme: updateSiteTheme,
  updateCms: updateSiteCmsConfig,
  publish: publishSite,
  uploadImage: uploadSiteImage,
  fetchPreviewHtml: fetchSitePreviewHtml,
};
