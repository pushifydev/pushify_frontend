import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Every Pushify release — new features, fixes and improvements across the platform, API and dashboard.',
  alternates: { canonical: '/changelog' },
  openGraph: {
    title: 'Changelog | Pushify',
    url: 'https://pushify.dev/changelog',
  },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://pushify.dev/changelog#webpage',
          url: 'https://pushify.dev/changelog',
          name: 'Changelog | Pushify',
          description:
            'Every Pushify release — new features, fixes and improvements across the platform, API and dashboard.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Changelog', item: 'https://pushify.dev/changelog' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
