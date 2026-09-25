import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 A no-code website builder, on your own server";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Site builder",
    title: "A no-code website builder, on your own server",
  });
}
