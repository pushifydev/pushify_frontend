import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
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
  return children;
}
