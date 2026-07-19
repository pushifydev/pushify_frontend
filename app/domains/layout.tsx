import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Domain Search & Registration',
  description:
    'Search, register, and connect a custom domain to your Pushify app. Live pricing across popular TLDs, automatic DNS and SSL — no separate registrar needed.',
  alternates: { canonical: '/domains' },
  openGraph: {
    title: 'Domain Search & Registration | Pushify',
    description:
      'Search, register, and connect a custom domain to your Pushify app. Live pricing, automatic DNS and SSL — no separate registrar needed.',
    url: 'https://pushify.dev/domains',
  },
};

export default function DomainsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://pushify.dev/domains#webpage',
          url: 'https://pushify.dev/domains',
          name: 'Domain Search & Registration | Pushify',
          description:
            'Search, register, and connect a custom domain to your Pushify app. Live pricing, automatic DNS and SSL — no separate registrar needed.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Domains',
                item: 'https://pushify.dev/domains',
              },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
