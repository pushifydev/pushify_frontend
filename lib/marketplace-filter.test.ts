import { describe, it, expect } from 'vitest';
import snapshot from '@/content/apps/templates.json';
import type { MarketplaceTemplate } from '@/lib/api';
import {
  MARKETPLACE_CATEGORIES,
  filterMarketplaceTemplates,
  marketplaceFilterSearch,
  parseMarketplaceFilter,
  type MarketplaceFilter,
} from './marketplace-filter';

const templates: Pick<MarketplaceTemplate, 'id' | 'name' | 'description' | 'tags' | 'category'>[] = [
  { id: 'ghost', name: 'Ghost', description: 'Publishing platform', tags: ['blog', 'newsletter'], category: 'cms' },
  { id: 'wordpress', name: 'WordPress', description: 'Popular CMS', tags: ['blog', 'php'], category: 'cms' },
  { id: 'n8n', name: 'n8n', description: 'Workflow automation', tags: ['workflows', 'no-code'], category: 'automation' },
  { id: 'uptime-kuma', name: 'Uptime Kuma', description: 'Status pages', tags: ['uptime', 'status'], category: 'monitoring' },
  { id: 'postgres', name: 'PostgreSQL', description: 'Relational database', tags: ['sql'], category: 'database' },
];

const ALL: MarketplaceFilter = { search: '', category: 'all' };
const ids = (list: readonly { id: string }[]) => list.map((t) => t.id);

describe('filterMarketplaceTemplates', () => {
  it('returns every template when the filter is cleared', () => {
    expect(ids(filterMarketplaceTemplates(templates, ALL))).toEqual(ids(templates));
    expect(ids(filterMarketplaceTemplates(templates, { search: '   ', category: 'all' }))).toEqual(ids(templates));
  });

  it('matches the name case-insensitively', () => {
    expect(ids(filterMarketplaceTemplates(templates, { ...ALL, search: 'GHOST' }))).toEqual(['ghost']);
    expect(ids(filterMarketplaceTemplates(templates, { ...ALL, search: 'kuma' }))).toEqual(['uptime-kuma']);
  });

  it('matches tags case-insensitively', () => {
    expect(ids(filterMarketplaceTemplates(templates, { ...ALL, search: 'Blog' }))).toEqual(['ghost', 'wordpress']);
    expect(ids(filterMarketplaceTemplates(templates, { ...ALL, search: 'PHP' }))).toEqual(['wordpress']);
  });

  it('matches the description', () => {
    expect(ids(filterMarketplaceTemplates(templates, { ...ALL, search: 'relational' }))).toEqual(['postgres']);
  });

  it('ignores surrounding whitespace in the search text', () => {
    expect(ids(filterMarketplaceTemplates(templates, { ...ALL, search: ' ghost ' }))).toEqual(['ghost']);
  });

  it('narrows the list to the chosen category', () => {
    const cms = filterMarketplaceTemplates(templates, { search: '', category: 'cms' });
    expect(ids(cms)).toEqual(['ghost', 'wordpress']);
    expect(cms.length).toBeLessThan(templates.length);
  });

  it('applies search and category together', () => {
    expect(ids(filterMarketplaceTemplates(templates, { search: 'blog', category: 'cms' }))).toEqual(['ghost', 'wordpress']);
    expect(ids(filterMarketplaceTemplates(templates, { search: 'press', category: 'cms' }))).toEqual(['wordpress']);
    // "status" exists only under monitoring, so it is filtered out by the cms category
    expect(filterMarketplaceTemplates(templates, { search: 'status', category: 'cms' })).toEqual([]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterMarketplaceTemplates(templates, { ...ALL, search: 'does-not-exist' })).toEqual([]);
    expect(filterMarketplaceTemplates(templates, { search: '', category: 'storage' })).toEqual([]);
    expect(filterMarketplaceTemplates([], ALL)).toEqual([]);
  });

  it('brings the full list back after a filter is cleared', () => {
    const narrowed = filterMarketplaceTemplates(templates, { search: 'ghost', category: 'cms' });
    expect(narrowed).toHaveLength(1);
    expect(filterMarketplaceTemplates(templates, ALL)).toHaveLength(templates.length);
  });
});

describe('parseMarketplaceFilter', () => {
  it('reads the search text and category from the query', () => {
    expect(parseMarketplaceFilter(new URLSearchParams('q=ghost&category=cms'))).toEqual({ search: 'ghost', category: 'cms' });
  });

  it('defaults to no search and every category', () => {
    expect(parseMarketplaceFilter(new URLSearchParams(''))).toEqual(ALL);
  });

  it('ignores an unknown category', () => {
    expect(parseMarketplaceFilter(new URLSearchParams('category=games'))).toEqual(ALL);
    expect(parseMarketplaceFilter(new URLSearchParams('category=all'))).toEqual(ALL);
  });
});

describe('marketplaceFilterSearch', () => {
  it('writes the search text and category', () => {
    expect(marketplaceFilterSearch('', { search: 'ghost', category: 'cms' })).toBe('?q=ghost&category=cms');
  });

  it('leaves defaults out so a cleared filter gives the bare URL', () => {
    expect(marketplaceFilterSearch('?q=ghost&category=cms', ALL)).toBe('');
    expect(marketplaceFilterSearch('', { search: '  ', category: 'all' })).toBe('');
  });

  it('keeps unrelated params', () => {
    expect(marketplaceFilterSearch('?ref=docs&q=old', { search: 'new', category: 'all' })).toBe('?ref=docs&q=new');
  });

  it('round-trips through parseMarketplaceFilter', () => {
    const filter: MarketplaceFilter = { search: 'uptime kuma', category: 'monitoring' };
    expect(parseMarketplaceFilter(new URLSearchParams(marketplaceFilterSearch('', filter)))).toEqual(filter);
  });
});

describe('MARKETPLACE_CATEGORIES', () => {
  it('offers a category filter for every category in the catalogue', () => {
    const used = new Set((snapshot as { templates: { category: string }[] }).templates.map((t) => t.category));
    for (const category of used) expect(MARKETPLACE_CATEGORIES).toContain(category);
  });
});
