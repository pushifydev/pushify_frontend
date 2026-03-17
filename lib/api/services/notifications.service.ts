import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export type NotificationChannelType = 'slack' | 'email' | 'webhook';

export type NotificationEvent =
  | 'deployment.started'
  | 'deployment.success'
  | 'deployment.failed'
  | 'health.unhealthy'
  | 'health.recovered';

export interface NotificationChannel {
  id: string;
  projectId: string;
  type: NotificationChannelType;
  name: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  channelId: string;
  deploymentId: string | null;
  eventType: string;
  status: 'sent' | 'failed';
  errorMessage: string | null;
  sentAt: string;
}

export interface SlackConfig {
  webhookUrl: string;
}

export interface EmailConfig {
  emails: string[];
}

export interface WebhookConfig {
  url: string;
  secret?: string;
}

export type ChannelConfig = SlackConfig | EmailConfig | WebhookConfig;

export interface CreateNotificationChannelInput {
  type: NotificationChannelType;
  name: string;
  config: ChannelConfig;
  events: NotificationEvent[];
}

export interface UpdateNotificationChannelInput {
  name?: string;
  config?: ChannelConfig;
  events?: NotificationEvent[];
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

export const getNotificationChannels = async (
  projectId: string
): Promise<ApiResponse<NotificationChannel[]>> => {
  try {
    const response = await api.get<{ data: NotificationChannel[] }>(
      `/projects/${projectId}/notifications`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createNotificationChannel = async (
  projectId: string,
  input: CreateNotificationChannelInput
): Promise<ApiResponse<NotificationChannel>> => {
  try {
    const response = await api.post<{ data: NotificationChannel; message: string }>(
      `/projects/${projectId}/notifications`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateNotificationChannel = async (
  projectId: string,
  channelId: string,
  input: UpdateNotificationChannelInput
): Promise<ApiResponse<NotificationChannel>> => {
  try {
    const response = await api.patch<{ data: NotificationChannel; message: string }>(
      `/projects/${projectId}/notifications/${channelId}`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteNotificationChannel = async (
  projectId: string,
  channelId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/projects/${projectId}/notifications/${channelId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const testNotificationChannel = async (
  projectId: string,
  channelId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.post(`/projects/${projectId}/notifications/${channelId}/test`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const getNotificationLogs = async (
  projectId: string,
  channelId: string
): Promise<ApiResponse<NotificationLog[]>> => {
  try {
    const response = await api.get<{ data: NotificationLog[] }>(
      `/projects/${projectId}/notifications/${channelId}/logs`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const notificationsService = {
  getChannels: getNotificationChannels,
  createChannel: createNotificationChannel,
  updateChannel: updateNotificationChannel,
  deleteChannel: deleteNotificationChannel,
  testChannel: testNotificationChannel,
  getLogs: getNotificationLogs,
};
