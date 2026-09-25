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
        className="relative overflow-hidden"
        style={{
          height: 320,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
        }}
      >
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {withCoords.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <MapPin className="w-6 h-6 mb-3" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
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
                aria-label={`${server.name} — ${server.location?.city || server.region}`}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
                style={pos}
              >
                <span
                  className="flex items-center justify-center w-2.5 h-2.5 rounded-full ring-2 ring-[var(--bg-secondary)] transition-transform group-hover:scale-125 group-focus-visible:scale-125"
                  style={{ background: accent }}
                />
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-4 whitespace-nowrap text-[11px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
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
          <p className="dash-section-label mb-2">
            {t('servers', 'mapNoLocationList')}
          </p>
          <div className="flex flex-wrap gap-2">
            {withoutCoords.map((server) => (
              <Link
                key={server.id}
                href={`/dashboard/servers/${server.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors hover:border-[var(--border-default)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                <Server className="w-3 h-3" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                {server.name}
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>· {server.region}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
