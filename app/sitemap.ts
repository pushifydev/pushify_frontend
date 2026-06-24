import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://pushify.dev';
  const lastModified = new Date();
  const frameworks = ['nextjs', 'react', 'vue', 'python', 'nodejs', 'laravel'];

  // changefreq and priority are intentionally omitted — Google ignores both.
  const paths = [
    '',
    '/features',
    '/sites',
    '/pricing',
    '/open-source',
    '/docs',
    '/about',
    '/vs/coolify',
    '/vs/vercel',
    '/privacy',
    '/terms',
    '/refund',
    ...frameworks.map((fw) => `/deploy/${fw}`),
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified,
  }));
}
