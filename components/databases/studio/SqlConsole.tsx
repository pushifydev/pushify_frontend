'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  Braces,
  Download,
  Eraser,
  Gauge,
  Loader2,
  Play,
  Sparkles,
  TextSelect,
  Trash2,
} from 'lucide-react';
import { format as formatSql } from 'sql-formatter';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { exportStudioQuery, type StudioQueryResult, type StudioSchemaMap } from '@/lib/api';
import {
  clearHistory,
  pushHistory,
  readHistory,
  type StudioHistoryEntry,
} from '@/lib/studio-history';
import { CellDetailModal } from './CellDetailModal';
import { SchemaExplorer } from './SchemaExplorer';
import type { SqlEditorHandle } from './SqlEditor';
import { displayValue, panelStyle, type T } from './_shared';

// CodeMirror touches the DOM on load, so it stays out of the server bundle.
const SqlEditor = dynamic(() => import('./SqlEditor').then((m) => m.SqlEditor), {
  ssr: false,
  loading: () => (
    <div className="px-4 py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
      …
    </div>
  ),
});

interface SqlConsoleProps {
  databaseId: string;
  /** seeds the editor when the console is opened from somewhere else (e.g. a slow query) */
  initialSql?: string;
  schemaMap: StudioSchemaMap | undefined;
  schemaLoading: boolean;
  onRun: (sql: string, allowWrite: boolean) => Promise<StudioQueryResult | undefined>;
  pending: boolean;
  t: T;
}

type ResultTab = 'result' | 'message' | 'history';

const mono = { fontFamily: 'var(--font-jetbrains-mono), monospace' } as const;

