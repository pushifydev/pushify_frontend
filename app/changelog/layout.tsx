import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Every Pushify release — new features, fixes and improvements across the platform, API and dashboard.',
  alternates: { canonical: '/changelog' },
  openGraph: {
    title: 'Changelog | Pushify',
    url: 'https://pushify.dev/changelog',
  },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
