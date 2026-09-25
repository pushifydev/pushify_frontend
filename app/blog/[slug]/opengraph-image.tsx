import { getBlogPost, listBlogPosts } from '@/lib/blog';
import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = 'Pushify Blog';
export const size = OG_SIZE;
export const contentType = 'image/png';

export async function generateStaticParams() {
  const posts = await listBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  return ogCard({
    eyebrow: 'Blog',
    title: post?.title ?? 'Engineering notes',
    footLeft: post ? `${post.date} · ${post.readingMinutes} min read` : 'pushify.dev/blog',
    footRight: 'pushify.dev/blog',
  });
}
