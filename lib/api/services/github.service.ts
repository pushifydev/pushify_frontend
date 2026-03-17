import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export interface GitHubStatus {
  connected: boolean;
  username: string | null;
}

export interface GitHubRepo {
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

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface FrameworkDetection {
  framework: string | null;
  buildCommand: string | null;
  installCommand: string | null;
  outputDirectory: string | null;
  startCommand: string | null;
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

// ============ GitHub Functions ============

export const getGitHubStatus = async (): Promise<ApiResponse<GitHubStatus>> => {
  try {
    const response = await api.get<{ data: GitHubStatus }>('/integrations/github/status');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getGitHubAuthUrl = async (): Promise<ApiResponse<{ url: string; state: string }>> => {
  try {
    const response = await api.get<{ data: { url: string; state: string } }>('/integrations/github/auth-url');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const connectGitHub = async (code: string, state: string): Promise<ApiResponse<GitHubStatus>> => {
  try {
    const response = await api.post<{ data: GitHubStatus; message: string }>('/integrations/github/callback', {
      code,
      state,
    });
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const disconnectGitHub = async (): Promise<ApiResponse<void>> => {
  try {
    await api.delete('/integrations/github/disconnect');
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const getGitHubRepos = async (options?: {
  page?: number;
  perPage?: number;
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
}): Promise<ApiResponse<GitHubRepo[]>> => {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', String(options.page));
    if (options?.perPage) params.append('per_page', String(options.perPage));
    if (options?.sort) params.append('sort', options.sort);

    const response = await api.get<{ data: GitHubRepo[] }>(`/integrations/github/repos?${params}`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getGitHubBranches = async (owner: string, repo: string): Promise<ApiResponse<GitHubBranch[]>> => {
  try {
    const response = await api.get<{ data: GitHubBranch[] }>(`/integrations/github/repos/${owner}/${repo}/branches`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const detectFramework = async (
  owner: string,
  repo: string,
  branch?: string
): Promise<ApiResponse<FrameworkDetection>> => {
  try {
    const params = branch ? `?branch=${branch}` : '';
    const response = await api.get<{ data: FrameworkDetection }>(
      `/integrations/github/repos/${owner}/${repo}/detect${params}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const githubService = {
  getStatus: getGitHubStatus,
  getAuthUrl: getGitHubAuthUrl,
  connect: connectGitHub,
  disconnect: disconnectGitHub,
  getRepos: getGitHubRepos,
  getBranches: getGitHubBranches,
  detectFramework,
};
