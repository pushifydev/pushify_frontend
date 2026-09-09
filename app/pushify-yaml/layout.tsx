import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'pushify.yaml Reference – Config-as-Code for Deployments',
  description:
    'Pin build, start and port settings, cron jobs, persistent volumes and worker processes in a pushify.yaml at the root of your repository. Full field reference with examples.',
  alternates: { canonical: '/pushify-yaml' },
  openGraph: {
    title: 'pushify.yaml Reference',
    url: 'https://pushify.dev/pushify-yaml',
  },
};

export default function PushifyYamlLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          '@id': 'https://pushify.dev/pushify-yaml#article',
          url: 'https://pushify.dev/pushify-yaml',
          headline: 'pushify.yaml Reference',
          description:
            'Field-by-field reference for pushify.yaml — build settings, cron jobs, volumes and workers declared in the repository.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Docs', item: 'https://pushify.dev/docs' },
              { '@type': 'ListItem', position: 3, name: 'pushify.yaml', item: 'https://pushify.dev/pushify-yaml' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
