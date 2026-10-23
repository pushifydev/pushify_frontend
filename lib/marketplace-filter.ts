import type { MarketplaceCategory, MarketplaceTemplate } from '@/lib/api';

/**
 * Search + category filtering for the dashboard marketplace, kept pure so it can be unit
 * tested. The page loads the whole catalogue once and narrows it here; the filter is
 * mirrored into the URL (`?q=…&category=…`) so a filtered view can be shared.
 */

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  'cms',
  'automation',
  'monitoring',
  'storage',
  'devtools',
  'analytics',
  'database',
];

export type MarketplaceCategoryFilter = MarketplaceCategory | 'all';

export interface MarketplaceFilter {
  search: string;
  category: MarketplaceCategoryFilter;
}

type FilterableTemplate = Pick<MarketplaceTemplate, 'name' | 'description' | 'tags' | 'category'>;

const SEARCH_PARAM = 'q';
const CATEGORY_PARAM = 'category';

export function isMarketplaceCategory(value: unknown): value is MarketplaceCategory {
  return typeof value === 'string' && (MARKETPLACE_CATEGORIES as string[]).includes(value);
}

/** Case-insensitive match on name, description or any tag, within the chosen category. */
export function filterMarketplaceTemplates<T extends FilterableTemplate>(
  templates: readonly T[],
  filter: MarketplaceFilter
): T[] {
  const q = filter.search.trim().toLowerCase();
  return templates.filter((t) => {
    if (filter.category !== 'all' && t.category !== filter.category) return false;
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}

/** Reads `?q=` and `?category=`; an unknown category falls back to "all". */
export function parseMarketplaceFilter(params: Pick<URLSearchParams, 'get'>): MarketplaceFilter {
  const category = params.get(CATEGORY_PARAM);
  return {
    search: params.get(SEARCH_PARAM) ?? '',
    category: isMarketplaceCategory(category) ? category : 'all',
  };
}

/**
 * The URL search string (`?…` or `''`) for `filter`, keeping any unrelated params from
 * `current`. Defaults are left out so a cleared filter gives the bare page URL.
 */
export function marketplaceFilterSearch(current: string, filter: MarketplaceFilter): string {
  const params = new URLSearchParams(current);
  const q = filter.search.trim();
  if (q) params.set(SEARCH_PARAM, q);
  else params.delete(SEARCH_PARAM);
  if (filter.category !== 'all') params.set(CATEGORY_PARAM, filter.category);
  else params.delete(CATEGORY_PARAM);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
