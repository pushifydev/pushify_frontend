'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, MoreHorizontal, Trash2, Copy, Check, Eye, EyeOff, Server } from 'lucide-react';
import {
  useTranslation,
  useDatabases,
  useDeleteDatabase,
  useDatabaseCredentials,
  useServers,
} from '@/hooks';
import { DB_TYPE_LABELS } from '@/lib/constants';
import { formatStorage, formatTimeAgo } from '@/lib/formatters';
import { CreateDatabaseModal } from './components/CreateDatabaseModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Database as DatabaseType, DatabaseStatus } from '@/lib/api';
import { EmptyState } from '@/components/EmptyState';
import { MetaLabel, PageHeader, RowList } from '@/components/dashboard/PageKit';

export default function DatabasesPage() {
  const { t } = useTranslation();
  const { data: databases = [], isLoading } = useDatabases();
  const { data: servers = [] } = useServers();
  const deleteDatabase = useDeleteDatabase();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionMenu, setActionMenu]           = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<string | null>(null);
  const [copiedField, setCopiedField]         = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget]       = useState<DatabaseType | null>(null);

  const handleDeleteClick = (db: DatabaseType) => {
    setActionMenu(null);
    setDeleteTarget(db);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteDatabase.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const readyServers = servers.filter(s => s.status === 'running' && s.setupStatus === 'completed');

  const running = databases.filter((d) => d.status === 'running').length;

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in">
      <PageHeader
        title={t('databases', 'title')}
        description={t('databases', 'description')}
        meta={
          databases.length > 0
            ? [
                <MetaLabel key="count">
                  {databases.length} {t('databases', 'title')}
                </MetaLabel>,
                <span key="running" className="inline-flex items-center gap-1.5">
                  <span className="dash-status-dot is-success" aria-hidden />
                  {running} {t('databases', 'running')}
                </span>,
              ]
            : undefined
        }
        actions={
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            disabled={readyServers.length === 0}
            className="btn btn-primary justify-center"
          >
            <Plus className="w-4 h-4" />
            {t('databases', 'newDatabase')}
          </button>
        }
      />

      {/* No servers warning */}
      {!isLoading && readyServers.length === 0 && (
        <div className="dash-callout dash-callout-attention flex-col sm:flex-row sm:items-center" role="note">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t('databases', 'noServersWarning')}</p>
            <p className="text-[13px] mt-0.5 text-[var(--text-secondary)]">
              {t('databases', 'noServersWarningDesc')}
            </p>
          </div>
          <Link href="/dashboard/servers" className="btn btn-secondary btn-sm shrink-0">
            <Plus className="w-3.5 h-3.5" />
            {t('databases', 'addServer')}
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="dash-rows" role="status" aria-label={t('common', 'loading')}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="dash-row flex items-center gap-3">
              <div className="dash-skeleton w-1.5 h-1.5 rounded-full" />
              <div className="dash-skeleton h-4 w-40 rounded" />
              <div className="dash-skeleton h-3 w-24 rounded ml-auto" />
            </div>
          ))}
        </div>
      ) : databases.length === 0 ? (
        <EmptyState
          label={t('databases', 'title')}
          title={t('databases', 'noDatabases')}
          description={t('databases', 'noDatabasesDesc')}
          action={{
            label: t('databases', 'createFirst'),
            onClick: () => setCreateModalOpen(true),
            disabled: readyServers.length === 0,
            icon: <Plus className="w-4 h-4" />,
          }}
        />
      ) : (
        <RowList>
          {databases.map((db) => (
            <DatabaseRow
              key={db.id}
              database={db}
              actionMenu={actionMenu}
              setActionMenu={setActionMenu}
              showCredentials={showCredentials}
              setShowCredentials={setShowCredentials}
              copiedField={copiedField}
              copyToClipboard={copyToClipboard}
              onDelete={handleDeleteClick}
              t={t}
            />
          ))}
        </RowList>
      )}

      <CreateDatabaseModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} servers={readyServers} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        variant="danger"
        title={deleteTarget ? `${t('common', 'delete')} "${deleteTarget.name}"` : ''}
        description={t('databases', 'deleteConfirm')}
        confirmText={t('common', 'delete')}
        cancelText={t('common', 'cancel')}
        loading={deleteDatabase.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function statusDot(status: DatabaseStatus) {
  if (status === 'running') return 'is-success';
  if (status === 'error') return 'is-error';
  if (status === 'provisioning' || status === 'deleting') return 'is-warning animate-pulse';
  return '';
}

function DatabaseRow({
  database,
  actionMenu, setActionMenu, showCredentials, setShowCredentials,
  copiedField, copyToClipboard, onDelete, t,
}: {
  database: DatabaseType;
  actionMenu: string | null;
  setActionMenu: (id: string | null) => void;
  showCredentials: string | null;
  setShowCredentials: (id: string | null) => void;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
  onDelete: (db: DatabaseType) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const dbLabel = DB_TYPE_LABELS[database.type] || database.type;
  const isShowingCreds = showCredentials === database.id;
  const menuOpen = actionMenu === database.id;

  return (
    <div className="dash-row">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`dash-status-dot ${statusDot(database.status)}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
            <Link
              href={`/dashboard/databases/${database.id}`}
              className="text-sm font-medium truncate text-[var(--text-primary)] hover:underline underline-offset-4"
            >
              {database.name}
            </Link>
            <span className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] shrink-0">
              {dbLabel} {database.version}
            </span>
            {database.status !== 'running' && (
              <span className="text-xs text-[var(--text-muted)] shrink-0">
                {t('databases', database.status as 'running')}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[var(--text-muted)] min-w-0">
            <span className="terminal-text truncate">{database.host}:{database.port}</span>
            {database.server && (
              <span className="inline-flex items-center gap-1 shrink-0">
                <Server className="w-3 h-3" aria-hidden />
                {database.server.name}
              </span>
            )}
            <span className="terminal-text shrink-0 hidden sm:inline">
              {formatStorage(database.usedStorageMb ?? 0)} / {formatStorage(database.storageMb ?? 0)}
            </span>
            <span className="shrink-0">
              {database.backupEnabled ? t('databases', 'listBackupOn') : t('databases', 'listBackupOff')}
              {' · '}
              {database.lastBackupAt
                ? formatTimeAgo(database.lastBackupAt, t)
                : t('databases', 'neverBackedUp')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link href={`/dashboard/databases/${database.id}`} className="btn btn-secondary btn-sm hidden sm:inline-flex">
            {t('databases', 'manageBackupsLink')}
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionMenu(menuOpen ? null : database.id)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={database.name}
              className="dash-icon-action"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} aria-hidden />
                <div className="dash-menu absolute right-0 top-full mt-1 w-48 z-20" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowCredentials(isShowingCreds ? null : database.id);
                      setActionMenu(null);
                    }}
                    className="dash-menu-item"
                  >
                    {isShowingCreds ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {isShowingCreds ? t('databases', 'hideCredentials') : t('databases', 'showCredentials')}
                  </button>
                  <div className="dash-menu-separator" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => onDelete(database)}
                    className="dash-menu-item is-danger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('databases', 'delete')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isShowingCreds && (
        <div className="mt-3 ml-[1.125rem] max-w-xl rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-3 py-1">
          <CredentialsView
            database={database}
            copiedField={copiedField}
            copyToClipboard={copyToClipboard}
            t={t}
          />
        </div>
      )}
    </div>
  );
}

function CredentialsView({
  database, copiedField, copyToClipboard, t,
}: {
  database: DatabaseType;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: credentials } = useDatabaseCredentials(database.id);
  return (
    <div>
      <CredentialRow label={t('databases', 'host')}     value={credentials?.host || database.host || ''} port={credentials?.port || database.port} field="host" copiedField={copiedField} copyToClipboard={copyToClipboard} />
      <CredentialRow label={t('databases', 'username')} value={credentials?.username || database.username} field="username" copiedField={copiedField} copyToClipboard={copyToClipboard} />
      <CredentialRow label={t('databases', 'password')} value={credentials?.password || '••••••••'} field="password" copiedField={copiedField} copyToClipboard={copyToClipboard} isPassword />
      {credentials?.connectionString && (
        <CredentialRow label={t('databases', 'connectionString')} value={credentials.connectionString} field="connectionString" copiedField={copiedField} copyToClipboard={copyToClipboard} isPassword />
      )}
    </div>
  );
}

function CredentialRow({
  label, value, port, field, copiedField, copyToClipboard, isPassword,
}: {
  label: string; value: string; port?: number; field: string;
  copiedField: string | null; copyToClipboard: (v: string, f: string) => void; isPassword?: boolean;
}) {
  const display = port ? `${value}:${port}` : value;
  const copied = copiedField === field;
  return (
    <div className="dash-kv items-center!">
      <span>{label}</span>
      <span className="flex items-center justify-end gap-1 min-w-0">
        <span className={`truncate ${isPassword ? 'blur-sm hover:blur-none transition-all' : ''}`}>{display}</span>
        <button
          type="button"
          onClick={() => copyToClipboard(display, field)}
          aria-label={`${label}`}
          title={label}
          className="dash-icon-action w-6! h-6!"
        >
          {copied
            ? <Check className="w-3 h-3" style={{ color: 'var(--status-success)' }} />
            : <Copy className="w-3 h-3" />}
        </button>
      </span>
    </div>
  );
}
