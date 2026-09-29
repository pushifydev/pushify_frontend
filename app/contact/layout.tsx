import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'How to reach Pushify: support, sales, bug reports, security reports and company details.',
  alternates: { canonical: '/contact' },
  openGraph: { images: OG_IMAGE, title: 'Contact Pushify', url: 'https://pushify.dev/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
