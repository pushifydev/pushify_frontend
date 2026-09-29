import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'API reference',
  description:
    'Pushify REST API reference. Authentication, projects, deployments, servers, databases, webhooks, CI/CD integration, and more.',
  alternates: {
    canonical: '/docs/api',
  },
  openGraph: {
    images: OG_IMAGE,
    title: 'API Documentation | Pushify',
    description: 'Complete REST API reference for Pushify cloud deployment platform.',
    url: 'https://pushify.dev/docs/api',
  },
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          '@id': 'https://pushify.dev/docs/api#article',
          headline: 'Pushify API Documentation',
          description:
            'Pushify REST API reference: authentication, projects, deployments, servers, databases, webhooks, and CI/CD integration.',
          url: 'https://pushify.dev/docs/api',
          image: 'https://pushify.dev/og-image.png',
          datePublished: '2026-05-01',
          dateModified: '2026-07-19',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          author: { '@id': 'https://pushify.dev/#organization' },
          publisher: { '@id': 'https://pushify.dev/#organization' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Documentation', item: 'https://pushify.dev/docs' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
