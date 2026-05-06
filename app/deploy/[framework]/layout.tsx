import type { Metadata } from 'next';

const FRAMEWORK_META: Record<string, { title: string; desc: string; slug: string }> = {
  nextjs: { title: 'Deploy Next.js Apps', desc: 'Deploy Next.js apps to your own VPS in under 60 seconds. Zero config, automatic SSL, instant rollbacks. Free tier available.', slug: 'nextjs' },
  react: { title: 'Deploy React Apps', desc: 'Deploy React apps (Vite, CRA) to your own VPS instantly. Auto-detect, zero config, free SSL. Start free.', slug: 'react' },
  vue: { title: 'Deploy Vue.js Apps', desc: 'Deploy Vue.js and Nuxt apps to your own VPS in seconds. Auto-detect, zero config, free SSL. Start free.', slug: 'vue' },
  python: { title: 'Deploy Python Apps', desc: 'Deploy Python apps (Django, Flask, FastAPI) to your own VPS instantly. Auto-detect, zero config, free SSL.', slug: 'python' },
  nodejs: { title: 'Deploy Node.js Apps', desc: 'Deploy Node.js apps (Express, Fastify, NestJS) to your own VPS instantly. Auto-detect, zero config, free SSL.', slug: 'nodejs' },
  laravel: { title: 'Deploy Laravel Apps', desc: 'Deploy Laravel apps to your own VPS instantly. PHP, Composer, migrations, queue workers — all configured automatically.', slug: 'laravel' },
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
    title: `${fw.title} in Under 60 Seconds`,
    description: fw.desc,
    alternates: { canonical: `/deploy/${fw.slug}` },
    openGraph: {
      title: `${fw.title} with Pushify`,
      description: fw.desc,
      url: `https://pushify.dev/deploy/${fw.slug}`,
    },
  };
}

export default function DeployFrameworkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
