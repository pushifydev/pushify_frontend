import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 What is new in Pushify";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Changelog",
    title: "What is new in Pushify",
    subtitle: "Every release across the platform, API and dashboard.",
  });
}
