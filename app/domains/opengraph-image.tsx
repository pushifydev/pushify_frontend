import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Find, register and connect a domain";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Domains",
    title: "Find, register and connect a domain",
    subtitle: "DNS and certificates written in the same step.",
  });
}
