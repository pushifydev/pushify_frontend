'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import {
  useDatabase,
  useDatabaseCredentials,
  useToggleExternalAccess,
  useStartDatabase,
  useStopDatabase,
  useRestartDatabase,
  useDeleteDatabase,
  useUpdateDatabase,
  useResetDatabasePassword,
  useDatabaseBackups,
  useCreateDatabaseBackup,
  useRestoreDatabaseBackup,
  useDeleteDatabaseBackup,
  useBackupStatusEvents,
  useTranslation,
} from '@/hooks';
import { downloadDatabaseBackup, type DatabaseCredentials } from '@/lib/api';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  DatabaseHero,
  DatabaseStatsRow,
  ConnectionPanel,
  NetworkAccessPanel,
  BackupListPanel,
  DatabaseSidebar,
  NewCredentialsModal,
} from '@/components/databases/DatabaseDetailSections';

export default function DatabaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const databaseId = params.id as string;
  const { t } = useTranslation();

  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState(false);
  const [newCredentials, setNewCredentials] = useState<DatabaseCredentials | null>(null);
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
  const [deleteBackupId, setDeleteBackupId] = useState<string | null>(null);

  const { data: database, isLoading } = useDatabase(databaseId);
  const { data: credentials } = useDatabaseCredentials(databaseId);

  const toggleExternalAccess = useToggleExternalAccess(databaseId);
  const startDatabase = useStartDatabase();
  const stopDatabase = useStopDatabase();
  const restartDatabase = useRestartDatabase();
  const deleteDatabase = useDeleteDatabase();
  const updateDatabase = useUpdateDatabase(databaseId);
  const resetPassword = useResetDatabasePassword(databaseId);

  const { data: backups = [], isLoading: backupsLoading } = useDatabaseBackups(databaseId);
  const createBackup = useCreateDatabaseBackup(databaseId);
  const restoreBackup = useRestoreDatabaseBackup(databaseId);
  const deleteBackup = useDeleteDatabaseBackup(databaseId);

  useBackupStatusEvents(databaseId);

  const handleCopy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success(t('databases', 'copied'));
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[320px]">
        <div
          className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--accent-cyan) transparent var(--accent-cyan) var(--accent-cyan)' }}
        />
      </div>
    );
  }

  if (!database) {
    return (
      <div className="max-w-5xl mx-auto text-center py-16">
        <p style={{ color: 'var(--text-muted)' }}>{t('databases', 'notFound')}</p>
        <Link href="/dashboard/databases" className="btn btn-secondary mt-4 inline-flex">
          {t('common', 'back')}
        </Link>
      </div>
    );
  }

  const isRunning = database.status === 'running';

  return (
    <div className="max-w-5xl mx-auto pb-10 animate-slide-in">
      <Link
        href="/dashboard/databases"
        className="inline-flex items-center gap-2 text-sm mb-5 transition-colors hover:text-[var(--text-primary)]"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        {t('databases', 'title')}
      </Link>

      <DatabaseHero
        database={database}
        t={t}
        studioHref={
          isRunning
            ? `/dashboard/databases/${databaseId}/studio`
            : null
        }
        onStart={async () => {
          try {
            await startDatabase.mutateAsync(databaseId);
            toast.success(t('databases', 'started'));
          } catch (e) {
            toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
          }
        }}
        onStop={async () => {
          try {
            await stopDatabase.mutateAsync(databaseId);
            toast.success(t('databases', 'stopped'));
          } catch (e) {
            toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
          }
        }}
        onRestart={async () => {
          try {
            await restartDatabase.mutateAsync(databaseId);
            toast.success(t('databases', 'restarted'));
          } catch (e) {
            toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
          }
        }}
        actionsPending={{
          start: startDatabase.isPending,
          stop: stopDatabase.isPending,
          restart: restartDatabase.isPending,
        }}
      />

      {database.statusMessage && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--status-error)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {database.statusMessage}
          </p>
        </div>
      )}

      <DatabaseStatsRow database={database} t={t} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <ConnectionPanel
            database={database}
            credentials={credentials}
            showSecrets={showSecrets}
            onToggleSecrets={() => setShowSecrets((v) => !v)}
            copiedField={copiedField}
            onCopy={handleCopy}
            onResetPassword={() => setShowResetPasswordConfirm(true)}
            canResetPassword={isRunning}
            t={t}
          />

          <NetworkAccessPanel
            database={database}
            pending={toggleExternalAccess.isPending}
            onToggle={async () => {
              try {
                await toggleExternalAccess.mutateAsync(!database.externalAccess);
                toast.success(
                  database.externalAccess
                    ? t('databases', 'externalAccessDisabled')
                    : t('databases', 'externalAccessEnabled')
                );
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
              }
            }}
            t={t}
          />

          <BackupListPanel
            backups={backups}
            loading={backupsLoading}
            onCreate={async () => {
              try {
                await createBackup.mutateAsync();
                toast.success(t('databases', 'backupStarted'));
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
              }
            }}
            createPending={createBackup.isPending}
            canCreate={isRunning}
            onRestore={setRestoreBackupId}
            onDownload={async (id) => {
              try {
                await downloadDatabaseBackup(databaseId, id);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
              }
            }}
            onDelete={setDeleteBackupId}
            t={t}
          />
        </div>

        <DatabaseSidebar
          database={database}
          backupPending={updateDatabase.isPending}
          onToggleAutoBackup={async (enabled) => {
            try {
              await updateDatabase.mutateAsync({ backupEnabled: enabled });
              toast.success(t('databases', 'updated'));
            } catch (e) {
              toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
            }
          }}
          onDeleteClick={() => setShowDeleteConfirm(true)}
          t={t}
        />
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        variant="danger"
        title={t('databases', 'deleteDatabase')}
        description={t('databases', 'deleteConfirmation')}
        confirmText={t('common', 'delete')}
        cancelText={t('common', 'cancel')}
        loading={deleteDatabase.isPending}
        onConfirm={async () => {
          try {
            await deleteDatabase.mutateAsync(databaseId);
            toast.success(t('databases', 'deleted'));
            router.push('/dashboard/databases');
          } catch (e) {
            toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
          }
        }}
      />

      <ConfirmDialog
        open={showResetPasswordConfirm}
        onOpenChange={setShowResetPasswordConfirm}
        variant="warning"
        title={t('databases', 'resetPassword')}
        description={t('databases', 'resetPasswordConfirm')}
        confirmText={t('databases', 'resetPassword')}
        cancelText={t('common', 'cancel')}
        loading={resetPassword.isPending}
        onConfirm={async () => {
          try {
            const result = await resetPassword.mutateAsync();
            if (result) {
              setNewCredentials(result);
              setShowResetPasswordConfirm(false);
              toast.success(t('databases', 'passwordResetSuccess'));
            }
          } catch (e) {
            toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
          }
        }}
      />

      <ConfirmDialog
        open={!!restoreBackupId}
        onOpenChange={(open) => !open && setRestoreBackupId(null)}
        variant="warning"
        title={t('databases', 'restoreConfirmTitle')}
        description={t('databases', 'restoreConfirmMessage')}
        confirmText={t('databases', 'restore')}
        cancelText={t('common', 'cancel')}
        loading={restoreBackup.isPending}
        onConfirm={async () => {
          if (!restoreBackupId) return;
          try {
            await restoreBackup.mutateAsync(restoreBackupId);
            toast.success(t('databases', 'restoreStarted'));
            setRestoreBackupId(null);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
          }
        }}
      />

      <ConfirmDialog
        open={!!deleteBackupId}
        onOpenChange={(open) => !open && setDeleteBackupId(null)}
        variant="danger"
        title={t('common', 'delete')}
        description={t('databases', 'deleteBackupConfirm')}
        confirmText={t('common', 'delete')}
        cancelText={t('common', 'cancel')}
        loading={deleteBackup.isPending}
        onConfirm={async () => {
          if (!deleteBackupId) return;
          try {
            await deleteBackup.mutateAsync(deleteBackupId);
            toast.success(t('databases', 'backupDeleted'));
            setDeleteBackupId(null);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
          }
        }}
      />

      {newCredentials && (
        <NewCredentialsModal
          credentials={newCredentials}
          copiedField={copiedField}
          onCopy={handleCopy}
          onClose={() => setNewCredentials(null)}
          t={t}
        />
      )}
    </div>
  );
}
