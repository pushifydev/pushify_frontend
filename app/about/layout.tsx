import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Pushify is an open-source cloud deployment platform. Learn our mission, team, and how we compare to proprietary PaaS tools.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About | Pushify',
    url: 'https://pushify.dev/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
