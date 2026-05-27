'use client';

import Link from 'next/link';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Download,
  ArchiveRestore,
  Trash2,
  Server,
  HardDrive,
  Clock,
  Globe,
  Lock,
  AlertCircle,
} from 'lucide-react';
import type { Database, DatabaseBackup, DatabaseCredentials } from '@/lib/api';
import { STATUS_COLORS, DATABASE_STATUS_COLORS, DB_TYPE_COLORS, DB_TYPE_LABELS } from '@/lib/constants';
import { formatStorage, formatTimeAgo } from '@/lib/formatters';
import type { useTranslation } from '@/hooks';

type T = ReturnType<typeof useTranslation>['t'];

const panelStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--glass-border)',
  borderRadius: 12,
} as const;

export function CopyField({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
  mono = true,
  masked,
  onToggleMask,
}: {
  label: string;
  value: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (value: string, key: string) => void;
  mono?: boolean;
  masked?: boolean;
  onToggleMask?: () => void;
}) {
  const copied = copiedField === fieldKey;
  return (
    <div className="space-y-1.5">
      <span
        style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </span>
      <div
        className="flex items-center gap-1 rounded-lg pl-3 pr-1 py-2"
        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
      >
        <span
          className={`flex-1 min-w-0 truncate text-sm ${mono ? 'font-mono' : ''}`}
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </span>
        {onToggleMask && (
          <button
            type="button"
            onClick={onToggleMask}
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--hover-overlay)]"
            style={{ color: 'var(--text-muted)' }}
          >
            {masked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => onCopy(value, fieldKey)}
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--hover-overlay)]"
          style={{ color: copied ? STATUS_COLORS.success : 'var(--text-muted)' }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

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

export function DatabaseStatsRow({ database, t }: { database: Database; t: T }) {
  const used = database.usedStorageMb ?? 0;
  const total = database.storageMb ?? 1024;
  const pct = Math.min((used / total) * 100, 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
      {[
        {
          label: t('databases', 'storage'),
          value: `${formatStorage(used)} / ${formatStorage(total)}`,
          sub: (
            <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: STATUS_COLORS.purple }} />
            </div>
          ),
        },
        {
          label: t('databases', 'server'),
          value: database.server?.name ?? '—',
          link: database.server ? `/dashboard/servers/${database.server.id}` : undefined,
        },
        {
          label: t('databases', 'lastBackup'),
          value: database.lastBackupAt
            ? formatTimeAgo(database.lastBackupAt, t)
            : t('databases', 'neverBackedUp'),
        },
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl px-4 py-3" style={panelStyle}>
          <p
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
            }}
          >
            {stat.label}
          </p>
          {stat.link ? (
            <Link href={stat.link} className="text-sm font-medium hover:underline" style={{ color: 'var(--accent-cyan)' }}>
              {stat.value}
            </Link>
          ) : (
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </p>
          )}
          {stat.sub}
        </div>
      ))}
    </div>
  );
}

