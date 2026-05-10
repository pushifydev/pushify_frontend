'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks';
import { ArrowRight, Table2, Code2, Target, type LucideIcon } from 'lucide-react';
import { BrandIcon, hasBrandIcon } from './BrandIcon';

type App = {
  name: string;
  slug: string;
  category: string;
  FallbackIcon?: LucideIcon;
  fallbackColor?: string;
};

const apps: App[] = [
  // Backend-as-a-Service / Database platforms
  { name: 'Supabase',    slug: 'supabase',    category: 'BaaS' },
  { name: 'Appwrite',    slug: 'appwrite',    category: 'BaaS' },
  { name: 'PocketBase',  slug: 'pocketbase',  category: 'BaaS' },
  { name: 'Hasura',      slug: 'hasura',      category: 'BaaS' },
  { name: 'Directus',    slug: 'directus',    category: 'BaaS' },
  { name: 'NocoDB',      slug: 'nocodb',      category: 'BaaS', FallbackIcon: Table2, fallbackColor: '#1773ea' },
  // Search
  { name: 'Meilisearch', slug: 'meilisearch', category: 'Search' },
  { name: 'Typesense',   slug: 'typesense',   category: 'Search', FallbackIcon: Target, fallbackColor: '#dc2626' },
  // CMS
  { name: 'WordPress',   slug: 'wordpress',   category: 'CMS' },
  { name: 'Ghost',       slug: 'ghost',       category: 'CMS' },
  { name: 'Strapi',      slug: 'strapi',      category: 'CMS' },
  // Productivity
  { name: 'NextCloud',   slug: 'nextcloud',   category: 'Cloud' },
  { name: 'Cal.com',     slug: 'calcom',      category: 'Cal' },
  // DevTools
  { name: 'code-server', slug: 'code-server', category: 'IDE',  FallbackIcon: Code2, fallbackColor: '#0078d4' },
  { name: 'Vaultwarden', slug: 'vaultwarden', category: 'Vault' },
  { name: 'n8n',         slug: 'n8n',         category: 'Auto' },
  { name: 'Uptime Kuma', slug: 'uptime-kuma', category: 'Mon.' },
  { name: 'Gitea',       slug: 'gitea',       category: 'Git' },
  { name: 'Portainer',   slug: 'portainer',   category: 'Ops' },
  // Storage / Analytics
  { name: 'MinIO',       slug: 'minio',       category: 'S3' },
  { name: 'Umami',       slug: 'umami',       category: 'Stat' },
  { name: 'Plausible',   slug: 'plausible',   category: 'Stat' },
  // Standalone databases
  { name: 'PostgreSQL',  slug: 'postgresql',  category: 'DB' },
  { name: 'Redis',       slug: 'redis',       category: 'DB' },
];

export function MarketplacePreviewSection() {
  const { t } = useTranslation();

  return (
    <section
      id="marketplace-preview"
      className="relative border-t border-[var(--glass-border)]"
    >
      <div className="absolute right-2 md:right-10 top-10 lp-index select-none" aria-hidden>
        03
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        {/* Header */}
        <div className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
          <div className="col-span-12 md:col-span-3 flex items-start gap-3">
            <span className="lp-crosshair mt-2" />
            <div className="lp-eyebrow">§&nbsp;03 / {t('homepage', 'marketplaceEyebrow')}</div>
          </div>

          <h2 className="col-span-12 md:col-span-9 lp-editorial text-[40px] md:text-[72px] lg:text-[92px] leading-[0.98] tracking-[-0.025em]">
            <span className="block">
              <em className="text-[var(--accent-cyan)]">{t('homepage', 'marketplaceHeadlineAppsCount')}</em>
              {t('homepage', 'marketplaceHeadlineAppsSuffix')}
            </span>
            <span className="block">{t('homepage', 'marketplaceHeadlineTagline')}</span>
          </h2>

          <p className="col-span-12 md:col-start-4 md:col-span-7 text-[16px] md:text-[18px] leading-[1.55] text-[var(--text-muted)] max-w-[58ch]">
            {t('homepage', 'marketplaceSubtitle')}
          </p>
        </div>

        {/* Catalog index header — magazine-style */}
        <div className="hidden md:grid grid-cols-12 gap-6 lp-mono text-[10px] uppercase tracking-[0.16em] opacity-50 pb-3 border-b border-[var(--glass-border-strong)]">
          <div className="col-span-1">{t('homepage', 'marketplaceCatalogNo')}</div>
          <div className="col-span-2">{t('homepage', 'marketplaceCatalogMark')}</div>
          <div className="col-span-5">{t('homepage', 'marketplaceCatalogName')}</div>
          <div className="col-span-2">{t('homepage', 'marketplaceCatalogCategory')}</div>
          <div className="col-span-2 text-right">{t('homepage', 'marketplaceCatalogStatus')}</div>
        </div>

        {/* Catalog grid — alternates rows for density */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-12 gap-y-0">
          {apps.map((app, i) => {
            const useBrand = hasBrandIcon(app.slug);
            const tintColor = app.fallbackColor ?? 'var(--accent-cyan)';
            return (
              <div
                key={app.slug}
                className="md:col-span-3 group flex items-center gap-3 border-b border-[var(--glass-divider)] py-4 px-2 hover:bg-[rgba(99,102,241,0.06)] transition-colors"
                title={app.name}
              >
                <span className="lp-mono text-[10px] opacity-40 w-7 text-right tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-8 h-8 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  {useBrand ? (
                    <BrandIcon
                      slug={app.slug}
                      className="w-5 h-5"
                      aria-label={app.name}
                    />
                  ) : app.FallbackIcon ? (
                    <app.FallbackIcon
                      className="w-5 h-5"
                      style={{ color: app.fallbackColor }}
                      strokeWidth={1.6}
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium truncate text-[var(--text-primary)]">
                    {app.name}
                  </div>
                  <div className="lp-mono text-[10px] uppercase tracking-[0.12em] opacity-50 truncate">
                    {app.category}
                  </div>
                </div>
                <span
                  className="hidden md:inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: tintColor }}
                />
              </div>
            );
          })}
        </div>

        {/* CTA row */}
        <div className="mt-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="lp-mono text-[11px] uppercase tracking-[0.14em] opacity-60">
            {t('homepage', 'marketplaceCatalogFooter')}
          </div>
          <Link href="/marketplace" className="lp-cta-ghost">
            {t('homepage', 'marketplaceCTA')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
