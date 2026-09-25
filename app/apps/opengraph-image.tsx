import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Self-host the tools you love, in one click";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Apps",
    title: "Self-host the tools you love, in one click",
    subtitle: "24 open-source apps with HTTPS and a health check.",
  });
}
