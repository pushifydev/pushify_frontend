'use client';

import Link from 'next/link';
import type { Database } from '@/lib/api';
import { formatStorage, formatTimeAgo } from '@/lib/formatters';
import { type T } from './_shared';

export function DatabaseStatsRow({ database, t }: { database: Database; t: T }) {
  const used = database.usedStorageMb ?? 0;
  const total = database.storageMb ?? 1024;
  const pct = Math.min((used / total) * 100, 100);
  const fillTone = pct >= 95 ? 'is-critical' : pct >= 80 ? 'is-warning' : '';

  const stats: Array<{ label: string; value: string; link?: string; sub?: React.ReactNode }> = [
    {
      label: t('databases', 'storage'),
      value: `${formatStorage(used)} / ${formatStorage(total)}`,
      sub: (
        <div
          className="dash-metric-track mt-3"
          role="progressbar"
          aria-label={t('databases', 'storage')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <div className={`dash-metric-fill ${fillTone}`} style={{ width: `${pct}%` }} />
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
      value: database.lastBackupAt ? formatTimeAgo(database.lastBackupAt, t) : t('databases', 'neverBackedUp'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="dash-stat-card px-4 py-3.5 min-w-0">
          <p className="dash-stat-label mt-0! mb-2">{stat.label}</p>
          {stat.link ? (
            <Link
              href={stat.link}
              className="block text-sm font-medium truncate underline-offset-4 hover:underline focus-visible:underline"
              style={{ color: 'var(--text-primary)' }}
            >
              {stat.value}
            </Link>
          ) : (
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </p>
          )}
          {stat.sub}
        </div>
      ))}
    </div>
  );
}
