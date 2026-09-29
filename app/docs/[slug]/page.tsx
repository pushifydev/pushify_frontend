import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DocsGuideShell } from '@/components/docs/DocsGuideShell';
import { BlogProse } from '@/app/blog/prose';
import { DOC_SLUGS, getDocPage, neighbours } from '@/lib/docs';

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return DOC_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getDocPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/docs/${slug}` },
    openGraph: { title: `${page.title} | Pushify docs`, description: page.description, url: `https://pushify.dev/docs/${slug}` },
  };
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = await getDocPage(slug);
  if (!page) notFound();
  const { prev, next } = neighbours(slug);

  return (
    <DocsGuideShell current={slug} headings={page.headings}>
      <h1 className="text-[2rem] font-medium tracking-[-0.02em]" style={{ color: 'var(--hp-ink)' }}>
        {page.title}
      </h1>
      {page.description && (
        <p className="mt-3 mb-10 text-[1.0625rem]" style={{ color: 'var(--hp-body)' }}>
          {page.description}
        </p>
      )}
      <BlogProse blocks={page.blocks} className="blog-prose docs-prose" />
      {page.updated && (
        <p className="mt-10 text-[0.8125rem]" style={{ color: 'var(--hp-muted)' }}>
          Last checked against the code on {page.updated}.
        </p>
      )}
      <nav className="docs-guide-pager" aria-label="Previous and next page">
        {prev ? <Link href={`/docs/${prev.slug}`}>← {prev.title}</Link> : <span />}
        {next ? <Link href={`/docs/${next.slug}`}>{next.title} →</Link> : <span />}
      </nav>
    </DocsGuideShell>
  );
}
