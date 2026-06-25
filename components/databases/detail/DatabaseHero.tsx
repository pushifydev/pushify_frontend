'use client';

import { HardDrive } from 'lucide-react';
import type { Database } from '@/lib/api';
import { STATUS_COLORS, DATABASE_STATUS_COLORS, DB_TYPE_COLORS, DB_TYPE_LABELS } from '@/lib/constants';
import { panelStyle, type T } from './_shared';

export function DatabaseHero({
  database,
  t,
  onStart,
  onStop,
  onRestart,
  actionsPending,
}: {
  database: Database;
  t: T;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  actionsPending: { start: boolean; stop: boolean; restart: boolean };
}) {
  const accent = DATABASE_STATUS_COLORS[database.status] ?? STATUS_COLORS.neutral;
  const typeColor = DB_TYPE_COLORS[database.type] ?? STATUS_COLORS.cyan;

  return (
    <div
      className="relative px-6 py-5 mb-5 overflow-hidden"
      style={{
        ...panelStyle,
        borderWidth: '2px 1px 1px 1px',
        borderColor: `${accent}40 var(--glass-border) var(--glass-border) var(--glass-border)`,
      }}
    >
      <div
        className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${typeColor}14 0%, transparent 70%)` }}
      />
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${typeColor}18`, border: `1px solid ${typeColor}35` }}
          >
            <HardDrive className="w-5 h-5" style={{ color: typeColor }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight truncate">{database.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {DB_TYPE_LABELS[database.type] ?? database.type} {database.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: `${accent}15`, color: accent }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${database.status === 'provisioning' ? 'animate-pulse' : ''}`}
              style={{ background: accent }}
            />
            {t('databases', database.status as 'running')}
          </span>
          {database.status === 'stopped' && (
            <button
              type="button"
              onClick={onStart}
              disabled={actionsPending.start}
              className="btn btn-primary text-sm py-1.5"
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
                className="btn btn-secondary text-sm py-1.5"
              >
                {t('databases', 'restart')}
              </button>
              <button
                type="button"
                onClick={onStop}
                disabled={actionsPending.stop}
                className="btn btn-secondary text-sm py-1.5"
              >
                {t('databases', 'stop')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
