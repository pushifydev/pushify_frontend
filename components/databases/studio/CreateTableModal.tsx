'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from '@/components/Modal';
import type { StudioCreateTableInput, StudioTypeInfo } from '@/lib/api';
import {
  ColumnFields,
  defaultIdColumn,
  emptyColumn,
  normalizeColumn,
  type DraftColumn,
} from './ColumnFields';
import type { T } from './_shared';

interface CreateTableModalProps {
  isOpen: boolean;
  types: StudioTypeInfo[];
  schema: string;
  pending: boolean;
  onClose: () => void;
  onSubmit: (input: StudioCreateTableInput) => Promise<void>;
  t: T;
}

export function CreateTableModal({
  isOpen,
  types,
  schema,
  pending,
  onClose,
  onSubmit,
  t,
}: CreateTableModalProps) {
  const [name, setName] = useState('');
  const [columns, setColumns] = useState<DraftColumn[]>(() => [defaultIdColumn(types)]);
  const [error, setError] = useState<string | null>(null);

  const patchColumn = (index: number, patch: Partial<DraftColumn>) => {
    setColumns((prev) => prev.map((column, i) => (i === index ? { ...column, ...patch } : column)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t('databases', 'studioTableNameRequired'));
      return;
    }

    const prepared = columns.map((column) => normalizeColumn(column, types));
    if (prepared.some((column) => !column.name)) {
      setError(t('databases', 'studioColumnNameRequired'));
      return;
    }

    try {
      await onSubmit({ schema, name: name.trim(), columns: prepared });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('databases', 'studioNewTable')}
      description={t('databases', 'studioNewTableDesc')}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('databases', 'studioTableName')}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="posts"
            className="input w-full text-sm"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t('databases', 'studioColumns')}
          </label>

          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
            {columns.map((column, index) => (
              <div
                key={index}
                className="rounded-lg px-3 py-3"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <ColumnFields
                      column={column}
                      types={types}
                      onChange={(patch) => patchColumn(index, patch)}
                      t={t}
                    />
                  </div>
                  {columns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setColumns((prev) => prev.filter((_, i) => i !== index))}
                      className="p-1.5 rounded-md shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                      title={t('common', 'delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setColumns((prev) => [...prev, emptyColumn(types)])}
            className="btn btn-secondary text-sm mt-3"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('databases', 'studioAddColumn')}
          </button>
        </div>

        {error && <AlertBox variant="error">{error}</AlertBox>}

        <ModalActions>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {t('common', 'cancel')}
          </button>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('databases', 'studioCreateTable')}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}
