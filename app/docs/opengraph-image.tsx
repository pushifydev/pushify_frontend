import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Pushify API documentation";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "API reference",
    title: "Pushify API documentation",
    subtitle: "Deploy, manage and monitor your apps programmatically.",
  });
}
