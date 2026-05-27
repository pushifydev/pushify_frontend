'use client';

import Link from 'next/link';
import { MapPin, Server } from 'lucide-react';
import type { Server as ServerType } from '@/lib/api';
import { SERVER_STATUS_COLORS } from '@/lib/constants';

function toMapPosition(lat: number, lng: number) {
  return {
    left: `${((lng + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`,
  };
}

export function ServerMapView({
  servers,
  t,
}: {
  servers: ServerType[];
  t: ReturnType<typeof import('@/hooks').useTranslation>['t'];
}) {
  const withCoords = servers.filter((s) => s.location?.latitude != null && s.location?.longitude != null);
  const withoutCoords = servers.filter((s) => !s.location?.latitude || !s.location?.longitude);

  return (
    <div className="space-y-4">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          height: 320,
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(34,211,238,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.06) 0%, transparent 45%), var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(var(--glass-border) 1px, transparent 1px), linear-gradient(90deg, var(--glass-border) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {withCoords.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <MapPin className="w-8 h-8 mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-medium">{t('servers', 'mapNoCoords')}</p>
            <p className="text-xs mt-1 max-w-sm" style={{ color: 'var(--text-muted)' }}>
              {t('servers', 'mapNoCoordsDesc')}
            </p>
          </div>
        ) : (
          withCoords.map((server) => {
            const pos = toMapPosition(server.location!.latitude, server.location!.longitude);
            const accent = SERVER_STATUS_COLORS[server.status];
            return (
              <Link
                key={server.id}
                href={`/dashboard/servers/${server.id}`}
                title={`${server.name} — ${server.location?.city || server.region}`}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
                style={pos}
              >
                <span
                  className="flex items-center justify-center w-3 h-3 rounded-full ring-2 ring-[var(--bg-primary)] transition-transform group-hover:scale-125"
                  style={{ background: accent, boxShadow: `0 0 10px ${accent}90` }}
                />
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-4 whitespace-nowrap text-[10px] font-medium px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {server.name}
                </span>
              </Link>
            );
          })
        )}
      </div>

      {withoutCoords.length > 0 && (
        <div>
          <p
            className="text-[10px] font-mono uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('servers', 'mapNoLocationList')}
          </p>
          <div className="flex flex-wrap gap-2">
            {withoutCoords.map((server) => (
              <Link
                key={server.id}
                href={`/dashboard/servers/${server.id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
              >
                <Server className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                {server.name}
                <span style={{ color: 'var(--text-muted)' }}>· {server.region}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
