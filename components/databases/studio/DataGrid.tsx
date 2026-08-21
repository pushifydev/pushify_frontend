'use client';

import { ArrowDown, ArrowUp, KeyRound, Pencil } from 'lucide-react';
import type { StudioRows } from '@/lib/api';
import { displayValue, rowKey, type T } from './_shared';

interface DataGridProps {
  data: StudioRows;
  orderBy?: string;
  orderDir: 'asc' | 'desc';
  onSort: (column: string) => void;
  selected: Set<string>;
  onToggleRow: (key: string) => void;
  onToggleAll: () => void;
  onEditRow: (row: Record<string, unknown>) => void;
  /** opens the full-value viewer — grid cells are truncated to one line */
  onCellClick: (column: string, value: unknown) => void;
  /** false hides the selection checkboxes and the row editor */
  canWrite?: boolean;
  t: T;
}

const mono = { fontFamily: 'var(--font-jetbrains-mono), monospace' } as const;

export function DataGrid({
  data,
  orderBy,
  orderDir,
  onSort,
  selected,
  onToggleRow,
  onToggleAll,
  onEditRow,
  onCellClick,
  canWrite = true,
  t,
}: DataGridProps) {
  const editable = data.editable && canWrite;
  const allSelected = data.rows.length > 0 && selected.size === data.rows.length;

  if (data.rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium mb-1">{t('databases', 'studioNoRows')}</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('databases', 'studioNoRowsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
            {editable && (
              <th className="w-9 px-3 py-2.5 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  aria-label="select all"
                  className="cursor-pointer"
                />
              </th>
            )}
            {data.columns.map((column) => {
              const isSorted = orderBy === column.name;
              return (
                <th key={column.name} className="px-3 py-2.5 text-left whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onSort(column.name)}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--text-primary)]"
                    style={{ color: isSorted ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    title={column.dataType}
                  >
                    {column.isPrimaryKey && (
                      <KeyRound className="w-3 h-3" style={{ color: 'var(--accent-cyan)' }} />
                    )}
                    <span className="text-xs font-semibold" style={mono}>
                      {column.name}
                    </span>
                    {isSorted &&
                      (orderDir === 'asc' ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      ))}
                  </button>
                  <span
                    className="block text-[10px] font-normal mt-0.5 truncate max-w-[180px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {column.dataType}
                  </span>
                </th>
              );
            })}
            {editable && <th className="w-10 px-3 py-2.5" />}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, index) => {
            const key = editable ? rowKey(row, data.primaryKey) : String(index);
            const isSelected = selected.has(key);

            return (
              <tr
                key={key}
                style={{
                  borderBottom: '1px solid var(--glass-border)',
                  background: isSelected ? 'var(--dash-accent-bg-md)' : 'transparent',
                }}
              >
                {editable && (
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleRow(key)}
                      aria-label="select row"
                      className="cursor-pointer"
                    />
                  </td>
                )}
                {data.columns.map((column) => {
                  const { text, isNull } = displayValue(row[column.name]);
                  return (
                    <td key={column.name} className="px-3 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => onCellClick(column.name, row[column.name])}
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
                {editable && (
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onEditRow(row)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      title={t('databases', 'studioEditRow')}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
