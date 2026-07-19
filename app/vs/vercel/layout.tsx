import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Pushify vs Vercel',
  description:
    'Pushify vs Vercel: an open-source, self-hostable Vercel alternative. Compare features, pricing, edge network, and which one to choose for your stack.',
  keywords: [
    'vercel alternative',
    'pushify vs vercel',
    'open source vercel alternative',
    'self-hosted vercel',
    'vercel comparison',
  ],
  alternates: { canonical: '/vs/vercel' },
  openGraph: {
    title: 'Pushify vs Vercel | Pushify',
    description:
      'An honest, side-by-side comparison of Pushify and Vercel — own your infrastructure with predictable pricing and no lock-in.',
    url: 'https://pushify.dev/vs/vercel',
  },
};

export default function VsVercelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          datePublished: '2026-06-15',
          dateModified: '2026-07-05',
          '@id': 'https://pushify.dev/vs/vercel#webpage',
          url: 'https://pushify.dev/vs/vercel',
          name: 'Pushify vs Vercel',
          description:
            'An honest comparison of Pushify and Vercel — an open-source, self-hostable Vercel alternative.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Pushify vs Vercel', item: 'https://pushify.dev/vs/vercel' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
