import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

/** A private registry the organization can pull from. The token is never returned. */
export interface RegistryCredential {
  id: string;
  name: string;
  registry: string;
  username: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateRegistryInput {
  name?: string;
  registry: string;
  username: string;
  password: string;
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

export const getRegistries = async (): Promise<ApiResponse<RegistryCredential[]>> => {
  try {
    const response = await api.get<{ data: RegistryCredential[] }>('/registries');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

/** Adds a registry, or replaces the credentials already stored for that host. */
export const createRegistry = async (
  input: CreateRegistryInput
): Promise<ApiResponse<RegistryCredential>> => {
  try {
    const response = await api.post<{ data: RegistryCredential }>('/registries', input);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteRegistry = async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await api.delete<{ data: { success: boolean } }>(`/registries/${id}`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};
