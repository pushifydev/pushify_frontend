import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'About – Open-Source Cloud Deployment Platform',
  description:
    'Pushify is an open-source cloud deployment platform built for developers who want Vercel-style simplicity without vendor lock-in. Read our mission and values.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Pushify – Open-Source Cloud Deployment Platform',
    url: 'https://pushify.dev/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': 'https://pushify.dev/about#webpage',
          url: 'https://pushify.dev/about',
          name: 'About Pushify',
          description:
            'Pushify is an open-source cloud deployment platform. Learn our mission, values, and how we compare to proprietary PaaS tools.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#organization' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'About', item: 'https://pushify.dev/about' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
