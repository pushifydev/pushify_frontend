'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useSiteStudioTemplates, useSiteStudioStacks } from '@/hooks/useSiteStudio';
import type { SiteStudioCategory, SiteStudioStack } from '@/lib/api';
import SiteTemplateCard from './components/SiteTemplateCard';
import { SkeletonMarketplaceTemplateCard } from '@/components/Skeleton';
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
    <div className="max-w-5xl mx-auto pb-16 animate-slide-in">
      {/* Hero — Cal.com style: typography-first, no gradient box */}
      <header className="pt-2 pb-14 border-b border-[var(--ss-line)] mb-12">
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

      {/* Search */}
      <div className="relative mb-10">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--ss-muted)' }}
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('siteStudio', 'searchPlaceholder')}
          className="ss-input"
          aria-label={t('siteStudio', 'searchPlaceholder')}
        />
      </div>

      {/* Filters */}
      <div className="space-y-8 mb-12">
        <div>
          <p className="ss-section-label">{t('siteStudio', 'filterCategory')}</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className="ss-pill"
                data-active={activeCategory === key}
              >
                {t('siteStudio', CATEGORY_I18N[key] as 'categoryAll')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="ss-section-label">{t('siteStudio', 'filterPlatform')}</p>
          <div className="flex flex-wrap gap-2">
            {STACK_FILTERS.map((stack) => (
              <button
                key={stack}
                type="button"
                onClick={() => setActiveStack(stack)}
                className="ss-pill"
                data-active={activeStack === stack}
              >
                {stack === 'all'
                  ? t('siteStudio', 'categoryAll')
                  : t('siteStudio', STACK_I18N[stack] as 'stackWordpress')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonMarketplaceTemplateCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="text-center py-20 ss-muted">{t('siteStudio', 'noTemplates')}</p>
      )}

      {featured.length > 0 && (
        <section className="mb-14">
          <h2 className="ss-section-label mb-5">{t('siteStudio', 'featured')}</h2>
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
        <section className="mb-14">
          {featured.length > 0 && (
            <h2 className="ss-section-label mb-5">{t('siteStudio', 'allTemplates')}</h2>
          )}
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

      <hr className="ss-divider mb-10" />

      {/* Footer CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-[0.9375rem] font-medium mb-1" style={{ color: 'var(--ss-ink)' }}>
            {t('siteStudio', 'devCtaTitle')}
          </p>
          <p className="ss-muted">{t('siteStudio', 'devCtaDesc')}</p>
        </div>
        <Link href="/dashboard/projects/new" className="ss-link inline-flex items-center gap-1 shrink-0">
          {t('siteStudio', 'devCtaLink')}
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        </Link>
      </div>

      <p className="ss-muted mt-10 text-center text-xs">{t('siteStudio', 'roadmap')}</p>
    </div>
  );
}
