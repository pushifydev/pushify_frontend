'use client';

import { useState } from 'react';
import { KeyRound, Loader2, Plus, Trash2 } from 'lucide-react';
import type { StudioColumn, StudioEngine, StudioIndex } from '@/lib/api';
import { formatBytes } from '@/lib/formatters';
import type { T } from './_shared';

interface IndexSectionProps {
  engine: StudioEngine;
  columns: StudioColumn[];
  indexes: StudioIndex[];
  loading: boolean;
  pending: { create: boolean; drop: boolean };
  onCreate: (input: { name?: string; columns: string[]; unique: boolean; method?: string }) => Promise<void>;
  onDrop: (name: string) => Promise<void>;
  t: T;
}

const mono = { fontFamily: 'var(--font-jetbrains-mono), monospace' } as const;

/** Methods the backend will accept, per engine. */
const METHODS: Record<StudioEngine, string[]> = {
  postgresql: ['btree', 'hash', 'gin', 'gist', 'brin'],
  mysql: ['btree', 'hash'],
};

export function IndexSection({
  engine,
  columns,
  indexes,
  loading,
  pending,
  onCreate,
  onDrop,
  t,
}: IndexSectionProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [unique, setUnique] = useState(false);
  const [method, setMethod] = useState('btree');
  const [confirmDrop, setConfirmDrop] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleColumn = (column: string) =>
    setSelected((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );

  const submit = async () => {
    setError(null);
    if (selected.length === 0) {
      setError(t('databases', 'studioIndexColumnsRequired'));
      return;
    }
    try {
      await onCreate({
        name: name.trim() || undefined,
        columns: selected,
        unique,
        method: method || undefined,
      });
      setOpen(false);
      setName('');
      setSelected([]);
      setUnique(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <p className="text-sm font-medium mb-2">{t('databases', 'studioIndexes')}</p>

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
        {loading ? (
          <p className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('common', 'loading')}
          </p>
        ) : indexes.length === 0 ? (
          <p className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('databases', 'studioNoIndexes')}
          </p>
        ) : (
          indexes.map((index, position) => (
            <div
              key={index.name}
              className="flex items-center gap-3 px-3 py-2"
              style={{ borderTop: position === 0 ? 'none' : '1px solid var(--glass-border)' }}
            >
              <div className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  {index.isPrimary && (
                    <KeyRound className="w-3 h-3 shrink-0" style={{ color: 'var(--accent-cyan)' }} />
                  )}
                  <span className="text-sm truncate" style={mono}>
                    {index.name}
                  </span>
                  {index.isUnique && !index.isPrimary && (
                    <span className="badge badge-neutral text-[10px]">
                      {t('databases', 'studioUnique')}
                    </span>
                  )}
                </span>
                <span className="block text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {index.columns.join(', ')}
                  {index.method ? ` · ${index.method}` : ''}
                  {index.sizeBytes ? ` · ${formatBytes(index.sizeBytes)}` : ''}
                </span>
              </div>

              {!index.isPrimary &&
                (confirmDrop === index.name ? (
                  <span className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        setError(null);
                        try {
                          await onDrop(index.name);
                          setConfirmDrop(null);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : String(err));
                        }
                      }}
                      disabled={pending.drop}
                      className="btn btn-secondary text-xs py-1"
                      style={{ color: 'var(--status-error)' }}
                    >
                      {pending.drop && <Loader2 className="w-3 h-3 animate-spin" />}
                      {t('common', 'delete')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDrop(null)}
                      className="btn btn-ghost text-xs py-1"
                    >
                      {t('common', 'cancel')}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDrop(index.name)}
                    className="p-1.5 rounded-md shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                    title={t('databases', 'studioDropIndex')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ))}
            </div>
          ))
        )}
      </div>

      {open ? (
        <div
          className="rounded-lg px-3 py-3 mt-3 space-y-3"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
        >
          <div className="flex flex-wrap gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('databases', 'studioIndexNamePlaceholder')}
              className="input text-sm flex-1"
              style={{ ...mono, minWidth: 180 }}
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="input text-sm"
              style={{ ...mono, minWidth: 110 }}
            >
              {METHODS[engine].map((candidate) => (
                <option key={candidate} value={candidate}>
                  {candidate}
                </option>
              ))}
            </select>
            <label
              className="flex items-center gap-1.5 text-xs cursor-pointer px-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <input
                type="checkbox"
                checked={unique}
                onChange={(e) => setUnique(e.target.checked)}
                className="cursor-pointer"
              />
              {t('databases', 'studioUnique')}
            </label>
          </div>

          <div>
            <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('databases', 'studioIndexColumns')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {columns.map((column) => {
                const active = selected.includes(column.name);
                const order = selected.indexOf(column.name) + 1;
                return (
                  <button
                    key={column.name}
                    type="button"
                    onClick={() => toggleColumn(column.name)}
                    className="px-2 py-1 rounded-md text-xs"
                    style={{
                      ...mono,
                      background: active ? 'var(--dash-accent-bg-md)' : 'transparent',
                      border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--glass-border)'}`,
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {active ? `${order}. ` : ''}
                    {column.name}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--status-error)' }}>
              {error}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={pending.create}
              className="btn btn-primary text-sm"
            >
              {pending.create && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {t('databases', 'studioCreateIndex')}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-secondary text-sm"
            >
              {t('common', 'cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary text-sm mt-3">
          <Plus className="w-3.5 h-3.5" />
          {t('databases', 'studioCreateIndex')}
        </button>
      )}
    </div>
  );
}
