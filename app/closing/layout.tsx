import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pushify is closing',
  description: "Pushify's hosted service is closing. What happens to your projects and how to move them.",
  alternates: { canonical: '/closing' },
};

export default function ClosingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
