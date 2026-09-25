'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useMarketplaceTemplates } from '@/hooks/useMarketplace';
import { InstalledAppsPanel } from '@/components/marketplace/InstalledAppsPanel';
import type { MarketplaceCategory } from '@/lib/api';
import TemplateCard from './components/TemplateCard';
import { SkeletonMarketplaceTemplateCard } from '@/components/Skeleton';
import { CrossPromoBanner } from '@/components/dashboard/CrossPromoBanner';
import { EmptyState } from '@/components/EmptyState';

const CATEGORIES: { key: MarketplaceCategory | 'all'; color: string }[] = [
  { key: 'all', color: 'var(--text-primary)' },
  { key: 'cms', color: 'var(--text-primary)' },
  { key: 'automation', color: 'var(--text-primary)' },
  { key: 'monitoring', color: 'var(--text-primary)' },
  { key: 'storage', color: 'var(--text-primary)' },
  { key: 'devtools', color: 'var(--text-primary)' },
  { key: 'analytics', color: 'var(--text-primary)' },
  { key: 'database', color: 'var(--text-primary)' },
];

const CATEGORY_I18N: Record<string, string> = {
  all: 'categoryAll',
  cms: 'categoryCms',
  automation: 'categoryAutomation',
  monitoring: 'categoryMonitoring',
  storage: 'categoryStorage',
  devtools: 'categoryDevtools',
  analytics: 'categoryAnalytics',
  database: 'categoryDatabase',
};

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | 'all'>('all');
  const [pageTab, setPageTab] = useState<'catalog' | 'installed'>('catalog');

  const { data: templates, isLoading } = useMarketplaceTemplates(
    activeCategory !== 'all' ? { category: activeCategory } : undefined
  );

  const filtered = useMemo(() => {
    if (!templates) return [];
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [templates, searchQuery]);

  const featured = filtered.filter((t) => t.featured);
  const rest = filtered.filter((t) => !t.featured);

  return (
    <div className="dash-page max-w-6xl space-y-8 animate-slide-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
              {t('marketplace', 'title')}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('marketplace', 'description')}
            </p>
          </div>
        </div>
      </div>

      <CrossPromoBanner
        message={t('marketplace', 'siteStudioBanner')}
        ctaLabel={t('marketplace', 'siteStudioBannerCta')}
        href="/dashboard/sites"
      />

      <div className="flex gap-1 p-1 rounded-lg w-fit border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        {(['catalog', 'installed'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setPageTab(tab)}
            className="px-3.5 py-1.5 rounded-md text-sm transition-colors"
            style={{
              background: pageTab === tab ? 'var(--bg-tertiary)' : 'transparent',
              color: pageTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: pageTab === tab ? 500 : 400,
            }}
          >
            {t('marketplace', tab === 'catalog' ? 'tabCatalog' : 'tabInstalled')}
          </button>
        ))}
      </div>

      {pageTab === 'installed' ? (
        <InstalledAppsPanel />
      ) : (
        <>
      {/* Search + Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('marketplace', 'searchPlaceholder')}
            className="input pl-10!"
            style={{ maxWidth: 420 }}
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, color }) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className="px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200"
                style={{
                  background: isActive ? color : 'transparent',
                  color: isActive ? 'var(--on-accent)' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? color : 'var(--border-default)'}`,
                }}
              >
                {t('marketplace', CATEGORY_I18N[key] as any)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonMarketplaceTemplateCard key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <EmptyState label={t('marketplace', 'title')} title={t('marketplace', 'noTemplates')} />
      )}

      {/* Featured Section */}
      {featured.length > 0 && (
        <div>
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--accent-cyan)' }}
            />
            {t('marketplace', 'featured')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={i}
                deployLabel={t('marketplace', 'deploy')}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      {rest.length > 0 && (
        <div>
          {featured.length > 0 && (
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--text-muted)' }}
              />
              {t('marketplace', 'categoryAll')}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={i + featured.length}
                deployLabel={t('marketplace', 'deploy')}
              />
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
