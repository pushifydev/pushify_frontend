'use client';

import { useState, useMemo } from 'react';
import { Search, Store, PackageOpen } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useMarketplaceTemplates } from '@/hooks/useMarketplace';
import type { MarketplaceCategory } from '@/lib/api';
import TemplateCard from './components/TemplateCard';
import { SkeletonMarketplaceTemplateCard } from '@/components/Skeleton';

const CATEGORIES: { key: MarketplaceCategory | 'all'; color: string }[] = [
  { key: 'all', color: '#8a8a9a' },
  { key: 'cms', color: '#6366f1' },
  { key: 'automation', color: '#a78bfa' },
  { key: 'monitoring', color: '#22c55e' },
  { key: 'storage', color: '#f59e0b' },
  { key: 'devtools', color: '#3b82f6' },
  { key: 'analytics', color: '#ec4899' },
  { key: 'database', color: '#f97316' },
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
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'var(--dash-accent-bg)',
              border: '1px solid var(--dash-accent-border)',
            }}
          >
            <Store className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
          </div>
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
                className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200"
                style={{
                  background: isActive ? `${color}18` : 'var(--hover-overlay)',
                  color: isActive ? color : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? `${color}35` : 'var(--glass-border)'}`,
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
        <div className="text-center py-20">
          <PackageOpen
            className="w-12 h-12 mx-auto mb-4 opacity-30"
            style={{ color: 'var(--text-muted)' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('marketplace', 'noTemplates')}
          </p>
        </div>
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
    </div>
  );
}
