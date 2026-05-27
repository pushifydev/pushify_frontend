import type { Metadata } from 'next';

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
  return children;
}
