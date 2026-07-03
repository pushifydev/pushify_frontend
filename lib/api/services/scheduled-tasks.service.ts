import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export type ScheduledTaskType = 'command' | 'http';
export type ScheduledTaskRunStatus = 'success' | 'failed' | 'timeout';

export interface ScheduledTask {
  id: string;
  projectId: string;
  name: string;
  type: ScheduledTaskType;
  schedule: string;
  timezone: string;
  command: string | null;
  httpUrl: string | null;
  timeoutSeconds: number;
  enabled: boolean;
  lastRunAt: string | null;
  lastStatus: ScheduledTaskRunStatus | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledTaskRun {
  id: string;
  taskId: string;
  projectId: string;
  status: ScheduledTaskRunStatus;
  trigger: 'schedule' | 'manual';
  exitCode: number | null;
  httpStatus: number | null;
  output: string | null;
  errorMessage: string | null;
  durationMs: number | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface CreateScheduledTaskInput {
  name: string;
  type: ScheduledTaskType;
  schedule: string;
  timezone?: string;
  command?: string;
  httpUrl?: string;
  timeoutSeconds?: number;
  enabled?: boolean;
}

export interface UpdateScheduledTaskInput {
  name?: string;
  schedule?: string;
  timezone?: string;
  command?: string;
  httpUrl?: string;
  timeoutSeconds?: number;
  enabled?: boolean;
}

export interface ScheduledTaskRunResult {
  status: ScheduledTaskRunStatus;
  exitCode?: number;
  httpStatus?: number;
  output?: string;
  errorMessage?: string;
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

export const getScheduledTasks = async (
  projectId: string
): Promise<ApiResponse<ScheduledTask[]>> => {
  try {
    const response = await api.get<{ data: ScheduledTask[] }>(
      `/projects/${projectId}/scheduled-tasks`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createScheduledTask = async (
  projectId: string,
  input: CreateScheduledTaskInput
): Promise<ApiResponse<ScheduledTask>> => {
  try {
    const response = await api.post<{ data: ScheduledTask }>(
      `/projects/${projectId}/scheduled-tasks`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateScheduledTask = async (
  projectId: string,
  taskId: string,
  input: UpdateScheduledTaskInput
): Promise<ApiResponse<ScheduledTask>> => {
  try {
    const response = await api.patch<{ data: ScheduledTask }>(
      `/projects/${projectId}/scheduled-tasks/${taskId}`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteScheduledTask = async (
  projectId: string,
  taskId: string
): Promise<ApiResponse<{ deleted: boolean }>> => {
  try {
    const response = await api.delete<{ data: { deleted: boolean } }>(
      `/projects/${projectId}/scheduled-tasks/${taskId}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const runScheduledTask = async (
  projectId: string,
  taskId: string
): Promise<ApiResponse<ScheduledTaskRunResult>> => {
  try {
    const response = await api.post<{ data: ScheduledTaskRunResult }>(
      `/projects/${projectId}/scheduled-tasks/${taskId}/run`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getScheduledTaskRuns = async (
  projectId: string,
  taskId: string,
  limit = 20
): Promise<ApiResponse<ScheduledTaskRun[]>> => {
  try {
    const response = await api.get<{ data: ScheduledTaskRun[] }>(
      `/projects/${projectId}/scheduled-tasks/${taskId}/runs?limit=${limit}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};
