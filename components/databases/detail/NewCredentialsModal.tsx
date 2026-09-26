'use client';

import { RefreshCw } from 'lucide-react';
import type { DatabaseCredentials } from '@/lib/api';
import { formatMessage } from '@/lib/i18n/format-message';
import { Modal } from '@/components/Modal';
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
    <Modal
      isOpen
      onClose={onClose}
      title={t('databases', 'newCredentialsTitle')}
      description={t('databases', 'passwordResetSuccess')}
    >
      <div className="space-y-4">
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
      </div>
      <div className="dash-modal-footer">
        <button type="button" onClick={onClose} className="btn btn-primary">
          {t('common', 'close')}
        </button>
      </div>
    </Modal>
  );
}
