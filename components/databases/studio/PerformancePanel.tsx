'use client';

import { Ban, Info, Loader2, RefreshCw } from 'lucide-react';
import type { StudioPerformance } from '@/lib/api';
import { panelStyle, type T } from './_shared';

interface PerformancePanelProps {
  data: StudioPerformance | undefined;
  loading: boolean;
  fetching: boolean;
  error: unknown;
  onRefresh: () => void;
  onOpenInConsole: (sql: string) => void;
  onCancel: (id: number) => void;
  cancelling: boolean;
  t: T;
}

const mono = { fontFamily: 'var(--font-mono)' } as const;

function formatMs(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  if (value < 1000) return `${Math.round(value)}ms`;
  return `${(value / 1000).toFixed(2)}s`;
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-2.5 px-4 py-3"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </p>
    </div>
  );
}

export function PerformancePanel({
  data,
  loading,
  fetching,
  error,
  onRefresh,
  onOpenInConsole,
  onCancel,
  cancelling,
  t,
}: PerformancePanelProps) {
  if (error) {
    return (
      <div
        className="dash-callout text-sm"
        role="alert"
        style={{
          background: 'color-mix(in srgb, var(--status-error) 6%, var(--bg-secondary))',
          border: '1px solid color-mix(in srgb, var(--status-error) 30%, var(--border-subtle))',
          color: 'var(--status-error)',
        }}
      >
        {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('databases', 'studioPerformanceSubtitle')}
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={fetching}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
          {t('databases', 'studioRefresh')}
        </button>
      </div>

      {/* Slow queries */}
      <div className="overflow-hidden" style={panelStyle}>
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className="dash-section-label">{t('databases', 'studioSlowQueries')}</h2>
        </div>

        {loading ? (
          <div className="px-4 py-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-6 rounded animate-pulse"
                style={{ background: 'var(--hover-overlay)' }}
              />
            ))}
          </div>
        ) : !data?.slowQueries.available ? (
          <Notice>{data?.slowQueries.hint ?? t('databases', 'studioSlowQueriesUnavailable')}</Notice>
        ) : data.slowQueries.items.length === 0 ? (
          <Notice>{t('databases', 'studioNoSlowQueries')}</Notice>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
                  {[
                    t('databases', 'studioQueryColumn'),
                    t('databases', 'studioCalls'),
                    t('databases', 'studioTotalTime'),
                    t('databases', 'studioMeanTime'),
                    t('databases', 'studioRowsLabel'),
                  ].map((label) => (
                    <th
                      key={label}
                      className="px-3 py-2 text-left text-xs font-medium whitespace-nowrap"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slowQueries.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="px-3 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => onOpenInConsole(item.query)}
                        className="block max-w-130 truncate text-xs text-left"
                        style={{ ...mono, color: 'var(--text-secondary)' }}
                        title={t('databases', 'studioOpenInConsole')}
                      >
                        {item.query}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {item.calls.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {formatMs(item.totalMs)}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                      {formatMs(item.meanMs)}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {item.rows.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Running right now */}
      <div className="overflow-hidden" style={panelStyle}>
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className="dash-section-label">{t('databases', 'studioRunningQueries')}</h2>
        </div>

        {loading ? (
          <div className="px-4 py-4">
            <div className="h-6 rounded animate-pulse" style={{ background: 'var(--hover-overlay)' }} />
          </div>
        ) : !data?.running.available ? (
          <Notice>{data?.running.hint ?? t('databases', 'studioRunningUnavailable')}</Notice>
        ) : data.running.items.length === 0 ? (
          <Notice>{t('databases', 'studioNoRunningQueries')}</Notice>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {data.running.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {item.user ?? '—'} · {item.state ?? '—'} · {formatMs(item.runningMs)}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span
                        className="block max-w-115 truncate text-xs"
                        style={{ ...mono, color: 'var(--text-secondary)' }}
                        title={item.query ?? ''}
                      >
                        {item.query ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right align-top">
                      <button
                        type="button"
                        onClick={() => onCancel(Number(item.id))}
                        disabled={cancelling || !Number.isFinite(Number(item.id))}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--status-error)' }}
                        title={t('databases', 'studioCancelQuery')}
                      >
                        {cancelling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Ban className="w-3 h-3" />
                        )}
                        {t('databases', 'studioCancelQuery')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
