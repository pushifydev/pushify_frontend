import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Security',
  description:
    'How Pushify protects accounts and secrets, exactly what it does on servers you connect, and how to report a vulnerability.',
  alternates: { canonical: '/security' },
  openGraph: { images: OG_IMAGE, title: 'Pushify Security', url: 'https://pushify.dev/security' },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
