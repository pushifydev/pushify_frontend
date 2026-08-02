import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Pushify vs Render',
  description:
    'Pushify vs Render: a self-hostable Render alternative with per-server pricing. Compare free tiers, per-service billing, features, and which one to choose.',
  keywords: [
    'render alternative',
    'pushify vs render',
    'self-hosted render alternative',
    'open source render alternative',
    'render pricing',
    'render comparison',
  ],
  alternates: { canonical: '/vs/render' },
  openGraph: {
    title: 'Pushify vs Render | Pushify',
    description:
      'An honest, side-by-side comparison of Pushify and Render — per-server pricing on infrastructure you own instead of per-service line items.',
    url: 'https://pushify.dev/vs/render',
  },
};

export default function VsRenderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          datePublished: '2026-08-02',
          dateModified: '2026-08-02',
          '@id': 'https://pushify.dev/vs/render#webpage',
          url: 'https://pushify.dev/vs/render',
          name: 'Pushify vs Render',
          description:
            'An honest comparison of Pushify and Render — a self-hostable Render alternative with per-server pricing.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Pushify vs Render', item: 'https://pushify.dev/vs/render' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
