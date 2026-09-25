import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 A flat plan for the platform";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Pricing",
    title: "A flat plan for the platform",
    subtitle: "Start free on a server you own. Managed servers are billed by the hour, on their own.",
  });
}
