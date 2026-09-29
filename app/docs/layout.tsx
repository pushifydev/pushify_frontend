import type { Metadata } from 'next';
import './docs.css';
import '../blog/blog.css';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  title: { default: 'Documentation', template: '%s | Pushify docs' },
  description: 'How to deploy on Pushify: connect or rent a server, deploy from Git, domains, databases, scaling, teams, billing and the CLI.',
  openGraph: { images: OG_IMAGE },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
