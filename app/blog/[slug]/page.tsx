import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarketingShell } from '@/components/landing';
import { JsonLd } from '@/components/JsonLd';
import { getBlogPost, listBlogPosts } from '@/lib/blog';
import { BlogProse } from '../prose';
import { BackToBlog, PostFooter, PostMeta } from '../copy';

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
      ...(post.author && { authors: [post.author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
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
          author: post.author
            ? { '@type': 'Person', name: post.author }
            : { '@id': 'https://pushify.dev/#organization' },
          publisher: { '@id': 'https://pushify.dev/#organization' },
          isPartOf: { '@id': 'https://pushify.dev/blog#blog' },
          keywords: post.tags.join(', '),
          inLanguage: 'en',
          mainEntityOfPage: url,
        }}
      />

      <article className="lp-container max-w-3xl pt-28 md:pt-36 pb-20 md:pb-28">
        <BackToBlog />

        <header className="blog-post-header">
          <PostMeta date={post.date} minutes={post.readingMinutes} long />
          <h1 className="blog-post-title" lang="en">{post.title}</h1>
          <p className="blog-post-lead" lang="en">{post.description}</p>
          {post.author && <p className="blog-post-author">{post.author}</p>}
        </header>

        <BlogProse blocks={post.blocks} />

        <PostFooter />
      </article>
    </MarketingShell>
  );
}