export function SqlConsole({
  databaseId,
  initialSql,
  schemaMap,
  schemaLoading,
  onRun,
  pending,
  t,
}: SqlConsoleProps) {
  const [sql, setSql] = useState(initialSql ?? '');
  const [allowWrite, setAllowWrite] = useState(false);
  const [confirmWrite, setConfirmWrite] = useState(false);
  const [result, setResult] = useState<StudioQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ResultTab>('result');
  const [history, setHistory] = useState<StudioHistoryEntry[]>(() => readHistory(databaseId));
  const [detail, setDetail] = useState<{ column: string; value: unknown } | null>(null);
  const [lastRunSql, setLastRunSql] = useState('');
  const [exporting, setExporting] = useState(false);

  const editorRef = useRef<SqlEditorHandle | null>(null);
  const engine = schemaMap?.engine ?? 'postgresql';

  const execute = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;

      setError(null);
      const startedAt = Date.now();

      try {
        const next = await onRun(trimmed, allowWrite);
        setResult(next ?? null);
        setLastRunSql(trimmed);
        setTab(next && next.rows.length > 0 ? 'result' : 'message');
        setHistory(
          pushHistory(databaseId, {
            sql: trimmed,
            durationMs: next?.durationMs ?? Date.now() - startedAt,
            rowCount: next?.rowCount ?? null,
            ok: true,
            writeMode: allowWrite,
          })
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setResult(null);
        setError(message);
        setTab('message');
        setHistory(
          pushHistory(databaseId, {
            sql: trimmed,
            durationMs: Date.now() - startedAt,
            rowCount: null,
            ok: false,
            error: message,
            writeMode: allowWrite,
          })
        );
      }
    },
    [allowWrite, databaseId, onRun, pending]
  );

  // Cmd+Enter and the Run button both send the selection when there is one.
  const runActive = useCallback(() => {
    void execute(editorRef.current?.getActiveText() ?? sql);
  }, [execute, sql]);

  const runExplain = useCallback(() => {
    const text = (editorRef.current?.getActiveText() ?? sql).trim().replace(/;\s*$/, '');
    if (!text) return;
    void execute(/^explain\b/i.test(text) ? text : `EXPLAIN ${text}`);
  }, [execute, sql]);

  const formatQuery = () => {
    try {
      setSql(
        formatSql(sql, {
          language: engine === 'mysql' ? 'mysql' : 'postgresql',
          keywordCase: 'upper',
        })
      );
    } catch {
      toast.error(t('databases', 'studioFormatFailed'));
    }
  };

  const download = async (fileFormat: 'csv' | 'json') => {
    if (!lastRunSql) return;
    setExporting(true);
    try {
      await exportStudioQuery(databaseId, { sql: lastRunSql, format: fileFormat });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  };

  const canExport = Boolean(result && result.rows.length > 0 && lastRunSql);

  const stats = useMemo(() => {
    if (!result) return null;
    const parts = [`${result.rowCount} ${t('databases', 'studioRowsLabel')}`, `${result.durationMs}ms`];
    if (result.command) parts.unshift(result.command);
    if (result.affected !== null) {
      parts.push(`${result.affected} ${t('databases', 'studioAffectedRows')}`);
    }
    return parts.join(' · ');
  }, [result, t]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
      <div className="hidden lg:block">
        <SchemaExplorer
          tables={schemaMap?.tables ?? []}
          loading={schemaLoading}
          truncated={schemaMap?.truncated ?? false}
          onInsert={(text) => editorRef.current?.insertAtCursor(text)}
          t={t}
        />
      </div>

      <div className="min-w-0 space-y-4">
        {/* Editor */}
        <div className="overflow-hidden" style={panelStyle}>
          <div
            className="flex flex-wrap items-center gap-2 px-3 py-2"
            style={{ borderBottom: '1px solid var(--glass-border)' }}
          >
            <button
              type="button"
              onClick={runActive}
              disabled={pending || !sql.trim()}
              className="btn btn-primary text-sm"
              title="⌘↵"
            >
              {pending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              {pending ? t('databases', 'studioRunning') : t('databases', 'studioRunQuery')}
            </button>

            <button
              type="button"
              onClick={runExplain}
              disabled={pending || !sql.trim()}
              className="btn btn-secondary text-sm"
            >
              <Gauge className="w-3.5 h-3.5" />
              {t('databases', 'studioExplain')}
            </button>

            <button
              type="button"
              onClick={formatQuery}
              disabled={!sql.trim()}
              className="btn btn-secondary text-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('databases', 'studioFormat')}
            </button>

            <button
              type="button"
              onClick={() => {
                setSql('');
                setResult(null);
                setError(null);
              }}
              disabled={!sql}
              className="btn btn-ghost text-sm"
            >
              <Eraser className="w-3.5 h-3.5" />
              {t('databases', 'studioClear')}
            </button>

            <span className="flex-1" />

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={allowWrite}
                onChange={(e) => {
                  // Turning writes on is the dangerous direction, so it gets a confirmation.
                  if (e.target.checked) setConfirmWrite(true);
                  else setAllowWrite(false);
                }}
                className="cursor-pointer"
              />
              <span
                style={{ color: allowWrite ? 'var(--status-warning)' : 'var(--text-muted)' }}
              >
                {allowWrite
                  ? t('databases', 'studioWriteMode')
                  : t('databases', 'studioReadOnlyMode')}
              </span>
            </label>
          </div>

          <SqlEditor
            value={sql}
            engine={engine}
            tables={schemaMap?.tables ?? []}
            onChange={setSql}
            onRun={runActive}
            editorRef={editorRef}
          />

          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 text-[11px]"
            style={{ borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
          >
            <span className="inline-flex items-center gap-1">
              <TextSelect className="w-3 h-3" />
              {t('databases', 'studioSelectionHint')}
            </span>
          </div>
        </div>

        {allowWrite && (
          <div
            className="flex items-start gap-2.5 rounded-xl px-4 py-3"
            style={{
              background: 'rgba(234,179,8,0.08)',
              border: '1px solid rgba(234,179,8,0.2)',
            }}
          >
            <AlertTriangle
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: 'var(--status-warning)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('databases', 'studioWriteModeHint')}
            </p>
          </div>
        )}

        {/* Results */}
        <div className="overflow-hidden" style={panelStyle}>
          <div
            className="flex flex-wrap items-center gap-2 px-3 py-2"
            style={{ borderBottom: '1px solid var(--glass-border)' }}
          >
            <div
              className="inline-flex p-0.5 rounded-lg"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              {(['result', 'message', 'history'] as ResultTab[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background: tab === value ? 'var(--bg-secondary)' : 'transparent',
                    color: tab === value ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {value === 'result'
                    ? t('databases', 'studioTabResult')
                    : value === 'message'
                      ? t('databases', 'studioTabMessages')
                      : t('databases', 'studioTabHistory')}
                </button>
              ))}
            </div>

            {stats && (
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {stats}
              </span>
            )}

            {result?.truncated && (
              <span className="text-[11px]" style={{ color: 'var(--status-warning)' }}>
                {t('databases', 'studioQueryTruncated')}
              </span>
            )}

            <span className="flex-1" />

            {canExport && (
              <>
                <button
                  type="button"
                  onClick={() => download('csv')}
                  disabled={exporting}
                  className="btn btn-secondary text-xs py-1"
                >
                  {exporting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => download('json')}
                  disabled={exporting}
                  className="btn btn-secondary text-xs py-1"
                >
                  <Braces className="w-3 h-3" />
                  JSON
                </button>
              </>
            )}
          </div>

          {tab === 'result' &&
            (result && result.rows.length > 0 ? (
              <div className="overflow-x-auto" style={{ maxHeight: '50vh' }}>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      {result.columns.map((column) => (
                        <th
                          key={column}
                          className="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap"
                          style={{ ...mono, color: 'var(--text-secondary)' }}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        {result.columns.map((column) => {
                          const { text, isNull } = displayValue(row[column]);
                          return (
                            <td key={column} className="px-3 py-2 align-top">
                              <button
                                type="button"
                                onClick={() => setDetail({ column, value: row[column] })}
                                className="block max-w-[320px] truncate text-xs text-left"
                                style={{
                                  ...mono,
                                  color: isNull ? 'var(--text-muted)' : 'var(--text-secondary)',
                                  fontStyle: isNull ? 'italic' : 'normal',
                                }}
                                title={t('databases', 'studioViewValue')}
                              >
                                {text === '' ? '—' : text}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-4 py-8 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                {t('databases', 'studioQueryEmpty')}
              </p>
            ))}

          {tab === 'message' && (
            <div className="px-4 py-3">
              {error ? (
                <pre
                  className="text-xs whitespace-pre-wrap"
                  style={{ ...mono, color: 'var(--status-error)' }}
                >
                  {error}
                </pre>
              ) : (
                <pre
                  className="text-xs whitespace-pre-wrap"
                  style={{ ...mono, color: 'var(--text-secondary)' }}
                >
                  {result?.message ?? t('databases', 'studioNoMessages')}
                </pre>
              )}
            </div>
          )}

          {tab === 'history' &&
            (history.length === 0 ? (
              <p className="px-4 py-8 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                {t('databases', 'studioNoHistory')}
              </p>
            ) : (
              <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                <div className="flex justify-end px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setHistory(clearHistory(databaseId))}
                    className="btn btn-ghost text-xs py-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {t('databases', 'studioClearHistory')}
                  </button>
                </div>
                <ul>
                  {history.map((entry) => (
                    <li key={entry.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                      <button
                        type="button"
                        onClick={() => setSql(entry.sql)}
                        className="w-full text-left px-3 py-2"
                        title={t('databases', 'studioLoadQuery')}
                      >
                        <span
                          className="block text-xs truncate"
                          style={{
                            ...mono,
                            color: entry.ok ? 'var(--text-secondary)' : 'var(--status-error)',
                          }}
                        >
                          {entry.sql}
                        </span>
                        <span
                          className="block text-[10px] mt-0.5"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {new Date(entry.at).toLocaleTimeString()}
                          {entry.durationMs !== null ? ` · ${entry.durationMs}ms` : ''}
                          {entry.rowCount !== null
                            ? ` · ${entry.rowCount} ${t('databases', 'studioRowsLabel')}`
                            : ''}
                          {entry.writeMode ? ` · ${t('databases', 'studioWriteMode')}` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>

      {detail && (
        <CellDetailModal
          column={detail.column}
          value={detail.value}
          onClose={() => setDetail(null)}
          t={t}
        />
      )}

      <ConfirmDialog
        open={confirmWrite}
        onOpenChange={setConfirmWrite}
        variant="warning"
        title={t('databases', 'studioWriteModeConfirmTitle')}
        description={t('databases', 'studioWriteModeConfirmBody')}
        confirmText={t('databases', 'studioWriteMode')}
        cancelText={t('common', 'cancel')}
        onConfirm={() => {
          setAllowWrite(true);
          setConfirmWrite(false);
        }}
      />
    </div>
  );
}
