import { MetadataRoute } from 'next';
import { listBlogPosts } from '@/lib/blog';
import { APPS } from '@/lib/apps-catalog';

/**
 * Per-route lastModified reflects when the CONTENT meaningfully changed, not the
 * build time — a single shared `new Date()` made every entry identical and useless
 * to crawlers. Bump a date when you materially edit that page.
 */
const CONTENT_DATES: Record<string, string> = {
  '': '2026-07-19', // homepage — nav gained Domains
  '/features': '2026-07-05',
  '/sites': '2026-07-05',
  '/domains': '2026-07-19',
  '/pricing': '2026-07-19',
  '/open-source': '2026-07-05',
  '/docs': '2026-07-19',
  '/about': '2026-07-19',
  '/partners': '2026-09-09',
  '/deploy-button': '2026-09-09',
  '/vs/coolify': '2026-07-05',
  '/vs/vercel': '2026-07-05',
  '/vs/heroku': '2026-07-19',
  '/vs/railway': '2026-08-02',
  '/vs/render': '2026-08-02',
  '/alternatives': '2026-07-19',
  '/guides/deploy-nextjs': '2026-07-19',
  '/privacy': '2026-05-01',
  '/terms': '2026-05-01',
  '/refund': '2026-05-01',
  '/deploy/nextjs': '2026-06-20',
  '/deploy/react': '2026-06-20',
  '/deploy/vue': '2026-06-20',
  '/deploy/python': '2026-06-20',
  '/deploy/nodejs': '2026-06-20',
  '/deploy/laravel': '2026-06-20',
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://pushify.dev';

  // changefreq and priority are intentionally omitted — Google ignores both.
  const entries: MetadataRoute.Sitemap = Object.entries(CONTENT_DATES).map(([path, date]) => ({
    url: `${base}${path}`,
    lastModified: new Date(date),
  }));

  // Changelog genuinely updates with every release — build time is accurate here.
  entries.push({ url: `${base}/changelog`, lastModified: new Date() });

  // Apps catalog — static snapshot; dated by when the catalog pages shipped.
  entries.push({ url: `${base}/apps`, lastModified: new Date('2026-09-10') });
  for (const app of APPS) {
    entries.push({ url: `${base}/apps/${app.id}`, lastModified: new Date('2026-09-10') });
  }

  // Blog: posts carry their publish date; the index tracks the newest post.
  const posts = await listBlogPosts();
  if (posts.length > 0) {
    entries.push({ url: `${base}/blog`, lastModified: new Date(posts[0].date) });
    for (const post of posts) {
      entries.push({ url: `${base}/blog/${post.slug}`, lastModified: new Date(post.date) });
    }
  }

  return entries;
}
