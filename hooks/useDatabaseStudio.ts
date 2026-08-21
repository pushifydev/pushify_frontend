'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStudioTables,
  getStudioRows,
  insertStudioRow,
  updateStudioRow,
  deleteStudioRows,
  runStudioQuery,
  getStudioSchemaMap,
  createStudioTable,
  dropStudioTable,
  truncateStudioTable,
  renameStudioTable,
  addStudioColumn,
  dropStudioColumn,
  getStudioIndexes,
  createStudioIndex,
  dropStudioIndex,
  getStudioPerformance,
  cancelStudioQuery,
  importStudioRows,
  getMongoCollections,
  createMongoCollection,
  dropMongoCollection,
  getMongoDocuments,
  insertMongoDocument,
  replaceMongoDocument,
  deleteMongoDocuments,
  scanRedisKeys,
  getRedisKey,
  deleteRedisKeys,
  setRedisExpiry,
  setRedisStringValue,
  type StudioRowsQuery,
  type StudioInsertInput,
  type StudioUpdateInput,
  type StudioDeleteInput,
  type StudioCreateTableInput,
  type StudioTableTarget,
  type StudioRenameTableInput,
  type StudioAddColumnInput,
  type StudioDropColumnInput,
  type StudioCreateIndexInput,
  type StudioDropIndexInput,
  type MongoDocumentsQuery,
  type StudioImportInput,
} from '@/lib/api';

export const studioKeys = {
  all: ['database-studio'] as const,
  tables: (databaseId: string) => [...studioKeys.all, 'tables', databaseId] as const,
  schemaMap: (databaseId: string) => [...studioKeys.all, 'schema-map', databaseId] as const,
  indexes: (databaseId: string, schema: string | undefined, table: string) =>
    [...studioKeys.all, 'indexes', databaseId, schema ?? '', table] as const,
  performance: (databaseId: string) => [...studioKeys.all, 'performance', databaseId] as const,
  rows: (databaseId: string, query: StudioRowsQuery) =>
    [...studioKeys.all, 'rows', databaseId, query] as const,
};

// ============ Queries ============

