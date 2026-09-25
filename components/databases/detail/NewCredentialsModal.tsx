'use client';

import { RefreshCw } from 'lucide-react';
import type { DatabaseCredentials } from '@/lib/api';
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
      style={{ background: 'color-mix(in srgb, var(--bg-primary) 70%, transparent)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-credentials-title"
        className="w-full max-w-md rounded-[14px] p-6 space-y-4"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
      >
        <div>
          <h3 id="new-credentials-title" className="text-lg flex items-center gap-2">
            <span className="dash-status-dot is-success" aria-hidden="true" />
            {t('databases', 'newCredentialsTitle')}
          </h3>
          <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t('databases', 'passwordResetSuccess')}
          </p>
        </div>
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
          <div className="dash-callout dash-callout-attention flex-col items-stretch! gap-2.5!">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {formatMessage(t('databases', 'resetRedeployHint'), { count: staleProjects.length })}{' '}
              <span style={{ color: 'var(--text-muted)' }}>{staleProjects.map((p) => p.name).join(', ')}</span>
            </p>
            <button
              type="button"
              onClick={onRedeploy}
              disabled={redeployPending}
              className="btn btn-secondary btn-sm w-full"
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
