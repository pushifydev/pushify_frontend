import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report abuse',
  description: 'Report an app hosted on Pushify that breaks the Acceptable Use Policy.',
  alternates: {
    canonical: '/abuse',
  },
};

export default function AbuseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
