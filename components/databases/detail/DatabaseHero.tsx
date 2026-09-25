'use client';

import Link from 'next/link';
import { HardDrive, Table2 } from 'lucide-react';
import type { Database } from '@/lib/api';
import { DB_TYPE_LABELS } from '@/lib/constants';
import { databaseTone, type T } from './_shared';

export function DatabaseHero({
  database,
  t,
  onStart,
  onStop,
  onRestart,
  actionsPending,
  studioHref,
}: {
  database: Database;
  t: T;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  actionsPending: { start: boolean; stop: boolean; restart: boolean };
  /** set only for engines the data browser supports, and only while the database is running */
  studioHref?: string | null;
}) {
  const tone = databaseTone(database.status);

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="dash-icon-box w-11 h-11 rounded-[10px]" aria-hidden="true">
          <HardDrive className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl tracking-tight truncate">{database.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`badge badge-${tone}`}>
              <span
                className={`dash-status-dot ${tone === 'neutral' ? '' : `is-${tone}`} ${
                  database.status === 'provisioning' ? 'animate-pulse' : ''
                }`}
                aria-hidden="true"
              />
              {t('databases', database.status as 'running')}
            </span>
            <span className="dash-mono-caption">
              {DB_TYPE_LABELS[database.type] ?? database.type} {database.version}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {studioHref && (
          <Link href={studioHref} className="btn btn-secondary btn-sm">
            <Table2 className="w-3.5 h-3.5" />
            {t('databases', 'studioOpen')}
          </Link>
        )}
        {database.status === 'stopped' && (
          <button
            type="button"
            onClick={onStart}
            disabled={actionsPending.start}
            className="btn btn-primary btn-sm"
          >
            {t('databases', 'start')}
          </button>
        )}
        {database.status === 'running' && (
          <>
            <button
              type="button"
              onClick={onRestart}
              disabled={actionsPending.restart}
              className="btn btn-secondary btn-sm"
            >
              {t('databases', 'restart')}
            </button>
            <button
              type="button"
              onClick={onStop}
              disabled={actionsPending.stop}
              className="btn btn-secondary btn-sm"
            >
              {t('databases', 'stop')}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
