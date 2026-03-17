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
  backupId: string
): Promise<void> => {
  const response = await api.get(
    `/databases/${databaseId}/backups/${backupId}/download`,
    { responseType: 'blob' }
  );
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const disposition = response.headers['content-disposition'];
  const fileName = disposition?.match(/filename="(.+?)"/)?.[1] || `backup-${backupId}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
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
  deleteBackup: deleteDatabaseBackup,
  downloadBackup: downloadDatabaseBackup,
};
