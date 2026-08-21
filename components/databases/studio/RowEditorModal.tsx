'use client';

import { useMemo, useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from '@/components/Modal';
import type { StudioColumn } from '@/lib/api';
import { displayValue, type T } from './_shared';

interface FieldState {
  value: string;
  isNull: boolean;
  /** untouched fields are left out of the payload, so the column keeps its default */
  touched: boolean;
}

interface RowEditorModalProps {
  isOpen: boolean;
  mode: 'insert' | 'update';
  columns: StudioColumn[];
  row: Record<string, unknown> | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  t: T;
}

/** Long text and json values get a textarea instead of a single-line input. */
function isMultiline(column: StudioColumn, value: string): boolean {
  return /text|json|jsonb|blob/i.test(column.dataType) || value.includes('\n') || value.length > 80;
}

function initialState(columns: StudioColumn[], row: Record<string, unknown> | null): Record<string, FieldState> {
  const state: Record<string, FieldState> = {};
  for (const column of columns) {
    const raw = row ? row[column.name] : undefined;
    const isNull = row ? raw === null || raw === undefined : false;
    const { text } = displayValue(raw);
    state[column.name] = {
      value: row && !isNull ? text : '',
      isNull,
      touched: false,
    };
  }
  return state;
}

export function RowEditorModal({
  isOpen,
  mode,
  columns,
  row,
  pending,
  onClose,
  onSubmit,
  t,
}: RowEditorModalProps) {
  // The parent mounts this modal per edit (keyed by row), so the initial state is the reset.
  const [fields, setFields] = useState<Record<string, FieldState>>(() =>
    initialState(columns, row)
  );
  const [error, setError] = useState<string | null>(null);

  const editableColumns = useMemo(() => columns.filter((c) => c.editable), [columns]);
  const readOnlyColumns = useMemo(() => columns.filter((c) => !c.editable), [columns]);

  const update = (name: string, patch: Partial<FieldState>) => {
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], ...patch, touched: true },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const values: Record<string, unknown> = {};
    for (const column of editableColumns) {
      const field = fields[column.name];
      if (!field?.touched) continue;
      values[column.name] = field.isNull ? null : field.value;
    }

    if (Object.keys(values).length === 0) {
      setError(t('databases', 'studioNoValues'));
      return;
    }

    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'insert' ? t('databases', 'studioNewRow') : t('databases', 'studioEditRow')}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          {editableColumns.map((column) => {
            const field = fields[column.name] ?? { value: '', isNull: false, touched: false };
            const multiline = isMultiline(column, field.value);

            return (
              <div key={column.name}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium">
                    {column.isPrimaryKey && (
                      <KeyRound className="w-3 h-3" style={{ color: 'var(--accent-cyan)' }} />
                    )}
                    <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                      {column.name}
                    </span>
                    <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                      {column.dataType}
                    </span>
                  </label>

                  {column.isNullable && (
                    <label
                      className="flex items-center gap-1.5 text-xs cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <input
                        type="checkbox"
                        checked={field.isNull}
                        onChange={(e) => update(column.name, { isNull: e.target.checked })}
                        className="cursor-pointer"
                      />
                      {t('databases', 'studioSetNull')}
                    </label>
                  )}
                </div>

                {multiline ? (
                  <textarea
                    value={field.isNull ? '' : field.value}
                    disabled={field.isNull}
                    onChange={(e) => update(column.name, { value: e.target.value, isNull: false })}
                    rows={3}
                    className="input w-full text-sm"
                    style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', resize: 'vertical' }}
                  />
                ) : (
                  <input
                    type="text"
                    value={field.isNull ? '' : field.value}
                    disabled={field.isNull}
                    onChange={(e) => update(column.name, { value: e.target.value, isNull: false })}
                    placeholder={
                      mode === 'insert' && column.defaultValue
                        ? `${t('databases', 'studioDefaultValue')}: ${column.defaultValue}`
                        : ''
                    }
                    className="input w-full text-sm"
                    style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  />
                )}
              </div>
            );
          })}

          {readOnlyColumns.map((column) => (
            <div key={column.name}>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                {column.name}
              </label>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t('databases', 'studioColumnNotEditable')}
              </p>
            </div>
          ))}
        </div>

        {error && <AlertBox variant="error">{error}</AlertBox>}

        <ModalActions>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {t('common', 'cancel')}
          </button>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('common', 'save')}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}
