'use client';

import { useMemo, useState } from 'react';
import { Search, Table2, Eye, KeyRound, Plus } from 'lucide-react';
import type { StudioTable } from '@/lib/api';
import { formatBytes } from '@/lib/formatters';
import { panelStyle, type T } from './_shared';

interface TableListPanelProps {
  tables: StudioTable[];
  loading: boolean;
  selected: StudioTable | null;
  onSelect: (table: StudioTable) => void;
  /** omitted for read-only access */
  onCreate?: () => void;
  t: T;
}

export function TableListPanel({
  tables,
  loading,
  selected,
  onSelect,
  onCreate,
  t,
}: TableListPanelProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tables;
    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(term) || table.schema.toLowerCase().includes(term)
    );
  }, [tables, search]);

  // Only worth showing the schema prefix when more than one schema is in play.
  const showSchema = useMemo(() => new Set(tables.map((tb) => tb.schema)).size > 1, [tables]);

  return (
    <div className="flex flex-col overflow-hidden" style={{ ...panelStyle, maxHeight: '72vh' }}>
      <div className="px-3 py-3 space-y-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        {onCreate && (
          <button type="button" onClick={onCreate} className="btn btn-secondary text-sm w-full">
            <Plus className="w-3.5 h-3.5" />
            {t('databases', 'studioNewTable')}
          </button>
        )}

        <div className="relative">
          <Search
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('databases', 'studioSearchTables')}
            className="input w-full text-sm"
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="space-y-1 px-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-lg animate-pulse"
                style={{ background: 'var(--hover-overlay)' }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            {tables.length === 0
              ? t('databases', 'studioNoTables')
              : t('databases', 'studioNoMatchingTables')}
          </p>
        ) : (
          <ul className="px-2 space-y-0.5">
            {filtered.map((table) => {
              const isActive =
                selected?.name === table.name && selected?.schema === table.schema;
              const Icon = table.kind === 'view' ? Eye : Table2;

              return (
                <li key={`${table.schema}.${table.name}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(table)}
                    className="w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-start gap-2.5"
                    style={{
                      background: isActive ? 'var(--dash-accent-bg-md)' : 'transparent',
                      border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'transparent'}`,
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5 mt-0.5 shrink-0"
                      style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="text-sm truncate"
                          style={{
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-jetbrains-mono), monospace',
                          }}
                        >
                          {showSchema ? `${table.schema}.${table.name}` : table.name}
                        </span>
                        {table.hasPrimaryKey && (
                          <KeyRound
                            className="w-3 h-3 shrink-0"
                            style={{ color: 'var(--text-muted)' }}
                          />
                        )}
                      </span>
                      <span
                        className="block text-[11px] mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {table.kind === 'view'
                          ? t('databases', 'studioView')
                          : `~${table.rowEstimate.toLocaleString()} ${t('databases', 'studioRowsLabel')}`}
                        {table.sizeBytes ? ` · ${formatBytes(table.sizeBytes)}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
