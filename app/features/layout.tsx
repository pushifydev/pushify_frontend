import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features - Deploy, Manage Servers & Databases',
  description:
    'Auto-deploy from GitHub, managed VPS servers, one-click databases, CLI tool, SSL certificates, team collaboration, and monitoring. Everything you need to ship with confidence.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'Features - Pushify',
    description:
      'Auto-deploy from GitHub, managed VPS servers, one-click databases, CLI tool, and more.',
    url: 'https://pushify.dev/features',
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
