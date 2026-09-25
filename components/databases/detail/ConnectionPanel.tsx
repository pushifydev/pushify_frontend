'use client';

import { KeyRound } from 'lucide-react';
import type { Database, DatabaseCredentials } from '@/lib/api';
import { CopyField } from './CopyField';
import { type T } from './_shared';

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
    <section className="dash-panel">
      <div className="dash-panel-header">
        <h2 className="dash-panel-title">{t('databases', 'connectionDetails')}</h2>
        <button
          type="button"
          onClick={onResetPassword}
          disabled={!canResetPassword}
          className="btn btn-ghost btn-sm"
        >
          <KeyRound className="w-3.5 h-3.5" />
          {t('databases', 'resetPassword')}
        </button>
      </div>

      <div className="space-y-4">
        {internalStr && (
          <div>
            <CopyField
              label={t('databases', 'internalConnectionString')}
              value={showSecrets ? internalStr : mask(internalStr)}
              copyValue={internalStr}
              fieldKey="internalConnectionString"
              copiedField={copiedField}
              onCopy={onCopy}
              masked={!showSecrets}
              onToggleMask={onToggleSecrets}
            />
            <p className="dash-caption mt-1.5">{t('databases', 'internalConnectionHint')}</p>
          </div>
        )}

        {connStr && (
          <CopyField
            label={t('databases', internalStr ? 'externalConnectionString' : 'connectionString')}
            value={showSecrets ? connStr : mask(connStr)}
            copyValue={connStr}
            fieldKey="connectionString"
            copiedField={copiedField}
            onCopy={onCopy}
            masked={!showSecrets}
            onToggleMask={onToggleSecrets}
          />
        )}

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
            internalStr || connStr ? 'pt-4 border-t border-[var(--border-subtle)]' : ''
          }`}
        >
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
          <CopyField
            label={t('databases', 'password')}
            value={showSecrets && credentials?.password ? credentials.password : '••••••••••••••••'}
            copyValue={credentials?.password}
            fieldKey="password"
            copiedField={copiedField}
            onCopy={onCopy}
            masked={!showSecrets}
            onToggleMask={credentials?.password ? onToggleSecrets : undefined}
          />
        </div>
      </div>
    </section>
  );
}
