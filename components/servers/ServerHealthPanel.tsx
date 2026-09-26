'use client';

import { Loader2, RefreshCw } from 'lucide-react';
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
    <section className="min-w-0" aria-labelledby={`server-health-${server.id}`}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <h2 id={`server-health-${server.id}`} className="dash-section-label">
          {t('servers', 'serverHealthTitle')}
        </h2>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="btn btn-secondary btn-sm"
        >
          {isLoading || isFetching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {t('servers', 'healthScan')}
        </button>
      </div>
      <div className="dash-card p-4 sm:p-5 space-y-4 min-w-0">
      {!health && !error && (
        <p className="text-[13px] text-[var(--text-muted)] flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          {t('common', 'loading')}
        </p>
      )}

      {error && (
        <p className="text-sm text-[var(--status-error)]">{t('servers', 'healthScanFailed')}</p>
      )}

      {health && (
        <>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="dash-stat-label !mt-0">{t('servers', 'diskUsage')}</span>
              <span
                className={`terminal-text text-xs tabular-nums ${
                  health.disk.critical
                    ? 'text-[var(--status-error)]'
                    : health.disk.warn
                      ? 'text-[var(--status-warning)]'
                      : 'text-[var(--text-primary)]'
                }`}
              >
                {health.disk.usedPercent}% · {health.disk.availGb} GB {t('servers', 'diskFree')}
              </span>
            </div>
            <div
              className="dash-metric-track"
              role="progressbar"
              aria-label={t('servers', 'diskUsage')}
              aria-valuenow={health.disk.usedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`dash-metric-fill ${
                  health.disk.critical ? 'is-critical' : health.disk.warn ? 'is-warning' : ''
                }`}
                style={{ width: `${Math.min(Math.max(health.disk.usedPercent, 0), 100)}%` }}
              />
            </div>
            {health.disk.message && (
              <p
                className={`text-xs ${
                  health.disk.critical
                    ? 'text-[var(--status-error)]'
                    : health.disk.warn
                      ? 'text-[var(--status-warning)]'
                      : 'text-[var(--text-muted)]'
                }`}
              >
                {health.disk.message}
              </p>
            )}
          </div>

          {health.orphans.length > 0 ? (
            <div className="dash-callout dash-callout-attention">
              <div className="flex items-start gap-2.5 mb-2">
                <span className="dash-status-dot is-warning mt-1.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {formatMessage(t('servers', 'orphanContainersTitle'), {
                      count: health.orphans.length,
                    })}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {t('servers', 'orphanContainersDesc')}
                  </p>
                </div>
              </div>
              <ul className="dash-rows terminal-text text-xs">
                {health.orphans.map((o: { name: string; slug: string; status: string; ports: string }) => (
                  <li
                    key={o.name}
                    className="dash-row !py-2 flex flex-wrap gap-x-3 gap-y-1"
                  >
                    <span className="text-[var(--text-primary)]">{o.name}</span>
                    {o.ports && <span className="text-[var(--text-muted)]">{o.ports}</span>}
                    <span className="text-[var(--text-muted)]">{o.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--text-muted)] flex items-center gap-2">
              <span className="dash-status-dot is-success" aria-hidden="true" />
              {formatMessage(t('servers', 'noOrphanContainers'), {
                count: health.pushifyContainerCount,
              })}
            </p>
          )}
        </>
      )}
      </div>
    </section>
  );
}
