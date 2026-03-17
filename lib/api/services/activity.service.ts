import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ActivityLog, ActivityLogFilters } from '../types';

// ============ Helper ============

const handleError = <T>(error: unknown): ApiResponse<T> => {
  const axiosError = error as AxiosError<{ error: { code: string; message: string } }>;
  return {
    error: axiosError.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server',
    },
  };
};

// ============ Activity Functions ============

export interface ActivityLogsResponse {
  logs: ActivityLog[];
  total: number;
}

export const getActivityLogs = async (
  filters: ActivityLogFilters = {}
): Promise<ApiResponse<ActivityLogsResponse>> => {
  try {
    const params = new URLSearchParams();

    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.actions?.length) params.append('actions', filters.actions.join(','));
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await api.get<{ data: ActivityLog[]; total: number }>(
      `/activity?${params.toString()}`
    );

    return {
      data: {
        logs: response.data.data,
        total: response.data.total,
      },
    };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const activityService = {
  getLogs: getActivityLogs,
};
