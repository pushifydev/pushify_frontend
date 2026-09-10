import { AxiosError } from 'axios';
import { api } from '../client';
import type {
  ApiResponse,
  ApiError,
  Database,
  DatabaseBackup,
  DatabaseCredentials,
  CreateDatabaseInput,
  UpdateDatabaseInput,
  DatabaseConnection,
  ConnectDatabaseInput,
  DatabaseTypeInfo,
  StudioTableList,
  StudioRows,
  StudioRowsQuery,
  StudioMutationResult,
  StudioInsertInput,
  StudioUpdateInput,
  StudioDeleteInput,
  StudioQueryResult,
  StudioSchemaMap,
  StudioCreateTableInput,
  StudioTableTarget,
  StudioRenameTableInput,
  StudioAddColumnInput,
  StudioDropColumnInput,
  StudioIndex,
  StudioCreateIndexInput,
  StudioDropIndexInput,
  StudioPerformance,
  MongoCollection,
  MongoDocumentsPage,
  MongoDocumentsQuery,
  RedisScanPage,
  RedisKeyValue,
  StudioImportInput,
} from '../types';

// ============ Helper ============

const handleError = <T>(error: unknown): ApiResponse<T> => {
  const axiosError = error as AxiosError<{ error: ApiError }>;
  return {
    error: axiosError.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server',
    },
  };
};

// ============ Database Functions ============

