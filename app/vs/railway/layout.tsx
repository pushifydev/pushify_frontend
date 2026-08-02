import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Pushify vs Railway',
  description:
    'Pushify vs Railway: a self-hostable Railway alternative with flat server pricing. Compare metered vs flat billing, features, and which one fits your stack.',
  keywords: [
    'railway alternative',
    'pushify vs railway',
    'self-hosted railway alternative',
    'open source railway alternative',
    'railway pricing',
    'railway comparison',
  ],
  alternates: { canonical: '/vs/railway' },
  openGraph: {
    title: 'Pushify vs Railway | Pushify',
    description:
      'An honest, side-by-side comparison of Pushify and Railway — flat server pricing on infrastructure you own instead of metered billing.',
    url: 'https://pushify.dev/vs/railway',
  },
};

export default function VsRailwayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          datePublished: '2026-08-02',
          dateModified: '2026-08-02',
          '@id': 'https://pushify.dev/vs/railway#webpage',
          url: 'https://pushify.dev/vs/railway',
          name: 'Pushify vs Railway',
          description:
            'An honest comparison of Pushify and Railway — a self-hostable Railway alternative with flat server pricing.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Pushify vs Railway', item: 'https://pushify.dev/vs/railway' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
