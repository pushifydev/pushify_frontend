import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Pushify vs Coolify',
  description:
    'Pushify vs Coolify: an honest comparison of two open-source, self-hostable deployment platforms. Features, pricing, managed cloud, and which one to choose.',
  keywords: [
    'coolify alternative',
    'pushify vs coolify',
    'open source PaaS',
    'self-hosted deployment',
    'coolify comparison',
  ],
  alternates: { canonical: '/vs/coolify' },
  openGraph: {
    title: 'Pushify vs Coolify | Pushify',
    description:
      'An honest, side-by-side comparison of two open-source self-hosting platforms — features, pricing, and which one fits.',
    url: 'https://pushify.dev/vs/coolify',
  },
};

export default function VsCoolifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          datePublished: '2026-06-15',
          dateModified: '2026-07-05',
          '@id': 'https://pushify.dev/vs/coolify#webpage',
          url: 'https://pushify.dev/vs/coolify',
          name: 'Pushify vs Coolify',
          description:
            'An honest comparison of Pushify and Coolify — two open-source, self-hostable deployment platforms.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Pushify vs Coolify', item: 'https://pushify.dev/vs/coolify' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
