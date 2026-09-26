'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import type { Database } from '@/lib/api';
import { DB_TYPE_LABELS } from '@/lib/constants';
import { SettingsField, SettingsSection, SettingsSwitch } from '@/components/dashboard/SettingsParts';
import { MetaRow } from './MetaRow';
import { type T } from './_shared';

/** Overview side column: quiet key/value facts, as the project info card. */
export function DatabaseSidebar({ database, t }: { database: Database; t: T }) {
  return (
    <aside className="space-y-3 min-w-0">
      <h2 className="dash-section-label">{t('databases', 'detailsTitle')}</h2>
      <div className="dash-card px-4 py-1.5">
        <MetaRow label={t('databases', 'type')} value={`${DB_TYPE_LABELS[database.type] ?? database.type} ${database.version}`} />
        <MetaRow label={t('databases', 'databaseName')} value={database.databaseName} />
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
    </aside>
  );
}

/** Settings tab: automatic backups + danger zone, in the project settings form language. */
export function DatabaseSettingsPanel({
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
  const interval = database.backupIntervalHours ?? 24;
  return (
    <div className="dash-settings-stack max-w-4xl">
      <SettingsSection
        id="db-settings-backups"
        title={t('databases', 'backups')}
        description={t('databases', 'retentionDays').replace('{days}', String(database.backupRetentionDays || 7))}
      >
        <SettingsField label={t('databases', 'autoBackup')}>
          <div className="md:pt-2">
            <SettingsSwitch
              checked={!!database.backupEnabled}
              onChange={onToggleAutoBackup}
              disabled={backupPending}
              label={t('databases', 'autoBackup')}
            />
          </div>
        </SettingsField>
        {database.backupEnabled && (
          <SettingsField
            label={t('databases', 'backupEvery')}
            htmlFor="db-backup-interval"
            // The interval is the worst-case data loss — say that, not just the number
            hint={t('databases', 'worstCaseLoss').replace(
              '{loss}',
              t('databases', `loss_${interval}` as 'loss_24')
            )}
          >
            <select
              id="db-backup-interval"
              value={String(interval)}
              onChange={(e) => onChangeBackupInterval(Number(e.target.value))}
              disabled={backupPending}
              className="select w-44!"
            >
              {[1, 6, 12, 24, 48, 168].map((hours) => (
                <option key={hours} value={hours}>
                  {t('databases', `interval_${hours}` as 'interval_24')}
                </option>
              ))}
            </select>
          </SettingsField>
        )}
      </SettingsSection>

      <SettingsSection
        id="db-settings-danger"
        danger
        title={t('databases', 'dangerZone')}
        description={t('databases', 'deleteConfirmation')}
        action={
          <button type="button" onClick={onDeleteClick} className="btn btn-danger btn-sm">
            <Trash2 className="w-4 h-4" />
            {t('databases', 'deleteDatabase')}
          </button>
        }
      />
    </div>
  );
}
