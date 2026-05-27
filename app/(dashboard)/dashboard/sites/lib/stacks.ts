import type { SiteStudioStack } from '@/lib/api';

export const STACK_COLORS: Record<SiteStudioStack, string> = {
  wordpress: '#21759b',
  ghost: '#15171A',
  strapi: '#4945ff',
  directus: '#6644ff',
  pocketbase: '#eab308',
  calcom: '#111827',
};

export const STACK_I18N: Record<SiteStudioStack, string> = {
  wordpress: 'stackWordpress',
  ghost: 'stackGhost',
  strapi: 'stackStrapi',
  directus: 'stackDirectus',
  pocketbase: 'stackPocketbase',
  calcom: 'stackCalcom',
};
