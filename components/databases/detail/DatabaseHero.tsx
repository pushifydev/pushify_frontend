'use client';

import Link from 'next/link';
import { Clock, Play, RotateCw, Server, Square, Table2 } from 'lucide-react';
import type { Database } from '@/lib/api';
import { DB_TYPE_LABELS } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/formatters';
import { MetaLabel, PageHeader } from '@/components/dashboard/PageKit';
import { databaseTone, type T } from './_shared';

/** The database page header: the project-detail anatomy (breadcrumb, title, status, meta, actions). */
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
    <PageHeader
      back={{ href: '/dashboard/databases', label: t('databases', 'title') }}
      title={database.name}
      badge={
        <span className={`badge badge-${tone} shrink-0`}>
          {database.status === 'provisioning' && (
            <span className="dash-status-dot is-warning animate-pulse" aria-hidden="true" />
          )}
          {t('databases', database.status as 'running')}
        </span>
      }
      meta={[
        <MetaLabel key="type">
          {DB_TYPE_LABELS[database.type] ?? database.type} {database.version}
        </MetaLabel>,
        database.server ? (
          <Link
            key="server"
            href={`/dashboard/servers/${database.server.id}`}
            className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
          >
            <Server className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {database.server.name}
          </Link>
        ) : null,
        <span key="created" className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {t('databases', 'created')} {formatTimeAgo(database.createdAt, t)}
        </span>,
      ]}
      actions={
        <>
          {database.status === 'running' && (
            <>
              <button
                type="button"
                onClick={onRestart}
                disabled={actionsPending.restart}
                className="btn btn-secondary justify-center flex-1 sm:flex-none"
              >
                <RotateCw className={`w-4 h-4 ${actionsPending.restart ? 'animate-spin' : ''}`} />
                {t('databases', 'restart')}
              </button>
              <button
                type="button"
                onClick={onStop}
                disabled={actionsPending.stop}
                className="btn btn-secondary justify-center flex-1 sm:flex-none"
              >
                <Square className="w-4 h-4" />
                {t('databases', 'stop')}
              </button>
            </>
          )}
          {database.status === 'stopped' && (
            <button
              type="button"
              onClick={onStart}
              disabled={actionsPending.start}
              className="btn btn-primary justify-center flex-1 sm:flex-none"
            >
              <Play className="w-4 h-4" />
              {t('databases', 'start')}
            </button>
          )}
          {studioHref && (
            <Link href={studioHref} className="btn btn-primary justify-center flex-1 sm:flex-none">
              <Table2 className="w-4 h-4" />
              {t('databases', 'studioOpen')}
            </Link>
          )}
        </>
      }
    />
  );
}
