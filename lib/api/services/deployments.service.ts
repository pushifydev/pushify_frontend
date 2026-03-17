import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError, Deployment, CreateDeploymentInput } from '../types';

// ============ Types ============

interface DeploymentLogsResponse {
  logs: string | null;
  status: string;
}

interface GetDeploymentsOptions {
  limit?: number;
  offset?: number;
}

interface HistoricalLogEntry {
  id: string;
  deploymentId: string;
  projectId: string;
  logContent: string;
  logType: 'stdout' | 'stderr';
  lineCount: number;
  startTimestamp: string | null;
  endTimestamp: string | null;
  chunkIndex: number;
  createdAt: string;
}

interface HistoricalLogsResponse {
  logs: HistoricalLogEntry[];
  totalChunks: number;
  totalLines: number;
}

interface GetHistoricalLogsOptions {
  limit?: number;
  offset?: number;
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

// ============ Deployments Functions ============

export const getDeployments = async (
  projectId: string,
  options?: GetDeploymentsOptions
): Promise<ApiResponse<Deployment[]>> => {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));

    const query = params.toString();
    const endpoint = `/projects/${projectId}/deployments${query ? `?${query}` : ''}`;

    const response = await api.get<{ data: Deployment[] }>(endpoint);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getDeployment = async (
  projectId: string,
  deploymentId: string
): Promise<ApiResponse<Deployment>> => {
  try {
    const response = await api.get<{ data: Deployment }>(
      `/projects/${projectId}/deployments/${deploymentId}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createDeployment = async (
  projectId: string,
  input?: CreateDeploymentInput
): Promise<ApiResponse<Deployment>> => {
  try {
    const response = await api.post<{ data: Deployment; message: string }>(
      `/projects/${projectId}/deployments`,
      input || {}
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const cancelDeployment = async (
  projectId: string,
  deploymentId: string
): Promise<ApiResponse<Deployment>> => {
  try {
    const response = await api.post<{ data: Deployment; message: string }>(
      `/projects/${projectId}/deployments/${deploymentId}/cancel`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const redeployDeployment = async (
  projectId: string,
  deploymentId: string
): Promise<ApiResponse<Deployment>> => {
  try {
    const response = await api.post<{ data: Deployment; message: string }>(
      `/projects/${projectId}/deployments/${deploymentId}/redeploy`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const rollbackDeployment = async (
  projectId: string,
  deploymentId: string
): Promise<ApiResponse<Deployment>> => {
  try {
    const response = await api.post<{ data: Deployment; message: string }>(
      `/projects/${projectId}/deployments/${deploymentId}/rollback`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getDeploymentLogs = async (
  projectId: string,
  deploymentId: string,
  type: 'build' | 'deploy' = 'build'
): Promise<ApiResponse<DeploymentLogsResponse>> => {
  try {
    const response = await api.get<{ data: DeploymentLogsResponse }>(
      `/projects/${projectId}/deployments/${deploymentId}/logs?type=${type}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getHistoricalContainerLogs = async (
  projectId: string,
  deploymentId: string,
  options?: GetHistoricalLogsOptions
): Promise<ApiResponse<HistoricalLogsResponse>> => {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));

    const query = params.toString();
    const endpoint = `/projects/${projectId}/deployments/${deploymentId}/container-logs/history${query ? `?${query}` : ''}`;

    const response = await api.get<{ data: HistoricalLogsResponse }>(endpoint);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace for backward compatibility ============

export const deploymentsService = {
  getAll: getDeployments,
  getById: getDeployment,
  create: createDeployment,
  cancel: cancelDeployment,
  redeploy: redeployDeployment,
  rollback: rollbackDeployment,
  getLogs: getDeploymentLogs,
  getHistoricalLogs: getHistoricalContainerLogs,
};
