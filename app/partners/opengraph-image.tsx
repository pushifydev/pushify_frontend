import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Run Pushify for your clients";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Partners",
    title: "Run Pushify for your clients",
  });
}
