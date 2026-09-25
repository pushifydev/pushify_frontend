import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/seo';

const FRAMEWORK_META: Record<string, { title: string; desc: string; slug: string }> = {
  nextjs: { title: 'Deploy Next.js Apps', desc: 'Deploy Next.js apps to your own VPS with a git push. Framework detection, automatic SSL, zero-downtime deploys and rollbacks. Free plan available.', slug: 'nextjs' },
  react: { title: 'Deploy React Apps', desc: 'Deploy React apps (Vite, CRA) to your own VPS. Built and served by nginx with SPA routing and free SSL. Start free.', slug: 'react' },
  vue: { title: 'Deploy Vue.js Apps', desc: 'Deploy Vue.js and Nuxt apps to your own VPS. Framework detection, static or SSR, free SSL. Start free.', slug: 'vue' },
  python: { title: 'Deploy Python Apps', desc: 'Deploy Django, Flask and FastAPI apps to your own VPS. Framework detection, Gunicorn or Uvicorn, free SSL.', slug: 'python' },
  nodejs: { title: 'Deploy Node.js Apps', desc: 'Deploy Node.js apps (Express, Fastify, NestJS) to your own VPS. Containerised, restarted on crash, free SSL, zero-downtime deploys.', slug: 'nodejs' },
  laravel: { title: 'Deploy Laravel Apps', desc: 'Deploy Laravel apps to your own VPS. PHP 8.3 with FPM and opcache, Composer, config caching, queue workers via pushify.yaml.', slug: 'laravel' },
};

export async function generateStaticParams() {
  return Object.keys(FRAMEWORK_META).map((framework) => ({ framework }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ framework: string }>;
}): Promise<Metadata> {
  const { framework } = await params;
  const fw = FRAMEWORK_META[framework];
  if (!fw) return {};

  return {
    title: `${fw.title} to Your Own Server`,
    description: fw.desc,
    alternates: { canonical: `/deploy/${fw.slug}` },
    openGraph: {
      images: OG_IMAGE,
      title: `${fw.title} with Pushify`,
      description: fw.desc,
      url: `https://pushify.dev/deploy/${fw.slug}`,
    },
  };
}

export default function DeployFrameworkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
