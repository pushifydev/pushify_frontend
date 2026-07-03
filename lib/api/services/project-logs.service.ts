import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export interface ProjectLogLine {
  content: string;
  timestamp: string;
  logType: string;
  deploymentId: string;
}

export interface ProjectLogSearchResult {
  lines: ProjectLogLine[];
  scannedChunks: number;
}

export interface ProjectLogSearchParams {
  q?: string;
  logType?: 'stdout' | 'stderr';
  limit?: number;
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

export const searchProjectLogs = async (
  projectId: string,
  params: ProjectLogSearchParams
): Promise<ApiResponse<ProjectLogSearchResult>> => {
  try {
    const search = new URLSearchParams();
    if (params.q) search.set('q', params.q);
    if (params.logType) search.set('logType', params.logType);
    if (params.limit) search.set('limit', String(params.limit));
    const response = await api.get<{ data: ProjectLogSearchResult }>(
      `/projects/${projectId}/logs/search?${search.toString()}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};
