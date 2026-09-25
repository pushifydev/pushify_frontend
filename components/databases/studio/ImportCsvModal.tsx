'use client';

import { useMemo, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from '@/components/Modal';
import type { StudioColumn } from '@/lib/api';
import { detectDelimiter, parseCsv } from '@/lib/csv-parse';
import { monoStyle, type T } from './_shared';

interface ImportCsvModalProps {
  table: string;
  columns: StudioColumn[];
  onClose: () => void;
  /** sends one batch; the modal loops so it can report progress */
  onImportBatch: (columns: string[], rows: (string | null)[][], emptyAsNull: boolean) => Promise<number>;
  t: T;
}

const mono = monoStyle;
const BATCH_SIZE = 500;
const PREVIEW_ROWS = 5;

export function ImportCsvModal({ table, columns, onClose, onImportBatch, t }: ImportCsvModalProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [malformed, setMalformed] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [emptyAsNull, setEmptyAsNull] = useState(true);
  const [mapping, setMapping] = useState<(string | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const editable = useMemo(() => columns.filter((column) => column.editable), [columns]);
  const headerRow = hasHeader ? rows[0] : null;
  const dataRows = useMemo(() => (hasHeader ? rows.slice(1) : rows), [rows, hasHeader]);

  const readFile = async (file: File) => {
    setError(null);
    setProgress(null);

    const text = await file.text();
    const parsed = parseCsv(text, detectDelimiter(text));

    if (parsed.rows.length === 0) {
      setError(t('databases', 'studioCsvEmpty'));
      return;
    }

    setFileName(file.name);
    setRows(parsed.rows);
    setMalformed(parsed.malformed);

    // Guess the mapping from the header, falling back to position.
    const first = parsed.rows[0];
    setMapping(
      first.map((cell, index) => {
        const byName = editable.find(
          (column) => column.name.toLowerCase() === cell.trim().toLowerCase()
        );
        return byName?.name ?? editable[index]?.name ?? null;
      })
    );
  };

  const mappedColumns = mapping
    .map((column, index) => ({ column, index }))
    .filter((entry): entry is { column: string; index: number } => Boolean(entry.column));

  const runImport = async () => {
    setError(null);

    if (mappedColumns.length === 0) {
      setError(t('databases', 'studioCsvNoMapping'));
      return;
    }

    const payloadColumns = mappedColumns.map((entry) => entry.column);
    const batches: (string | null)[][][] = [];

    for (let index = 0; index < dataRows.length; index += BATCH_SIZE) {
      batches.push(
        dataRows
          .slice(index, index + BATCH_SIZE)
          .map((row) => mappedColumns.map((entry) => row[entry.index] ?? null))
      );
    }

    setProgress({ done: 0, total: dataRows.length });

    try {
      let done = 0;
      for (const batch of batches) {
        await onImportBatch(payloadColumns, batch, emptyAsNull);
        done += batch.length;
        setProgress({ done, total: dataRows.length });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setProgress(null);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t('databases', 'studioImportCsv')}
      description={table}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <label
          className="flex items-center gap-3 px-4 py-4 rounded-[10px] cursor-pointer transition-colors hover:border-(--border-strong)! focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--text-primary)"
          style={{ border: '1px dashed var(--border-default)', background: 'var(--bg-tertiary)' }}
        >
          <FileUp className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
          <span className={`text-sm truncate ${fileName ? 'font-mono' : ''}`} style={{ color: 'var(--text-secondary)' }}>
            {fileName ?? t('databases', 'studioChooseCsv')}
          </span>
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void readFile(file);
            }}
          />
        </label>

        {rows.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="cursor-pointer accent-(--text-primary)"
                />
                {t('databases', 'studioCsvHasHeader')}
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emptyAsNull}
                  onChange={(e) => setEmptyAsNull(e.target.checked)}
                  className="cursor-pointer accent-(--text-primary)"
                />
                {t('databases', 'studioCsvEmptyAsNull')}
              </label>
              <span className="dash-mono-caption tabular-nums ml-auto">
                {dataRows.length.toLocaleString()} {t('databases', 'studioRowsLabel')}
              </span>
            </div>

            {malformed && <AlertBox variant="warning">{t('databases', 'studioCsvMalformed')}</AlertBox>}

            {/* Mapping + preview in one table: each column header is its target picker. */}
            <div className="overflow-x-auto rounded-[10px]" style={{ border: '1px solid var(--border-subtle)' }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
                    {mapping.map((column, index) => (
                      <th key={index} className="px-2 py-2 text-left align-top">
                        <select
                          value={column ?? ''}
                          onChange={(e) =>
                            setMapping((prev) =>
                              prev.map((entry, position) =>
                                position === index ? e.target.value || null : entry
                              )
                            )
                          }
                          className="select text-xs! py-1.5! w-full"
                          style={{ ...mono, minWidth: 130 }}
                          aria-label={headerRow?.[index] ?? `#${index + 1}`}
                        >
                          <option value="">{t('databases', 'studioCsvSkipColumn')}</option>
                          {editable.map((candidate) => (
                            <option key={candidate.name} value={candidate.name}>
                              {candidate.name}
                            </option>
                          ))}
                        </select>
                        {headerRow && (
                          <span className="block dash-mono-caption text-[10px]! font-normal mt-1 truncate">
                            {headerRow[index]}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.slice(0, PREVIEW_ROWS).map((row, rowIndex) => (
                    <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {mapping.map((_, columnIndex) => (
                        <td
                          key={columnIndex}
                          className="px-2 py-1.5 text-xs"
                          style={{ ...mono, color: 'var(--text-secondary)' }}
                        >
                          <span className="block max-w-50 truncate">
                            {row[columnIndex] ?? ''}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {progress && (
          <div className="space-y-1">
            <div
              className="dash-metric-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.done}
            >
              <div
                className="dash-metric-fill"
                style={{ width: `${Math.round((progress.done / Math.max(1, progress.total)) * 100)}%` }}
              />
            </div>
            <p className="dash-mono-caption tabular-nums">
              {progress.done.toLocaleString()} / {progress.total.toLocaleString()}
            </p>
          </div>
        )}

        {error && <AlertBox variant="error">{error}</AlertBox>}

        <ModalActions>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {t('common', 'cancel')}
          </button>
          <button
            type="button"
            onClick={runImport}
            disabled={dataRows.length === 0 || progress !== null}
            className="btn btn-primary"
          >
            {progress !== null && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('databases', 'studioImport')}
          </button>
        </ModalActions>
      </div>
    </Modal>
  );
}
