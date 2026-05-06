import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Free Tier & Pro Plans',
  description:
    'Start deploying for free. Upgrade to Pro for more projects, servers, databases, team members, and priority support. Simple, transparent pricing.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing - Pushify',
    description: 'Start deploying for free. Simple, transparent pricing for developers and teams.',
    url: 'https://pushify.dev/pricing',
  },
};

const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Pushify',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Linux',
  url: 'https://pushify.dev',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
      description: 'For personal projects and experimentation',
      url: 'https://pushify.dev/register',
    },
    {
      '@type': 'Offer',
      name: 'Hobby',
      price: '9',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '9',
        priceCurrency: 'USD',
        billingDuration: 'P1M',
      },
      description: 'For hobby developers and side projects',
      url: 'https://pushify.dev/register?plan=hobby',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '29',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '29',
        priceCurrency: 'USD',
        billingDuration: 'P1M',
      },
      description: 'For professional developers and growing teams',
      url: 'https://pushify.dev/register?plan=pro',
    },
    {
      '@type': 'Offer',
      name: 'Business',
      price: '79',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '79',
        priceCurrency: 'USD',
        billingDuration: 'P1M',
      },
      description: 'For businesses and larger teams',
      url: 'https://pushify.dev/register?plan=business',
    },
    {
      '@type': 'Offer',
      name: 'Enterprise',
      description: 'Custom pricing for enterprise organizations',
      url: 'https://pushify.dev/register?plan=enterprise',
    },
  ],
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      {children}
    </>
  );
}
