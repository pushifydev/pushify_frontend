import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Pushify vs Coolify";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Comparison",
    title: "Pushify vs Coolify",
    subtitle: "An honest, side-by-side look at where each one fits.",
  });
}
