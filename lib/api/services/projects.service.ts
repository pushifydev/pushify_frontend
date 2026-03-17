import { AxiosError } from 'axios';
import { api } from '../client';
import type {
  ApiResponse,
  ApiError,
  Project,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types';

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

// ============ Projects Functions ============

export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
  try {
    const response = await api.get<{ data: Project[] }>('/projects');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getProject = async (id: string): Promise<ApiResponse<Project>> => {
  try {
    const response = await api.get<{ data: Project }>(`/projects/${id}`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createProject = async (
  input: CreateProjectInput
): Promise<ApiResponse<Project>> => {
  try {
    const response = await api.post<{ data: Project; message: string }>('/projects', input);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateProject = async (
  id: string,
  input: UpdateProjectInput
): Promise<ApiResponse<Project>> => {
  try {
    const response = await api.patch<{ data: Project; message: string }>(`/projects/${id}`, input);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteProject = async (id: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/projects/${id}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const updateProjectStatus = async (
  id: string,
  status: ProjectStatus
): Promise<ApiResponse<Project>> => {
  try {
    const response = await api.patch<{ data: Project; message: string }>(
      `/projects/${id}/status`,
      { status }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Webhook Functions ============

export interface WebhookInfo {
  webhookUrl: string;
  hasSecret: boolean;
  autoDeploy: boolean;
}

export interface WebhookSecret {
  secret: string;
}

export const getWebhookInfo = async (projectId: string): Promise<ApiResponse<WebhookInfo>> => {
  try {
    const response = await api.get<{ data: WebhookInfo }>(`/projects/${projectId}/webhook`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const regenerateWebhookSecret = async (projectId: string): Promise<ApiResponse<WebhookSecret>> => {
  try {
    const response = await api.post<{ data: WebhookSecret; message: string }>(
      `/projects/${projectId}/webhook/regenerate`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Project Settings ============

export interface ProjectSettings {
  prStatusChecksEnabled?: boolean;
  [key: string]: unknown;
}

export const updateProjectSettings = async (
  projectId: string,
  settings: ProjectSettings
): Promise<ApiResponse<Project>> => {
  try {
    const response = await api.patch<{ data: Project; message: string }>(
      `/projects/${projectId}/settings`,
      settings
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace for backward compatibility ============

export const projectsService = {
  getAll: getProjects,
  getById: getProject,
  create: createProject,
  update: updateProject,
  delete: deleteProject,
  updateStatus: updateProjectStatus,
  getWebhookInfo,
  regenerateWebhookSecret,
  updateSettings: updateProjectSettings,
};
