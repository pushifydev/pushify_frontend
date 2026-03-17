import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export type ServerStatus = 'provisioning' | 'running' | 'stopped' | 'rebooting' | 'error' | 'deleting';
export type ServerSetupStatus = 'pending' | 'installing' | 'completed' | 'failed';
export type ServerProvider = 'hetzner' | 'digitalocean' | 'aws' | 'gcp' | 'self_hosted';
export type ServerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export interface Server {
  id: string;
  name: string;
  description: string | null;
  provider: ServerProvider;
  providerId: string | null;
  region: string;
  size: ServerSize;
  image: string | null;
  vcpus: number;
  memoryMb: number;
  diskGb: number;
  ipv4: string | null;
  ipv6: string | null;
  privateIp: string | null;
  status: ServerStatus;
  setupStatus: ServerSetupStatus;
  statusMessage: string | null;
  labels: Record<string, unknown>;
  isManaged: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string | null;
}

export interface CreateServerInput {
  name: string;
  description?: string;
  provider: ServerProvider;
  region: string;
  size: ServerSize;
  image: string;
  sshKeyIds?: string[];
  labels?: Record<string, string>;
}

export interface Region {
  id: string;
  name: string;
  country: string;
  city: string;
  available: boolean;
}

export interface Image {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'app' | 'snapshot';
  status: string;
}

export interface ServerSizeOption {
  size: ServerSize;
  specs: {
    vcpus: number;
    memoryMb: number;
    diskGb: number;
    priceMonthly: number;
  };
}

export interface ProviderServerType {
  id: string;
  name: string;
  description: string;
  cores: number;
  memory: number; // in GB
  disk: number; // in GB
  priceMonthly: number;
  priceHourly: number;
  cpuType: 'shared' | 'dedicated';
  architecture: 'x86' | 'arm';
  availableLocations: string[];
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

export const listServers = async (): Promise<ApiResponse<Server[]>> => {
  try {
    const response = await api.get<{ data: Server[] }>('/servers');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getServer = async (serverId: string): Promise<ApiResponse<Server>> => {
  try {
    const response = await api.get<{ data: Server }>(`/servers/${serverId}`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createServer = async (input: CreateServerInput): Promise<ApiResponse<Server>> => {
  try {
    const response = await api.post<{ data: Server }>('/servers', input);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteServer = async (serverId: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/servers/${serverId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const startServer = async (serverId: string): Promise<ApiResponse<Server>> => {
  try {
    const response = await api.post<{ data: Server }>(`/servers/${serverId}/start`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const stopServer = async (serverId: string): Promise<ApiResponse<Server>> => {
  try {
    const response = await api.post<{ data: Server }>(`/servers/${serverId}/stop`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const rebootServer = async (serverId: string): Promise<ApiResponse<Server>> => {
  try {
    const response = await api.post<{ data: Server }>(`/servers/${serverId}/reboot`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const syncServer = async (serverId: string): Promise<ApiResponse<Server>> => {
  try {
    const response = await api.post<{ data: Server }>(`/servers/${serverId}/sync`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getProviderRegions = async (
  provider: ServerProvider
): Promise<ApiResponse<Region[]>> => {
  try {
    const response = await api.get<{ data: Region[] }>(`/servers/providers/${provider}/regions`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getProviderImages = async (
  provider: ServerProvider
): Promise<ApiResponse<Image[]>> => {
  try {
    const response = await api.get<{ data: Image[] }>(`/servers/providers/${provider}/images`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getProviderSizes = async (
  provider: ServerProvider
): Promise<ApiResponse<ServerSizeOption[]>> => {
  try {
    const response = await api.get<{ data: ServerSizeOption[] }>(
      `/servers/providers/${provider}/sizes`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getProviderServerTypes = async (
  provider: ServerProvider,
  location?: string
): Promise<ApiResponse<ProviderServerType[]>> => {
  try {
    const params = location ? `?location=${location}` : '';
    const response = await api.get<{ data: ProviderServerType[] }>(
      `/servers/providers/${provider}/server-types${params}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const serversService = {
  listServers,
  getServer,
  createServer,
  deleteServer,
  startServer,
  stopServer,
  rebootServer,
  syncServer,
  getProviderRegions,
  getProviderImages,
  getProviderSizes,
  getProviderServerTypes,
};
