import { APPS, getApp } from '@/lib/apps-catalog';
import { ogCard, OG_SIZE } from '@/lib/og-card';

export const alt = 'Self-host in one click with Pushify';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return APPS.map((a) => ({ id: a.id }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = getApp(id);
  return ogCard({
    eyebrow: 'Self-host in one click',
    title: app ? `${app.name} on your own server` : 'Open-source apps on your own server',
    subtitle: app?.description,
    footLeft: app ? `pushify.dev/apps/${id}` : 'pushify.dev/apps',
  });
}
