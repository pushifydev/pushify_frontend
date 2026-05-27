import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Deploy to your own servers in under 60 seconds. Git push deploys, marketplace apps, monitoring, teams, and open-source MIT license.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'Features | Pushify',
    description: 'Open-source cloud deployment with zero config on your VPS.',
    url: 'https://pushify.dev/features',
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
