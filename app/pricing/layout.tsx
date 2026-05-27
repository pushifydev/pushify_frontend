import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Transparent plans from Free to Business. Pay for your servers, not per-seat markup. Compare limits for projects, deployments, and API rate limits.',
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