export function useStudioTables(databaseId: string, enabled = true) {
  return useQuery({
    queryKey: studioKeys.tables(databaseId),
    queryFn: async () => {
      const result = await getStudioTables(databaseId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!databaseId && enabled,
    staleTime: 30_000,
  });
}

/** The console's autocomplete source: every table with its columns, fetched once per visit. */
export function useStudioSchemaMap(databaseId: string, enabled = true) {
  return useQuery({
    queryKey: studioKeys.schemaMap(databaseId),
    queryFn: async () => {
      const result = await getStudioSchemaMap(databaseId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!databaseId && enabled,
    staleTime: 5 * 60_000,
  });
}

export function useStudioRows(databaseId: string, query: StudioRowsQuery | null) {
  return useQuery({
    queryKey: studioKeys.rows(databaseId, query ?? { table: '' }),
    queryFn: async () => {
      const result = await getStudioRows(databaseId, query!);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!databaseId && !!query?.table,
    placeholderData: (previous) => previous,
    // Each fetch is a round trip to the customer's server; don't repeat it for a quick revisit.
    staleTime: 10_000,
  });
}

// ============ Mutations ============

/** Row edits change what the grid shows, so every mutation refreshes the current page. */
function useInvalidateRows(databaseId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [...studioKeys.all, 'rows', databaseId] });
    queryClient.invalidateQueries({ queryKey: studioKeys.tables(databaseId) });
  };
}

export function useInsertStudioRow(databaseId: string) {
  const invalidate = useInvalidateRows(databaseId);

  return useMutation({
    mutationFn: async (input: StudioInsertInput) => {
      const result = await insertStudioRow(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateStudioRow(databaseId: string) {
  const invalidate = useInvalidateRows(databaseId);

  return useMutation({
    mutationFn: async (input: StudioUpdateInput) => {
      const result = await updateStudioRow(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteStudioRows(databaseId: string) {
  const invalidate = useInvalidateRows(databaseId);

  return useMutation({
    mutationFn: async (input: StudioDeleteInput) => {
      const result = await deleteStudioRows(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useRunStudioQuery(databaseId: string) {
  const invalidate = useInvalidateRows(databaseId);

  return useMutation({
    mutationFn: async (input: { sql: string; allowWrite?: boolean }) => {
      const result = await runStudioQuery(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_data, variables) => {
      // A write query can touch anything the grid is showing.
      if (variables.allowWrite) invalidate();
    },
  });
}

// ============ Schema (DDL) mutations ============

/** Schema changes invalidate the table list and whatever the grid is currently showing. */
function useInvalidateSchema(databaseId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: studioKeys.tables(databaseId) });
    queryClient.invalidateQueries({ queryKey: studioKeys.schemaMap(databaseId) });
    queryClient.invalidateQueries({ queryKey: [...studioKeys.all, 'rows', databaseId] });
  };
}

export function useCreateStudioTable(databaseId: string) {
  const invalidate = useInvalidateSchema(databaseId);

  return useMutation({
    mutationFn: async (input: StudioCreateTableInput) => {
      const result = await createStudioTable(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useDropStudioTable(databaseId: string) {
  const invalidate = useInvalidateSchema(databaseId);

  return useMutation({
    mutationFn: async (input: StudioTableTarget) => {
      const result = await dropStudioTable(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useTruncateStudioTable(databaseId: string) {
  const invalidate = useInvalidateSchema(databaseId);

  return useMutation({
    mutationFn: async (input: StudioTableTarget) => {
      const result = await truncateStudioTable(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useRenameStudioTable(databaseId: string) {
  const invalidate = useInvalidateSchema(databaseId);

  return useMutation({
    mutationFn: async (input: StudioRenameTableInput) => {
      const result = await renameStudioTable(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useAddStudioColumn(databaseId: string) {
  const invalidate = useInvalidateSchema(databaseId);

  return useMutation({
    mutationFn: async (input: StudioAddColumnInput) => {
      const result = await addStudioColumn(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useDropStudioColumn(databaseId: string) {
  const invalidate = useInvalidateSchema(databaseId);

  return useMutation({
    mutationFn: async (input: StudioDropColumnInput) => {
      const result = await dropStudioColumn(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

// ============ Indexes & performance ============

export function useStudioIndexes(
  databaseId: string,
  input: { schema?: string; table: string } | null
) {
  return useQuery({
    queryKey: studioKeys.indexes(databaseId, input?.schema, input?.table ?? ''),
    queryFn: async () => {
      const result = await getStudioIndexes(databaseId, input!);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!databaseId && !!input?.table,
  });
}

function useInvalidateIndexes(databaseId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [...studioKeys.all, 'indexes', databaseId] });
  };
}

export function useCreateStudioIndex(databaseId: string) {
  const invalidate = useInvalidateIndexes(databaseId);

  return useMutation({
    mutationFn: async (input: StudioCreateIndexInput) => {
      const result = await createStudioIndex(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useDropStudioIndex(databaseId: string) {
  const invalidate = useInvalidateIndexes(databaseId);

  return useMutation({
    mutationFn: async (input: StudioDropIndexInput) => {
      const result = await dropStudioIndex(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

/** Diagnostics are a snapshot: refetched on demand, never polled in the background. */
export function useStudioPerformance(databaseId: string, enabled = true) {
  return useQuery({
    queryKey: studioKeys.performance(databaseId),
    queryFn: async () => {
      const result = await getStudioPerformance(databaseId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!databaseId && enabled,
    staleTime: 15_000,
  });
}

export function useCancelStudioQuery(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await cancelStudioQuery(databaseId, id);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studioKeys.performance(databaseId) });
    },
  });
}

/** One CSV batch. The modal drives the loop so it can show progress. */
export function useImportStudioRows(databaseId: string) {
  const invalidate = useInvalidateRows(databaseId);

  return useMutation({
    mutationFn: async (input: StudioImportInput) => {
      const result = await importStudioRows(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

// ============ MongoDB ============

export const nosqlKeys = {
  collections: (databaseId: string) => [...studioKeys.all, 'mongo-collections', databaseId] as const,
  documents: (databaseId: string, query: MongoDocumentsQuery) =>
    [...studioKeys.all, 'mongo-documents', databaseId, query] as const,
  redisKeys: (databaseId: string, cursor: string, pattern: string) =>
    [...studioKeys.all, 'redis-keys', databaseId, cursor, pattern] as const,
  redisKey: (databaseId: string, key: string) =>
    [...studioKeys.all, 'redis-key', databaseId, key] as const,
};

export function useMongoCollections(databaseId: string, enabled = true) {
  return useQuery({
    queryKey: nosqlKeys.collections(databaseId),
    queryFn: async () => {
      const result = await getMongoCollections(databaseId);
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    enabled: !!databaseId && enabled,
    staleTime: 30_000,
  });
}

export function useMongoDocuments(databaseId: string, query: MongoDocumentsQuery | null) {
  return useQuery({
    queryKey: nosqlKeys.documents(databaseId, query ?? { collection: '' }),
    queryFn: async () => {
      const result = await getMongoDocuments(databaseId, query!);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!databaseId && !!query?.collection,
    placeholderData: (previous) => previous,
    staleTime: 10_000,
  });
}

/** Any document or collection change can move what the browser is showing. */
function useInvalidateMongo(databaseId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: nosqlKeys.collections(databaseId) });
    queryClient.invalidateQueries({ queryKey: [...studioKeys.all, 'mongo-documents', databaseId] });
  };
}

export function useCreateMongoCollection(databaseId: string) {
  const invalidate = useInvalidateMongo(databaseId);
  return useMutation({
    mutationFn: async (name: string) => {
      const result = await createMongoCollection(databaseId, name);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useDropMongoCollection(databaseId: string) {
  const invalidate = useInvalidateMongo(databaseId);
  return useMutation({
    mutationFn: async (name: string) => {
      const result = await dropMongoCollection(databaseId, name);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useInsertMongoDocument(databaseId: string) {
  const invalidate = useInvalidateMongo(databaseId);
  return useMutation({
    mutationFn: async (input: { collection: string; document: string }) => {
      const result = await insertMongoDocument(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useReplaceMongoDocument(databaseId: string) {
  const invalidate = useInvalidateMongo(databaseId);
  return useMutation({
    mutationFn: async (input: { collection: string; id: string; document: string }) => {
      const result = await replaceMongoDocument(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteMongoDocuments(databaseId: string) {
  const invalidate = useInvalidateMongo(databaseId);
  return useMutation({
    mutationFn: async (input: { collection: string; ids: string }) => {
      const result = await deleteMongoDocuments(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

// ============ Redis ============

export function useRedisKeys(
  databaseId: string,
  query: { cursor: string; pattern: string },
  enabled = true
) {
  return useQuery({
    queryKey: nosqlKeys.redisKeys(databaseId, query.cursor, query.pattern),
    queryFn: async () => {
      const result = await scanRedisKeys(databaseId, query);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!databaseId && enabled,
    placeholderData: (previous) => previous,
  });
}

export function useRedisKey(databaseId: string, key: string | null) {
  return useQuery({
    queryKey: nosqlKeys.redisKey(databaseId, key ?? ''),
    queryFn: async () => {
      const result = await getRedisKey(databaseId, key!);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!databaseId && !!key,
  });
}

function useInvalidateRedis(databaseId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [...studioKeys.all, 'redis-keys', databaseId] });
    queryClient.invalidateQueries({ queryKey: [...studioKeys.all, 'redis-key', databaseId] });
  };
}

export function useDeleteRedisKeys(databaseId: string) {
  const invalidate = useInvalidateRedis(databaseId);
  return useMutation({
    mutationFn: async (keys: string[]) => {
      const result = await deleteRedisKeys(databaseId, keys);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useSetRedisExpiry(databaseId: string) {
  const invalidate = useInvalidateRedis(databaseId);
  return useMutation({
    mutationFn: async (input: { key: string; seconds: number | null }) => {
      const result = await setRedisExpiry(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}

export function useSetRedisStringValue(databaseId: string) {
  const invalidate = useInvalidateRedis(databaseId);
  return useMutation({
    mutationFn: async (input: { key: string; value: string }) => {
      const result = await setRedisStringValue(databaseId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: invalidate,
  });
}
