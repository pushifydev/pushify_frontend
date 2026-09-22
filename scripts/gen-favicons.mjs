// Regenerate the favicon set from the brand mark: node scripts/gen-favicons.mjs (uses next's sharp).
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

// The site's logo (components/logo.tsx): a neutral-900 tile with a white P. Keep these in step
// with it — the set was left indigo when the logo went monochrome, so tabs and Google showed
// a purple mark the site no longer uses.
const TILE = '#171717';
const MARK = '#ffffff';
const P_PATH = 'M22 48V16H34C38.4 16 42 17.6 44.2 20.2C46.4 22.8 47 26 47 28.5C47 31 46.4 34.2 44.2 36.8C42 39.4 38.4 41 34 41H30V48H22ZM30 33.5H33.5C35 33.5 36.2 33 37 32.2C37.8 31.4 38.2 30.2 38.2 28.5C38.2 26.8 37.8 25.6 37 24.8C36.2 24 35 23.5 33.5 23.5H30V33.5Z';

// Tuned for tiny sizes: a touch bolder P, slightly larger corner radius so it reads as a
// rounded tile even at 16px.
const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="15" fill="${TILE}"/>
  <g transform="translate(32 32) scale(1.12) translate(-32 -32)">
    <path d="${P_PATH}" fill="${MARK}"/>
  </g>
</svg>`;

// The logo itself, unscaled — the Organization schema's logo (Google wants a raster, ≥112px).
const logo = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${TILE}"/>
  <path d="${P_PATH}" fill="${MARK}"/>
</svg>`;

// Maskable variant keeps the mark inside the safe zone (80%) on a full-bleed tile.
const maskable = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${TILE}"/>
  <g transform="translate(32 32) scale(0.82) translate(-32 -32)">
    <path d="${P_PATH}" fill="${MARK}"/>
  </g>
</svg>`;

const out = {};
for (const size of [16, 32, 48, 96, 180, 192, 512]) {
  const png = await sharp(Buffer.from(svg(size)), { density: 384 }).resize(size, size).png().toBuffer();
  out[size] = png;
  const name = size === 180 ? 'public/apple-touch-icon.png' : `public/favicon-${size}x${size}.png`;
  writeFileSync(name, png);
}
writeFileSync('public/logo-512.png', await sharp(Buffer.from(logo(512)), { density: 384 }).resize(512, 512).png().toBuffer());
writeFileSync('public/maskable-512x512.png', await sharp(Buffer.from(maskable(512)), { density: 384 }).resize(512, 512).png().toBuffer());

// favicon.ico = ICO container holding PNG-encoded 16/32/48 (valid since Vista; what Google wants).
const entries = [16, 32, 48].map((s) => out[s]);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(entries.length, 4);
const dir = Buffer.alloc(16 * entries.length);
let offset = 6 + dir.length;
entries.forEach((buf, i) => {
  const s = [16, 32, 48][i];
  dir.writeUInt8(s === 256 ? 0 : s, i * 16 + 0);
  dir.writeUInt8(s === 256 ? 0 : s, i * 16 + 1);
  dir.writeUInt8(0, i * 16 + 2); dir.writeUInt8(0, i * 16 + 3);
  dir.writeUInt16LE(1, i * 16 + 4); dir.writeUInt16LE(32, i * 16 + 6);
  dir.writeUInt32LE(buf.length, i * 16 + 8); dir.writeUInt32LE(offset, i * 16 + 12);
  offset += buf.length;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, dir, ...entries]));

writeFileSync('public/site.webmanifest', JSON.stringify({
  name: 'Pushify', short_name: 'Pushify',
  description: 'Open-source cloud deployment platform — deploy to your own servers.',
  start_url: '/', display: 'standalone', background_color: '#0a0a0a', theme_color: '#171717',
  icons: [
    { src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    { src: '/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));
console.log('favicons written');
