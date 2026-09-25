'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import type { Database } from '@/lib/api';
import { MetaRow } from './MetaRow';
import { type T } from './_shared';

export function DatabaseSidebar({
  database,
  onToggleAutoBackup,
  onChangeBackupInterval,
  backupPending,
  onDeleteClick,
  t,
}: {
  database: Database;
  onToggleAutoBackup: (enabled: boolean) => void;
  onChangeBackupInterval: (hours: number) => void;
  backupPending: boolean;
  onDeleteClick: () => void;
  t: T;
}) {
  return (
    <aside className="space-y-4 min-w-0">
      <div className="dash-panel py-4!">
        <h2 className="dash-section-label mb-2">{t('databases', 'detailsTitle')}</h2>
        <MetaRow label={t('databases', 'created')} value={new Date(database.createdAt).toLocaleDateString()} />
        {database.server && (
          <MetaRow
            label={t('databases', 'server')}
            value={
              <Link
                href={`/dashboard/servers/${database.server.id}`}
                className="underline-offset-4 hover:underline focus-visible:underline"
                style={{ color: 'var(--text-primary)' }}
              >
                {database.server.name}
              </Link>
            }
          />
        )}
      </div>

      <div className="dash-panel py-4!">
        <h2 className="dash-section-label mb-3">{t('databases', 'backups')}</h2>
        <div className="flex items-center justify-between gap-3">
          <span id="db-auto-backup-label" className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {t('databases', 'autoBackup')}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={!!database.backupEnabled}
            aria-labelledby="db-auto-backup-label"
            onClick={() => onToggleAutoBackup(!database.backupEnabled)}
            disabled={backupPending}
            className="dash-switch"
          >
            <span className="dash-switch-thumb" />
          </button>
        </div>
        {database.backupEnabled && (
          <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="db-backup-interval" className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {t('databases', 'backupEvery')}
              </label>
              <select
                id="db-backup-interval"
                value={String(database.backupIntervalHours ?? 24)}
                onChange={(e) => onChangeBackupInterval(Number(e.target.value))}
                disabled={backupPending}
                className="select w-32! py-1.5! text-[13px]!"
              >
                {[1, 6, 12, 24, 48, 168].map((hours) => (
                  <option key={hours} value={hours}>
                    {t('databases', `interval_${hours}` as 'interval_24')}
                  </option>
                ))}
              </select>
            </div>
            {/* The interval is the worst-case data loss — say that, not just the number */}
            <p className="dash-caption text-xs! leading-relaxed">
              {t('databases', 'worstCaseLoss').replace(
                '{loss}',
                t('databases', `loss_${database.backupIntervalHours ?? 24}` as 'loss_24')
              )}
            </p>
            <p className="dash-caption text-xs! leading-relaxed">
              {t('databases', 'retentionDays').replace('{days}', String(database.backupRetentionDays || 7))}
            </p>
          </div>
        )}
      </div>

      <div
        className="dash-panel py-4!"
        style={{ borderColor: 'color-mix(in srgb, var(--status-error) 35%, var(--border-subtle))' }}
      >
        <h2 className="dash-section-label mb-2" style={{ color: 'var(--status-error)' }}>
          {t('databases', 'dangerZone')}
        </h2>
        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t('databases', 'deleteConfirmation')}
        </p>
        <button type="button" onClick={onDeleteClick} className="btn btn-secondary btn-sm w-full">
          <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-error)' }} />
          {t('databases', 'deleteDatabase')}
        </button>
      </div>
    </aside>
  );
}
