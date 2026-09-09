import snapshot from '@/content/apps/templates.json';

/**
 * Public marketplace catalog for the /apps pages. Sourced from a build-time
 * snapshot (content/apps/templates.json, produced by the backend's
 * `npm run marketplace:export`) so the pages are fully static.
 */

export type AppCategory =
  | 'cms'
  | 'automation'
  | 'monitoring'
  | 'storage'
  | 'devtools'
  | 'analytics'
  | 'database';

export interface AppEnvVar {
  key: string;
  label: string;
  description: string;
  required: boolean;
  type: 'text' | 'password' | 'number' | 'url' | 'email';
  default?: string;
  generated: boolean;
}

export interface CatalogApp {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  category: AppCategory;
  tags: string[];
  website: string;
  documentation: string;
  deploymentType: 'single-container' | 'docker-compose';
  dockerImage: string | null;
  port: number;
  healthCheckPath: string;
  minMemoryMb: number;
  minDiskGb: number;
  requiresDatabase: { type: 'postgresql' | 'mysql' | 'mongodb' | 'redis'; version?: string } | null;
  appVersion: string;
  featured: boolean;
  envVars: AppEnvVar[];
}

export const APPS: CatalogApp[] = (snapshot as { templates: CatalogApp[] }).templates;

export const CATEGORY_ORDER: AppCategory[] = [
  'database',
  'cms',
  'devtools',
  'automation',
  'analytics',
  'monitoring',
  'storage',
];

export const CATEGORY_LABELS: Record<AppCategory, { en: string; tr: string }> = {
  database: { en: 'Databases & backends', tr: 'Veritabanı & backend' },
  cms: { en: 'CMS & publishing', tr: 'CMS & yayıncılık' },
  devtools: { en: 'Developer tools', tr: 'Geliştirici araçları' },
  automation: { en: 'Automation', tr: 'Otomasyon' },
  analytics: { en: 'Analytics', tr: 'Analitik' },
  monitoring: { en: 'Monitoring', tr: 'İzleme' },
  storage: { en: 'Storage & files', tr: 'Depolama & dosya' },
};

export function getApp(id: string): CatalogApp | undefined {
  return APPS.find((a) => a.id === id);
}

export function relatedApps(app: CatalogApp, limit = 4): CatalogApp[] {
  const same = APPS.filter((a) => a.id !== app.id && a.category === app.category);
  const others = APPS.filter((a) => a.id !== app.id && a.category !== app.category && a.featured);
  return [...same, ...others].slice(0, limit);
}

export function appsByCategory(): { category: AppCategory; apps: CatalogApp[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    apps: APPS.filter((a) => a.category === category),
  })).filter((g) => g.apps.length > 0);
}
