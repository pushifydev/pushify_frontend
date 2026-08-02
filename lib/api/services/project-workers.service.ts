import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export interface ProjectWorker {
  id: string;
  projectId: string;
  name: string;
  command: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerStatusMap {
  [workerName: string]: { state: string; status: string };
}

export interface CreateWorkerInput {
  name: string;
  command: string;
  enabled?: boolean;
}

export interface UpdateWorkerInput {
  command?: string;
  enabled?: boolean;
}

export interface WorkerLogsResult {
  logs: string;
  containerName: string;
}

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

// ============ API Functions ============

export const getProjectWorkers = async (
  projectId: string
): Promise<ApiResponse<ProjectWorker[]>> => {
  try {
    const response = await api.get<{ data: ProjectWorker[] }>(`/projects/${projectId}/workers`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getProjectWorkerStatuses = async (
  projectId: string
): Promise<ApiResponse<WorkerStatusMap>> => {
  try {
    const response = await api.get<{ data: WorkerStatusMap }>(
      `/projects/${projectId}/workers/status`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createProjectWorker = async (
  projectId: string,
  input: CreateWorkerInput
): Promise<ApiResponse<ProjectWorker>> => {
  try {
    const response = await api.post<{ data: ProjectWorker }>(
      `/projects/${projectId}/workers`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateProjectWorker = async (
  projectId: string,
  workerId: string,
  input: UpdateWorkerInput
): Promise<ApiResponse<ProjectWorker>> => {
  try {
    const response = await api.patch<{ data: ProjectWorker }>(
      `/projects/${projectId}/workers/${workerId}`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteProjectWorker = async (
  projectId: string,
  workerId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/projects/${projectId}/workers/${workerId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const getProjectWorkerLogs = async (
  projectId: string,
  workerId: string,
  tail = 100
): Promise<ApiResponse<WorkerLogsResult>> => {
  try {
    const response = await api.get<{ data: WorkerLogsResult }>(
      `/projects/${projectId}/workers/${workerId}/logs`,
      { params: { tail } }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};
