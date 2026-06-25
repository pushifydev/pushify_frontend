'use client';

import Link from 'next/link';
import type { Database } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { formatStorage, formatTimeAgo } from '@/lib/formatters';
import { panelStyle, type T } from './_shared';

export function DatabaseStatsRow({ database, t }: { database: Database; t: T }) {
  const used = database.usedStorageMb ?? 0;
  const total = database.storageMb ?? 1024;
  const pct = Math.min((used / total) * 100, 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
      {[
        {
          label: t('databases', 'storage'),
          value: `${formatStorage(used)} / ${formatStorage(total)}`,
          sub: (
            <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: STATUS_COLORS.purple }} />
            </div>
          ),
        },
        {
          label: t('databases', 'server'),
          value: database.server?.name ?? '—',
          link: database.server ? `/dashboard/servers/${database.server.id}` : undefined,
        },
        {
          label: t('databases', 'lastBackup'),
          value: database.lastBackupAt
            ? formatTimeAgo(database.lastBackupAt, t)
            : t('databases', 'neverBackedUp'),
        },
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl px-4 py-3" style={panelStyle}>
          <p
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
            }}
          >
            {stat.label}
          </p>
          {stat.link ? (
            <Link href={stat.link} className="text-sm font-medium hover:underline" style={{ color: 'var(--accent-cyan)' }}>
              {stat.value}
            </Link>
          ) : (
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </p>
          )}
          {stat.sub}
        </div>
      ))}
    </div>
  );
}
