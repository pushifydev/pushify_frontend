import Link from 'next/link';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { listBlogPosts } from '@/lib/blog';

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function BlogIndexPage() {
  const posts = await listBlogPosts();

  return (
    <MarketingShell>
      <MarketingPageHero
        label="Blog"
        title="Engineering notes"
        description="Self-hosting, zero-downtime deploys, and running your own PaaS on servers you control — written as we build Pushify."
      />

      <div className="lp-container max-w-3xl pb-24">
        <div className="divide-y" style={{ borderColor: 'var(--lp-border)' }}>
          {posts.map((post) => (
            <article key={post.slug} className="py-8 first:pt-0">
              <p
                className="text-xs uppercase tracking-[0.08em] font-medium mb-2 tabular-nums"
                style={{ color: 'var(--lp-muted)' }}
              >
                {formatDate(post.date)} · {post.readingMinutes} min read
              </p>
              <h2 className="text-xl font-semibold tracking-tight mb-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:underline underline-offset-4"
                  style={{ color: 'var(--lp-ink)' }}
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-[15px] leading-relaxed mb-3" style={{ color: 'var(--lp-body)' }}>
                {post.description}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-medium hover:underline underline-offset-4"
                style={{ color: 'var(--lp-ink)' }}
              >
                Read the post →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
