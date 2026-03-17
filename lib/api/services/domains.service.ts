import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError, Domain, AddDomainInput, DnsSetupInfo, NginxSettings } from '../types';

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

// ============ Domains Functions ============

export const getDomains = async (projectId: string): Promise<ApiResponse<Domain[]>> => {
  try {
    const response = await api.get<{ data: Domain[] }>(`/projects/${projectId}/domains`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const addDomain = async (
  projectId: string,
  input: AddDomainInput
): Promise<ApiResponse<Domain>> => {
  try {
    const response = await api.post<{ data: Domain; message: string }>(
      `/projects/${projectId}/domains`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteDomain = async (
  projectId: string,
  domainId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/projects/${projectId}/domains/${domainId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const setPrimaryDomain = async (
  projectId: string,
  domainId: string
): Promise<ApiResponse<Domain>> => {
  try {
    const response = await api.post<{ data: Domain; message: string }>(
      `/projects/${projectId}/domains/${domainId}/primary`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const verifyDomain = async (
  projectId: string,
  domainId: string
): Promise<ApiResponse<Domain>> => {
  try {
    const response = await api.post<{ data: Domain; message: string }>(
      `/projects/${projectId}/domains/${domainId}/verify`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getDnsSetup = async (
  projectId: string,
  domainId: string
): Promise<ApiResponse<DnsSetupInfo>> => {
  try {
    const response = await api.get<{ data: DnsSetupInfo }>(
      `/projects/${projectId}/domains/${domainId}/dns-setup`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getNginxSettings = async (
  projectId: string,
  domainId: string
): Promise<ApiResponse<NginxSettings>> => {
  try {
    const response = await api.get<{ data: NginxSettings }>(
      `/projects/${projectId}/domains/${domainId}/nginx-settings`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateNginxSettings = async (
  projectId: string,
  domainId: string,
  settings: Partial<NginxSettings>
): Promise<ApiResponse<NginxSettings>> => {
  try {
    const response = await api.patch<{ data: NginxSettings; message: string }>(
      `/projects/${projectId}/domains/${domainId}/nginx-settings`,
      settings
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace for backward compatibility ============

export const domainsService = {
  getAll: getDomains,
  add: addDomain,
  delete: deleteDomain,
  setPrimary: setPrimaryDomain,
  verify: verifyDomain,
  getDnsSetup: getDnsSetup,
  getNginxSettings: getNginxSettings,
  updateNginxSettings: updateNginxSettings,
};
