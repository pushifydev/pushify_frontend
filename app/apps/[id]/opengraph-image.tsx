import { ImageResponse } from 'next/og';
import { APPS, getApp } from '@/lib/apps-catalog';

export const alt = 'Self-host in one click with Pushify';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return APPS.map((a) => ({ id: a.id }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = getApp(id);
  const name = app?.name ?? 'Apps';
  const description = app?.description ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #0a0a0f 0%, #14141c 100%)',
          color: '#f4f4f5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020206', fontSize: 28, fontWeight: 800 }}>P</div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>Pushify</div>
          <div style={{ fontSize: 22, color: '#8b8b96', marginLeft: 8 }}>Apps</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 30, color: '#22d3ee', fontWeight: 600 }}>Self-host in one click</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{name}</div>
          <div style={{ fontSize: 26, color: '#b4b4bd', maxWidth: 1000, lineHeight: 1.35 }}>{description}</div>
        </div>
        <div style={{ fontSize: 22, color: '#8b8b96' }}>{`pushify.dev/apps/${id}`}</div>
      </div>
    ),
    size,
  );
}
