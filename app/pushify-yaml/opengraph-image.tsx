import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 pushify.yaml";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Reference",
    title: "pushify.yaml",
    subtitle: "How your app builds and runs, kept next to the code.",
  });
}
