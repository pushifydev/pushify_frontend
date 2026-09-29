import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Exit plan',
  description:
    'How to leave Pushify: what keeps running on your servers, how to export your data, moving to self-hosted Pushify, and at least 90 days notice before any shutdown.',
  alternates: { canonical: '/exit-plan' },
  openGraph: { images: OG_IMAGE, title: 'Pushify exit plan', url: 'https://pushify.dev/exit-plan' },
};

export default function ExitPlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
