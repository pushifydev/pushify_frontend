import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export type PreviewStatus = 'pending' | 'building' | 'running' | 'stopped' | 'failed';

export interface PreviewDeployment {
  id: string;
  projectId: string;
  deploymentId: string | null;
  prNumber: number;
  prTitle: string | null;
  prBranch: string;
  baseBranch: string;
  previewUrl: string | null;
  containerName: string | null;
  hostPort: number | null;
  githubCommentId: number | null;
  status: PreviewStatus;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
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

export const getPreviewDeployments = async (
  projectId: string
): Promise<ApiResponse<PreviewDeployment[]>> => {
  try {
    const response = await api.get<{ data: PreviewDeployment[] }>(
      `/projects/${projectId}/previews`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getActivePreviewDeployments = async (
  projectId: string
): Promise<ApiResponse<PreviewDeployment[]>> => {
  try {
    const response = await api.get<{ data: PreviewDeployment[] }>(
      `/projects/${projectId}/previews/active`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const previewService = {
  getAll: getPreviewDeployments,
  getActive: getActivePreviewDeployments,
};
