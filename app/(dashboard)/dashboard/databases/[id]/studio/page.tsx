'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Columns3,
  FileUp,
  Filter,
  Info,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAddStudioColumn,
  useCreateStudioIndex,
  useCreateStudioTable,
  useDropStudioIndex,
  useDatabase,
  useDeleteStudioRows,
  useDropStudioColumn,
  useDropStudioTable,
  useCancelStudioQuery,
  useImportStudioRows,
  useInsertStudioRow,
  useRenameStudioTable,
  useRunStudioQuery,
  useStudioIndexes,
  useStudioPerformance,
  useStudioRows,
  useStudioSchemaMap,
  useStudioTables,
  useTranslation,
  useTruncateStudioTable,
  useUpdateStudioRow,
} from '@/hooks';
import type { StudioFilter, StudioTable } from '@/lib/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  CellDetailModal,
  CreateTableModal,
  DataGrid,
  ImportCsvModal,
  MongoBrowser,
  PerformancePanel,
  RedisBrowser,
  FilterBar,
  RowEditorModal,
  SqlConsole,
  TableListPanel,
  TableSchemaModal,
  panelStyle,
  pickPrimaryKey,
  rowKey,
} from '@/components/databases/studio';

const PAGE_SIZE = 50;

export default function DatabaseStudioPage() {
  const params = useParams();
  const databaseId = params.id as string;
  const { t } = useTranslation();

  const [tab, setTab] = useState<'data' | 'sql' | 'performance'>('data');
  const [consolePrefill, setConsolePrefill] = useState<{ sql: string; nonce: number } | null>(null);
  const [pickedTable, setPickedTable] = useState<StudioTable | null>(null);
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<string | undefined>();
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<StudioFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editorMode, setEditorMode] = useState<'insert' | 'update' | null>(null);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [createTableOpen, setCreateTableOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [confirmTruncate, setConfirmTruncate] = useState(false);
  const [confirmDropTable, setConfirmDropTable] = useState(false);
  const [cellDetail, setCellDetail] = useState<{ column: string; value: unknown } | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data: database } = useDatabase(databaseId);
  const isSql = database?.type === 'postgresql' || database?.type === 'mysql';
  const isMongo = database?.type === 'mongodb';
  const isRedis = database?.type === 'redis';
  const isSupported = isSql || isMongo || isRedis;
  const isRunning = database?.status === 'running';

  const {
    data: tableList,
    isLoading: tablesLoading,
    error: tablesError,
  } = useStudioTables(databaseId, !!database && isSql && isRunning);

  // The console's autocomplete source; only fetched once the SQL tab is actually opened.
  const { data: schemaMap, isLoading: schemaLoading } = useStudioSchemaMap(
    databaseId,
    tab === 'sql' && !!database && isSql && isRunning
  );

  // A read-granted member browses the same UI without the actions that would 403.
  const canWrite = tableList?.access !== 'read';

  // Fall back to the first table so the page never lands on an empty right pane.
  const selectedTable = pickedTable ?? tableList?.tables[0] ?? null;

  const rowsQuery = useMemo(
    () =>
      selectedTable
        ? {
            schema: selectedTable.schema,
            table: selectedTable.name,
            page,
            pageSize: PAGE_SIZE,
            orderBy,
            orderDir,
            filters,
          }
        : null,
    [selectedTable, page, orderBy, orderDir, filters]
  );

  const { data: rows, isFetching: rowsFetching, error: rowsError, refetch } = useStudioRows(
    databaseId,
    rowsQuery
  );

  // Indexes are only fetched while the structure modal is open.
  const { data: indexes = [], isLoading: indexesLoading } = useStudioIndexes(
    databaseId,
    schemaOpen && selectedTable
      ? { schema: selectedTable.schema, table: selectedTable.name }
      : null
  );

  const {
    data: performance,
    isLoading: performanceLoading,
    isFetching: performanceFetching,
    error: performanceError,
    refetch: refetchPerformance,
  } = useStudioPerformance(
    databaseId,
    tab === 'performance' && !!database && isSql && isRunning
  );

  const insertRow = useInsertStudioRow(databaseId);
  const updateRow = useUpdateStudioRow(databaseId);
  const deleteRows = useDeleteStudioRows(databaseId);
  const runQuery = useRunStudioQuery(databaseId);
  const createTable = useCreateStudioTable(databaseId);
  const dropTable = useDropStudioTable(databaseId);
  const truncateTable = useTruncateStudioTable(databaseId);
  const renameTable = useRenameStudioTable(databaseId);
  const addColumn = useAddStudioColumn(databaseId);
  const dropColumn = useDropStudioColumn(databaseId);
  const importRows = useImportStudioRows(databaseId);
  const cancelQuery = useCancelStudioQuery(databaseId);
  const createIndex = useCreateStudioIndex(databaseId);
  const dropIndex = useDropStudioIndex(databaseId);

  const selectTable = (table: StudioTable) => {
    setPickedTable(table);
    setPage(1);
    setOrderBy(undefined);
    setOrderDir('asc');
    setFilters([]);
    setSelectedRows(new Set());
  };

  const toggleSort = (column: string) => {
    if (orderBy === column) {
      setOrderDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(column);
      setOrderDir('asc');
    }
    setPage(1);
  };

  const totalPages = rows ? Math.max(1, Math.ceil(rows.total / rows.pageSize)) : 1;

  const notSupportedNotice = database && !isSupported;
  const notRunningNotice = database && isSupported && !isRunning;

  return (
    <div className="max-w-[1400px] mx-auto pb-10 animate-slide-in">
      <Link
        href={`/dashboard/databases/${databaseId}`}
        className="inline-flex items-center gap-2 text-sm mb-5 transition-colors hover:text-[var(--text-primary)]"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        {database?.name ?? t('databases', 'title')}
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-semibold">{t('databases', 'studioTitle')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('databases', 'studioSubtitle')}
          </p>
        </div>

        {isSql && (
        <div
          className="inline-flex p-1 rounded-lg"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
        >
          {(['data', 'sql', 'performance'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{
                background: tab === value ? 'var(--bg-secondary)' : 'transparent',
                color: tab === value ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {value === 'data'
                ? t('databases', 'studioTabData')
                : value === 'sql'
                  ? t('databases', 'studioTabSql')
                  : t('databases', 'studioTabPerformance')}
            </button>
          ))}
        </div>
        )}
      </div>

      {(notSupportedNotice || notRunningNotice) && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {notSupportedNotice
              ? t('databases', 'studioUnsupportedEngine')
              : t('databases', 'studioMustBeRunning')}
          </p>
        </div>
      )}

      {tablesError && (
        <div
          className="rounded-xl px-4 py-3 mb-5 text-sm"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--status-error)',
          }}
        >
          {tablesError instanceof Error ? tablesError.message : String(tablesError)}
        </div>
      )}

      {isMongo ? (
        <MongoBrowser databaseId={databaseId} enabled={!!isRunning} t={t} />
      ) : isRedis ? (
        <RedisBrowser databaseId={databaseId} enabled={!!isRunning} t={t} />
      ) : tab === 'performance' ? (
        <PerformancePanel
          data={performance}
          loading={performanceLoading}
          fetching={performanceFetching}
          error={performanceError}
          onRefresh={() => refetchPerformance()}
          onCancel={async (id) => {
            try {
              const result = await cancelQuery.mutateAsync(id);
              toast.success(
                result?.cancelled
                  ? t('databases', 'studioQueryCancelled')
                  : t('databases', 'studioQueryGone')
              );
            } catch (err) {
              toast.error(err instanceof Error ? err.message : String(err));
            }
          }}
          cancelling={cancelQuery.isPending}
          onOpenInConsole={(sql) => {
            setConsolePrefill({ sql, nonce: Date.now() });
            setTab('sql');
          }}
          t={t}
        />
      ) : tab === 'sql' ? (
        <SqlConsole
          key={consolePrefill?.nonce ?? 'console'}
          initialSql={consolePrefill?.sql}
          databaseId={databaseId}
          schemaMap={schemaMap}
          schemaLoading={schemaLoading}
          pending={runQuery.isPending}
          onRun={(sql, allowWrite) => runQuery.mutateAsync({ sql, allowWrite })}
          t={t}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          <TableListPanel
            tables={tableList?.tables ?? []}
            loading={tablesLoading}
            selected={selectedTable}
            onSelect={selectTable}
            onCreate={canWrite ? () => setCreateTableOpen(true) : undefined}
            t={t}
          />

          <div className="min-w-0 overflow-hidden" style={panelStyle}>
            {!selectedTable ? (
              <div className="py-20 text-center">
                <p className="text-sm font-medium mb-1">{t('databases', 'studioSelectTable')}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {t('databases', 'studioSelectTableDesc')}
                </p>
              </div>
            ) : (
              <>
                <div
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  style={{ borderBottom: '1px solid var(--glass-border)' }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      {selectedTable.schema}.{selectedTable.name}
                    </p>
                    {rows && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {rows.totalEstimated ? '~' : ''}
                        {rows.total.toLocaleString()}{' '}
                        {rows.totalCapped
                          ? t('databases', 'studioTotalRowsCapped')
                          : rows.totalEstimated
                            ? t('databases', 'studioTotalRowsEstimated')
                            : t('databases', 'studioTotalRows')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSchemaOpen(true)}
                      className="btn btn-secondary text-sm"
                      disabled={!rows}
                    >
                      <Columns3 className="w-3.5 h-3.5" />
                      {t('databases', 'studioStructure')}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowFilters((v) => !v)}
                      className="btn btn-secondary text-sm"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      {t('databases', 'studioFilters')}
                      {filters.length > 0 ? ` (${filters.length})` : ''}
                    </button>

                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="btn btn-secondary text-sm"
                      disabled={rowsFetching}
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${rowsFetching ? 'animate-spin' : ''}`}
                      />
                      {t('databases', 'studioRefresh')}
                    </button>

                    {canWrite && selectedRows.size > 0 && (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="btn btn-secondary text-sm"
                        style={{ color: 'var(--status-error)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('databases', 'studioDeleteSelected')} ({selectedRows.size})
                      </button>
                    )}

                    {canWrite && rows && rows.kind === 'table' && (
                      <button
                        type="button"
                        onClick={() => setImportOpen(true)}
                        className="btn btn-secondary text-sm"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        {t('databases', 'studioImportCsv')}
                      </button>
                    )}

                    {canWrite && rows?.editable && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRow(null);
                          setEditorMode('insert');
                        }}
                        className="btn btn-primary text-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t('databases', 'studioAddRow')}
                      </button>
                    )}
                  </div>
                </div>

                {showFilters && rows && (
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <FilterBar
                      columns={rows.columns}
                      filters={filters}
                      onChange={(next) => {
                        setFilters(next);
                        setPage(1);
                      }}
                      t={t}
                    />
                  </div>
                )}

                {rows && !rows.editable && (
                  <p
                    className="px-4 py-2 text-xs"
                    style={{
                      color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--glass-border)',
                    }}
                  >
                    {rows.kind === 'view'
                      ? t('databases', 'studioReadOnlyView')
                      : t('databases', 'studioReadOnlyTable')}
                  </p>
                )}

                {rowsError ? (
                  <p className="px-4 py-6 text-sm" style={{ color: 'var(--status-error)' }}>
                    {rowsError instanceof Error ? rowsError.message : String(rowsError)}
                  </p>
                ) : !rows ? (
                  <div className="px-4 py-6 space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-8 rounded-md animate-pulse"
                        style={{ background: 'var(--hover-overlay)' }}
                      />
                    ))}
                  </div>
                ) : (
                  <DataGrid
                    data={rows}
                    orderBy={orderBy}
                    orderDir={orderDir}
                    onSort={toggleSort}
                    selected={selectedRows}
                    onToggleRow={(key) =>
                      setSelectedRows((prev) => {
                        const next = new Set(prev);
                        if (next.has(key)) next.delete(key);
                        else next.add(key);
                        return next;
                      })
                    }
                    onToggleAll={() =>
                      setSelectedRows((prev) =>
                        prev.size === rows.rows.length
                          ? new Set()
                          : new Set(rows.rows.map((row) => rowKey(row, rows.primaryKey)))
                      )
                    }
                    onEditRow={(row) => {
                      setEditingRow(row);
                      setEditorMode('update');
                    }}
                    onCellClick={(column, value) => setCellDetail({ column, value })}
                    canWrite={canWrite}
                    t={t}
                  />
                )}

                {rows && rows.rows.length > 0 && (
                  <div
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                    style={{ borderTop: '1px solid var(--glass-border)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t('databases', 'studioPageInfo')} {rows.page} / {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={rows.page <= 1}
                        className="btn btn-secondary text-sm"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={rows.page >= totalPages && rows.rows.length < rows.pageSize}
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
        </div>
      )}

      {rows && editorMode && (
        <RowEditorModal
          key={editingRow ? rowKey(editingRow, rows.primaryKey) : 'new-row'}
          isOpen
          mode={editorMode}
          columns={rows.columns}
          row={editingRow}
          pending={insertRow.isPending || updateRow.isPending}
          onClose={() => {
            setEditorMode(null);
            setEditingRow(null);
          }}
          onSubmit={async (values) => {
            if (editorMode === 'insert') {
              await insertRow.mutateAsync({
                schema: rows.schema,
                table: rows.name,
                values,
              });
            } else if (editingRow) {
              await updateRow.mutateAsync({
                schema: rows.schema,
                table: rows.name,
                values,
                pk: pickPrimaryKey(editingRow, rows.primaryKey),
              });
            }
            toast.success(t('databases', 'studioRowSaved'));
            setEditorMode(null);
            setEditingRow(null);
          }}
          t={t}
        />
      )}

      {importOpen && rows && (
        <ImportCsvModal
          table={`${rows.schema}.${rows.name}`}
          columns={rows.columns}
          onClose={() => setImportOpen(false)}
          onImportBatch={async (columns, batch, emptyAsNull) => {
            const result = await importRows.mutateAsync({
              schema: rows.schema,
              table: rows.name,
              columns,
              rows: batch,
              emptyAsNull,
            });
            return result?.affected ?? 0;
          }}
          t={t}
        />
      )}

      {cellDetail && (
        <CellDetailModal
          column={cellDetail.column}
          value={cellDetail.value}
          onClose={() => setCellDetail(null)}
          t={t}
        />
      )}

      {createTableOpen && tableList && (
        <CreateTableModal
          isOpen
          types={tableList.columnTypes}
          schema={tableList.defaultSchema}
          pending={createTable.isPending}
          onClose={() => setCreateTableOpen(false)}
          onSubmit={async (input) => {
            const created = await createTable.mutateAsync(input);
            toast.success(t('databases', 'studioTableCreated'));
            setCreateTableOpen(false);
            if (created) {
              selectTable({
                schema: created.schema,
                name: created.name,
                kind: 'table',
                rowEstimate: 0,
                sizeBytes: 0,
                hasPrimaryKey: input.columns.some((column) => column.primaryKey),
              });
            }
          }}
          t={t}
        />
      )}

      {schemaOpen && rows && tableList && (
        <TableSchemaModal
          isOpen
          table={rows}
          types={tableList.columnTypes}
          engine={tableList.engine}
          indexes={indexes}
          indexesLoading={indexesLoading}
          pending={{
            add: addColumn.isPending,
            drop: dropColumn.isPending,
            rename: renameTable.isPending,
            indexCreate: createIndex.isPending,
            indexDrop: dropIndex.isPending,
          }}
          onClose={() => setSchemaOpen(false)}
          onAddColumn={async (column) => {
            await addColumn.mutateAsync({ schema: rows.schema, table: rows.name, column });
            toast.success(t('databases', 'studioColumnAdded'));
          }}
          onDropColumn={async (column) => {
            await dropColumn.mutateAsync({ schema: rows.schema, table: rows.name, column });
            toast.success(t('databases', 'studioColumnDropped'));
          }}
          onCreateIndex={async (input) => {
            await createIndex.mutateAsync({
              schema: rows.schema,
              table: rows.name,
              ...input,
            });
            toast.success(t('databases', 'studioIndexCreated'));
          }}
          onDropIndex={async (name) => {
            await dropIndex.mutateAsync({ schema: rows.schema, table: rows.name, name });
            toast.success(t('databases', 'studioIndexDropped'));
          }}
          onRename={async (newName) => {
            const renamed = await renameTable.mutateAsync({
              schema: rows.schema,
              table: rows.name,
              newName,
            });
            toast.success(t('databases', 'studioTableRenamed'));
            setSchemaOpen(false);
            if (renamed) {
              selectTable({
                schema: renamed.schema,
                name: renamed.name,
                kind: 'table',
                rowEstimate: rows.total,
                sizeBytes: null,
                hasPrimaryKey: rows.primaryKey.length > 0,
              });
            }
          }}
          onRequestTruncate={() => {
            setSchemaOpen(false);
            setConfirmTruncate(true);
          }}
          onRequestDrop={() => {
            setSchemaOpen(false);
            setConfirmDropTable(true);
          }}
          t={t}
        />
      )}

      <ConfirmDialog
        open={confirmTruncate}
        onOpenChange={setConfirmTruncate}
        variant="warning"
        title={t('databases', 'studioTruncateTable')}
        description={t('databases', 'studioTruncateConfirm')}
        confirmText={t('databases', 'studioTruncateTable')}
        cancelText={t('common', 'cancel')}
        loading={truncateTable.isPending}
        onConfirm={async () => {
          if (!selectedTable) return;
          try {
            await truncateTable.mutateAsync({
              schema: selectedTable.schema,
              table: selectedTable.name,
            });
            toast.success(t('databases', 'studioTableTruncated'));
            setSelectedRows(new Set());
            setConfirmTruncate(false);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : String(err));
          }
        }}
      />

      <ConfirmDialog
        open={confirmDropTable}
        onOpenChange={setConfirmDropTable}
        variant="danger"
        title={t('databases', 'studioDropTable')}
        description={t('databases', 'studioDropTableConfirm')}
        confirmText={t('common', 'delete')}
        cancelText={t('common', 'cancel')}
        loading={dropTable.isPending}
        onConfirm={async () => {
          if (!selectedTable) return;
          try {
            await dropTable.mutateAsync({
              schema: selectedTable.schema,
              table: selectedTable.name,
            });
            toast.success(t('databases', 'studioTableDropped'));
            setPickedTable(null);
            setSelectedRows(new Set());
            setConfirmDropTable(false);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : String(err));
          }
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        variant="danger"
        title={t('databases', 'studioDeleteRowsTitle')}
        description={t('databases', 'studioDeleteRowsConfirm')}
        confirmText={t('common', 'delete')}
        cancelText={t('common', 'cancel')}
        loading={deleteRows.isPending}
        onConfirm={async () => {
          if (!rows) return;
          const pks = rows.rows
            .filter((row) => selectedRows.has(rowKey(row, rows.primaryKey)))
            .map((row) => pickPrimaryKey(row, rows.primaryKey));

          try {
            await deleteRows.mutateAsync({ schema: rows.schema, table: rows.name, pks });
            toast.success(t('databases', 'studioRowsDeleted'));
            setSelectedRows(new Set());
            setConfirmDelete(false);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : String(err));
          }
        }}
      />
    </div>
  );
}
