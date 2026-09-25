import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Ship apps to servers you own";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "About",
    title: "Ship apps to servers you own",
  });
}
