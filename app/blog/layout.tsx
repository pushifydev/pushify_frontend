import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import './blog.css';

export const metadata: Metadata = {
  title: {
    default: 'Blog',
    template: '%s | Pushify Blog',
  },
  description:
    'Engineering notes from Pushify — self-hosting, zero-downtime deploys, and running your own PaaS on servers you control.',
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': 'https://pushify.dev/blog/rss.xml' },
  },
  openGraph: {
    title: 'Pushify Blog',
    url: 'https://pushify.dev/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': 'https://pushify.dev/blog#blog',
          url: 'https://pushify.dev/blog',
          name: 'Pushify Blog',
          description:
            'Engineering notes from Pushify — self-hosting, zero-downtime deploys, and running your own PaaS on servers you control.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
        }}
      />
      {children}
    </>
  );
}
