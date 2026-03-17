import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export interface MetricsCurrent {
  cpuPercent: number;
  memoryPercent: number;
  memoryUsageMB: number;
  memoryLimitMB: number;
  networkRxMB: number;
  networkTxMB: number;
  containerStatus: string;
  recordedAt: string;
}

export interface MetricsStats24h {
  avgCpu: number;
  maxCpu: number;
  avgMemory: number;
  maxMemory: number;
  totalNetworkRxMB: number;
  totalNetworkTxMB: number;
  dataPoints: number;
}

export interface MetricsSummary {
  current: MetricsCurrent | null;
  stats24h: MetricsStats24h | null;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  cpuPercent: number;
  memoryPercent: number;
  memoryUsageMB: number;
  networkRxMB: number;
  networkTxMB: number;
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

export const getMetricsSummary = async (
  projectId: string
): Promise<ApiResponse<MetricsSummary>> => {
  try {
    const response = await api.get<{ data: MetricsSummary }>(
      `/projects/${projectId}/metrics`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getMetricsTimeSeries = async (
  projectId: string,
  hours: number = 1
): Promise<ApiResponse<TimeSeriesDataPoint[]>> => {
  try {
    const response = await api.get<{ data: TimeSeriesDataPoint[] }>(
      `/projects/${projectId}/metrics/timeseries`,
      { params: { hours } }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Overview Types ============

export interface ProjectMetricSnapshot {
  projectId: string;
  projectName: string;
  projectSlug: string;
  cpuPercent: number;
  memoryPercent: number;
  memoryUsageMB: number;
  memoryLimitMB: number;
  networkRxMB: number;
  networkTxMB: number;
  containerStatus: string;
  recordedAt: string;
}

export interface MetricsOverview {
  totalProjects: number;
  runningContainers: number;
  aggregate: {
    totalCpuPercent: number;
    totalMemoryUsageMB: number;
    totalMemoryLimitMB: number;
    totalNetworkRxMB: number;
    totalNetworkTxMB: number;
    avgCpuPercent: number;
    avgMemoryPercent: number;
  };
  projects: ProjectMetricSnapshot[];
}

// ============ Overview API ============

export const getMetricsOverview = async (): Promise<ApiResponse<MetricsOverview>> => {
  try {
    const response = await api.get<{ data: MetricsOverview }>('/projects/overview');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const metricsService = {
  getSummary: getMetricsSummary,
  getTimeSeries: getMetricsTimeSeries,
  getOverview: getMetricsOverview,
};
