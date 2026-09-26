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
import { MetaLabel, PageHeader, TabPanel, Tabs } from '@/components/dashboard/PageKit';

const CATEGORIES: (MarketplaceCategory | 'all')[] = [
  'all',
  'cms',
  'automation',
  'monitoring',
  'storage',
  'devtools',
  'analytics',
  'database',
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
  const { t, locale } = useTranslation();
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

  const tabs = [
    { id: 'catalog' as const, label: t('marketplace', 'tabCatalog') },
    { id: 'installed' as const, label: t('marketplace', 'tabInstalled') },
  ];

  const grid = (list: typeof filtered, offset: number) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map((template, i) => (
        <TemplateCard
          key={template.id}
          template={template}
          index={i + offset}
          deployLabel={t('marketplace', 'deploy')}
        />
      ))}
    </div>
  );

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in">
      <PageHeader
        title={t('marketplace', 'title')}
        description={t('marketplace', 'description')}
        meta={
          templates && templates.length > 0 && activeCategory === 'all'
            ? [<MetaLabel key="count">{templates.length} {locale === 'tr' ? 'uygulama' : 'apps'}</MetaLabel>]
            : undefined
        }
      />

      <CrossPromoBanner
        message={t('marketplace', 'siteStudioBanner')}
        ctaLabel={t('marketplace', 'siteStudioBannerCta')}
        href="/dashboard/sites"
      />

      <Tabs items={tabs} active={pageTab} onChange={setPageTab} label={t('marketplace', 'title')} idPrefix="marketplace-tab" />

      <TabPanel idPrefix="marketplace-tab" active={pageTab}>
        {pageTab === 'installed' ? (
          <InstalledAppsPanel />
        ) : (
          <div className="space-y-6 min-w-0">
            {/* Search + category filter */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center min-w-0">
              <div className="relative w-full lg:max-w-xs">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('marketplace', 'searchPlaceholder')}
                  aria-label={t('marketplace', 'searchPlaceholder')}
                  className="input pl-10!"
                />
              </div>
              <div className="overflow-x-auto min-w-0 [scrollbar-width:none]">
                <div className="dash-segmented" role="group" aria-label={t('marketplace', 'categoryAll')}>
                  {CATEGORIES.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveCategory(key)}
                      aria-pressed={activeCategory === key}
                    >
                      {t('marketplace', CATEGORY_I18N[key] as 'categoryAll')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonMarketplaceTemplateCard key={i} />
                ))}
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <EmptyState label={t('marketplace', 'title')} title={t('marketplace', 'noTemplates')} />
            )}

            {featured.length > 0 && (
              <section className="space-y-3">
                <h2 className="dash-section-label">{t('marketplace', 'featured')}</h2>
                {grid(featured, 0)}
              </section>
            )}

            {rest.length > 0 && (
              <section className="space-y-3">
                {featured.length > 0 && <h2 className="dash-section-label">{t('marketplace', 'categoryAll')}</h2>}
                {grid(rest, featured.length)}
              </section>
            )}
          </div>
        )}
      </TabPanel>
    </div>
  );
}
