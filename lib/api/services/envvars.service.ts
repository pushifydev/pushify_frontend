import { AxiosError } from 'axios';
import { api } from '../client';
import type {
  ApiResponse,
  ApiError,
  EnvVar,
  Environment,
  CreateEnvVarInput,
  UpdateEnvVarInput,
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

// ============ EnvVars Functions ============

export const getEnvVars = async (
  projectId: string,
  environment?: Environment
): Promise<ApiResponse<EnvVar[]>> => {
  try {
    const query = environment ? `?environment=${environment}` : '';
    const response = await api.get<{ data: EnvVar[] }>(`/projects/${projectId}/env${query}`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createEnvVar = async (
  projectId: string,
  input: CreateEnvVarInput
): Promise<ApiResponse<EnvVar>> => {
  try {
    const response = await api.post<{ data: EnvVar; message: string }>(
      `/projects/${projectId}/env`,
      {
        key: input.key,
        value: input.value,
        environment: input.environment || 'production',
        isSecret: input.isSecret ?? true,
      }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateEnvVar = async (
  projectId: string,
  envVarId: string,
  input: UpdateEnvVarInput
): Promise<ApiResponse<EnvVar>> => {
  try {
    const response = await api.patch<{ data: EnvVar; message: string }>(
      `/projects/${projectId}/env/${envVarId}`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteEnvVar = async (
  projectId: string,
  envVarId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/projects/${projectId}/env/${envVarId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const bulkCreateEnvVars = async (
  projectId: string,
  envVars: CreateEnvVarInput[]
): Promise<ApiResponse<EnvVar[]>> => {
  try {
    const response = await api.post<{ data: EnvVar[]; message: string }>(
      `/projects/${projectId}/env/bulk`,
      { variables: envVars }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace for backward compatibility ============

export const envVarsService = {
  getAll: getEnvVars,
  create: createEnvVar,
  update: updateEnvVar,
  delete: deleteEnvVar,
  bulkCreate: bulkCreateEnvVars,
};
