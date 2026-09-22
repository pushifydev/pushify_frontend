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

/**
 * The same log as a CSV file. A compliance review asks for the audit trail as evidence, and
 * scrolling a dashboard is not evidence — the server writes up to 10,000 entries, oldest first,
 * with the IP each action came from.
 */
export const exportActivityLogs = async (
  filters: ActivityLogFilters = {}
): Promise<ApiResponse<{ blob: Blob; filename: string }>> => {
  try {
    const params = new URLSearchParams();
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.actions?.length) params.append('actions', filters.actions.join(','));

    const response = await api.get(`/activity/export?${params.toString()}`, { responseType: 'blob' });
    const disposition = String(response.headers['content-disposition'] || '');
    const filename = disposition.match(/filename="([^"]+)"/)?.[1] || 'activity.csv';
    return { data: { blob: response.data as Blob, filename } };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const activityService = {
  getLogs: getActivityLogs,
  exportLogs: exportActivityLogs,
};
