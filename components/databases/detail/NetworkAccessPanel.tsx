'use client';

import { AlertCircle } from 'lucide-react';
import type { Database } from '@/lib/api';
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
    <section className="dash-panel">
      <div className="dash-panel-header mb-4!">
        <h2 className="dash-panel-title">{t('databases', 'networkAccess')}</h2>
        <span className={`badge ${isExternal ? 'badge-warning' : 'badge-neutral'}`}>
          {isExternal ? t('databases', 'externalAccessOn') : t('databases', 'externalAccessOff')}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-[13px] leading-relaxed min-w-0" style={{ color: 'var(--text-secondary)' }}>
          {isExternal ? t('databases', 'externalAccessOnDesc') : t('databases', 'externalAccessOffDesc')}
        </p>
        <button
          type="button"
          onClick={onToggle}
          disabled={pending || database.status !== 'running'}
          className={`btn btn-sm shrink-0 ${isExternal ? 'btn-secondary' : 'btn-primary'}`}
          aria-pressed={isExternal}
        >
          {pending ? '…' : isExternal ? t('databases', 'disable') : t('databases', 'enable')}
        </button>
      </div>

      {isExternal && (
        <div className="dash-callout dash-callout-attention mt-4" role="note">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--status-warning)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t('databases', 'externalAccessWarning')}
          </p>
        </div>
      )}
    </section>
  );
}
