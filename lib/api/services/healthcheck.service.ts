import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export type HealthCheckStatus = 'healthy' | 'unhealthy' | 'timeout' | 'unknown';

export interface HealthCheckConfig {
  id: string;
  projectId: string;
  endpoint: string;
  intervalSeconds: number;
  timeoutSeconds: number;
  unhealthyThreshold: number;
  autoRestart: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCheckLog {
  id: string;
  projectId: string;
  deploymentId: string | null;
  status: HealthCheckStatus;
  responseTimeMs: number | null;
  statusCode: number | null;
  consecutiveFailures: number;
  actionTaken: 'none' | 'restarted' | 'notified' | null;
  errorMessage: string | null;
  checkedAt: string;
}

export interface HealthCheckConfigInput {
  endpoint?: string;
  intervalSeconds?: number;
  timeoutSeconds?: number;
  unhealthyThreshold?: number;
  autoRestart?: boolean;
  isActive?: boolean;
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

export const getHealthCheckConfig = async (
  projectId: string
): Promise<ApiResponse<HealthCheckConfig | null>> => {
  try {
    const response = await api.get<{ data: HealthCheckConfig | null }>(
      `/projects/${projectId}/health-check`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateHealthCheckConfig = async (
  projectId: string,
  input: HealthCheckConfigInput
): Promise<ApiResponse<HealthCheckConfig>> => {
  try {
    const response = await api.put<{ data: HealthCheckConfig; message: string }>(
      `/projects/${projectId}/health-check`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteHealthCheckConfig = async (
  projectId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/projects/${projectId}/health-check`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const getHealthCheckLogs = async (
  projectId: string
): Promise<ApiResponse<HealthCheckLog[]>> => {
  try {
    const response = await api.get<{ data: HealthCheckLog[] }>(
      `/projects/${projectId}/health-check/logs`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const healthCheckService = {
  getConfig: getHealthCheckConfig,
  updateConfig: updateHealthCheckConfig,
  deleteConfig: deleteHealthCheckConfig,
  getLogs: getHealthCheckLogs,
};
