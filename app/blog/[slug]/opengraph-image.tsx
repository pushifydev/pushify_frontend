import { ImageResponse } from 'next/og';
import { getBlogPost, listBlogPosts } from '@/lib/blog';

export const alt = 'Pushify Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const posts = await listBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  const title = post?.title ?? 'Pushify Blog';
  const meta = post ? `${post.readingMinutes} min read · ${post.date}` : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #0a0a0f 0%, #14141c 100%)',
          color: '#f4f4f5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020206', fontSize: 28, fontWeight: 800 }}>P</div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>Pushify</div>
          <div style={{ fontSize: 22, color: '#8b8b96', marginLeft: 8 }}>Blog</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: title.length > 60 ? 52 : 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5, maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ fontSize: 24, color: '#8b8b96' }}>{meta}</div>
        </div>
        <div style={{ fontSize: 22, color: '#8b8b96' }}>pushify.dev/blog</div>
      </div>
    ),
    size,
  );
}
