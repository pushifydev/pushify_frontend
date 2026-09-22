'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, Pause, Play, RefreshCw, Search, Terminal, Trash2 } from 'lucide-react';
import { useContainerLogsStream } from '@/hooks/useContainerLogsStream';
import { useDeployments, useTranslation } from '@/hooks';
import {
  exportProjectLogs,
  getProjectLogContainers,
  searchProjectLogs,
  type ProjectLogLine,
  type ProjectLogSearchParams,
} from '@/lib/api';

type Mode = 'live' | 'history';

/** History windows, newest-relative; 0 means "everything the plan still keeps". */
const RANGES = [
  { hours: 1, key: 'range1h' },
  { hours: 6, key: 'range6h' },
  { hours: 24, key: 'range24h' },
  { hours: 24 * 7, key: 'range7d' },
  { hours: 0, key: 'rangeAll' },
] as const;

export function LogsTab({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [mode, setMode] = useState<Mode>('live');
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  // History mode state
  const [query, setQuery] = useState('');
  const [logType, setLogType] = useState<'all' | 'stdout' | 'stderr'>('all');
  const [container, setContainer] = useState('');
  const [rangeHours, setRangeHours] = useState<number>(24);
  const [containers, setContainers] = useState<string[]>([]);
  const [historyLines, setHistoryLines] = useState<ProjectLogLine[] | null>(null);
  const [retentionDays, setRetentionDays] = useState(7);
  const [searching, setSearching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { data: deployments = [] } = useDeployments(projectId);
  // Latest deployment is first (list is newest-first); the stream endpoint resolves the
  // actual running container (blue/green) from the project slug regardless.
  const latestDeployment = deployments[0];

  const stream = useContainerLogsStream(
    projectId,
    latestDeployment?.id ?? '',
    mode === 'live' && !!latestDeployment
  );

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (mode === 'live' && autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [stream.logs, autoScroll, mode]);

  const visibleLiveLogs = useMemo(() => {
    if (!filter.trim()) return stream.logs;
    const needle = filter.toLowerCase();
    return stream.logs.filter((line) => line.toLowerCase().includes(needle));
  }, [stream.logs, filter]);

  // The containers with stored logs — replicas, workers and staging each get their own entry
  useEffect(() => {
    if (mode !== 'history') return;
    let cancelled = false;
    getProjectLogContainers(projectId).then((result) => {
      if (!cancelled && result.data) setContainers(result.data.containers);
    });
    return () => {
      cancelled = true;
    };
  }, [mode, projectId]);

  const searchParams = (): ProjectLogSearchParams => ({
    q: query.trim() || undefined,
    logType: logType === 'all' ? undefined : logType,
    container: container || undefined,
    from: rangeHours ? new Date(Date.now() - rangeHours * 3600_000).toISOString() : undefined,
  });

  const runSearch = async () => {
    setSearching(true);
    setSearchError(null);
    const result = await searchProjectLogs(projectId, { ...searchParams(), limit: 500 });
    setSearching(false);
    if (result.error) {
      setSearchError(result.error.message);
      return;
    }
    setHistoryLines(result.data?.lines ?? []);
    if (result.data?.retentionDays) setRetentionDays(result.data.retentionDays);
  };

  const saveFile = (content: BlobPart, filename: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadLogs = async () => {
    if (mode === 'live') {
      saveFile(visibleLiveLogs.join('\n'), `logs-${projectId.slice(0, 8)}-live.txt`);
      return;
    }
    // History: let the server write the file — it is not limited to the 500 lines on screen
    setExporting(true);
    const result = await exportProjectLogs(projectId, searchParams());
    setExporting(false);
    if (result.error) {
      setSearchError(result.error.message);
      return;
    }
    if (result.data) saveFile(result.data.blob, result.data.filename);
  };

  return (
    <div className="space-y-4 min-w-0">
      {/* Header: mode switch + controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {(['live', 'history'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                mode === m
                  ? 'dash-accent-fill border'
                  : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
              }`}
            >
              {m === 'live' ? t('logs', 'live') : t('logs', 'history')}
            </button>
          ))}
          {mode === 'live' && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] ml-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: stream.isLive
                    ? 'var(--status-success)'
                    : stream.isConnected
                      ? 'var(--status-warning)'
                      : 'var(--text-muted)',
                }}
              />
              {stream.isLive
                ? t('logs', 'connected')
                : stream.isConnected
                  ? t('logs', 'connecting')
                  : t('logs', 'disconnected')}
              {stream.containerName && (
                <code className="ml-1 text-[var(--text-secondary)]">{stream.containerName}</code>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {mode === 'live' && (
            <>
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className="btn btn-ghost h-8 text-xs"
                title={autoScroll ? t('logs', 'pauseScroll') : t('logs', 'resumeScroll')}
              >
                {autoScroll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {autoScroll ? t('logs', 'pauseScroll') : t('logs', 'resumeScroll')}
              </button>
              <button onClick={stream.reconnect} className="btn btn-ghost h-8 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button onClick={stream.clearLogs} className="btn btn-ghost h-8 text-xs">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button onClick={downloadLogs} disabled={exporting} className="btn btn-ghost h-8 text-xs">
            <Download className="w-3.5 h-3.5" />
            {exporting ? t('logs', 'exporting') : t('logs', 'download')}
          </button>
          <Link
            href={`/dashboard/projects/${projectId}/shell`}
            className="btn btn-ghost h-8 text-xs"
          >
            <Terminal className="w-3.5 h-3.5" />
            {t('logs', 'shell')}
          </Link>
        </div>
      </div>

      {/* Filter / search bar */}
      {mode === 'live' ? (
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('logs', 'filterPlaceholder')}
          className="input w-full text-sm terminal-text"
        />
      ) : (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder={t('logs', 'searchPlaceholder')}
            className="input flex-1 min-w-[12rem] text-sm terminal-text"
          />
          <select
            value={rangeHours}
            onChange={(e) => setRangeHours(Number(e.target.value))}
            className="input w-36 text-sm"
          >
            {RANGES.map((range) => (
              <option key={range.key} value={range.hours}>
                {t('logs', range.key)}
              </option>
            ))}
          </select>
          {containers.length > 1 && (
            <select
              value={container}
              onChange={(e) => setContainer(e.target.value)}
              className="input w-44 text-sm terminal-text"
            >
              <option value="">{t('logs', 'allContainers')}</option>
              {containers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value as typeof logType)}
            className="input w-32 text-sm"
          >
            <option value="all">{t('logs', 'allTypes')}</option>
            <option value="stdout">stdout</option>
            <option value="stderr">stderr</option>
          </select>
          <button onClick={runSearch} disabled={searching} className="btn btn-primary">
            <Search className="w-4 h-4" />
            {searching ? t('logs', 'searching') : t('logs', 'search')}
          </button>
        </div>
      )}

      {/* Log viewport */}
      <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 h-[60vh] overflow-y-auto terminal-text text-xs leading-relaxed">
        {mode === 'live' ? (
          !latestDeployment ? (
            <p className="text-[var(--text-muted)]">{t('logs', 'noDeployment')}</p>
          ) : stream.error ? (
            <p className="text-[var(--status-error)]">{stream.error}</p>
          ) : visibleLiveLogs.length === 0 ? (
            <p className="text-[var(--text-muted)]">{t('logs', 'waiting')}</p>
          ) : (
            <>
              {visibleLiveLogs.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-all">
                  {line}
                </div>
              ))}
              <div ref={bottomRef} />
            </>
          )
        ) : searchError ? (
          <p className="text-[var(--status-error)]">{searchError}</p>
        ) : historyLines === null ? (
          <p className="text-[var(--text-muted)]">{t('logs', 'historyHint')}</p>
        ) : historyLines.length === 0 ? (
          <p className="text-[var(--text-muted)]">{t('logs', 'noResults')}</p>
        ) : (
          historyLines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">
              <span className="text-[var(--text-muted)]">
                [{new Date(line.timestamp).toLocaleString()}]
              </span>{' '}
              {line.containerName && containers.length > 1 && !container && (
                <span className="text-[var(--text-secondary)]">{line.containerName}</span>
              )}{' '}
              {line.logType === 'stderr' && (
                <span className="text-[var(--status-error)]">stderr</span>
              )}{' '}
              {line.content}
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        {t('logs', 'retentionNote').replace('{days}', String(retentionDays))}
      </p>
    </div>
  );
}
