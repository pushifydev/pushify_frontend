'use client';

import { Download, ArchiveRestore, Trash2 } from 'lucide-react';
import type { DatabaseBackup } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { panelStyle, type T } from './_shared';

export function BackupListPanel({
  backups,
  loading,
  onCreate,
  createPending,
  canCreate,
  onRestore,
  onDownload,
  onDelete,
  t,
}: {
  backups: DatabaseBackup[];
  loading: boolean;
  onCreate: () => void;
  createPending: boolean;
  canCreate: boolean;
  onRestore: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  t: T;
}) {
  const statusColor = (status: string) => {
    if (status === 'completed') return STATUS_COLORS.success;
    if (status === 'failed') return STATUS_COLORS.error;
    if (status === 'creating' || status === 'restoring') return STATUS_COLORS.warning;
    return STATUS_COLORS.neutral;
  };

  return (
    <section className="rounded-xl p-5" style={panelStyle}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold">{t('databases', 'backupHistory')}</h2>
        <button
          type="button"
          onClick={onCreate}
          disabled={createPending || !canCreate}
          className="btn btn-primary text-sm py-1.5"
        >
          {createPending ? '…' : t('databases', 'createBackup')}
        </button>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-cyan) transparent var(--accent-cyan) var(--accent-cyan)' }} />
        </div>
      ) : backups.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium">{t('databases', 'noBackups')}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('databases', 'noBackupsDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {new Date(backup.startedAt).toLocaleString()}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {t('databases', backup.type as 'automatic')} ·{' '}
                  {backup.sizeMb ? `${backup.sizeMb} MB` : '—'}
                </p>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full shrink-0 capitalize"
                style={{
                  background: `${statusColor(backup.status)}18`,
                  color: statusColor(backup.status),
                }}
              >
                {t('databases', `backup_${backup.status}` as 'backup_completed')}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                {backup.status === 'completed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onRestore(backup.id)}
                      className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--hover-overlay)]"
                      title={t('databases', 'restore')}
                    >
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownload(backup.id)}
                      className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--hover-overlay)]"
                      title={t('databases', 'download')}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                {(backup.status === 'completed' || backup.status === 'failed') && (
                  <button
                    type="button"
                    onClick={() => onDelete(backup.id)}
                    className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--status-error)]/10"
                    style={{ color: 'var(--text-muted)' }}
                    title={t('common', 'delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
