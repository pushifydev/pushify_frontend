import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

const handleError = <T>(error: unknown): ApiResponse<T> => {
  const axiosError = error as AxiosError<{ error: ApiError }>;
  return {
    error: axiosError.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server',
    },
  };
};

export interface AlertsSummary {
  totalChannels: number;
  activeChannels: number;
  projectsWithChannels: number;
  failedDeliveries24h: number;
  healthChecksEnabled: number;
  unhealthyProjects: number;
}

export interface OrgNotificationChannel {
  id: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  type: string;
  name: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrgNotificationLog {
  id: string;
  channelId: string;
  channelName: string;
  channelType: string;
  projectId: string;
  projectName: string;
  eventType: string;
  status: string;
  errorMessage: string | null;
  sentAt: string;
}

export interface OrgHealthCheckRow {
  projectId: string;
  projectName: string;
  projectSlug: string;
  isActive: boolean;
  endpoint: string;
  intervalSeconds: number;
  autoRestart: boolean;
  lastStatus: string | null;
  consecutiveFailures: number;
  lastCheckedAt: string | null;
  responseTimeMs: number | null;
}

export interface AlertsOverview {
  summary: AlertsSummary;
  channels: OrgNotificationChannel[];
  recentLogs: OrgNotificationLog[];
  healthChecks: OrgHealthCheckRow[];
}

export const getAlertsOverview = async (): Promise<ApiResponse<AlertsOverview>> => {
  try {
    const response = await api.get<{ data: AlertsOverview }>('/alerts/overview');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const alertsService = {
  getOverview: getAlertsOverview,
};
