import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Partners – Run Pushify for Your Clients',
  description:
    'Agency setup, white-label licensing, and team plans. Run the open-source Pushify deployment platform for your clients — on your infrastructure or ours.',
  alternates: { canonical: '/partners' },
  openGraph: {
    title: 'Pushify Partners – Agencies & Hosting Providers',
    url: 'https://pushify.dev/partners',
  },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://pushify.dev/partners#webpage',
          url: 'https://pushify.dev/partners',
          name: 'Pushify Partners',
          description:
            'Agency setup, white-label licensing, and team plans for the open-source Pushify deployment platform.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#organization' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Partners', item: 'https://pushify.dev/partners' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
