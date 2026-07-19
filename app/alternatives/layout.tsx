import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Self-Hosted PaaS & Heroku Alternatives Compared (2026)',
  description:
    'Coolify, Dokploy, CapRover, Dokku, Railway, Render and Heroku compared honestly: real licenses, real prices, who each fits — and where Pushify stands.',
  keywords: [
    'coolify alternative',
    'heroku alternative',
    'self hosted paas',
    'vercel alternative self hosted',
    'dokploy vs coolify',
    'open source paas comparison',
  ],
  alternates: { canonical: '/alternatives' },
  openGraph: {
    title: 'Self-Hosted PaaS & Heroku Alternatives Compared | Pushify',
    description:
      'Real licenses, real prices, no fake rankings — the self-hosted PaaS landscape in one honest page.',
    url: 'https://pushify.dev/alternatives',
  },
};

export default function AlternativesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://pushify.dev/alternatives#webpage',
          url: 'https://pushify.dev/alternatives',
          name: 'Self-Hosted PaaS & Heroku Alternatives Compared',
          description:
            'An honest comparison of self-hosted and managed PaaS platforms: Coolify, Dokploy, CapRover, Dokku, Heroku, Railway, Render and Pushify.',
          datePublished: '2026-07-19',
          dateModified: '2026-07-19',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://pushify.dev/alternatives' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
