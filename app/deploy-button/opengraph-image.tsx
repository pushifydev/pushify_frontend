import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 One-click deploys from your README";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Deploy button",
    title: "One-click deploys from your README",
  });
}
