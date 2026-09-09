import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: {
    default: 'Self-host 24 open-source apps in one click',
    template: '%s | Pushify Apps',
  },
  description:
    'One-click self-hosting for WordPress, n8n, Supabase, Grafana, Plausible, Ghost and more — on your own server with HTTPS, backups and health checks handled.',
  alternates: { canonical: '/apps' },
  openGraph: {
    title: 'Pushify Apps — self-host open-source tools in one click',
    url: 'https://pushify.dev/apps',
  },
};

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://pushify.dev/apps#webpage',
          url: 'https://pushify.dev/apps',
          name: 'Pushify Apps',
          description:
            'One-click self-hosting for popular open-source apps on your own server.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
        }}
      />
      {children}
    </>
  );
}
