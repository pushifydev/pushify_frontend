import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Pushify vs Dokploy',
  description:
    'Pushify vs Dokploy: two open-source platforms that deploy Docker apps to your own servers. Hosted plans, scaling, licensing and which one fits, checked against live sources.',
  keywords: ['dokploy alternative', 'pushify vs dokploy', 'dokploy comparison', 'open source PaaS', 'self-hosted deployment'],
  alternates: { canonical: '/vs/dokploy' },
  openGraph: {
    images: OG_IMAGE,
    title: 'Pushify vs Dokploy | Pushify',
    description: 'A side-by-side comparison of two open-source self-hosting platforms, with sources.',
    url: 'https://pushify.dev/vs/dokploy',
  },
};

export default function VsDokployLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          datePublished: '2026-09-29',
          dateModified: '2026-09-29',
          '@id': 'https://pushify.dev/vs/dokploy#webpage',
          url: 'https://pushify.dev/vs/dokploy',
          name: 'Pushify vs Dokploy',
          description: 'A comparison of Pushify and Dokploy, two open-source platforms that deploy to your own servers.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Pushify vs Dokploy', item: 'https://pushify.dev/vs/dokploy' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
