'use client';

import { Globe, Lock, AlertCircle } from 'lucide-react';
import type { Database } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { panelStyle, type T } from './_shared';

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
    <section className="rounded-xl p-5" style={panelStyle}>
      <h2 className="text-sm font-semibold mb-4">{t('databases', 'networkAccess')}</h2>
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg"
        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-start gap-3">
          {isExternal ? (
            <Globe className="w-5 h-5 shrink-0" style={{ color: STATUS_COLORS.warning }} />
          ) : (
            <Lock className="w-5 h-5 shrink-0" style={{ color: STATUS_COLORS.success }} />
          )}
          <div>
            <p className="text-sm font-medium">
              {isExternal ? t('databases', 'externalAccessOn') : t('databases', 'externalAccessOff')}
            </p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {isExternal ? t('databases', 'externalAccessOnDesc') : t('databases', 'externalAccessOffDesc')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={pending || database.status !== 'running'}
          className={`btn shrink-0 ${isExternal ? 'btn-secondary' : 'btn-primary'}`}
        >
          {pending ? '…' : isExternal ? t('databases', 'disable') : t('databases', 'enable')}
        </button>
      </div>
      {isExternal && (
        <p
          className="flex items-start gap-2 text-xs mt-3 px-3 py-2 rounded-lg"
          style={{
            background: `${STATUS_COLORS.warning}10`,
            border: `1px solid ${STATUS_COLORS.warning}25`,
            color: 'var(--text-secondary)',
          }}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: STATUS_COLORS.warning }} />
          {t('databases', 'externalAccessWarning')}
        </p>
      )}
    </section>
  );
}
