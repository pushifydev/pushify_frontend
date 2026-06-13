import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import './docs.css';

export const metadata: Metadata = {
  title: 'API Documentation',
  description:
    'Pushify REST API reference. Authentication, projects, deployments, servers, databases, webhooks, CI/CD integration, and more.',
  alternates: {
    canonical: '/docs',
  },
  openGraph: {
    title: 'API Documentation - Pushify',
    description: 'Complete REST API reference for Pushify cloud deployment platform.',
    url: 'https://pushify.dev/docs',
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          '@id': 'https://pushify.dev/docs#article',
          headline: 'Pushify API Documentation',
          description:
            'Pushify REST API reference: authentication, projects, deployments, servers, databases, webhooks, and CI/CD integration.',
          url: 'https://pushify.dev/docs',
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
