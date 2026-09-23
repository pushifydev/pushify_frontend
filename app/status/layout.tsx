import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Status',
  description: 'Live Pushify platform status — API, control-plane database, job queue and build runner, straight from the health probe.',
  alternates: { canonical: '/status' },
  robots: { index: true, follow: true },
  openGraph: { images: OG_IMAGE, title: 'Pushify Status', url: 'https://pushify.dev/status' },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
