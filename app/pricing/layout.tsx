import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Platform plans for deploy, API, and team limits. Managed cloud servers billed via prepaid infrastructure credits.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Pushify',
    description: 'Simple pricing for self-hosted and managed deployment.',
    url: 'https://pushify.dev/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
