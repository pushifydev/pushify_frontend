import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Pushify is an open-source cloud deployment platform built in Turkiye. Our mission: let developers focus on building products, not managing infrastructure.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us - Pushify',
    description:
      'Open-source cloud deployment platform. Our mission: let developers focus on building products.',
    url: 'https://pushify.dev/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
