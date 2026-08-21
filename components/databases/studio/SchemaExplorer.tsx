'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Eye, Search, Table2 } from 'lucide-react';
import type { StudioSchemaTable } from '@/lib/api';
import { panelStyle, type T } from './_shared';

interface SchemaExplorerProps {
  tables: StudioSchemaTable[];
  loading: boolean;
  truncated: boolean;
  /** clicking a table or column drops its name into the editor at the cursor */
  onInsert: (text: string) => void;
  t: T;
}

const mono = { fontFamily: 'var(--font-jetbrains-mono), monospace' } as const;

export function SchemaExplorer({ tables, loading, truncated, onInsert, t }: SchemaExplorerProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tables;
    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(term) ||
        table.columns.some((column) => column.name.toLowerCase().includes(term))
    );
  }, [tables, search]);

  const showSchema = useMemo(() => new Set(tables.map((tb) => tb.schema)).size > 1, [tables]);

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="flex flex-col overflow-hidden" style={{ ...panelStyle, maxHeight: '70vh' }}>
      <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="relative">
          <Search
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('databases', 'studioSearchSchema')}
            className="input w-full text-sm"
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="space-y-1 px-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-7 rounded-md animate-pulse"
                style={{ background: 'var(--hover-overlay)' }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            {t('databases', 'studioNoTables')}
          </p>
        ) : (
          <ul className="px-1.5">
            {filtered.map((table) => {
              const key = `${table.schema}.${table.name}`;
              const isOpen = expanded.has(key);
              const label = showSchema ? key : table.name;
              const Icon = table.kind === 'view' ? Eye : Table2;

              return (
                <li key={key}>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="p-1 rounded"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label={label}
                    >
                      {isOpen ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onInsert(label)}
                      className="flex-1 min-w-0 flex items-center gap-1.5 px-1 py-1 rounded text-left"
                      title={t('databases', 'studioInsertName')}
                    >
                      <Icon className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
                      <span
                        className="text-xs truncate"
                        style={{ ...mono, color: 'var(--text-secondary)' }}
                      >
                        {label}
                      </span>
                    </button>
                  </div>

                  {isOpen && (
                    <ul className="ml-6 mb-1 space-y-0.5">
                      {table.columns.map((column) => (
                        <li key={column.name}>
                          <button
                            type="button"
                            onClick={() => onInsert(column.name)}
                            className="w-full text-left px-1.5 py-0.5 rounded flex items-baseline gap-2"
                            title={t('databases', 'studioInsertName')}
                          >
                            <span
                              className="text-xs truncate"
                              style={{ ...mono, color: 'var(--text-secondary)' }}
                            >
                              {column.name}
                            </span>
                            <span
                              className="text-[10px] truncate"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {column.dataType}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {truncated && (
          <p className="px-3 py-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {t('databases', 'studioSchemaTruncated')}
          </p>
        )}
      </div>
    </div>
  );
}
