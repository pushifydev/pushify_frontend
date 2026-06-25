'use client';

import { Check } from 'lucide-react';
import type { DatabaseCredentials } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { CopyField } from './CopyField';
import { type T } from './_shared';

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
