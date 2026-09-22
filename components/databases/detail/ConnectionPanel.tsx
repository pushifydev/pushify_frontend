'use client';

import { KeyRound } from 'lucide-react';
import type { Database, DatabaseCredentials } from '@/lib/api';
import { CopyField } from './CopyField';
import { panelStyle, type T } from './_shared';

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
  const internalStr = credentials?.internalConnectionString;
  const mask = (value: string) => value.replace(/:[^:@]+@/, ':••••••••@');

  return (
    <section className="rounded-xl p-5" style={panelStyle}>
      <h2 className="text-sm font-semibold mb-4">{t('databases', 'connectionDetails')}</h2>

      {internalStr && (
        <div className="mb-4">
          <CopyField
            label={t('databases', 'internalConnectionString')}
            value={showSecrets ? internalStr : mask(internalStr)}
            fieldKey="internalConnectionString"
            copiedField={copiedField}
            onCopy={onCopy}
            masked={!showSecrets}
            onToggleMask={onToggleSecrets}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {t('databases', 'internalConnectionHint')}
          </p>
        </div>
      )}

      {connStr && (
        <div className="mb-4">
          <CopyField
            label={t('databases', internalStr ? 'externalConnectionString' : 'connectionString')}
            value={showSecrets ? connStr : mask(connStr)}
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
