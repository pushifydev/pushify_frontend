import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Open Source',
  description:
    'Pushify is MIT licensed. Self-host the platform, contribute on GitHub, and use the pushify-cli for deployments.',
  alternates: { canonical: '/open-source' },
  openGraph: {
    title: 'Open Source | Pushify',
    url: 'https://pushify.dev/open-source',
  },
};

export default function OpenSourceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          '@id': 'https://pushify.dev/open-source#sourcecode',
          name: 'Pushify',
          description:
            'Open-source cloud deployment platform. MIT-licensed, self-hostable, community-driven.',
          url: 'https://pushify.dev/open-source',
          codeRepository: 'https://github.com/pushifydev',
          license: 'https://opensource.org/licenses/MIT',
          programmingLanguage: { '@type': 'ComputerLanguage', name: 'TypeScript' },
          runtimePlatform: 'Node.js',
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Open Source', item: 'https://pushify.dev/open-source' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
