'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useMarketplaceTemplates } from '@/hooks/useMarketplace';
import { InstalledAppsPanel } from '@/components/marketplace/InstalledAppsPanel';
import {
  MARKETPLACE_CATEGORIES,
  filterMarketplaceTemplates,
  marketplaceFilterSearch,
  parseMarketplaceFilter,
  type MarketplaceCategoryFilter,
  type MarketplaceFilter,
} from '@/lib/marketplace-filter';
import TemplateCard from './components/TemplateCard';
import { SkeletonMarketplaceTemplateCard } from '@/components/Skeleton';
import { CrossPromoBanner } from '@/components/dashboard/CrossPromoBanner';
import { EmptyState } from '@/components/EmptyState';
import { MetaLabel, PageHeader, TabPanel, Tabs } from '@/components/dashboard/PageKit';

const CATEGORIES: MarketplaceCategoryFilter[] = ['all', ...MARKETPLACE_CATEGORIES];

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
  const searchParams = useSearchParams();
  // A shared link (?q=…&category=…) opens with its filter applied.
  const [filter, setFilter] = useState<MarketplaceFilter>(() => parseMarketplaceFilter(searchParams));
  const [pageTab, setPageTab] = useState<'catalog' | 'installed'>('catalog');

  // The whole catalogue is loaded once and narrowed client-side, so the visible list always
  // follows the tested filter in lib/marketplace-filter.
  const { data: templates, isLoading } = useMarketplaceTemplates();

  const filtered = useMemo(() => filterMarketplaceTemplates(templates ?? [], filter), [templates, filter]);

  // Mirror the filter into the URL. replaceState: no navigation and no history entry per keystroke.
  useEffect(() => {
    const search = marketplaceFilterSearch(window.location.search, filter);
    if (search === window.location.search) return;
    window.history.replaceState(null, '', `${window.location.pathname}${search}${window.location.hash}`);
  }, [filter]);

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
          templates && templates.length > 0 && filter.category === 'all'
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
                  value={filter.search}
                  onChange={(e) => {
                    const search = e.target.value;
                    setFilter((f) => ({ ...f, search }));
                  }}
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
                      onClick={() => setFilter((f) => ({ ...f, category: key }))}
                      aria-pressed={filter.category === key}
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
