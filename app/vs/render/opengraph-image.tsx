import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Pushify vs Render";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Comparison",
    title: "Pushify vs Render",
    subtitle: "An honest, side-by-side look at where each one fits.",
  });
}
