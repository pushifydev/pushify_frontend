import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Open Source - MIT Licensed, Self-Hostable',
  description:
    'Pushify is fully open-source under the MIT license. Self-host on your own infrastructure, contribute on GitHub, and own your deployment stack.',
  alternates: {
    canonical: '/open-source',
  },
  openGraph: {
    title: 'Open Source - Pushify',
    description:
      'Fully open-source under MIT license. Self-host, contribute, and own your deployment stack.',
    url: 'https://pushify.dev/open-source',
  },
};

export default function OpenSourceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
