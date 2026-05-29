'use client';

import { AlertTriangle, HardDrive, Loader2, RefreshCw, Box } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatMessage } from '@/lib/i18n/format-message';
import { useServerHealth } from '@/hooks/useServers';
import type { Server } from '@/lib/api';

export function ServerHealthPanel({ server }: { server: Server }) {
  const { t } = useTranslation();
  const canScan = server.setupStatus === 'completed' && server.status === 'running';
  const { data: health, isLoading, isFetching, refetch, error } = useServerHealth(
    server.id,
    canScan
  );

  if (!canScan) return null;

  return (
    <div className="p-4 sm:p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-[var(--text-muted)]" />
          <h3 className="text-lg font-semibold">{t('servers', 'serverHealthTitle')}</h3>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="btn btn-secondary text-sm inline-flex items-center gap-2"
        >
          {isLoading || isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {t('servers', 'healthScan')}
        </button>
      </div>

      {error && (
        <p className="text-sm text-[var(--status-error)]">{t('servers', 'healthScanFailed')}</p>
      )}

      {health && (
        <>
          <div
            className={`p-3 rounded-lg text-sm border ${
              health.disk.critical
                ? 'bg-[var(--status-error)]/10 border-[var(--status-error)]/30 text-[var(--status-error)]'
                : health.disk.warn
                  ? 'bg-[var(--status-warning)]/10 border-[var(--status-warning)]/30 text-[var(--status-warning)]'
                  : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            <p className="font-medium">
              {t('servers', 'diskUsage')}: {health.disk.usedPercent}% — {health.disk.availGb} GB{' '}
              {t('servers', 'diskFree')}
            </p>
            <p className="text-xs mt-1 opacity-90">{health.disk.message}</p>
          </div>

          {health.orphans.length > 0 ? (
            <div className="p-3 rounded-lg border border-[var(--status-warning)]/40 bg-[var(--status-warning)]/5">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[var(--status-warning)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--status-warning)]">
                    {formatMessage(t('servers', 'orphanContainersTitle'), {
                      count: health.orphans.length,
                    })}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {t('servers', 'orphanContainersDesc')}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-xs font-mono">
                {health.orphans.map((o: { name: string; slug: string; status: string; ports: string }) => (
                  <li
                    key={o.name}
                    className="flex flex-wrap gap-x-3 gap-y-1 p-2 rounded bg-[var(--bg-tertiary)]"
                  >
                    <span className="flex items-center gap-1">
                      <Box className="w-3 h-3" />
                      {o.name}
                    </span>
                    {o.ports && <span className="text-[var(--text-muted)]">{o.ports}</span>}
                    <span className="text-[var(--text-muted)]">{o.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              {formatMessage(t('servers', 'noOrphanContainers'), {
                count: health.pushifyContainerCount,
              })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
