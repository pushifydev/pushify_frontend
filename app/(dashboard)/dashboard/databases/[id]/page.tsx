'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
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
  useVerifyDatabaseBackup,
  useDeleteDatabaseBackup,
  useBackupStatusEvents,
  useConnectDatabase,
  useDisconnectDatabase,
  useProjects,
  useTranslation,
} from '@/hooks';
import { createDeployment, downloadDatabaseBackup, type DatabaseCredentials } from '@/lib/api';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import {
  DatabaseHero,
  DatabaseStatsRow,
  ConnectionPanel,
  NetworkAccessPanel,
  ConnectedProjectsPanel,
  BackupListPanel,
  DatabaseSidebar,
  DatabaseSettingsPanel,
  NewCredentialsModal,
} from '@/components/databases/DatabaseDetailSections';
import { Tabs, TabPanel } from '@/components/dashboard/PageKit';

type Tab = 'overview' | 'projects' | 'backups' | 'settings';
const VALID_TABS: Tab[] = ['overview', 'projects', 'backups', 'settings'];

export default function DatabaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const databaseId = params.id as string;
  const { t } = useTranslation();

  const tabParam = searchParams.get('tab') as Tab | null;
  const activeTab: Tab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'overview';
  const setActiveTab = useCallback(
    (tab: Tab) => {
      const next = new URLSearchParams(searchParams.toString());
      if (tab === 'overview') next.delete('tab');
      else next.set('tab', tab);
      const qs = next.toString();
      router.push(`/dashboard/databases/${databaseId}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, databaseId, searchParams]
  );

  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState(false);
  const [newCredentials, setNewCredentials] = useState<DatabaseCredentials | null>(null);
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
  const [deleteBackupId, setDeleteBackupId] = useState<string | null>(null);
  const [redeployPending, setRedeployPending] = useState(false);

  const { data: database, isLoading } = useDatabase(databaseId);
  const { data: credentials } = useDatabaseCredentials(databaseId);

  const toggleExternalAccess = useToggleExternalAccess(databaseId);
  const startDatabase = useStartDatabase();
  const stopDatabase = useStopDatabase();
  const restartDatabase = useRestartDatabase();
  const deleteDatabase = useDeleteDatabase();
  const updateDatabase = useUpdateDatabase(databaseId);
  const resetPassword = useResetDatabasePassword(databaseId);
  const { data: projects = [] } = useProjects();
  const connectDatabase = useConnectDatabase(databaseId);
  const disconnectDatabase = useDisconnectDatabase();

  const { data: backups = [], isLoading: backupsLoading } = useDatabaseBackups(databaseId);
  const createBackup = useCreateDatabaseBackup(databaseId);
  const restoreBackup = useRestoreDatabaseBackup(databaseId);
  const verifyBackup = useVerifyDatabaseBackup(databaseId);
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
      <div className="dash-page max-w-7xl" role="status" aria-live="polite" aria-label={t('common', 'loading')}>
        <div className="space-y-6">
          <div className="dash-skeleton h-4 w-40 rounded" />
          <div className="dash-skeleton h-9 w-64 rounded" />
          <div className="h-10 border-b border-[var(--border-subtle)]" />
          <div className="dash-skeleton h-64 rounded-[14px]" />
        </div>
      </div>
    );
  }

  if (!database) {
    return (
      <div className="dash-page max-w-7xl">
        <EmptyState
          label={t('databases', 'title')}
          title={t('databases', 'notFound')}
          action={{ label: t('common', 'back'), href: '/dashboard/databases' }}
        />
      </div>
    );
  }

  const isRunning = database.status === 'running';

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in overflow-x-clip">

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
          className="dash-callout"
          role="alert"
          style={{
            borderColor: 'color-mix(in srgb, var(--status-error) 30%, var(--border-subtle))',
            background: 'color-mix(in srgb, var(--status-error) 6%, var(--bg-secondary))',
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--status-error)' }} aria-hidden="true" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {database.statusMessage}
          </p>
        </div>
      )}

      <Tabs
        label={database.name}
        idPrefix="database-tab"
        active={activeTab}
        onChange={setActiveTab}
        items={[
          { id: 'overview', label: t('projectDetail', 'overview') },
          { id: 'projects', label: t('databases', 'connectedProjects'), count: database.connections?.length ?? 0 },
          { id: 'backups', label: t('databases', 'backups'), count: backups.length },
          { id: 'settings', label: t('projectDetail', 'settings') },
        ]}
      />

      <TabPanel idPrefix="database-tab" active={activeTab}>
        {activeTab === 'overview' && (
          <div className="space-y-6 min-w-0">
            <DatabaseStatsRow database={database} t={t} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
              <div className="lg:col-span-2 space-y-5 min-w-0">
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
              </div>
              <DatabaseSidebar database={database} t={t} />
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <ConnectedProjectsPanel
            database={database}
            projects={projects}
            pending={connectDatabase.isPending || disconnectDatabase.isPending}
            canEdit={database.status !== 'deleting'}
            onConnect={async (projectId, envVarName, permissions) => {
              try {
                await connectDatabase.mutateAsync({ projectId, envVarName, permissions });
                toast.success(t('databases', 'projectConnected'));
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
              }
            }}
            onDisconnect={async (connectionId) => {
              try {
                await disconnectDatabase.mutateAsync(connectionId);
                toast.success(t('databases', 'projectDisconnected'));
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
              }
            }}
            t={t}
          />
        )}

        {activeTab === 'backups' && (
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
            onVerify={async (id) => {
              try {
                await verifyBackup.mutateAsync(id);
                toast.success(t('databases', 'backupVerifyStarted'));
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
              }
            }}
            onDownload={async (id) => {
              try {
                await downloadDatabaseBackup(databaseId, id, backups.find((b) => b.id === id)?.name);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
              }
            }}
            onDelete={setDeleteBackupId}
            t={t}
          />
        )}

        {activeTab === 'settings' && (
          <DatabaseSettingsPanel
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
            onChangeBackupInterval={async (hours) => {
              try {
                await updateDatabase.mutateAsync({ backupIntervalHours: hours });
                toast.success(t('databases', 'updated'));
              } catch (e) {
                // The plan floor is refused here, with a message saying what to upgrade to
                toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
              }
            }}
            onDeleteClick={() => setShowDeleteConfirm(true)}
            t={t}
          />
        )}
      </TabPanel>

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
          staleProjects={(database.connections ?? [])
            .filter((c) => c.permissions !== 'readonly' && c.project)
            .map((c) => ({ id: c.project!.id, name: c.project!.name }))}
          redeployPending={redeployPending}
          onRedeploy={async () => {
            setRedeployPending(true);
            try {
              const projectIds = (database.connections ?? [])
                .filter((c) => c.permissions !== 'readonly')
                .map((c) => c.projectId);
              const results = await Promise.all(projectIds.map((id) => createDeployment(id)));
              const failed = results.find((r) => r.error);
              if (failed?.error) throw new Error(failed.error.message);
              toast.success(t('databases', 'redeployStarted'));
              setNewCredentials(null);
            } catch (e) {
              toast.error(e instanceof Error ? e.message : t('errors', 'unknownError'));
            } finally {
              setRedeployPending(false);
            }
          }}
          t={t}
        />
      )}
    </div>
  );
}
