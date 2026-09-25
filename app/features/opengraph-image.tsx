import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Everything between git push and a running app";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Platform",
    title: "Everything between git push and a running app",
    subtitle: "Deploys, servers, databases, domains, scaling and alerts.",
  });
}
