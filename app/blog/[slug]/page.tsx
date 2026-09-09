import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MarketingShell } from '@/components/landing';
import { JsonLd } from '@/components/JsonLd';
import { getBlogPost, listBlogPosts } from '@/lib/blog';
import { BlogProse } from '../prose';

interface Params {
  slug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await listBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  const url = `https://pushify.dev/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
      types: { 'application/rss+xml': 'https://pushify.dev/blog/rss.xml' },
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      publishedTime: `${post.date}T00:00:00Z`,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const url = `https://pushify.dev/blog/${post.slug}`;

  return (
    <MarketingShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          '@id': `${url}#article`,
          headline: post.title,
          description: post.description,
          url,
          datePublished: `${post.date}T00:00:00Z`,
          author: { '@type': 'Person', name: post.author },
          publisher: { '@id': 'https://pushify.dev/#organization' },
          isPartOf: { '@id': 'https://pushify.dev/blog#blog' },
          keywords: post.tags.join(', '),
          inLanguage: 'en',
          mainEntityOfPage: url,
        }}
      />

      <article className="lp-container max-w-3xl pt-28 md:pt-36 pb-20 md:pb-28">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm mb-8 hover:underline underline-offset-4"
          style={{ color: 'var(--lp-muted)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Blog
        </Link>

        <header className="mb-10">
          <p
            className="text-xs uppercase tracking-[0.08em] font-medium mb-3 tabular-nums"
            style={{ color: 'var(--lp-muted)' }}
          >
            {formatDate(post.date)} · {post.readingMinutes} min read
          </p>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-4"
            style={{ color: 'var(--lp-ink)' }}
          >
            {post.title}
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--lp-body)' }}>
            {post.description}
          </p>
          <p className="text-sm mt-4" style={{ color: 'var(--lp-muted)' }}>
            {post.author}
          </p>
        </header>

        <BlogProse blocks={post.blocks} />

        <footer
          className="mt-14 pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderColor: 'var(--lp-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--lp-muted)' }}>
            Questions or feedback? Open an issue on{' '}
            <a
              href="https://github.com/pushifydev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
              style={{ color: 'var(--lp-ink)' }}
            >
              GitHub
            </a>
            .
          </p>
          <Link href="/register" className="lp-cta text-sm py-2.5 px-5 shrink-0">
            Deploy your first app
          </Link>
        </footer>
      </article>
    </MarketingShell>
  );
}
