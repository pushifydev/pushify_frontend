'use client';

import { Check, RefreshCw } from 'lucide-react';
import type { DatabaseCredentials } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { formatMessage } from '@/lib/i18n/format-message';
import { CopyField } from './CopyField';
import { type T } from './_shared';

export function NewCredentialsModal({
  credentials,
  copiedField,
  onCopy,
  onClose,
  staleProjects,
  onRedeploy,
  redeployPending,
  t,
}: {
  credentials: DatabaseCredentials;
  copiedField: string | null;
  onCopy: (value: string, key: string) => void;
  onClose: () => void;
  /** Projects connected read & write: they run with the old password until redeployed */
  staleProjects: Array<{ id: string; name: string }>;
  onRedeploy: () => void;
  redeployPending: boolean;
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
        {staleProjects.length > 0 && (
          <div
            className="rounded-lg px-3 py-3 space-y-2.5"
            style={{ background: `${STATUS_COLORS.warning}10`, border: `1px solid ${STATUS_COLORS.warning}30` }}
          >
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {formatMessage(t('databases', 'resetRedeployHint'), { count: staleProjects.length })}{' '}
              <span style={{ color: 'var(--text-muted)' }}>{staleProjects.map((p) => p.name).join(', ')}</span>
            </p>
            <button
              type="button"
              onClick={onRedeploy}
              disabled={redeployPending}
              className="btn btn-secondary w-full text-sm py-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${redeployPending ? 'animate-spin' : ''}`} />
              {t('databases', 'redeployConnected')}
            </button>
          </div>
        )}
        <button type="button" onClick={onClose} className="btn btn-primary w-full">
          {t('common', 'close')}
        </button>
      </div>
    </div>
  );
}
