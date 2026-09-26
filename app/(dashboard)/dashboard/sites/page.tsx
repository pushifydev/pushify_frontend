'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useSiteStudioTemplates, useSiteStudioStacks } from '@/hooks/useSiteStudio';
import type { SiteStudioCategory, SiteStudioStack } from '@/lib/api';
import SiteTemplateCard from './components/SiteTemplateCard';
import { SkeletonMarketplaceTemplateCard } from '@/components/Skeleton';
import { CrossPromoBanner } from '@/components/dashboard/CrossPromoBanner';
import { EmptyState } from '@/components/EmptyState';
import { STACK_I18N } from './lib/stacks';

const CATEGORIES: (SiteStudioCategory | 'all')[] = [
  'all',
  'ecommerce',
  'corporate',
  'blog',
  'booking',
  'saas',
  'portfolio',
  'restaurant',
  'newsletter',
];

const CATEGORY_I18N: Record<string, string> = {
  all: 'categoryAll',
  ecommerce: 'categoryEcommerce',
  corporate: 'categoryCorporate',
  blog: 'categoryBlog',
  booking: 'categoryBooking',
  saas: 'categorySaas',
  portfolio: 'categoryPortfolio',
  restaurant: 'categoryRestaurant',
  newsletter: 'categoryNewsletter',
};

const STACK_FILTERS: (SiteStudioStack | 'all')[] = [
  'all',
  'wordpress',
  'ghost',
  'directus',
  'calcom',
  'pocketbase',
  'strapi',
];

export default function SiteStudioPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SiteStudioCategory | 'all'>('all');
  const [activeStack, setActiveStack] = useState<SiteStudioStack | 'all'>('all');

  const listFilters = useMemo(
    () => ({
      ...(activeCategory !== 'all' ? { category: activeCategory } : {}),
      ...(activeStack !== 'all' ? { stack: activeStack } : {}),
      ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
    }),
    [activeCategory, activeStack, searchQuery]
  );

  const { data: templates, isLoading } = useSiteStudioTemplates(
    Object.keys(listFilters).length > 0 ? listFilters : undefined
  );
  const { data: stackInfo } = useSiteStudioStacks();

  const filtered = templates ?? [];
  const featured = filtered.filter((tpl) => tpl.featured);
  const rest = filtered.filter((tpl) => !tpl.featured);

  const getCategoryLabel = (cat: SiteStudioCategory) =>
    t('siteStudio', CATEGORY_I18N[cat] as 'categoryEcommerce');

  const platformSummary =
    stackInfo?.summary
      .map(({ stack, count }) => `${t('siteStudio', STACK_I18N[stack] as 'stackWordpress')} ${count}`)
      .join(' · ') ?? '';

  return (
    <div className="dash-page max-w-7xl min-w-0 pb-8 animate-slide-in">
      {/* Hero — the one showcase moment; the rest of the page follows the dashboard anatomy */}
      <header className="pt-2 pb-12 border-b border-[var(--ss-line)] mb-8">
        <p className="ss-eyebrow mb-4">{t('siteStudio', 'badge')}</p>
        <h1 className="ss-display text-[2.25rem] sm:text-[2.75rem] leading-[1.1] mb-5 max-w-2xl">
          {t('siteStudio', 'title')}
        </h1>
        <p className="ss-lead mb-6">{t('siteStudio', 'heroDescription')}</p>
        <p className="ss-muted mb-8 max-w-xl">{t('siteStudio', 'platformNote')}</p>

        <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-8 mb-10">
          <li className="ss-stat">{t('siteStudio', 'heroPoint1')}</li>
          <li className="ss-stat">{t('siteStudio', 'heroPoint2')}</li>
          <li className="ss-stat">{t('siteStudio', 'heroPoint3')}</li>
        </ul>

        {platformSummary && (
          <p className="text-xs font-medium" style={{ color: 'var(--ss-muted)', fontFamily: 'var(--ss-mono)' }}>
            {platformSummary}
          </p>
        )}
      </header>

      <div className="space-y-6 min-w-0">
        <CrossPromoBanner
          message={t('siteStudio', 'marketplaceBanner')}
          ctaLabel={t('siteStudio', 'marketplaceBannerCta')}
          href="/dashboard/marketplace"
        />

        {/* Search + filters */}
        <section className="dash-rows" aria-label={t('siteStudio', 'searchPlaceholder')}>
          <div className="dash-toolbar px-4! py-3!">
            <div className="relative w-full sm:max-w-sm">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[var(--text-muted)]"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('siteStudio', 'searchPlaceholder')}
                className="input pl-10!"
                aria-label={t('siteStudio', 'searchPlaceholder')}
              />
            </div>
          </div>
          <div className="dash-row flex flex-col gap-2 md:flex-row md:items-center md:gap-4 min-w-0">
            <span id="ss-filter-category" className="dash-section-label w-24 shrink-0">
              {t('siteStudio', 'filterCategory')}
            </span>
            <div className="overflow-x-auto min-w-0 [scrollbar-width:none]">
              <div className="dash-segmented" role="group" aria-labelledby="ss-filter-category">
                {CATEGORIES.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    aria-pressed={activeCategory === key}
                  >
                    {t('siteStudio', CATEGORY_I18N[key] as 'categoryAll')}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="dash-row flex flex-col gap-2 md:flex-row md:items-center md:gap-4 min-w-0">
            <span id="ss-filter-platform" className="dash-section-label w-24 shrink-0">
              {t('siteStudio', 'filterPlatform')}
            </span>
            <div className="overflow-x-auto min-w-0 [scrollbar-width:none]">
              <div className="dash-segmented" role="group" aria-labelledby="ss-filter-platform">
                {STACK_FILTERS.map((stack) => (
                  <button
                    key={stack}
                    type="button"
                    onClick={() => setActiveStack(stack)}
                    aria-pressed={activeStack === stack}
                  >
                    {stack === 'all'
                      ? t('siteStudio', 'categoryAll')
                      : t('siteStudio', STACK_I18N[stack] as 'stackWordpress')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonMarketplaceTemplateCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <EmptyState label={t('siteStudio', 'badge')} title={t('siteStudio', 'noTemplates')} />
        )}

        {featured.length > 0 && (
          <section className="space-y-3">
            <h2 className="dash-section-label">{t('siteStudio', 'featured')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featured.map((template, i) => (
                <SiteTemplateCard
                  key={template.id}
                  template={template}
                  index={i}
                  launchLabel={t('siteStudio', 'launch')}
                  categoryLabel={getCategoryLabel(template.category)}
                />
              ))}
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section className="space-y-3">
            {featured.length > 0 && <h2 className="dash-section-label">{t('siteStudio', 'allTemplates')}</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rest.map((template, i) => (
                <SiteTemplateCard
                  key={template.id}
                  template={template}
                  index={i + featured.length}
                  launchLabel={t('siteStudio', 'launch')}
                  categoryLabel={getCategoryLabel(template.category)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Developer path */}
        <div className="dash-rows">
          <div className="dash-row flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)]">{t('siteStudio', 'devCtaTitle')}</p>
              <p className="text-[13px] mt-0.5 text-[var(--text-secondary)]">{t('siteStudio', 'devCtaDesc')}</p>
            </div>
            <Link href="/dashboard/projects/new" className="btn btn-secondary btn-sm shrink-0">
              {t('siteStudio', 'devCtaLink')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <p className="text-xs text-center text-[var(--text-muted)]">{t('siteStudio', 'roadmap')}</p>
      </div>
    </div>
  );
}
