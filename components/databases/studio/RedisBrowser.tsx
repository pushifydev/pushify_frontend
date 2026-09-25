'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Key, Loader2, RefreshCw, Search, Timer, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  useDeleteRedisKeys,
  useRedisKey,
  useRedisKeys,
  useSetRedisExpiry,
  useSetRedisStringValue,
} from '@/hooks';
import { panelStyle, type T } from './_shared';

interface RedisBrowserProps {
  databaseId: string;
  enabled: boolean;
  t: T;
}

const mono = { fontFamily: 'var(--font-mono)' } as const;

function formatTtl(ttl: number, t: T): string {
  if (ttl === -1) return t('databases', 'studioNoExpiry');
  if (ttl === -2) return t('databases', 'studioKeyMissing');
  if (ttl < 60) return `${ttl}s`;
  if (ttl < 3600) return `${Math.round(ttl / 60)}m`;
  if (ttl < 86400) return `${Math.round(ttl / 3600)}h`;
  return `${Math.round(ttl / 86400)}d`;
}

export function RedisBrowser({ databaseId, enabled, t }: RedisBrowserProps) {
  const [pattern, setPattern] = useState('*');
  const [appliedPattern, setAppliedPattern] = useState('*');
  const [cursor, setCursor] = useState('0');
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [ttlDraft, setTtlDraft] = useState('');
  const [valueDraft, setValueDraft] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: page, isFetching, error, refetch } = useRedisKeys(
    databaseId,
    { cursor, pattern: appliedPattern },
    enabled
  );
  const { data: value, isLoading: valueLoading } = useRedisKey(databaseId, activeKey);

  const deleteKeys = useDeleteRedisKeys(databaseId);
  const setExpiry = useSetRedisExpiry(databaseId);
  const setStringValue = useSetRedisStringValue(databaseId);

  const applyPattern = () => {
    setAppliedPattern(pattern.trim() || '*');
    setCursor('0');
    setCursorStack([]);
    setSelected(new Set());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
      {/* Keys */}
      <div className="flex flex-col overflow-hidden" style={{ ...panelStyle, maxHeight: '72vh' }}>
        <div className="px-3 py-3 space-y-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyPattern();
              }}
              placeholder="user:*"
              aria-label={t('common', 'search')}
              className="input w-full text-sm py-2!"
              style={{ ...mono, paddingLeft: 32 }}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="dash-mono-caption tabular-nums">
              {page ? `${page.keyCount.toLocaleString()} ${t('databases', 'studioKeysTotal')}` : ''}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="btn btn-ghost btn-sm"
                aria-label={t('common', 'refresh')}
                title={t('common', 'refresh')}
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--status-error)' }}
                  aria-label={`${t('common', 'delete')} (${selected.size})`}
                >
                  <Trash2 className="w-3 h-3" />
                  {selected.size}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {error ? (
            <p className="px-4 py-6 text-sm" style={{ color: 'var(--status-error)' }}>
              {error instanceof Error ? error.message : String(error)}
            </p>
          ) : !page ? (
            <div className="space-y-1 px-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-md animate-pulse"
                  style={{ background: 'var(--hover-overlay)' }}
                />
              ))}
            </div>
          ) : page.keys.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              {t('databases', 'studioNoKeys')}
            </p>
          ) : (
            <ul className="px-2 space-y-0.5">
              {page.keys.map((key) => {
                const isActive = key.name === activeKey;
                return (
                  <li key={key.name} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.has(key.name)}
                      onChange={() =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(key.name)) next.delete(key.name);
                          else next.add(key.name);
                          return next;
                        })
                      }
                      className="cursor-pointer shrink-0"
                      aria-label="select key"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveKey(key.name);
                        setTtlDraft('');
                        setValueDraft(null);
                      }}
                      aria-current={isActive ? 'true' : undefined}
                      className="flex-1 min-w-0 text-left px-2 py-1.5 rounded-md transition-colors hover:bg-(--hover-overlay-md) focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--text-primary)"
                      style={isActive ? { background: 'var(--hover-overlay-lg)' } : undefined}
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] px-1 py-0.5 rounded-sm shrink-0 uppercase tracking-[0.06em]"
                          style={{
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-label)',
                          }}
                        >
                          {key.type}
                        </span>
                        <span className="text-xs truncate" style={{ ...mono, color: 'var(--text-secondary)' }}>
                          {key.name}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* SCAN is cursor-based, so paging goes forward and back through the cursors we have seen. */}
        <div
          className="flex items-center justify-between gap-2 px-3 py-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button
            type="button"
            onClick={() => {
              const previous = [...cursorStack];
              const last = previous.pop() ?? '0';
              setCursorStack(previous);
              setCursor(last);
            }}
            disabled={cursorStack.length === 0}
            className="btn btn-secondary btn-sm"
            aria-label={t('databases', 'studioPrevPage')}
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="dash-mono-caption tabular-nums">
            {page?.cursor === '0' ? t('databases', 'studioScanEnd') : ''}
          </span>
          <button
            type="button"
            onClick={() => {
              if (!page || page.cursor === '0') return;
              setCursorStack((prev) => [...prev, cursor]);
              setCursor(page.cursor);
            }}
            disabled={!page || page.cursor === '0'}
            className="btn btn-secondary btn-sm"
            aria-label={t('databases', 'studioNextPage')}
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Value */}
      <div className="min-w-0 overflow-hidden" style={panelStyle}>
        {!activeKey ? (
          <div className="py-20 text-center">
            <Key className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
            <p className="text-sm font-medium">{t('databases', 'studioSelectKey')}</p>
          </div>
        ) : valueLoading || !value ? (
          <div className="px-4 py-6 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-6 rounded animate-pulse"
                style={{ background: 'var(--hover-overlay)' }}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="dash-toolbar justify-between gap-3! px-4! py-2.5!">
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate" style={mono}>
                  {value.name}
                </p>
                <p className="dash-mono-caption mt-0.5 tabular-nums">
                  {value.type} · {value.size.toLocaleString()} · {formatTtl(value.ttl, t)}
                  {value.truncated ? ` · ${t('databases', 'studioValueTruncated')}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={ttlDraft}
                  onChange={(e) => setTtlDraft(e.target.value)}
                  placeholder={t('databases', 'studioTtlSeconds')}
                  aria-label={t('databases', 'studioTtlSeconds')}
                  className="input text-sm py-1.5!"
                  style={{ width: 130 }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const seconds = ttlDraft.trim() === '' ? null : Number(ttlDraft);
                      await setExpiry.mutateAsync({ key: value.name, seconds });
                      toast.success(t('databases', 'studioTtlUpdated'));
                      setTtlDraft('');
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : String(err));
                    }
                  }}
                  disabled={setExpiry.isPending}
                  className="btn btn-secondary btn-sm"
                >
                  {setExpiry.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Timer className="w-3.5 h-3.5" />
                  )}
                  {t('databases', 'studioSetTtl')}
                </button>
              </div>
            </div>

            <div className="px-4 py-4">
              {value.type === 'string' ? (
                <div className="space-y-3">
                  <textarea
                    value={valueDraft ?? value.value ?? ''}
                    onChange={(e) => setValueDraft(e.target.value)}
                    rows={10}
                    spellCheck={false}
                    className="input w-full text-sm"
                    style={{ ...mono, resize: 'vertical' }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await setStringValue.mutateAsync({
                          key: value.name,
                          value: valueDraft ?? value.value ?? '',
                        });
                        toast.success(t('databases', 'studioValueUpdated'));
                        setValueDraft(null);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : String(err));
                      }
                    }}
                    disabled={setStringValue.isPending || valueDraft === null}
                    className="btn btn-primary btn-sm"
                  >
                    {setStringValue.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {t('common', 'save')}
                  </button>
                </div>
              ) : value.entries && value.entries.length > 0 ? (
                <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
                  <tbody>
                    {value.entries.map((entry, index) => (
                      <tr key={`${entry.field}-${index}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td className="px-2 py-1.5 text-xs align-top" style={{ ...mono, color: 'var(--text-primary)', width: '35%' }}>
                          {entry.field}
                        </td>
                        <td className="px-2 py-1.5 text-xs align-top" style={{ ...mono, color: 'var(--text-secondary)' }}>
                          {entry.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              ) : value.items && value.items.length > 0 ? (
                <ul className="space-y-1">
                  {value.items.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="text-xs px-2 py-1.5 rounded"
                      style={{ ...mono, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {value.type === 'none'
                    ? t('databases', 'studioKeyMissing')
                    : t('databases', 'studioEmptyValue')}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        variant="danger"
        title={t('databases', 'studioDeleteKeysTitle')}
        description={t('databases', 'studioDeleteKeysConfirm')}
        confirmText={t('common', 'delete')}
        cancelText={t('common', 'cancel')}
        loading={deleteKeys.isPending}
        onConfirm={async () => {
          try {
            await deleteKeys.mutateAsync([...selected]);
            toast.success(t('databases', 'studioKeysDeleted'));
            if (activeKey && selected.has(activeKey)) setActiveKey(null);
            setSelected(new Set());
            setConfirmDelete(false);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : String(err));
          }
        }}
      />
    </div>
  );
}
