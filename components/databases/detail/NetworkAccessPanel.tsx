'use client';

import { AlertCircle } from 'lucide-react';
import type { Database } from '@/lib/api';
import { SettingsSection, SettingsSwitch } from '@/components/dashboard/SettingsParts';
import { type T } from './_shared';

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
    <SettingsSection
      id="db-network"
      title={t('databases', 'networkAccess')}
      description={isExternal ? t('databases', 'externalAccessOnDesc') : t('databases', 'externalAccessOffDesc')}
      padded
      action={
        <>
          <span className={`badge ${isExternal ? 'badge-warning' : 'badge-neutral'}`}>
            {isExternal ? t('databases', 'externalAccessOn') : t('databases', 'externalAccessOff')}
          </span>
          <SettingsSwitch
            checked={!!isExternal}
            onChange={() => onToggle()}
            disabled={pending || database.status !== 'running'}
            label={t('databases', 'networkAccess')}
          />
        </>
      }
    >
      {isExternal && (
        <div className="dash-callout dash-callout-attention" role="note">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--status-warning)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t('databases', 'externalAccessWarning')}
          </p>
        </div>
      )}
    </SettingsSection>
  );
}
