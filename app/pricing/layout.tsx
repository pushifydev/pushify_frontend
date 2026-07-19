import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Pricing – Plans, Server Credits & Billing',
  description:
    'Platform subscription plus prepaid infrastructure credits for managed Hetzner servers. Hourly billing, payment failure policy, and BYOS explained.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Pushify',
    description: 'Simple pricing for self-hosted and managed deployment.',
    url: 'https://pushify.dev/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://pushify.dev/pricing#webpage',
          url: 'https://pushify.dev/pricing',
          name: 'Pricing | Pushify',
          description:
            'Platform subscription plus prepaid infrastructure credits for managed Hetzner servers. Free self-hosting, plus paid managed plans.',
          inLanguage: 'en',
          isPartOf: { '@id': 'https://pushify.dev/#website' },
          about: { '@id': 'https://pushify.dev/#software' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pushify.dev' },
              { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://pushify.dev/pricing' },
            ],
          },
        }}
      />
      {children}
    </>
  );
}
