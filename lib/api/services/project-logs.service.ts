import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export interface ProjectLogLine {
  content: string;
  timestamp: string;
  logType: string;
  deploymentId: string;
  containerName: string | null;
}

export interface ProjectLogSearchResult {
  lines: ProjectLogLine[];
  scannedChunks: number;
  /** Days of history the organization's plan keeps */
  retentionDays: number;
}

export interface ProjectLogSearchParams {
  q?: string;
  logType?: 'stdout' | 'stderr';
  /** One container of the project: the app, a replica, a worker, staging */
  container?: string;
  /** ISO strings; omitted means "as far back as retention goes" */
  from?: string;
  to?: string;
  limit?: number;
}

const toSearchParams = (params: ProjectLogSearchParams): URLSearchParams => {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.logType) search.set('logType', params.logType);
  if (params.container) search.set('container', params.container);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.limit) search.set('limit', String(params.limit));
  return search;
};

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
    const response = await api.get<{ data: ProjectLogSearchResult }>(
      `/projects/${projectId}/logs/search?${toSearchParams(params).toString()}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

/** One autoscaling decision — including the ones taken while only watching. */
export interface ScaleEvent {
  id: string;
  from: number;
  to: number;
  averageCpu: number | null;
  reason: string;
  /** False when the project was only observing: decided, not carried out */
  applied: boolean;
  createdAt: string;
}

/**
 * What autoscaling decided for this project. Read for a few days before trusting the thresholds
 * with real traffic — in observe mode nothing changes, but every decision is still recorded.
 */
export const getScaleEvents = async (projectId: string): Promise<ApiResponse<ScaleEvent[]>> => {
  try {
    const response = await api.get<{ data: ScaleEvent[] }>(`/projects/${projectId}/scale-events`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

/** The containers that have stored logs, for the container filter */
export const getProjectLogContainers = async (
  projectId: string
): Promise<ApiResponse<{ containers: string[] }>> => {
  try {
    const response = await api.get<{ data: { containers: string[] } }>(
      `/projects/${projectId}/logs/containers`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * The same search as a .log file. It goes through the API (not a plain link) because the
 * download needs the auth header, and the server writes far more lines than the view shows.
 */
export const exportProjectLogs = async (
  projectId: string,
  params: ProjectLogSearchParams
): Promise<ApiResponse<{ blob: Blob; filename: string }>> => {
  try {
    const search = toSearchParams({ limit: 50000, ...params });
    const response = await api.get(`/projects/${projectId}/logs/export?${search.toString()}`, {
      responseType: 'blob',
    });
    const disposition = String(response.headers['content-disposition'] || '');
    const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `logs-${projectId.slice(0, 8)}.log`;
    return { data: { blob: response.data as Blob, filename } };
  } catch (error) {
    // A failed blob request carries its error as a Blob too, so handleError would only ever
    // report "cannot connect" — read the real message out of it first.
    const body = (error as AxiosError).response?.data;
    if (body instanceof Blob) {
      try {
        const parsed = JSON.parse(await body.text()) as { error?: ApiError };
        if (parsed.error) return { error: parsed.error };
      } catch {
        // not JSON — fall through
      }
    }
    return handleError(error);
  }
};
