import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Deploy to Pushify Button – One-Click Deploys from Your README',
  description:
    'Add a "Deploy to Pushify" button to any repository README. Visitors deploy your project to their own server in one click — repo, branch and framework prefilled.',
  alternates: { canonical: '/deploy-button' },
  openGraph: {
    title: 'Deploy to Pushify Button',
    url: 'https://pushify.dev/deploy-button',
  },
};

export default function DeployButtonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          '@id': 'https://pushify.dev/deploy-button#article',
          url: 'https://pushify.dev/deploy-button',
          headline: 'Deploy to Pushify Button',
          description:
            'Add a one-click "Deploy to Pushify" button to a repository README so visitors can deploy the project to their own server.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Deploy button', item: 'https://pushify.dev/deploy-button' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
