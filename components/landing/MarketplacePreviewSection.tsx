'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks';
import { ArrowRight, Table2, Code2, Target, type LucideIcon } from 'lucide-react';
import { BrandIcon, hasBrandIcon } from './BrandIcon';
import { LandingSectionHeader } from './LandingSectionHeader';
import { Reveal } from './Reveal';

type App = {
  name: string;
  slug: string;
  category: string;
  FallbackIcon?: LucideIcon;
  fallbackColor?: string;
};

const apps: App[] = [
  { name: 'Supabase', slug: 'supabase', category: 'BaaS' },
  { name: 'Appwrite', slug: 'appwrite', category: 'BaaS' },
  { name: 'PocketBase', slug: 'pocketbase', category: 'BaaS' },
  { name: 'Hasura', slug: 'hasura', category: 'BaaS' },
  { name: 'Directus', slug: 'directus', category: 'BaaS' },
  { name: 'NocoDB', slug: 'nocodb', category: 'BaaS', FallbackIcon: Table2, fallbackColor: '#1773ea' },
  { name: 'Meilisearch', slug: 'meilisearch', category: 'Search' },
  { name: 'Typesense', slug: 'typesense', category: 'Search', FallbackIcon: Target, fallbackColor: '#dc2626' },
  { name: 'WordPress', slug: 'wordpress', category: 'CMS' },
  { name: 'Ghost', slug: 'ghost', category: 'CMS' },
  { name: 'Strapi', slug: 'strapi', category: 'CMS' },
  { name: 'NextCloud', slug: 'nextcloud', category: 'Cloud' },
  { name: 'Cal.com', slug: 'calcom', category: 'Cal' },
  { name: 'code-server', slug: 'code-server', category: 'IDE', FallbackIcon: Code2, fallbackColor: '#0078d4' },
  { name: 'Vaultwarden', slug: 'vaultwarden', category: 'Vault' },
  { name: 'n8n', slug: 'n8n', category: 'Auto' },
  { name: 'Uptime Kuma', slug: 'uptime-kuma', category: 'Mon.' },
  { name: 'Gitea', slug: 'gitea', category: 'Git' },
  { name: 'Portainer', slug: 'portainer', category: 'Ops' },
  { name: 'MinIO', slug: 'minio', category: 'S3' },
  { name: 'Umami', slug: 'umami', category: 'Stat' },
  { name: 'Plausible', slug: 'plausible', category: 'Stat' },
  { name: 'PostgreSQL', slug: 'postgresql', category: 'DB' },
  { name: 'Redis', slug: 'redis', category: 'DB' },
];

const FEATURED = ['supabase', 'wordpress', 'n8n', 'calcom', 'ghost', 'postgresql'];

export function MarketplacePreviewSection() {
  const { t } = useTranslation();

  return (
    <section id="marketplace-preview" className="lp-section">
      <div className="lp-container">
        <LandingSectionHeader
          label={t('homepage', 'marketplaceEyebrow')}
          title={
            <>
              {t('homepage', 'marketplaceHeadlineAppsCount')}
              {t('homepage', 'marketplaceHeadlineAppsSuffix')}{' '}
              {t('homepage', 'marketplaceHeadlineTagline')}
            </>
          }
          description={t('homepage', 'marketplaceSubtitle')}
        />

        {/* Featured picks — larger, curated tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          {apps
            .filter((a) => FEATURED.includes(a.slug))
            .map((app, i) => (
              <Reveal key={app.slug} delay={i * 70} className="h-full">
                <div
                  className="lp-card h-full flex flex-col items-start gap-3 p-4 hover:border-[var(--lp-muted)] transition-colors"
                  title={app.name}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--lp-border)' }}
                  >
                    <BrandIcon slug={app.slug} className="w-6 h-6" aria-label={app.name} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--lp-ink)' }}>
                      {app.name}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--lp-muted)' }}>
                      {app.category}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {apps.filter((a) => !FEATURED.includes(a.slug)).map((app) => {
            const useBrand = hasBrandIcon(app.slug);
            return (
              <div
                key={app.slug}
                className="lp-card flex items-center gap-2.5 p-3 hover:border-[var(--lp-muted)] transition-colors"
                title={app.name}
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  {useBrand ? (
                    <BrandIcon slug={app.slug} className="w-5 h-5" aria-label={app.name} />
                  ) : app.FallbackIcon ? (
                    <app.FallbackIcon className="w-5 h-5" style={{ color: app.fallbackColor }} strokeWidth={1.6} />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--lp-ink)' }}>
                    {app.name}
                  </div>
                  <div className="text-[10px] truncate" style={{ color: 'var(--lp-muted)' }}>
                    {app.category}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm" style={{ color: 'var(--lp-muted)' }}>
            {t('homepage', 'marketplaceCatalogFooter')}
          </p>
          <Link href="/register" className="lp-cta-ghost">
            {t('homepage', 'marketplaceCTA')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
