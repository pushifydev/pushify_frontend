import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export interface ProjectVolume {
  id: string;
  projectId: string;
  name: string;
  containerPath: string;
  createdAt: string;
}

export interface CreateProjectVolumeInput {
  name: string;
  containerPath: string;
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

export const getProjectVolumes = async (
  projectId: string
): Promise<ApiResponse<ProjectVolume[]>> => {
  try {
    const response = await api.get<{ data: ProjectVolume[] }>(`/projects/${projectId}/volumes`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createProjectVolume = async (
  projectId: string,
  input: CreateProjectVolumeInput
): Promise<ApiResponse<ProjectVolume>> => {
  try {
    const response = await api.post<{ data: ProjectVolume }>(
      `/projects/${projectId}/volumes`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteProjectVolume = async (
  projectId: string,
  volumeId: string
): Promise<ApiResponse<{ deleted: boolean }>> => {
  try {
    const response = await api.delete<{ data: { deleted: boolean } }>(
      `/projects/${projectId}/volumes/${volumeId}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};
