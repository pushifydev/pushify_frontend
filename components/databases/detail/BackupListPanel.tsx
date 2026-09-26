'use client';

import { Download, ArchiveRestore, Trash2, ShieldCheck, ShieldAlert, ShieldQuestion, Loader2 } from 'lucide-react';
import type { DatabaseBackup, BackupVerification } from '@/lib/api';
import { formatMessage } from '@/lib/i18n/format-message';
import { backupTone, iconButtonClass, type Tone, type T } from './_shared';

function verificationTone(status: BackupVerification['status']): Tone {
  if (status === 'verified') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'verifying') return 'warning';
  return 'neutral';
}

function VerificationBadge({ v, t }: { v: BackupVerification; t: T }) {
  const tone = verificationTone(v.status);
  const label =
    v.status === 'verified'
      ? t('databases', 'backupVerified')
      : v.status === 'failed'
        ? t('databases', 'backupVerifyFailed')
        : v.status === 'verifying'
          ? t('databases', 'backupVerifying')
          : t('databases', 'backupVerifySkipped');
  const detail =
    v.status === 'verified' && v.tables !== undefined
      ? `${v.tables} · ${v.rows ?? 0} ${v.unit ?? 'rows'}`
      : v.error;

  return (
    <span className={`badge badge-${tone} shrink-0`} title={detail ? `${label} — ${detail}` : label}>
      {v.status === 'verifying' && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
      {label}
    </span>
  );
}

export function BackupListPanel({
  backups,
  loading,
  onCreate,
  createPending,
  canCreate,
  onRestore,
  onDownload,
  onDelete,
  onVerify,
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
  onVerify?: (id: string) => void;
  t: T;
}) {
  // The trust line: has the newest completed backup actually been restored somewhere?
  const latest = backups.find((b) => b.status === 'completed');
  const latestVerification = latest?.metadata?.verification;

  return (
    <section className="min-w-0 space-y-3" aria-labelledby="db-backups-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="db-backups-title" className="dash-section-label">{t('databases', 'backupHistory')}</h2>
        <button
          type="button"
          onClick={onCreate}
          disabled={createPending || !canCreate}
          className="btn btn-primary btn-sm"
        >
          {createPending ? '…' : t('databases', 'createBackup')}
        </button>
      </div>

      {!loading && backups.length > 0 && (
        <div
          className="dash-callout text-xs"
          style={{ color: 'var(--text-secondary)' }}
          title={t('databases', 'backupVerifyHint')}
          role="note"
        >
          {latestVerification?.status === 'verified' ? (
            <ShieldCheck className="w-3.5 h-3.5 mt-px shrink-0" style={{ color: 'var(--status-success)' }} aria-hidden="true" />
          ) : latestVerification?.status === 'failed' ? (
            <ShieldAlert className="w-3.5 h-3.5 mt-px shrink-0" style={{ color: 'var(--status-error)' }} aria-hidden="true" />
          ) : (
            <ShieldQuestion className="w-3.5 h-3.5 mt-px shrink-0" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
          )}
          <span className="min-w-0 leading-relaxed">
            {latestVerification?.status === 'verified'
              ? formatMessage(t('databases', 'backupVerifiedSummary'), {
                  date: new Date(latestVerification.checkedAt).toLocaleDateString(),
                  tables: String(latestVerification.tables ?? 0),
                  rows: String(latestVerification.rows ?? 0),
                  unit: latestVerification.unit ?? 'rows',
                })
              : latestVerification?.status === 'failed'
                ? `${t('databases', 'backupVerifyFailed')}${latestVerification.error ? ` — ${latestVerification.error}` : ''}`
                : t('databases', 'backupNeverVerified')}
          </span>
        </div>
      )}

      <div className="dash-rows">
      {loading ? (
        <div className="dash-row py-10! flex justify-center" role="status" aria-live="polite">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
        </div>
      ) : backups.length === 0 ? (
        <div className="dash-row py-10! text-center">
          <p className="text-sm font-medium">{t('databases', 'noBackups')}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('databases', 'noBackupsDesc')}
          </p>
        </div>
      ) : (
        backups.map((backup) => {
          const verification = backup.metadata?.verification;
          const tone = backupTone(backup.status);
          return (
            <div key={backup.id} className="dash-row flex items-center gap-3">
              <span className={`dash-status-dot ${tone === 'neutral' ? '' : `is-${tone}`}`} aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {new Date(backup.startedAt).toLocaleString()}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="dash-mono-caption">
                    {t('databases', backup.type as 'automatic')} · {backup.sizeMb ? `${backup.sizeMb} MB` : '—'}
                  </span>
                  {backup.status === 'completed' && verification && <VerificationBadge v={verification} t={t} />}
                  {/* 'skipped' means the platform keeps no off-site copies at all — a warning
                      nobody reading this can act on, so it is not shown. */}
                  {backup.status === 'completed' &&
                    (backup.offsiteStatus === 'uploaded' || backup.offsiteStatus === 'failed') && (
                      <span
                        className={`badge ${backup.offsiteCopy ? 'badge-neutral' : 'badge-warning'}`}
                        title={
                          backup.offsiteCopy ? t('databases', 'offsiteCopyHint') : t('databases', 'offsiteFailedHint')
                        }
                      >
                        {backup.offsiteCopy ? t('databases', 'offsiteCopy') : t('databases', 'offsiteFailed')}
                      </span>
                    )}
                </div>
              </div>
              <span className={`badge badge-${tone} shrink-0`}>
                {t('databases', `backup_${backup.status}` as 'backup_completed')}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                {backup.status === 'completed' && (
                  <>
                    {onVerify && (
                      <button
                        type="button"
                        onClick={() => onVerify(backup.id)}
                        disabled={verification?.status === 'verifying'}
                        className={iconButtonClass}
                        title={t('databases', 'backupVerify')}
                        aria-label={t('databases', 'backupVerify')}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRestore(backup.id)}
                      className={iconButtonClass}
                      title={t('databases', 'restore')}
                      aria-label={t('databases', 'restore')}
                    >
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownload(backup.id)}
                      className={iconButtonClass}
                      title={t('databases', 'download')}
                      aria-label={t('databases', 'download')}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                {(backup.status === 'completed' || backup.status === 'failed') && (
                  <button
                    type="button"
                    onClick={() => onDelete(backup.id)}
                    className={`${iconButtonClass} hover:text-(--status-error)!`}
                    title={t('common', 'delete')}
                    aria-label={t('common', 'delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
      </div>
    </section>
  );
}
