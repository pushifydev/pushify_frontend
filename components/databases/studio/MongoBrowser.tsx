'use client';

import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileJson,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Modal, ModalActions, AlertBox } from '@/components/Modal';
import {
  useCreateMongoCollection,
  useDeleteMongoDocuments,
  useDropMongoCollection,
  useInsertMongoDocument,
  useMongoCollections,
  useMongoDocuments,
  useReplaceMongoDocument,
} from '@/hooks';
import { panelStyle, type T } from './_shared';

interface MongoBrowserProps {
  databaseId: string;
  enabled: boolean;
  t: T;
}

const mono = { fontFamily: 'var(--font-jetbrains-mono), monospace' } as const;
const PAGE_SIZE = 25;

/** The `_id` as extended JSON — what the API needs to address a single document. */
function documentId(document: Record<string, unknown>): string {
  return JSON.stringify(document._id ?? null);
}

export function MongoBrowser({ databaseId, enabled, t }: MongoBrowserProps) {
  const [collection, setCollection] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  const [appliedQuery, setAppliedQuery] = useState({ filter: '', sort: '' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editor, setEditor] = useState<{ mode: 'insert' | 'edit'; id?: string; value: string } | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [newCollection, setNewCollection] = useState<string | null>(null);
  const [confirmDrop, setConfirmDrop] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: collections = [], isLoading: collectionsLoading } = useMongoCollections(
    databaseId,
    enabled
  );

  const active = collection ?? collections[0]?.name ?? null;

  const query = useMemo(
    () =>
      active
        ? {
            collection: active,
            filter: appliedQuery.filter || undefined,
            sort: appliedQuery.sort || undefined,
            page,
            pageSize: PAGE_SIZE,
          }
        : null,
    [active, appliedQuery, page]
  );

  const { data: documents, isFetching, error, refetch } = useMongoDocuments(databaseId, query);

  const createCollection = useCreateMongoCollection(databaseId);
  const dropCollection = useDropMongoCollection(databaseId);
  const insertDocument = useInsertMongoDocument(databaseId);
  const replaceDocument = useReplaceMongoDocument(databaseId);
  const deleteDocuments = useDeleteMongoDocuments(databaseId);

  const totalPages = documents ? Math.max(1, Math.ceil(documents.total / documents.pageSize)) : 1;

  const selectCollection = (name: string) => {
    setCollection(name);
    setPage(1);
    setSelected(new Set());
    setFilter('');
    setSort('');
    setAppliedQuery({ filter: '', sort: '' });
  };

  const saveDocument = async () => {
    if (!editor || !active) return;
    setEditorError(null);

    try {
      JSON.parse(editor.value);
    } catch {
      setEditorError(t('databases', 'studioInvalidJson'));
      return;
    }

    try {
      if (editor.mode === 'insert') {
        await insertDocument.mutateAsync({ collection: active, document: editor.value });
        toast.success(t('databases', 'studioDocumentInserted'));
      } else {
        await replaceDocument.mutateAsync({
          collection: active,
          id: editor.id!,
          document: editor.value,
        });
        toast.success(t('databases', 'studioDocumentUpdated'));
      }
      setEditor(null);
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
      {/* Collections */}
      <div className="flex flex-col overflow-hidden" style={{ ...panelStyle, maxHeight: '72vh' }}>
        <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <button
            type="button"
            onClick={() => setNewCollection('')}
            className="btn btn-secondary text-sm w-full"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('databases', 'studioNewCollection')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {collectionsLoading ? (
            <div className="space-y-1 px-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 rounded-lg animate-pulse"
                  style={{ background: 'var(--hover-overlay)' }}
                />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              {t('databases', 'studioNoCollections')}
            </p>
          ) : (
            <ul className="px-2 space-y-0.5">
              {collections.map((entry) => {
                const isActive = entry.name === active;
                return (
                  <li key={entry.name}>
                    <button
                      type="button"
                      onClick={() => selectCollection(entry.name)}
                      className="w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2.5"
                      style={{
                        background: isActive ? 'var(--dash-accent-bg-md)' : 'transparent',
                        border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'transparent'}`,
                      }}
                    >
                      <FileJson
                        className="w-3.5 h-3.5 mt-0.5 shrink-0"
                        style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm truncate" style={mono}>
                          {entry.name}
                        </span>
                        <span
                          className="block text-[11px] mt-0.5"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          ~{entry.count.toLocaleString()} {t('databases', 'studioDocuments')}
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

      {/* Documents */}
      <div className="min-w-0 overflow-hidden" style={panelStyle}>
        {!active ? (
          <div className="py-20 text-center">
            <p className="text-sm font-medium mb-1">{t('databases', 'studioSelectCollection')}</p>
          </div>
        ) : (
          <>
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              style={{ borderBottom: '1px solid var(--glass-border)' }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={mono}>
                  {active}
                </p>
                {documents && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {documents.totalCapped ? '10.000+' : documents.total.toLocaleString()}{' '}
                    {t('databases', 'studioDocuments')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="btn btn-secondary text-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                  {t('databases', 'studioRefresh')}
                </button>

                {selected.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="btn btn-secondary text-sm"
                    style={{ color: 'var(--status-error)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('databases', 'studioDeleteSelected')} ({selected.size})
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setConfirmDrop(true)}
                  className="btn btn-secondary text-sm"
                  style={{ color: 'var(--status-error)' }}
                >
                  {t('databases', 'studioDropCollection')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditorError(null);
                    setEditor({ mode: 'insert', value: '{\n  \n}' });
                  }}
                  className="btn btn-primary text-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('databases', 'studioNewDocument')}
                </button>
              </div>
            </div>

            {/* Query bar */}
            <div
              className="flex flex-wrap items-center gap-2 px-4 py-2.5"
              style={{ borderBottom: '1px solid var(--glass-border)' }}
            >
              <div className="relative flex-1" style={{ minWidth: 220 }}>
                <Search
                  className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder='{"status":"active"}'
                  className="input w-full text-sm"
                  style={{ ...mono, paddingLeft: 32 }}
                />
              </div>
              <input
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                placeholder='{"createdAt":-1}'
                className="input text-sm"
                style={{ ...mono, minWidth: 180 }}
              />
              <button
                type="button"
                onClick={() => {
                  setAppliedQuery({ filter, sort });
                  setPage(1);
                }}
                className="btn btn-secondary text-sm"
              >
                {t('databases', 'studioApply')}
              </button>
            </div>

            {error ? (
              <p className="px-4 py-6 text-sm" style={{ color: 'var(--status-error)' }}>
                {error instanceof Error ? error.message : String(error)}
              </p>
            ) : !documents ? (
              <div className="px-4 py-6 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg animate-pulse"
                    style={{ background: 'var(--hover-overlay)' }}
                  />
                ))}
              </div>
            ) : documents.documents.length === 0 ? (
              <p className="px-4 py-10 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                {t('databases', 'studioNoDocuments')}
              </p>
            ) : (
              <ul style={{ maxHeight: '52vh', overflowY: 'auto' }}>
                {documents.documents.map((document) => {
                  const id = documentId(document);
                  const isSelected = selected.has(id);

                  return (
                    <li
                      key={id}
                      className="px-4 py-3"
                      style={{
                        borderBottom: '1px solid var(--glass-border)',
                        background: isSelected ? 'var(--dash-accent-bg-md)' : 'transparent',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(id)) next.delete(id);
                              else next.add(id);
                              return next;
                            })
                          }
                          className="mt-1 cursor-pointer"
                          aria-label="select document"
                        />
                        <pre
                          className="flex-1 min-w-0 text-xs whitespace-pre-wrap break-words"
                          style={{ ...mono, color: 'var(--text-secondary)', maxHeight: 180, overflow: 'auto' }}
                        >
                          {JSON.stringify(document, null, 2)}
                        </pre>
                        <button
                          type="button"
                          onClick={() => {
                            setEditorError(null);
                            setEditor({
                              mode: 'edit',
                              id,
                              value: JSON.stringify(document, null, 2),
                            });
                          }}
                          className="p-1.5 rounded-md shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                          title={t('databases', 'studioEditDocument')}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {documents && documents.documents.length > 0 && (
              <div
                className="flex items-center justify-between gap-3 px-4 py-2.5"
                style={{ borderTop: '1px solid var(--glass-border)' }}
              >
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {t('databases', 'studioPageInfo')} {documents.page} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={documents.page <= 1}
                    className="btn btn-secondary text-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={documents.documents.length < documents.pageSize}
                    className="btn btn-secondary text-sm"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Document editor */}
      {editor && (
        <Modal
          isOpen
          onClose={() => setEditor(null)}
          title={
            editor.mode === 'insert'
              ? t('databases', 'studioNewDocument')
              : t('databases', 'studioEditDocument')
          }
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <textarea
              value={editor.value}
              onChange={(e) => setEditor({ ...editor, value: e.target.value })}
              rows={16}
              spellCheck={false}
              className="input w-full text-sm"
              style={{ ...mono, resize: 'vertical' }}
            />

            {editorError && <AlertBox variant="error">{editorError}</AlertBox>}

            <ModalActions>
              <button type="button" onClick={() => setEditor(null)} className="btn btn-secondary">
                {t('common', 'cancel')}
              </button>
              <button
                type="button"
                onClick={saveDocument}
                disabled={insertDocument.isPending || replaceDocument.isPending}
                className="btn btn-primary"
              >
                {(insertDocument.isPending || replaceDocument.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {t('common', 'save')}
              </button>
            </ModalActions>
          </div>
        </Modal>
      )}

      {/* New collection */}
      {newCollection !== null && (
        <Modal
          isOpen
          onClose={() => setNewCollection(null)}
          title={t('databases', 'studioNewCollection')}
          maxWidth="md"
        >
          <div className="space-y-4">
            <input
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              placeholder="events"
              className="input w-full text-sm"
              style={mono}
              autoFocus
            />
            <ModalActions>
              <button
                type="button"
                onClick={() => setNewCollection(null)}
                className="btn btn-secondary"
              >
                {t('common', 'cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newCollection.trim()) return;
                  try {
                    await createCollection.mutateAsync(newCollection.trim());
                    toast.success(t('databases', 'studioCollectionCreated'));
                    selectCollection(newCollection.trim());
                    setNewCollection(null);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : String(err));
                  }
                }}
                disabled={createCollection.isPending}
                className="btn btn-primary"
              >
                {createCollection.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('databases', 'studioCreateCollection')}
              </button>
            </ModalActions>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        variant="danger"
        title={t('databases', 'studioDeleteDocumentsTitle')}
        description={t('databases', 'studioDeleteDocumentsConfirm')}
        confirmText={t('common', 'delete')}
        cancelText={t('common', 'cancel')}
        loading={deleteDocuments.isPending}
        onConfirm={async () => {
          if (!active) return;
          try {
            await deleteDocuments.mutateAsync({
              collection: active,
              ids: `[${[...selected].join(',')}]`,
            });
            toast.success(t('databases', 'studioDocumentsDeleted'));
            setSelected(new Set());
            setConfirmDelete(false);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : String(err));
          }
        }}
      />

      <ConfirmDialog
        open={confirmDrop}
        onOpenChange={setConfirmDrop}
        variant="danger"
        title={t('databases', 'studioDropCollection')}
        description={t('databases', 'studioDropCollectionConfirm')}
        confirmText={t('common', 'delete')}
        cancelText={t('common', 'cancel')}
        loading={dropCollection.isPending}
        onConfirm={async () => {
          if (!active) return;
          try {
            await dropCollection.mutateAsync(active);
            toast.success(t('databases', 'studioCollectionDropped'));
            setCollection(null);
            setConfirmDrop(false);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : String(err));
          }
        }}
      />
    </div>
  );
}
