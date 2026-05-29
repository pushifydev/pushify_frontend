import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

export interface GitLabStatus {
  connected: boolean;
  username: string | null;
}

export interface GitLabRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  description: string | null;
  language: string | null;
  updated_at: string;
  pushed_at: string;
}

export interface GitLabBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitLabFrameworkDetection {
  framework: string | null;
  buildCommand: string | null;
  installCommand: string | null;
  outputDirectory: string | null;
  startCommand: string | null;
}

const handleError = <T>(error: unknown): ApiResponse<T> => {
  const axiosError = error as AxiosError<{ error: ApiError }>;
  return {
    error: axiosError.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server',
    },
  };
};

export const getGitLabStatus = async (): Promise<ApiResponse<GitLabStatus>> => {
  try {
    const response = await api.get<{ data: GitLabStatus }>('/integrations/gitlab/status');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getGitLabAuthUrl = async (): Promise<ApiResponse<{ url: string; state: string }>> => {
  try {
    const response = await api.get<{ data: { url: string; state: string } }>(
      '/integrations/gitlab/auth-url',
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const connectGitLab = async (code: string, state: string): Promise<ApiResponse<GitLabStatus>> => {
  try {
    const response = await api.post<{ data: GitLabStatus; message: string }>(
      '/integrations/gitlab/callback',
      { code, state },
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const disconnectGitLab = async (): Promise<ApiResponse<void>> => {
  try {
    await api.delete('/integrations/gitlab/disconnect');
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const getGitLabRepos = async (options?: {
  page?: number;
  perPage?: number;
}): Promise<ApiResponse<GitLabRepo[]>> => {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', String(options.page));
    if (options?.perPage) params.append('per_page', String(options.perPage));

    const response = await api.get<{ data: GitLabRepo[] }>(`/integrations/gitlab/repos?${params}`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getGitLabBranches = async (projectId: number): Promise<ApiResponse<GitLabBranch[]>> => {
  try {
    const response = await api.get<{ data: GitLabBranch[] }>(
      `/integrations/gitlab/projects/${projectId}/branches`,
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const detectGitLabFramework = async (
  projectId: number,
  branch?: string,
): Promise<ApiResponse<GitLabFrameworkDetection>> => {
  try {
    const params = branch ? `?branch=${encodeURIComponent(branch)}` : '';
    const response = await api.get<{ data: GitLabFrameworkDetection }>(
      `/integrations/gitlab/projects/${projectId}/detect${params}`,
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const gitlabService = {
  getStatus: getGitLabStatus,
  getAuthUrl: getGitLabAuthUrl,
  connect: connectGitLab,
  disconnect: disconnectGitLab,
  getRepos: getGitLabRepos,
  getBranches: getGitLabBranches,
  detectFramework: detectGitLabFramework,
};
