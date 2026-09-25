import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Built in the open";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Open source",
    title: "Built in the open",
    subtitle: "The API, the dashboard and the CLI are MIT-licensed on GitHub.",
  });
}
