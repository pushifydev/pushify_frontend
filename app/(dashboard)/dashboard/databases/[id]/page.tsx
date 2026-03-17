'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Database,
  Server,
  Copy,
  Check,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Settings,
  Shield,
  HardDrive,
  Clock,
  AlertCircle,
  KeyRound,
  X,
  Download,
  Plus,
  ArchiveRestore,
  History,
} from 'lucide-react';
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

const DATABASE_ICONS: Record<string, string> = {
  postgresql: '🐘',
  mysql: '🐬',
  redis: '🔴',
  mongodb: '🍃',
};

const STATUS_COLORS: Record<string, string> = {
  running: 'badge-success',
  stopped: 'badge-warning',
  provisioning: 'badge-info',
  error: 'badge-error',
  deleting: 'badge-warning',
};

export default function DatabaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const databaseId = params.id as string;
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
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

  const { data: backups, isLoading: backupsLoading } = useDatabaseBackups(databaseId);
  const createBackup = useCreateDatabaseBackup(databaseId);
  const restoreBackup = useRestoreDatabaseBackup(databaseId);
  const deleteBackup = useDeleteDatabaseBackup(databaseId);

  // Real-time backup status events
  useBackupStatusEvents(databaseId);

  const handleCopy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success(t('databases', 'copied'));
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleExternalAccess = async () => {
    if (!database) return;
    try {
      await toggleExternalAccess.mutateAsync(!database.externalAccess);
      toast.success(
        database.externalAccess
          ? t('databases', 'externalAccessDisabled')
          : t('databases', 'externalAccessEnabled')
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  const handleStart = async () => {
    try {
      await startDatabase.mutateAsync(databaseId);
      toast.success(t('databases', 'started'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  const handleStop = async () => {
    try {
      await stopDatabase.mutateAsync(databaseId);
      toast.success(t('databases', 'stopped'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  const handleRestart = async () => {
    try {
      await restartDatabase.mutateAsync(databaseId);
      toast.success(t('databases', 'restarted'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDatabase.mutateAsync(databaseId);
      toast.success(t('databases', 'deleted'));
      router.push('/dashboard/databases');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  const handleUpdateBackup = async (enabled: boolean) => {
    try {
      await updateDatabase.mutateAsync({ backupEnabled: enabled });
      toast.success(t('databases', 'updated'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  const handleCreateBackup = async () => {
    try {
      await createBackup.mutateAsync();
      toast.success(t('databases', 'backupStarted'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreBackupId) return;
    try {
      await restoreBackup.mutateAsync(restoreBackupId);
      toast.success(t('databases', 'restoreStarted'));
      setRestoreBackupId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  const handleDeleteBackup = async () => {
    if (!deleteBackupId) return;
    try {
      await deleteBackup.mutateAsync(deleteBackupId);
      toast.success(t('databases', 'backupDeleted'));
      setDeleteBackupId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  const handleDownloadBackup = async (backupId: string) => {
    try {
      await downloadDatabaseBackup(databaseId, backupId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  const handleResetPassword = async () => {
    try {
      const result = await resetPassword.mutateAsync();
      if (result) {
        setNewCredentials(result);
        setShowResetPasswordConfirm(false);
        toast.success(t('databases', 'passwordResetSuccess'));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors', 'unknownError'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading" />
      </div>
    );
  }

  if (!database) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">{t('databases', 'notFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/databases"
            className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{DATABASE_ICONS[database.type]}</span>
            <div>
              <h1 className="text-2xl font-bold">{database.name}</h1>
              <p className="text-sm text-[var(--text-muted)]">
                {database.type.toUpperCase()} {database.version}
              </p>
            </div>
          </div>
          <span className={`badge ${STATUS_COLORS[database.status]}`}>
            {t('databases', database.status as any)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {database.status === 'stopped' && (
            <button
              onClick={handleStart}
              disabled={startDatabase.isPending}
              className="btn btn-secondary"
            >
              <Play className="w-4 h-4" />
              {t('databases', 'start')}
            </button>
          )}
          {database.status === 'running' && (
            <>
              <button
                onClick={handleRestart}
                disabled={restartDatabase.isPending}
                className="btn btn-secondary"
              >
                <RotateCcw className="w-4 h-4" />
                {t('databases', 'restart')}
              </button>
              <button
                onClick={handleStop}
                disabled={stopDatabase.isPending}
                className="btn btn-secondary"
              >
                <Square className="w-4 h-4" />
                {t('databases', 'stop')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Message */}
      {database.statusMessage && (
        <div className="p-4 rounded-lg bg-[var(--status-error)]/10 border border-[var(--status-error)]/20">
          <div className="flex items-center gap-2 text-[var(--status-error)]">
            <AlertCircle className="w-5 h-5" />
            <span>{database.statusMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <Database className="w-5 h-5" />
                {t('databases', 'connectionDetails')}
              </h2>
            </div>
            <div className="card-body space-y-4">
              {/* Connection String */}
              {credentials?.connectionString && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    {t('databases', 'connectionString')}
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-[var(--bg-tertiary)] rounded-lg text-sm font-mono break-all">
                      {showPassword
                        ? credentials.connectionString
                        : credentials.connectionString.replace(/:[^:@]+@/, ':••••••••@')}
                    </code>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopy(credentials.connectionString!, 'connectionString')}
                      className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                    >
                      {copiedField === 'connectionString' ? (
                        <Check className="w-5 h-5 text-[var(--status-success)]" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Individual Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    {t('databases', 'host')}
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-[var(--bg-tertiary)] rounded text-sm font-mono">
                      {credentials?.host || database.host}
                    </code>
                    <button
                      onClick={() => handleCopy(credentials?.host || database.host || '', 'host')}
                      className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                    >
                      {copiedField === 'host' ? (
                        <Check className="w-4 h-4 text-[var(--status-success)]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    {t('databases', 'port')}
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-[var(--bg-tertiary)] rounded text-sm font-mono">
                      {credentials?.port || database.port}
                    </code>
                    <button
                      onClick={() => handleCopy(String(credentials?.port || database.port), 'port')}
                      className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                    >
                      {copiedField === 'port' ? (
                        <Check className="w-4 h-4 text-[var(--status-success)]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    {t('databases', 'databaseName')}
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-[var(--bg-tertiary)] rounded text-sm font-mono">
                      {credentials?.databaseName || database.databaseName}
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(credentials?.databaseName || database.databaseName, 'dbName')
                      }
                      className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                    >
                      {copiedField === 'dbName' ? (
                        <Check className="w-4 h-4 text-[var(--status-success)]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    {t('databases', 'username')}
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-[var(--bg-tertiary)] rounded text-sm font-mono">
                      {credentials?.username || database.username}
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(credentials?.username || database.username, 'username')
                      }
                      className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                    >
                      {copiedField === 'username' ? (
                        <Check className="w-4 h-4 text-[var(--status-success)]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  {t('databases', 'password')}
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-[var(--bg-tertiary)] rounded text-sm font-mono">
                    {showPassword ? credentials?.password : '••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {credentials?.password && (
                    <button
                      onClick={() => handleCopy(credentials.password, 'password')}
                      className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                    >
                      {copiedField === 'password' ? (
                        <Check className="w-4 h-4 text-[var(--status-success)]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setShowResetPasswordConfirm(true)}
                    disabled={database.status !== 'running'}
                    className="btn btn-secondary btn-sm"
                    title={t('databases', 'resetPassword')}
                  >
                    <KeyRound className="w-4 h-4" />
                    {t('databases', 'resetPassword')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* External Access */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('databases', 'networkAccess')}
              </h2>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="flex items-center gap-3">
                  {database.externalAccess ? (
                    <Globe className="w-6 h-6 text-[var(--status-warning)]" />
                  ) : (
                    <Lock className="w-6 h-6 text-[var(--status-success)]" />
                  )}
                  <div>
                    <p className="font-medium">
                      {database.externalAccess
                        ? t('databases', 'externalAccessOn')
                        : t('databases', 'externalAccessOff')}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {database.externalAccess
                        ? t('databases', 'externalAccessOnDesc')
                        : t('databases', 'externalAccessOffDesc')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleExternalAccess}
                  disabled={
                    toggleExternalAccess.isPending || database.status !== 'running'
                  }
                  className={`btn ${database.externalAccess ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {toggleExternalAccess.isPending ? (
                    <span className="loading loading-sm" />
                  ) : database.externalAccess ? (
                    t('databases', 'disable')
                  ) : (
                    t('databases', 'enable')
                  )}
                </button>
              </div>
              {database.externalAccess && (
                <div className="mt-4 p-3 bg-[var(--status-warning)]/10 border border-[var(--status-warning)]/20 rounded-lg">
                  <p className="text-sm text-[var(--status-warning)] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {t('databases', 'externalAccessWarning')}
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Backup History */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="card-title flex items-center gap-2">
                <History className="w-5 h-5" />
                {t('databases', 'backupHistory')}
              </h2>
              <button
                onClick={handleCreateBackup}
                disabled={createBackup.isPending || database.status !== 'running'}
                className="btn btn-primary btn-sm"
              >
                {createBackup.isPending ? (
                  <span className="loading loading-sm" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {t('databases', 'createBackup')}
                  </>
                )}
              </button>
            </div>
            <div className="card-body">
              {backupsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loading" />
                </div>
              ) : !backups || backups.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">{t('databases', 'noBackups')}</p>
                  <p className="text-sm mt-1">{t('databases', 'noBackupsDesc')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-primary)]">
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">
                          {t('databases', 'backupDate')}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">
                          {t('databases', 'backupType')}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">
                          {t('databases', 'backupStatus')}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">
                          {t('databases', 'backupSize')}
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--text-muted)]">
                          {t('databases', 'actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => (
                        <tr
                          key={backup.id}
                          className="border-b border-[var(--border-primary)] last:border-0"
                        >
                          <td className="py-3 px-4 text-sm">
                            {new Date(backup.startedAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`badge ${
                                backup.type === 'automatic' ? 'badge-info' : 'badge-default'
                              }`}
                            >
                              {t('databases', backup.type as any)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`badge ${
                                backup.status === 'completed'
                                  ? 'badge-success'
                                  : backup.status === 'failed'
                                  ? 'badge-error'
                                  : backup.status === 'creating' || backup.status === 'restoring'
                                  ? 'badge-warning'
                                  : backup.status === 'restored'
                                  ? 'badge-info'
                                  : 'badge-default'
                              }`}
                            >
                              {t('databases', `backup_${backup.status}` as any)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-[var(--text-muted)]">
                            {backup.sizeMb ? `${backup.sizeMb} MB` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              {backup.status === 'completed' && (
                                <>
                                  <button
                                    onClick={() => setRestoreBackupId(backup.id)}
                                    className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                                    title={t('databases', 'restore')}
                                  >
                                    <ArchiveRestore className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadBackup(backup.id)}
                                    className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                                    title={t('databases', 'download')}
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {(backup.status === 'completed' || backup.status === 'failed') && (
                                <button
                                  onClick={() => setDeleteBackupId(backup.id)}
                                  className="p-1.5 hover:bg-[var(--status-error)]/10 rounded transition-colors text-[var(--text-muted)] hover:text-[var(--status-error)]"
                                  title={t('common', 'delete')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              {(backup.status === 'creating' || backup.status === 'restoring') && (
                                <span className="loading loading-sm" />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('databases', 'info')}
              </h2>
            </div>
            <div className="card-body space-y-4">
              {database.server && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    {t('databases', 'server')}
                  </span>
                  <Link
                    href={`/dashboard/servers/${database.server.id}`}
                    className="text-[var(--accent-cyan)] hover:underline"
                  >
                    {database.server.name}
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  {t('databases', 'storage')}
                </span>
                <span>
                  {database.usedStorageMb || 0} / {database.storageMb || 1024} MB
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('databases', 'created')}
                </span>
                <span>{new Date(database.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Backup Settings */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t('databases', 'backups')}
              </h2>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <span>{t('databases', 'autoBackup')}</span>
                <button
                  onClick={() => handleUpdateBackup(!database.backupEnabled)}
                  disabled={updateDatabase.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    database.backupEnabled ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--bg-elevated)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      database.backupEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {database.backupEnabled && (
                <div className="text-sm text-[var(--text-muted)]">
                  {t('databases', 'retentionDays').replace('{days}', String(database.backupRetentionDays || 7))}
                </div>
              )}

              {database.lastBackupAt && (
                <div className="text-sm text-[var(--text-muted)]">
                  {t('databases', 'lastBackup')}:{' '}
                  {new Date(database.lastBackupAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-[var(--status-error)]/20">
            <div className="card-header">
              <h2 className="card-title text-[var(--status-error)]">{t('databases', 'dangerZone')}</h2>
            </div>
            <div className="card-body">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-secondary w-full text-[var(--status-error)] hover:bg-[var(--status-error)]/10"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('databases', 'deleteDatabase')}
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-muted)]">
                    {t('databases', 'deleteConfirmation')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn btn-secondary flex-1"
                    >
                      {t('common', 'cancel')}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteDatabase.isPending}
                      className="btn bg-[var(--status-error)] text-white hover:bg-[var(--status-error)]/90 flex-1"
                    >
                      {deleteDatabase.isPending ? (
                        <span className="loading loading-sm" />
                      ) : (
                        t('common', 'delete')
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Confirmation Modal */}
      {showResetPasswordConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-lg p-6 max-w-md w-full mx-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                {t('databases', 'resetPassword')}
              </h3>
              <button
                onClick={() => setShowResetPasswordConfirm(false)}
                className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[var(--text-muted)] mb-6">
              {t('databases', 'resetPasswordConfirm')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetPasswordConfirm(false)}
                className="btn btn-secondary flex-1"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetPassword.isPending}
                className="btn btn-primary flex-1"
              >
                {resetPassword.isPending ? (
                  <>
                    <span className="loading loading-sm" />
                    {t('databases', 'resettingPassword')}
                  </>
                ) : (
                  t('databases', 'resetPassword')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Confirmation Modal */}
      {restoreBackupId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-lg p-6 max-w-md w-full mx-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ArchiveRestore className="w-5 h-5" />
                {t('databases', 'restoreConfirmTitle')}
              </h3>
              <button
                onClick={() => setRestoreBackupId(null)}
                className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[var(--text-muted)] mb-6">
              {t('databases', 'restoreConfirmMessage')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRestoreBackupId(null)}
                className="btn btn-secondary flex-1"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={restoreBackup.isPending}
                className="btn bg-[var(--status-warning)] text-white hover:bg-[var(--status-warning)]/90 flex-1"
              >
                {restoreBackup.isPending ? (
                  <span className="loading loading-sm" />
                ) : (
                  t('databases', 'restore')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Backup Confirmation Modal */}
      {deleteBackupId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-lg p-6 max-w-md w-full mx-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-[var(--status-error)]" />
                {t('common', 'delete')}
              </h3>
              <button
                onClick={() => setDeleteBackupId(null)}
                className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[var(--text-muted)] mb-6">
              {t('databases', 'deleteBackupConfirm')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteBackupId(null)}
                className="btn btn-secondary flex-1"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={handleDeleteBackup}
                disabled={deleteBackup.isPending}
                className="btn bg-[var(--status-error)] text-white hover:bg-[var(--status-error)]/90 flex-1"
              >
                {deleteBackup.isPending ? (
                  <span className="loading loading-sm" />
                ) : (
                  t('common', 'delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Credentials Modal */}
      {newCredentials && (
        <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-lg p-6 max-w-lg w-full mx-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-[var(--status-success)]">
                <Check className="w-5 h-5" />
                {t('databases', 'newCredentials')}
              </h3>
              <button
                onClick={() => setNewCredentials(null)}
                className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[var(--text-muted)] mb-4">
              {t('databases', 'passwordResetSuccess')}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  {t('databases', 'password')}
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-[var(--bg-tertiary)] rounded text-sm font-mono break-all">
                    {newCredentials.password}
                  </code>
                  <button
                    onClick={() => handleCopy(newCredentials.password, 'newPassword')}
                    className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                  >
                    {copiedField === 'newPassword' ? (
                      <Check className="w-4 h-4 text-[var(--status-success)]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {newCredentials.connectionString && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    {t('databases', 'connectionString')}
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-[var(--bg-tertiary)] rounded text-sm font-mono break-all max-h-24 overflow-auto">
                      {newCredentials.connectionString}
                    </code>
                    <button
                      onClick={() => handleCopy(newCredentials.connectionString!, 'newConnectionString')}
                      className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                    >
                      {copiedField === 'newConnectionString' ? (
                        <Check className="w-4 h-4 text-[var(--status-success)]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setNewCredentials(null)}
                className="btn btn-primary w-full"
              >
                {t('common', 'close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
