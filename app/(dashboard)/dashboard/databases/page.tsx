'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Database,
  Plus,
  MoreVertical,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Server,
} from 'lucide-react';
import {
  useTranslation,
  useDatabases,
  useDeleteDatabase,
  useDatabaseCredentials,
  useServers,
} from '@/hooks';
import { DATABASE_STATUS_COLORS, DB_TYPE_COLORS, DB_TYPE_LABELS, STATUS_COLORS } from '@/lib/constants';
import { formatStorage } from '@/lib/formatters';
import { CreateDatabaseModal } from './components/CreateDatabaseModal';
import type { Database as DatabaseType, DatabaseStatus } from '@/lib/api';

export default function DatabasesPage() {
  const { t } = useTranslation();
  const { data: databases = [], isLoading } = useDatabases();
  const { data: servers = [] } = useServers();
  const deleteDatabase = useDeleteDatabase();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionMenu, setActionMenu]           = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<string | null>(null);
  const [copiedField, setCopiedField]         = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm(t('databases', 'deleteConfirm'))) {
      setActionMenu(null);
      await deleteDatabase.mutateAsync(id);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const readyServers = servers.filter(s => s.status === 'running' && s.setupStatus === 'completed');

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-7 w-32 rounded-lg animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t('databases', 'title')}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {t('databases', 'description')}
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          disabled={readyServers.length === 0}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          {t('databases', 'newDatabase')}
        </button>
      </div>

      {/* No servers warning */}
      {readyServers.length === 0 && (
        <div
          className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(234,179,8,0.05)',
            border: '1px solid rgba(234,179,8,0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <Server className="w-4 h-4 shrink-0" style={{ color: STATUS_COLORS.warning }} />
            <div>
              <p className="text-sm font-medium" style={{ color: STATUS_COLORS.warning }}>
                {t('databases', 'noServersWarning')}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {t('databases', 'noServersWarningDesc')}
              </p>
            </div>
          </div>
          <Link href="/dashboard/servers" className="btn btn-primary shrink-0">
            <Plus className="w-4 h-4" />
            {t('databases', 'addServer')}
          </Link>
        </div>
      )}

      {/* Empty */}
      {databases.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
        >
          <div
            className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(34,211,238,0.1)' }}
          >
            <Database className="w-7 h-7" style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <h3 className="font-semibold mb-1">{t('databases', 'noDatabases')}</h3>
          <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            {t('databases', 'noDatabasesDesc')}
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            disabled={readyServers.length === 0}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            {t('databases', 'createFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {databases.map((db) => (
            <DatabaseCard
              key={db.id}
              database={db}
              statusAccent={DATABASE_STATUS_COLORS}
              dbColors={DB_TYPE_COLORS}
              dbLabels={DB_TYPE_LABELS}
              actionMenu={actionMenu}
              setActionMenu={setActionMenu}
              showCredentials={showCredentials}
              setShowCredentials={setShowCredentials}
              copiedField={copiedField}
              copyToClipboard={copyToClipboard}
              onDelete={handleDelete}
              t={t}
            />
          ))}
        </div>
      )}

      {createModalOpen && (
        <CreateDatabaseModal onClose={() => setCreateModalOpen(false)} servers={readyServers} />
      )}
    </div>
  );
}

function DatabaseCard({
  database, statusAccent, dbColors, dbLabels,
  actionMenu, setActionMenu, showCredentials, setShowCredentials,
  copiedField, copyToClipboard, onDelete, t,
}: {
  database: DatabaseType;
  statusAccent: Record<DatabaseStatus, string>;
  dbColors: Record<string, string>;
  dbLabels: Record<string, string>;
  actionMenu: string | null;
  setActionMenu: (id: string | null) => void;
  showCredentials: string | null;
  setShowCredentials: (id: string | null) => void;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
  onDelete: (id: string) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const accent = statusAccent[database.status];
  const dbColor = dbColors[database.type] || '#8a8a9a';
  const dbLabel = dbLabels[database.type] || database.type;
  const isShowingCreds = showCredentials === database.id;

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{
        background: 'var(--bg-secondary)',
        borderWidth: '2px 1px 1px 1px',
        borderStyle: 'solid',
        borderColor: `${accent}45 var(--glass-border) var(--glass-border) var(--glass-border)`,
        borderRadius: 12,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor =
          `${accent}70 var(--glass-border-strong) var(--glass-border-strong) var(--glass-border-strong)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor =
          `${accent}45 var(--glass-border) var(--glass-border) var(--glass-border)`;
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link href={`/dashboard/databases/${database.id}`} className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${dbColor}14` }}
          >
            <Database className="w-4 h-4" style={{ color: dbColor }} />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm truncate">{database.name}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {dbLabel} {database.version}
            </p>
          </div>
        </Link>

        <div className="relative shrink-0">
          <button
            onClick={() => setActionMenu(actionMenu === database.id ? null : database.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {actionMenu === database.id && (
            <div
              className="absolute right-0 top-8 z-10 w-44 rounded-xl py-1 shadow-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border-md)' }}
            >
              <button
                onClick={() => {
                  setShowCredentials(isShowingCreds ? null : database.id);
                  setActionMenu(null);
                }}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isShowingCreds ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {isShowingCreds ? t('databases', 'hideCredentials') : t('databases', 'showCredentials')}
              </button>
              <div className="my-1 mx-3" style={{ height: 1, background: 'var(--glass-divider-md)' }} />
              <button
                onClick={() => onDelete(database.id)}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2"
                style={{ color: 'var(--status-error)' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('databases', 'delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status + server */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: `${accent}15`, color: accent }}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${database.status === 'provisioning' ? 'animate-pulse' : ''}`}
            style={{ background: accent }}
          />
          {database.status}
        </span>
        {database.server && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Server className="w-3 h-3" />
            {database.server.name}
          </span>
        )}
      </div>

      {/* Credentials or info */}
      {isShowingCreds ? (
        <CredentialsView
          database={database}
          copiedField={copiedField}
          copyToClipboard={copyToClipboard}
          t={t}
        />
      ) : (
        <div className="space-y-1.5">
          {[
            { label: t('databases', 'host'),     value: `${database.host}:${database.port}` },
            { label: t('databases', 'database'), value: database.databaseName },
            { label: t('databases', 'storage'),  value: `${formatStorage(database.usedStorageMb ?? 0)} / ${formatStorage(database.storageMb ?? 0)}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{value}</span>
            </div>
          ))}
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
    <div className="space-y-1.5">
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
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span
          className={`truncate ${isPassword ? 'blur-sm hover:blur-none transition-all' : ''}`}
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
        >
          {display}
        </span>
        <button
          onClick={() => copyToClipboard(display, field)}
          className="p-1 rounded shrink-0 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          {copiedField === field
            ? <Check className="w-3 h-3" style={{ color: 'var(--status-success)' }} />
            : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
