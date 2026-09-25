'use client';

import { useState } from 'react';
import { Eraser, KeyRound, Loader2, Plus, Trash2 } from 'lucide-react';
import { Modal, AlertBox } from '@/components/Modal';
import type {
  StudioColumn,
  StudioColumnDefinition,
  StudioEngine,
  StudioIndex,
  StudioTypeInfo,
} from '@/lib/api';
import { IndexSection } from './IndexSection';
import { ColumnFields, emptyColumn, normalizeColumn, type DraftColumn } from './ColumnFields';
import { iconButtonClass, type T } from './_shared';

interface TableSchemaModalProps {
  isOpen: boolean;
  table: { schema: string; name: string; kind: 'table' | 'view'; columns: StudioColumn[] };
  types: StudioTypeInfo[];
  engine: StudioEngine;
  indexes: StudioIndex[];
  indexesLoading: boolean;
  pending: { add: boolean; drop: boolean; rename: boolean; indexCreate: boolean; indexDrop: boolean };
  onClose: () => void;
  onAddColumn: (column: StudioColumnDefinition) => Promise<void>;
  onDropColumn: (name: string) => Promise<void>;
  onRename: (newName: string) => Promise<void>;
  onCreateIndex: (input: {
    name?: string;
    columns: string[];
    unique: boolean;
    method?: string;
  }) => Promise<void>;
  onDropIndex: (name: string) => Promise<void>;
  /** the destructive table-level actions are confirmed on the page, not inside this modal */
  onRequestTruncate: () => void;
  onRequestDrop: () => void;
  t: T;
}

const mono = { fontFamily: 'var(--font-mono)' } as const;

export function TableSchemaModal({
  isOpen,
  table,
  types,
  engine,
  indexes,
  indexesLoading,
  pending,
  onClose,
  onAddColumn,
  onDropColumn,
  onRename,
  onCreateIndex,
  onDropIndex,
  onRequestTruncate,
  onRequestDrop,
  t,
}: TableSchemaModalProps) {
  const [newName, setNewName] = useState(table.name);
  const [draft, setDraft] = useState<DraftColumn | null>(null);
  const [confirmColumn, setConfirmColumn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isView = table.kind === 'view';

  const run = async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('databases', 'studioStructure')}
      description={`${table.schema}.${table.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {isView && <AlertBox variant="info">{t('databases', 'studioReadOnlyView')}</AlertBox>}

        {/* Columns */}
        <div>
          <h3 className="dash-section-label mb-2">{t('databases', 'studioColumns')}</h3>
          <div
            className="rounded-[10px] overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            {table.columns.map((column, index) => (
              <div
                key={column.name}
                className="flex items-center gap-3 px-3 py-2"
                style={{
                  borderTop: index === 0 ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    {column.isPrimaryKey && (
                      <KeyRound className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                    )}
                    <span className="text-sm truncate" style={mono}>
                      {column.name}
                    </span>
                  </span>
                  <span className="block dash-mono-caption mt-0.5">
                    {column.dataType}
                    {column.isNullable ? '' : ' · NOT NULL'}
                    {column.defaultValue ? ` · ${t('databases', 'studioColumnDefault')}: ${column.defaultValue}` : ''}
                  </span>
                </div>

                {!isView &&
                  (confirmColumn === column.name ? (
                    <span className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          run(async () => {
                            await onDropColumn(column.name);
                            setConfirmColumn(null);
                          })
                        }
                        disabled={pending.drop}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--status-error)' }}
                      >
                        {pending.drop && <Loader2 className="w-3 h-3 animate-spin" />}
                        {t('common', 'delete')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmColumn(null)}
                        className="btn btn-ghost btn-sm"
                      >
                        {t('common', 'cancel')}
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmColumn(column.name)}
                      className={`${iconButtonClass} hover:text-(--status-error)!`}
                      title={t('databases', 'studioDropColumn')}
                      aria-label={t('databases', 'studioDropColumn')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Add column */}
        {!isView &&
          (draft ? (
            <div
              className="rounded-[10px] px-3 py-3 space-y-3"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
            >
              <ColumnFields
                column={draft}
                types={types}
                allowKeyFlags={false}
                onChange={(patch) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev))}
                t={t}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    run(async () => {
                      const column = normalizeColumn(draft, types);
                      if (!column.name) {
                        setError(t('databases', 'studioColumnNameRequired'));
                        return;
                      }
                      await onAddColumn(column);
                      setDraft(null);
                    })
                  }
                  disabled={pending.add}
                  className="btn btn-primary btn-sm"
                >
                  {pending.add && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t('databases', 'studioAddColumn')}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="btn btn-secondary btn-sm"
                >
                  {t('common', 'cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDraft(emptyColumn(types))}
              className="btn btn-secondary btn-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('databases', 'studioAddColumn')}
            </button>
          ))}

        {/* Indexes */}
        {!isView && (
          <IndexSection
            engine={engine}
            columns={table.columns}
            indexes={indexes}
            loading={indexesLoading}
            pending={{ create: pending.indexCreate, drop: pending.indexDrop }}
            onCreate={onCreateIndex}
            onDrop={onDropIndex}
            t={t}
          />
        )}

        {/* Rename */}
        {!isView && (
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('databases', 'studioRenameTable')}
            </label>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input text-sm flex-1"
                style={mono}
              />
              <button
                type="button"
                onClick={() => run(() => onRename(newName.trim()))}
                disabled={pending.rename || !newName.trim() || newName.trim() === table.name}
                className="btn btn-secondary btn-sm"
              >
                {pending.rename && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t('common', 'save')}
              </button>
            </div>
          </div>
        )}

        {error && <AlertBox variant="error">{error}</AlertBox>}

        {/* Destructive actions — confirmed outside this modal */}
        {!isView && (
          <div
            className="rounded-[10px] px-3 py-3 flex flex-wrap items-center justify-between gap-3"
            style={{
              background: 'color-mix(in srgb, var(--status-error) 6%, var(--bg-secondary))',
              border: '1px solid color-mix(in srgb, var(--status-error) 30%, var(--border-subtle))',
            }}
          >
            <p className="dash-section-label" style={{ color: 'var(--status-error)' }}>
              {t('databases', 'studioDangerZone')}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRequestTruncate}
                className="btn btn-secondary btn-sm"
              >
                <Eraser className="w-3.5 h-3.5" />
                {t('databases', 'studioTruncateTable')}
              </button>
              <button
                type="button"
                onClick={onRequestDrop}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--status-error)' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('databases', 'studioDropTable')}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
