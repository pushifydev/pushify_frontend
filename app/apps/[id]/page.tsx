import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { APPS, getApp, relatedApps } from '@/lib/apps-catalog';
import { AppDetailView } from './AppDetailView';

interface Params {
  id: string;
}

export function generateStaticParams(): Params[] {
  return APPS.map((a) => ({ id: a.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const app = getApp(id);
  if (!app) return {};
  const title = `Self-host ${app.name} in one click`;
  const description = `${app.description} Deploy ${app.name} on your own server with Pushify — HTTPS, health checks${app.requiresDatabase ? ', a managed database with restore-tested backups' : ''} and updates handled.`;
  return {
    title,
    description,
    alternates: { canonical: `/apps/${app.id}` },
    openGraph: { title: `${title} | Pushify`, description, url: `https://pushify.dev/apps/${app.id}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function AppPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const app = getApp(id);
  if (!app) notFound();

  const url = `https://pushify.dev/apps/${app.id}`;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'SoftwareApplication',
              '@id': `${url}#app`,
              name: app.name,
              description: app.description,
              url: app.website,
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Linux (Docker)',
              softwareVersion: app.appVersion,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Open-source software; hosting on your own server' },
            },
            {
              '@type': 'WebPage',
              '@id': `${url}#webpage`,
              url,
              name: `Self-host ${app.name} in one click | Pushify`,
              inLanguage: 'en',
              isPartOf: { '@id': 'https://pushify.dev/#website' },
              about: { '@id': `${url}#app` },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
                  { '@type': 'ListItem', position: 2, name: 'Apps', item: 'https://pushify.dev/apps' },
                  { '@type': 'ListItem', position: 3, name: app.name, item: url },
                ],
              },
            },
          ],
        }}
      />
      <AppDetailView app={app} related={relatedApps(app)} />
    </>
  );
}
