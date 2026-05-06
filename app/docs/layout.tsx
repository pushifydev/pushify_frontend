import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation',
  description:
    'Pushify REST API reference. Authentication, projects, deployments, servers, databases, webhooks, CI/CD integration, and more.',
  alternates: {
    canonical: '/docs',
  },
  openGraph: {
    title: 'API Documentation - Pushify',
    description: 'Complete REST API reference for Pushify cloud deployment platform.',
    url: 'https://pushify.dev/docs',
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
