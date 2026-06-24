import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Site Builder',
  description:
    'Build and publish websites without code. A WordPress-style visual editor with multi-page management, ready-made design templates, and one-click publish to your own server — domain optional.',
  alternates: { canonical: '/sites' },
  openGraph: {
    title: 'Site Builder | Pushify',
    description:
      'Pick a design, edit blocks on the page, add pages, and publish to your own server — with or without a domain.',
    url: 'https://pushify.dev/sites',
  },
};

export default function SitesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://pushify.dev/sites#webpage',
          url: 'https://pushify.dev/sites',
          name: 'Site Builder | Pushify',
          description:
            'Build and publish websites without code. A visual editor with multi-page management, design templates, and one-click publish to your own server — domain optional.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Site Builder', item: 'https://pushify.dev/sites' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
