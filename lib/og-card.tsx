import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Social preview cards in the site's language: the lit background (public/og/og-bg.png, rendered
 * from the homepage hero's CSS — the brand mark is part of it), a bracketed mono eyebrow, an
 * Inter 500 title and a mono footer. Static Inter/Geist Mono instances live in lib/og-fonts
 * because the OG renderer cannot read the site's variable woff2 files.
 */

export const OG_SIZE = { width: 1200, height: 630 };

async function load() {
  const root = process.cwd();
  const [bg, inter400, inter500, mono] = await Promise.all([
    readFile(path.join(root, 'public/og/og-bg.png')),
    readFile(path.join(root, 'lib/og-fonts/Inter-400.ttf')),
    readFile(path.join(root, 'lib/og-fonts/Inter-500.ttf')),
    readFile(path.join(root, 'lib/og-fonts/GeistMono-400.ttf')),
  ]);
  return { bg: `data:image/png;base64,${bg.toString('base64')}`, inter400, inter500, mono };
}

export async function ogCard({
  eyebrow,
  title,
  subtitle,
  footLeft,
  footRight = 'pushify.dev',
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  footLeft?: string;
  footRight?: string;
}) {
  const { bg, inter400, inter500, mono } = await load();
  const titleSize = title.length > 70 ? 54 : title.length > 40 ? 64 : 76;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0a0a0a', color: '#f4f4f5', fontFamily: 'Inter' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bg} width={1200} height={630} alt="" style={{ position: 'absolute', left: 0, top: 0 }} />
        <div style={{ position: 'absolute', left: 72, right: 72, bottom: 150, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Geist Mono', fontSize: 18, letterSpacing: 2.2, textTransform: 'uppercase', color: '#7a7a7a' }}>
            {`[ ${eyebrow} ]`}
          </div>
          <div style={{ marginTop: 24, fontSize: titleSize, fontWeight: 500, lineHeight: 1.06, letterSpacing: -1, maxWidth: 1020 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ marginTop: 22, fontSize: 26, lineHeight: 1.4, color: '#9ca3af', maxWidth: 940 }}>{subtitle}</div>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 72,
            right: 72,
            bottom: 56,
            paddingTop: 22,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'Geist Mono',
            fontSize: 17,
            letterSpacing: 1.7,
            textTransform: 'uppercase',
            color: '#6b7280',
          }}
        >
          <span>{footLeft ?? ''}</span>
          <span style={{ color: '#f4f4f5' }}>{footRight}</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
        { name: 'Inter', data: inter500, weight: 500, style: 'normal' },
        { name: 'Geist Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );
}
