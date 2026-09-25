import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Engineering notes";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Blog",
    title: "Engineering notes",
    subtitle: "Self-hosting, zero-downtime deploys and running your own PaaS.",
  });
}