export function ConnectionPanel({
  database,
  credentials,
  showSecrets,
  onToggleSecrets,
  copiedField,
  onCopy,
  onResetPassword,
  canResetPassword,
  t,
}: {
  database: Database;
  credentials?: DatabaseCredentials;
  showSecrets: boolean;
  onToggleSecrets: () => void;
  copiedField: string | null;
  onCopy: (value: string, key: string) => void;
  onResetPassword: () => void;
  canResetPassword: boolean;
  t: T;
}) {
  const connStr = credentials?.connectionString;
  const maskedConn = connStr?.replace(/:[^:@]+@/, ':••••••••@') ?? '';

  return (
    <section className="rounded-xl p-5" style={panelStyle}>
      <h2 className="text-sm font-semibold mb-4">{t('databases', 'connectionDetails')}</h2>

      {connStr && (
        <div className="mb-4">
          <CopyField
            label={t('databases', 'connectionString')}
            value={showSecrets ? connStr : maskedConn}
            fieldKey="connectionString"
            copiedField={copiedField}
            onCopy={onCopy}
            masked={!showSecrets}
            onToggleMask={onToggleSecrets}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CopyField
          label={t('databases', 'host')}
          value={`${credentials?.host || database.host}:${credentials?.port || database.port}`}
          fieldKey="host"
          copiedField={copiedField}
          onCopy={onCopy}
        />
        <CopyField
          label={t('databases', 'databaseName')}
          value={credentials?.databaseName || database.databaseName}
          fieldKey="dbName"
          copiedField={copiedField}
          onCopy={onCopy}
        />
        <CopyField
          label={t('databases', 'username')}
          value={credentials?.username || database.username}
          fieldKey="username"
          copiedField={copiedField}
          onCopy={onCopy}
        />
        <div className="space-y-1.5">
          <CopyField
            label={t('databases', 'password')}
            value={showSecrets && credentials?.password ? credentials.password : '••••••••••••••••'}
            fieldKey="password"
            copiedField={copiedField}
            onCopy={onCopy}
            masked={!showSecrets}
            onToggleMask={credentials?.password ? onToggleSecrets : undefined}
          />
          <button
            type="button"
            onClick={onResetPassword}
            disabled={!canResetPassword}
            className="btn btn-secondary w-full text-xs py-2 mt-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {t('databases', 'resetPassword')}
          </button>
        </div>
      </div>
    </section>
  );
}

export function NetworkAccessPanel({
  database,
  onToggle,
  pending,
  t,
}: {
  database: Database;
  onToggle: () => void;
  pending: boolean;
  t: T;
}) {
  const isExternal = database.externalAccess;
  return (
    <section className="rounded-xl p-5" style={panelStyle}>
      <h2 className="text-sm font-semibold mb-4">{t('databases', 'networkAccess')}</h2>
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg"
        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-start gap-3">
          {isExternal ? (
            <Globe className="w-5 h-5 shrink-0" style={{ color: STATUS_COLORS.warning }} />
          ) : (
            <Lock className="w-5 h-5 shrink-0" style={{ color: STATUS_COLORS.success }} />
          )}
          <div>
            <p className="text-sm font-medium">
              {isExternal ? t('databases', 'externalAccessOn') : t('databases', 'externalAccessOff')}
            </p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {isExternal ? t('databases', 'externalAccessOnDesc') : t('databases', 'externalAccessOffDesc')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={pending || database.status !== 'running'}
          className={`btn shrink-0 ${isExternal ? 'btn-secondary' : 'btn-primary'}`}
        >
          {pending ? '…' : isExternal ? t('databases', 'disable') : t('databases', 'enable')}
        </button>
      </div>
      {isExternal && (
        <p
          className="flex items-start gap-2 text-xs mt-3 px-3 py-2 rounded-lg"
          style={{
            background: `${STATUS_COLORS.warning}10`,
            border: `1px solid ${STATUS_COLORS.warning}25`,
            color: 'var(--text-secondary)',
          }}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: STATUS_COLORS.warning }} />
          {t('databases', 'externalAccessWarning')}
        </p>
      )}
    </section>
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

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 shrink-0" style={{ color: 'var(--text-muted)' }}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="text-right truncate" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}

export function NewCredentialsModal({
  credentials,
  copiedField,
  onCopy,
  onClose,
  t,
}: {
  credentials: DatabaseCredentials;
  copiedField: string | null;
  onCopy: (value: string, key: string) => void;
  onClose: () => void;
  t: T;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.45)' }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 space-y-4"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border-md)' }}
      >
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: STATUS_COLORS.success }}>
          <Check className="w-5 h-5" />
          {t('databases', 'newCredentials')}
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('databases', 'passwordResetSuccess')}
        </p>
        <CopyField
          label={t('databases', 'password')}
          value={credentials.password}
          fieldKey="newPassword"
          copiedField={copiedField}
          onCopy={onCopy}
        />
        {credentials.connectionString && (
          <CopyField
            label={t('databases', 'connectionString')}
            value={credentials.connectionString}
            fieldKey="newConnectionString"
            copiedField={copiedField}
            onCopy={onCopy}
          />
        )}
        <button type="button" onClick={onClose} className="btn btn-primary w-full">
          {t('common', 'close')}
        </button>
      </div>
    </div>
  );
}
