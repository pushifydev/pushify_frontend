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
import { Select } from '@/components/ui/select';

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
  const { locale } = useTranslation();
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
    <div className="space-y-3 min-w-0">
      <div className="dash-card overflow-hidden min-w-0">
        {/* Toolbar: mode switch, stream state, actions */}
        <div className="dash-toolbar justify-between">
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <div className="dash-segmented" role="group" aria-label={t('logs', 'title')}>
              {(['live', 'history'] as Mode[]).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m}>
                  {m === 'live' ? t('logs', 'live') : t('logs', 'history')}
                </button>
              ))}
            </div>
            {mode === 'live' && (
              <span className="flex items-center gap-2 min-w-0 font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]" role="status">
                <span
                  className={`dash-status-dot ${stream.isLive ? 'is-success' : stream.isConnected ? 'is-warning' : ''}`}
                  aria-hidden
                />
                {stream.isLive
                  ? t('logs', 'connected')
                  : stream.isConnected
                    ? t('logs', 'connecting')
                    : t('logs', 'disconnected')}
                {stream.containerName && (
                  <code className="normal-case tracking-normal text-[var(--text-secondary)] truncate">{stream.containerName}</code>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {mode === 'live' && (
              <>
                <button
                  type="button"
                  onClick={() => setAutoScroll(!autoScroll)}
                  className="btn btn-ghost btn-sm"
                  title={autoScroll ? t('logs', 'pauseScroll') : t('logs', 'resumeScroll')}
                >
                  {autoScroll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{autoScroll ? t('logs', 'pauseScroll') : t('logs', 'resumeScroll')}</span>
                </button>
                <button
                  type="button"
                  onClick={stream.reconnect}
                  className="btn btn-ghost btn-sm"
                  aria-label={t('logs', 'reconnect')}
                  title={t('logs', 'reconnect')}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={stream.clearLogs}
                  className="btn btn-ghost btn-sm"
                  aria-label={t('common', 'delete')}
                  title={t('common', 'delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button type="button" onClick={downloadLogs} disabled={exporting} className="btn btn-ghost btn-sm">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{exporting ? t('logs', 'exporting') : t('logs', 'download')}</span>
            </button>
            <Link
              href={`/dashboard/projects/${projectId}/shell`}
              className="btn btn-secondary btn-sm ml-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              {t('logs', 'shell')}
            </Link>
          </div>
        </div>

        {/* Filter / search bar */}
        <div className="dash-toolbar">
          {mode === 'live' ? (
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" aria-hidden />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={t('logs', 'filterPlaceholder')}
                aria-label={t('logs', 'filterPlaceholder')}
                className="input w-full !py-1.5 !pl-8 text-[13px] terminal-text"
              />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
              <div className="relative flex-1 min-w-[12rem]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" aria-hidden />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                  placeholder={t('logs', 'searchPlaceholder')}
                  aria-label={t('logs', 'searchPlaceholder')}
                  className="input w-full !py-1.5 !pl-8 text-[13px] terminal-text"
                />
              </div>
              <Select
                size="sm"
                value={String(rangeHours)}
                onValueChange={(v) => setRangeHours(Number(v))}
                className="sm:w-36"
                aria-label={locale === 'tr' ? 'Zaman aralığı' : 'Time range'}
                options={RANGES.map((range) => ({ value: String(range.hours), label: t('logs', range.key) }))}
              />
              {containers.length > 1 && (
                <Select
                  size="sm"
                  value={container}
                  onValueChange={setContainer}
                  className="sm:w-44"
                  aria-label={locale === 'tr' ? 'Konteyner' : 'Container'}
                  mono
                  options={[
                    { value: '', label: t('logs', 'allContainers') },
                    ...containers.map((name) => ({ value: name, label: name })),
                  ]}
                />
              )}
              <Select
                size="sm"
                value={logType}
                onValueChange={(v) => setLogType(v as typeof logType)}
                className="sm:w-32"
                aria-label={locale === 'tr' ? 'Log türü' : 'Log type'}
                options={[
                  { value: 'all', label: t('logs', 'allTypes') },
                  { value: 'stdout', label: 'stdout' },
                  { value: 'stderr', label: 'stderr' },
                ]}
              />
              <button type="button" onClick={runSearch} disabled={searching} className="btn btn-primary btn-sm !h-auto">
                <Search className="w-4 h-4" />
                {searching ? t('logs', 'searching') : t('logs', 'search')}
              </button>
            </div>
          )}
        </div>

        {/* Log viewport */}
        <div
          className="bg-[var(--bg-primary)] px-4 py-3 h-[60vh] overflow-y-auto terminal-text text-xs leading-relaxed text-[var(--text-secondary)]"
          role="log"
          aria-live="off"
        >
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
      </div>

      <p className="dash-mono-caption">
        {t('logs', 'retentionNote').replace('{days}', String(retentionDays))}
      </p>
    </div>
  );
}
