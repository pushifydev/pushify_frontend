'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks';
import {
  Package, ArrowRight,
  Table2, Code2, Target,
  type LucideIcon,
} from 'lucide-react';
import { BrandIcon, hasBrandIcon } from './BrandIcon';

type App = {
  name: string;
  slug: string;
  /** Optional override for the brand color used in tinted background/border. */
  color?: string;
  /** Fallback Lucide icon when no simple-icons logo exists. */
  FallbackIcon?: LucideIcon;
  fallbackColor?: string;
};

const apps: App[] = [
  // Backend-as-a-Service / Database platforms
  { name: 'Supabase',    slug: 'supabase' },
  { name: 'Appwrite',    slug: 'appwrite' },
  { name: 'PocketBase',  slug: 'pocketbase', color: '#08bcc4' },
  { name: 'Hasura',      slug: 'hasura' },
  { name: 'Directus',    slug: 'directus',   color: '#6644ff' },
  { name: 'NocoDB',      slug: 'nocodb',     FallbackIcon: Table2, fallbackColor: '#1773ea' },
  // Search engines
  { name: 'Meilisearch', slug: 'meilisearch' },
  { name: 'Typesense',   slug: 'typesense',  FallbackIcon: Target, fallbackColor: '#dc2626' },
  // CMS
  { name: 'WordPress',   slug: 'wordpress' },
  { name: 'Ghost',       slug: 'ghost' },
  { name: 'Strapi',      slug: 'strapi' },
  // Productivity / Collaboration
  { name: 'NextCloud',   slug: 'nextcloud' },
  { name: 'Cal.com',     slug: 'calcom' },
  // DevTools
  { name: 'code-server', slug: 'code-server', FallbackIcon: Code2, fallbackColor: '#0078d4' },
  { name: 'Vaultwarden', slug: 'vaultwarden', color: '#175ddc' },
  { name: 'n8n',         slug: 'n8n' },
  { name: 'Uptime Kuma', slug: 'uptime-kuma' },
  { name: 'Gitea',       slug: 'gitea' },
  { name: 'Portainer',   slug: 'portainer' },
  // Storage / Analytics
  { name: 'MinIO',       slug: 'minio' },
  { name: 'Umami',       slug: 'umami',      color: '#22c55e' },
  { name: 'Plausible',   slug: 'plausible' },
  // Standalone databases
  { name: 'PostgreSQL',  slug: 'postgresql' },
  { name: 'Redis',       slug: 'redis' },
];

export function MarketplacePreviewSection() {
  const { t } = useTranslation();

  return (
    <section
      id="marketplace-preview"
      className="relative py-24 border-y border-[var(--glass-border)] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/20 mb-5">
            <Package className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
            <span className="text-xs text-[var(--accent-amber)] terminal-text uppercase tracking-wider">
              {t('homepage', 'marketplaceEyebrow')}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t('homepage', 'marketplaceTitle')}
          </h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            {t('homepage', 'marketplaceSubtitle')}
          </p>
        </div>

        {/* App grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-10">
          {apps.map((app) => {
            const useBrand = hasBrandIcon(app.slug);
            const tintColor = app.color ?? app.fallbackColor ?? '#6366f1';
            return (
              <div
                key={app.slug}
                className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:-translate-y-0.5 hover:border-[var(--glass-border-strong)] transition-all"
                title={app.name}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${tintColor}14`,
                    border: `1px solid ${tintColor}30`,
                  }}
                >
                  {useBrand ? (
                    <BrandIcon
                      slug={app.slug}
                      color={app.color}
                      className="w-5 h-5"
                      aria-label={app.name}
                    />
                  ) : app.FallbackIcon ? (
                    <app.FallbackIcon
                      className="w-5 h-5"
                      style={{ color: app.fallbackColor }}
                      strokeWidth={2}
                    />
                  ) : null}
                </div>
                <span className="text-[11px] font-medium text-[var(--text-secondary)] text-center truncate max-w-full">
                  {app.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center">
          <Link
            href="/marketplace"
            className="btn btn-secondary h-11 px-6 text-sm gap-2"
          >
            {t('homepage', 'marketplaceCTA')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
