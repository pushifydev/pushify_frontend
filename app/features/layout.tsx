import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Features – Deploy, Databases, Marketplace & AI',
  description:
    'Deploy to your own servers in under 60 seconds. Git push deploys, marketplace apps, monitoring, teams, and open-source MIT license.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'Features – Deploy, Databases, Marketplace & AI | Pushify',
    description: 'Open-source cloud deployment with zero config on your VPS.',
    url: 'https://pushify.dev/features',
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://pushify.dev/features#webpage',
          url: 'https://pushify.dev/features',
          name: 'Features | Pushify',
          description:
            'Deploy to your own servers in under 60 seconds. Git push deploys, marketplace apps, monitoring, teams, and open-source MIT license.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://pushify.dev/features' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
