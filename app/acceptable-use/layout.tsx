import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
  description: 'What may and may not run on the hosted Pushify service, how it is enforced and how to appeal.',
  alternates: {
    canonical: '/acceptable-use',
  },
};

export default function AcceptableUseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
