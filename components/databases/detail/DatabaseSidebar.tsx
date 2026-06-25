'use client';

import Link from 'next/link';
import { Trash2, Server, Clock } from 'lucide-react';
import type { Database } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { MetaRow } from './MetaRow';
import { panelStyle, type T } from './_shared';

export function DatabaseSidebar({
  database,
  onToggleAutoBackup,
  backupPending,
  onDeleteClick,
  t,
}: {
  database: Database;
  onToggleAutoBackup: (enabled: boolean) => void;
  backupPending: boolean;
  onDeleteClick: () => void;
  t: T;
}) {
  return (
    <aside className="space-y-4">
      <div className="rounded-xl p-5 space-y-3" style={panelStyle}>
        <h2 className="text-sm font-semibold">{t('databases', 'info')}</h2>
        <MetaRow icon={Clock} label={t('databases', 'created')} value={new Date(database.createdAt).toLocaleDateString()} />
        {database.server && (
          <MetaRow
            icon={Server}
            label={t('databases', 'server')}
            value={
              <Link href={`/dashboard/servers/${database.server.id}`} className="text-sm hover:underline" style={{ color: 'var(--accent-cyan)' }}>
                {database.server.name}
              </Link>
            }
          />
        )}
      </div>

      <div className="rounded-xl p-5 space-y-4" style={panelStyle}>
        <h2 className="text-sm font-semibold">{t('databases', 'backups')}</h2>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('databases', 'autoBackup')}
          </span>
          <button
            type="button"
            onClick={() => onToggleAutoBackup(!database.backupEnabled)}
            disabled={backupPending}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
              database.backupEnabled ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--bg-tertiary)]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 mt-1 rounded-full bg-white transition-transform ${
                database.backupEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {database.backupEnabled && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('databases', 'retentionDays').replace('{days}', String(database.backupRetentionDays || 7))}
          </p>
        )}
      </div>

      <div
        className="rounded-xl p-5"
        style={{ ...panelStyle, borderColor: `${STATUS_COLORS.error}30` }}
      >
        <h2 className="text-sm font-semibold mb-3" style={{ color: STATUS_COLORS.error }}>
          {t('databases', 'dangerZone')}
        </h2>
        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t('databases', 'deleteConfirmation')}
        </p>
        <button type="button" onClick={onDeleteClick} className="btn btn-secondary w-full text-sm">
          <Trash2 className="w-4 h-4" style={{ color: STATUS_COLORS.error }} />
          {t('databases', 'deleteDatabase')}
        </button>
      </div>
    </aside>
  );
}
