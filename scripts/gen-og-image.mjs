// Regenerate public/og-image.png (1200×630): node scripts/gen-og-image.mjs
// Rendered with Satori (next's bundled @vercel/og) and the site's own faces — Inter and
// JetBrains Mono, fetched from Google Fonts as TTF. Monochrome like the landing and the logo
// (components/logo.tsx); copy only states what the product does — no speed claims.
import { writeFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/dist/compiled/@vercel/og/index.node.js';

const INK = '#09090b';
const PAPER = '#fafafa';
const BODY = '#52525b';
const MUTED = '#71717a';
const RULE = '#e4e4e7';
const TILE = '#171717';
const P_PATH =
  'M22 48V16H34C38.4 16 42 17.6 44.2 20.2C46.4 22.8 47 26 47 28.5C47 31 46.4 34.2 44.2 36.8C42 39.4 38.4 41 34 41H30V48H22ZM30 33.5H33.5C35 33.5 36.2 33 37 32.2C37.8 31.4 38.2 30.2 38.2 28.5C38.2 26.8 37.8 25.6 37 24.8C36.2 24 35 23.5 33.5 23.5H30V33.5Z';

// An old Safari user agent makes Google Fonts answer with TrueType, which Satori can read.
async function googleFont(family, weight) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
    },
  }).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`No TTF for ${family} ${weight}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

const tile = (size, radius) =>
  h(
    'svg',
    { width: size, height: size, viewBox: '0 0 64 64', xmlns: 'http://www.w3.org/2000/svg' },
    h('rect', { width: 64, height: 64, rx: radius, fill: TILE }),
    h('path', { d: P_PATH, fill: '#ffffff' })
  );

const image = h(
  'div',
  {
    style: {
      width: 1200,
      height: 630,
      display: 'flex',
      position: 'relative',
      background: PAPER,
      fontFamily: 'Inter',
      overflow: 'hidden',
    },
  },
  // The mark, oversized and cropped by the frame: recognisable even as a tiny link preview.
  h('div', { style: { position: 'absolute', left: 764, top: 150, display: 'flex' } }, tile(540, 14)),
  h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 0 64px 80px',
        width: 700,
        height: '100%',
      },
    },
    // Just the name: the mark is already on the right, once is enough.
    h('div', { style: { display: 'flex', fontSize: 30, fontWeight: 700, color: INK, letterSpacing: '-0.02em' } }, 'Pushify'),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 26 } },
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            fontSize: 82,
            fontWeight: 700,
            color: INK,
            letterSpacing: '-0.045em',
            lineHeight: 1.0,
          },
        },
        h('div', {}, 'Deploy to your'),
        h('div', {}, 'own servers.')
      ),
      // Broken by hand (and a non-breaking hyphen) so no line starts with a dash or ends on "zero-".
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            fontSize: 26,
            fontWeight: 500,
            color: BODY,
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
          },
        },
        h('div', {}, 'Connect a repository, pick a server (yours or ours)'),
        h('div', {}, 'and ship with HTTPS and zero\u2011downtime deploys.')
      )
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          gap: 18,
          paddingTop: 22,
          borderTop: `1px solid ${RULE}`,
          width: 610,
          fontFamily: 'JetBrains Mono',
          fontSize: 19,
          color: MUTED,
        },
      },
      h('div', {}, 'open source'),
      h('div', { style: { color: RULE } }, '/'),
      h('div', {}, 'MIT licensed'),
      h('div', { style: { color: RULE } }, '/'),
      h('div', { style: { color: INK } }, 'pushify.dev')
    )
  )
);

const [interBold, interMedium, mono] = await Promise.all([
  googleFont('Inter', 700),
  googleFont('Inter', 500),
  googleFont('JetBrains+Mono', 500),
]);

const response = new ImageResponse(image, {
  width: 1200,
  height: 630,
  fonts: [
    { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
    { name: 'Inter', data: interMedium, weight: 500, style: 'normal' },
    { name: 'JetBrains Mono', data: mono, weight: 500, style: 'normal' },
  ],
});

writeFileSync('public/og-image.png', Buffer.from(await response.arrayBuffer()));
console.log('og-image.png written');
