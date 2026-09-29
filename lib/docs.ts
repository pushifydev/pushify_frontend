import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseBlocks, parseFrontmatter, type BlogBlock } from './blog';

/**
 * Product docs: content/docs/<slug>.md, rendered on the server with the blog's markdown subset
 * (plus tables). The order and grouping of the sidebar live here; the API reference is its own
 * page at /docs/api.
 */

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

export interface DocNavItem {
  slug: string;
  title: string;
}

export const DOC_NAV: { group: string; items: DocNavItem[] }[] = [
  {
    group: 'Start',
    items: [
      { slug: 'getting-started', title: 'Getting started' },
      { slug: 'servers', title: 'Servers' },
    ],
  },
  {
    group: 'Deploy',
    items: [
      { slug: 'projects', title: 'Projects & builds' },
      { slug: 'environment', title: 'Environment variables' },
      { slug: 'domains', title: 'Domains & HTTPS' },
      { slug: 'databases', title: 'Databases & backups' },
      { slug: 'previews', title: 'Preview deployments' },
    ],
  },
  {
    group: 'Run',
    items: [
      { slug: 'scaling', title: 'Scaling & sleep' },
      { slug: 'monitoring', title: 'Monitoring & alerts' },
    ],
  },
  {
    group: 'Account',
    items: [
      { slug: 'teams', title: 'Teams & SSO' },
      { slug: 'billing', title: 'Billing & credits' },
    ],
  },
  {
    group: 'Tools',
    items: [
      { slug: 'cli', title: 'CLI' },
      { slug: 'self-hosting', title: 'Self-hosting' },
    ],
  },
];

export const DOC_SLUGS = DOC_NAV.flatMap((g) => g.items.map((i) => i.slug));

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  updated: string;
  blocks: BlogBlock[];
  headings: { id: string; text: string }[];
}

export async function getDocPage(slug: string): Promise<DocPage | null> {
  if (!DOC_SLUGS.includes(slug)) return null;
  try {
    const raw = await readFile(path.join(DOCS_DIR, `${slug}.md`), 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    const blocks = parseBlocks(body);
    return {
      slug,
      title: meta.title || slug,
      description: meta.description || '',
      updated: meta.updated || '',
      blocks,
      headings: blocks.flatMap((b) => (b.type === 'h2' ? [{ id: b.id, text: b.text }] : [])),
    };
  } catch {
    return null;
  }
}

/** Previous and next page in sidebar order, for the links at the bottom of a page. */
export function neighbours(slug: string): { prev: DocNavItem | null; next: DocNavItem | null } {
  const all = DOC_NAV.flatMap((g) => g.items);
  const i = all.findIndex((p) => p.slug === slug);
  return { prev: i > 0 ? all[i - 1] : null, next: i >= 0 && i < all.length - 1 ? all[i + 1] : null };
}
