import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Site Builder',
  description:
    'Build and publish websites without code. A WordPress-style visual editor with multi-page management, ready-made design templates, and one-click publish to your own server — domain optional.',
  alternates: { canonical: '/sites' },
  openGraph: {
    title: 'Site Builder | Pushify',
    description:
      'Pick a design, edit blocks on the page, add pages, and publish to your own server — with or without a domain.',
    url: 'https://pushify.dev/sites',
  },
};

export default function SitesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
