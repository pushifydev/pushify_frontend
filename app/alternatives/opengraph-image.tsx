import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = "Pushify \u2014 Self-hosted PaaS and Heroku alternatives compared";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "The landscape, honestly",
    title: "Self-hosted PaaS and Heroku alternatives compared",
  });
}
