import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface ApiKeyWithSecret extends Omit<ApiKey, 'isActive' | 'lastUsedAt' | 'user'> {
  secretKey: string;
}

export interface CreateApiKeyInput {
  name: string;
  scopes?: string[];
  expiresAt?: string;
}

export interface UpdateApiKeyInput {
  name?: string;
  scopes?: string[];
}

export type ApiKeyScopes = Record<string, string>;

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

export const getApiKeys = async (): Promise<ApiResponse<ApiKey[]>> => {
  try {
    const response = await api.get<{ data: ApiKey[] }>('/api-keys');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getApiKeyScopes = async (): Promise<ApiResponse<ApiKeyScopes>> => {
  try {
    const response = await api.get<{ data: ApiKeyScopes }>('/api-keys/scopes');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createApiKey = async (
  input: CreateApiKeyInput
): Promise<ApiResponse<ApiKeyWithSecret>> => {
  try {
    const response = await api.post<{ data: ApiKeyWithSecret; message: string }>(
      '/api-keys',
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateApiKey = async (
  keyId: string,
  input: UpdateApiKeyInput
): Promise<ApiResponse<ApiKey>> => {
  try {
    const response = await api.patch<{ data: ApiKey; message: string }>(
      `/api-keys/${keyId}`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const revokeApiKey = async (keyId: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/api-keys/${keyId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const getOrganizationApiKeys = async (): Promise<ApiResponse<ApiKey[]>> => {
  try {
    const response = await api.get<{ data: ApiKey[] }>('/api-keys/organization');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const apiKeysService = {
  list: getApiKeys,
  getScopes: getApiKeyScopes,
  create: createApiKey,
  update: updateApiKey,
  revoke: revokeApiKey,
  listOrganization: getOrganizationApiKeys,
};
