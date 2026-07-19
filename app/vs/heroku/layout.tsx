import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Pushify vs Heroku',
  description:
    'Pushify vs Heroku: an honest comparison. Heroku is fully managed with per-dyno pricing (Basic $7/mo, free tier removed in 2022); Pushify is MIT-licensed, self-hostable, and runs on servers you own with flat pricing.',
  keywords: [
    'heroku alternative',
    'self hosted heroku',
    'pushify vs heroku',
    'heroku pricing',
    'open source heroku alternative',
  ],
  alternates: { canonical: '/vs/heroku' },
  openGraph: {
    title: 'Pushify vs Heroku | Pushify',
    description:
      'The git-push workflow Heroku made famous — on servers you own. An honest side-by-side comparison with real pricing.',
    url: 'https://pushify.dev/vs/heroku',
  },
};

export default function VsHerokuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          datePublished: '2026-07-19',
          dateModified: '2026-07-19',
          '@id': 'https://pushify.dev/vs/heroku#webpage',
          url: 'https://pushify.dev/vs/heroku',
          name: 'Pushify vs Heroku',
          description:
            'An honest comparison of Pushify and Heroku — managed PaaS convenience versus self-hostable ownership, with real pricing.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Pushify vs Heroku', item: 'https://pushify.dev/vs/heroku' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
