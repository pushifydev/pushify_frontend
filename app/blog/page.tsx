import Link from 'next/link';
import { MarketingShell } from '@/components/landing';
import { listBlogPosts } from '@/lib/blog';
import { BlogIndexHero, FeaturedPost, PostMeta, ReadPostLink } from './copy';

export default async function BlogIndexPage() {
  const posts = await listBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <MarketingShell noPad>
      <BlogIndexHero />

      <div className="lp-container max-w-4xl pb-24 md:pb-32">
        {/* The newest post, set as the page's one object; the rest follow as a plain list. */}
        {featured && (
          <FeaturedPost
            href={`/blog/${featured.slug}`}
            title={featured.title}
            description={featured.description}
            date={featured.date}
            minutes={featured.readingMinutes}
          />
        )}

        {rest.length > 0 && (
          <div className="blog-list mt-16 md:mt-20">
            {rest.map((post) => (
              <article key={post.slug} className="blog-list-item">
                <PostMeta date={post.date} minutes={post.readingMinutes} />
                <div>
                  <h2 className="blog-list-title" lang="en">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="blog-list-desc" lang="en">{post.description}</p>
                  <ReadPostLink href={`/blog/${post.slug}`} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </MarketingShell>
  );
}