export const getDatabases = async (): Promise<ApiResponse<Database[]>> => {
  try {
    const response = await api.get<{ data: Database[] }>('/databases');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getDatabase = async (
  databaseId: string
): Promise<ApiResponse<Database>> => {
  try {
    const response = await api.get<{ data: Database }>(`/databases/${databaseId}`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getDatabaseCredentials = async (
  databaseId: string
): Promise<ApiResponse<DatabaseCredentials>> => {
  try {
    const response = await api.get<{ data: DatabaseCredentials }>(
      `/databases/${databaseId}/credentials`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getDatabaseTypes = async (): Promise<ApiResponse<DatabaseTypeInfo[]>> => {
  try {
    const response = await api.get<{ data: DatabaseTypeInfo[] }>('/databases/types');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createDatabase = async (
  input: CreateDatabaseInput
): Promise<ApiResponse<Database>> => {
  try {
    const response = await api.post<{ data: Database; message: string }>(
      '/databases',
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateDatabase = async (
  databaseId: string,
  input: UpdateDatabaseInput
): Promise<ApiResponse<Database>> => {
  try {
    const response = await api.patch<{ data: Database; message: string }>(
      `/databases/${databaseId}`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteDatabase = async (
  databaseId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/databases/${databaseId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const connectDatabaseToProject = async (
  databaseId: string,
  input: ConnectDatabaseInput
): Promise<ApiResponse<DatabaseConnection>> => {
  try {
    const response = await api.post<{ data: DatabaseConnection; message: string }>(
      `/databases/${databaseId}/connect`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const disconnectDatabase = async (
  connectionId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/databases/connections/${connectionId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const toggleExternalAccess = async (
  databaseId: string,
  enabled: boolean
): Promise<ApiResponse<Database>> => {
  try {
    const response = await api.post<{ data: Database; message: string }>(
      `/databases/${databaseId}/external-access`,
      { enabled }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const startDatabase = async (
  databaseId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.post(`/databases/${databaseId}/start`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const stopDatabase = async (
  databaseId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.post(`/databases/${databaseId}/stop`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const restartDatabase = async (
  databaseId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.post(`/databases/${databaseId}/restart`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const resetDatabasePassword = async (
  databaseId: string
): Promise<ApiResponse<DatabaseCredentials>> => {
  try {
    const response = await api.post<{ data: DatabaseCredentials; message: string }>(
      `/databases/${databaseId}/reset-password`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Backup Functions ============

export const getDatabaseBackups = async (
  databaseId: string
): Promise<ApiResponse<DatabaseBackup[]>> => {
  try {
    const response = await api.get<{ data: DatabaseBackup[] }>(
      `/databases/${databaseId}/backups`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createDatabaseBackup = async (
  databaseId: string
): Promise<ApiResponse<DatabaseBackup>> => {
  try {
    const response = await api.post<{ data: DatabaseBackup; message: string }>(
      `/databases/${databaseId}/backups`
    );
    return { data: response.data.data, message: response.data.message };
  } catch (error) {
    return handleError(error);
  }
};

export const verifyDatabaseBackup = async (
  databaseId: string,
  backupId: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<{ message: string }>(
      `/databases/${databaseId}/backups/${backupId}/verify`
    );
    return { data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const restoreDatabaseBackup = async (
  databaseId: string,
  backupId: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<{ message: string }>(
      `/databases/${databaseId}/backups/${backupId}/restore`
    );
    return { data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteDatabaseBackup = async (
  databaseId: string,
  backupId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/databases/${databaseId}/backups/${backupId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const downloadDatabaseBackup = async (
  databaseId: string,
  backupId: string,
  fallbackFileName?: string
): Promise<void> => {
  const response = await api.get(
    `/databases/${databaseId}/backups/${backupId}/download`,
    { responseType: 'blob' }
  );
  // Keep the binary type — re-wrapping as an untyped Blob made browsers save it as .txt.
  const blob = new Blob([response.data], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  // Content-Disposition is only readable cross-origin when the API exposes it; the
  // backup's own name (db_<timestamp>.sql.gz / .rdb) is the reliable fallback.
  const disposition = response.headers['content-disposition'];
  const fileName =
    disposition?.match(/filename="(.+?)"/)?.[1] || fallbackFileName || `backup-${backupId}.sql.gz`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};


// ============ Database Studio (data browser) ============

export const getStudioTables = async (
  databaseId: string
): Promise<ApiResponse<StudioTableList>> => {
  try {
    const response = await api.get<{ data: StudioTableList }>(
      `/databases/${databaseId}/studio/tables`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getStudioRows = async (
  databaseId: string,
  query: StudioRowsQuery
): Promise<ApiResponse<StudioRows>> => {
  try {
    const response = await api.get<{ data: StudioRows }>(`/databases/${databaseId}/studio/rows`, {
      params: {
        schema: query.schema,
        table: query.table,
        page: query.page,
        pageSize: query.pageSize,
        orderBy: query.orderBy,
        orderDir: query.orderDir,
        filters: query.filters?.length ? JSON.stringify(query.filters) : undefined,
      },
    });
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const insertStudioRow = async (
  databaseId: string,
  input: StudioInsertInput
): Promise<ApiResponse<StudioMutationResult>> => {
  try {
    const response = await api.post<{ data: StudioMutationResult }>(
      `/databases/${databaseId}/studio/rows`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateStudioRow = async (
  databaseId: string,
  input: StudioUpdateInput
): Promise<ApiResponse<StudioMutationResult>> => {
  try {
    const response = await api.patch<{ data: StudioMutationResult }>(
      `/databases/${databaseId}/studio/rows`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteStudioRows = async (
  databaseId: string,
  input: StudioDeleteInput
): Promise<ApiResponse<StudioMutationResult>> => {
  try {
    const response = await api.post<{ data: StudioMutationResult }>(
      `/databases/${databaseId}/studio/rows/delete`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getStudioSchemaMap = async (
  databaseId: string
): Promise<ApiResponse<StudioSchemaMap>> => {
  try {
    const response = await api.get<{ data: StudioSchemaMap }>(
      `/databases/${databaseId}/studio/schema`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

/** Downloads the full result of a read-only query straight to the user's disk. */
export const exportStudioQuery = async (
  databaseId: string,
  input: { sql: string; format: 'csv' | 'json' }
): Promise<void> => {
  const response = await api.post(`/databases/${databaseId}/studio/query/export`, input, {
    responseType: 'blob',
  });

  const disposition = String(response.headers['content-disposition'] ?? '');
  const fileName = disposition.match(/filename="?([^"]+)"?/)?.[1] ?? `query.${input.format}`;

  const url = window.URL.createObjectURL(response.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const runStudioQuery = async (
  databaseId: string,
  input: { sql: string; allowWrite?: boolean }
): Promise<ApiResponse<StudioQueryResult>> => {
  try {
    const response = await api.post<{ data: StudioQueryResult }>(
      `/databases/${databaseId}/studio/query`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};


// ============ Database Studio schema (DDL) ============

export const createStudioTable = async (
  databaseId: string,
  input: StudioCreateTableInput
): Promise<ApiResponse<{ schema: string; name: string }>> => {
  try {
    const response = await api.post<{ data: { schema: string; name: string } }>(
      `/databases/${databaseId}/studio/tables`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const dropStudioTable = async (
  databaseId: string,
  input: StudioTableTarget
): Promise<ApiResponse<{ dropped: true }>> => {
  try {
    const response = await api.delete<{ data: { dropped: true } }>(
      `/databases/${databaseId}/studio/tables`,
      { params: { schema: input.schema, table: input.table } }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const truncateStudioTable = async (
  databaseId: string,
  input: StudioTableTarget
): Promise<ApiResponse<{ truncated: true }>> => {
  try {
    const response = await api.post<{ data: { truncated: true } }>(
      `/databases/${databaseId}/studio/tables/truncate`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const renameStudioTable = async (
  databaseId: string,
  input: StudioRenameTableInput
): Promise<ApiResponse<{ schema: string; name: string }>> => {
  try {
    const response = await api.post<{ data: { schema: string; name: string } }>(
      `/databases/${databaseId}/studio/tables/rename`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const addStudioColumn = async (
  databaseId: string,
  input: StudioAddColumnInput
): Promise<ApiResponse<{ added: true }>> => {
  try {
    const response = await api.post<{ data: { added: true } }>(
      `/databases/${databaseId}/studio/columns`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const dropStudioColumn = async (
  databaseId: string,
  input: StudioDropColumnInput
): Promise<ApiResponse<{ dropped: true }>> => {
  try {
    const response = await api.delete<{ data: { dropped: true } }>(
      `/databases/${databaseId}/studio/columns`,
      { params: { schema: input.schema, table: input.table, column: input.column } }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};


// ============ Database Studio indexes & performance ============

export const getStudioIndexes = async (
  databaseId: string,
  input: { schema?: string; table: string }
): Promise<ApiResponse<StudioIndex[]>> => {
  try {
    const response = await api.get<{ data: StudioIndex[] }>(
      `/databases/${databaseId}/studio/indexes`,
      { params: { schema: input.schema, table: input.table } }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createStudioIndex = async (
  databaseId: string,
  input: StudioCreateIndexInput
): Promise<ApiResponse<{ name: string }>> => {
  try {
    const response = await api.post<{ data: { name: string } }>(
      `/databases/${databaseId}/studio/indexes`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const dropStudioIndex = async (
  databaseId: string,
  input: StudioDropIndexInput
): Promise<ApiResponse<{ dropped: true }>> => {
  try {
    const response = await api.delete<{ data: { dropped: true } }>(
      `/databases/${databaseId}/studio/indexes`,
      { params: { schema: input.schema, table: input.table, name: input.name } }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const cancelStudioQuery = async (
  databaseId: string,
  id: number
): Promise<ApiResponse<{ cancelled: boolean }>> => {
  try {
    const response = await api.post<{ data: { cancelled: boolean } }>(
      `/databases/${databaseId}/studio/cancel`,
      { id }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getStudioPerformance = async (
  databaseId: string
): Promise<ApiResponse<StudioPerformance>> => {
  try {
    const response = await api.get<{ data: StudioPerformance }>(
      `/databases/${databaseId}/studio/performance`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};


export const importStudioRows = async (
  databaseId: string,
  input: StudioImportInput
): Promise<ApiResponse<{ affected: number }>> => {
  try {
    const response = await api.post<{ data: { affected: number } }>(
      `/databases/${databaseId}/studio/import`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Database Studio: MongoDB ============

export const getMongoCollections = async (
  databaseId: string
): Promise<ApiResponse<MongoCollection[]>> => {
  try {
    const response = await api.get<{ data: MongoCollection[] }>(
      `/databases/${databaseId}/studio/mongo/collections`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createMongoCollection = async (
  databaseId: string,
  name: string
): Promise<ApiResponse<{ created: true }>> => {
  try {
    const response = await api.post<{ data: { created: true } }>(
      `/databases/${databaseId}/studio/mongo/collections`,
      { name }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const dropMongoCollection = async (
  databaseId: string,
  name: string
): Promise<ApiResponse<{ dropped: true }>> => {
  try {
    const response = await api.delete<{ data: { dropped: true } }>(
      `/databases/${databaseId}/studio/mongo/collections`,
      { params: { name } }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getMongoDocuments = async (
  databaseId: string,
  query: MongoDocumentsQuery
): Promise<ApiResponse<MongoDocumentsPage>> => {
  try {
    const response = await api.get<{ data: MongoDocumentsPage }>(
      `/databases/${databaseId}/studio/mongo/documents`,
      { params: query }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const insertMongoDocument = async (
  databaseId: string,
  input: { collection: string; document: string }
): Promise<ApiResponse<{ insertedId: unknown }>> => {
  try {
    const response = await api.post<{ data: { insertedId: unknown } }>(
      `/databases/${databaseId}/studio/mongo/documents`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const replaceMongoDocument = async (
  databaseId: string,
  input: { collection: string; id: string; document: string }
): Promise<ApiResponse<{ matched: number; modified: number }>> => {
  try {
    const response = await api.patch<{ data: { matched: number; modified: number } }>(
      `/databases/${databaseId}/studio/mongo/documents`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteMongoDocuments = async (
  databaseId: string,
  input: { collection: string; ids: string }
): Promise<ApiResponse<{ deleted: number }>> => {
  try {
    const response = await api.post<{ data: { deleted: number } }>(
      `/databases/${databaseId}/studio/mongo/documents/delete`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Database Studio: Redis ============

export const scanRedisKeys = async (
  databaseId: string,
  query: { cursor?: string; pattern?: string; count?: number }
): Promise<ApiResponse<RedisScanPage>> => {
  try {
    const response = await api.get<{ data: RedisScanPage }>(
      `/databases/${databaseId}/studio/redis/keys`,
      { params: query }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getRedisKey = async (
  databaseId: string,
  key: string
): Promise<ApiResponse<RedisKeyValue>> => {
  try {
    const response = await api.get<{ data: RedisKeyValue }>(
      `/databases/${databaseId}/studio/redis/key`,
      { params: { key } }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteRedisKeys = async (
  databaseId: string,
  keys: string[]
): Promise<ApiResponse<{ deleted: number }>> => {
  try {
    const response = await api.post<{ data: { deleted: number } }>(
      `/databases/${databaseId}/studio/redis/keys/delete`,
      { keys }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const setRedisExpiry = async (
  databaseId: string,
  input: { key: string; seconds: number | null }
): Promise<ApiResponse<{ applied: boolean; ttl: number }>> => {
  try {
    const response = await api.post<{ data: { applied: boolean; ttl: number } }>(
      `/databases/${databaseId}/studio/redis/key/expire`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const setRedisStringValue = async (
  databaseId: string,
  input: { key: string; value: string }
): Promise<ApiResponse<{ ttl: number }>> => {
  try {
    const response = await api.post<{ data: { ttl: number } }>(
      `/databases/${databaseId}/studio/redis/key/value`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const databasesService = {
  getAll: getDatabases,
  getById: getDatabase,
  getCredentials: getDatabaseCredentials,
  getTypes: getDatabaseTypes,
  create: createDatabase,
  update: updateDatabase,
  delete: deleteDatabase,
  connectToProject: connectDatabaseToProject,
  disconnect: disconnectDatabase,
  toggleExternalAccess,
  start: startDatabase,
  stop: stopDatabase,
  restart: restartDatabase,
  resetPassword: resetDatabasePassword,
  getBackups: getDatabaseBackups,
  createBackup: createDatabaseBackup,
  restoreBackup: restoreDatabaseBackup,
  verifyBackup: verifyDatabaseBackup,
  deleteBackup: deleteDatabaseBackup,
  downloadBackup: downloadDatabaseBackup,
  getStudioTables,
  getStudioRows,
  insertStudioRow,
  updateStudioRow,
  deleteStudioRows,
  runStudioQuery,
  getStudioSchemaMap,
  exportStudioQuery,
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
};
