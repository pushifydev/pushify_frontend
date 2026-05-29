import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export type ServerStatus = 'provisioning' | 'running' | 'stopped' | 'rebooting' | 'error' | 'deleting';
export type ServerSetupStatus = 'pending' | 'installing' | 'completed' | 'failed';
export type ServerProvider = 'hetzner' | 'digitalocean' | 'aws' | 'gcp' | 'self_hosted';
export type ServerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export interface ServerLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  datacenter?: string;
}

export interface ServerInfraBilling {
  walletBalanceCents: number;
  requiredStartCents: number;
  estimatedMonthlyCents: number;
  canStart: boolean;
}

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
  location: ServerLocation | null;
  projectCount: number;
  databaseCount: number;
  isManaged: boolean;
  autoSnapshotEnabled: boolean;
  lastAutoSnapshotAt: string | null;
  infraBilling?: ServerInfraBilling;
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
  // BYOS fields
  ipv4?: string;
  sshPrivateKey?: string;
  rootPassword?: string;
  authMethod?: 'ssh_key' | 'password';
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
    providerCostMonthlyCents: number;
    providerCostHourlyCents: number;
    customerPriceMonthlyCents: number;
    customerPriceHourlyCents: number;
    marginPercent: number;
    /** @deprecated use customerPriceMonthlyCents — kept for backward compat */
    priceMonthly?: number;
  };
  allowedByPlan: boolean;
  disallowCode?: 'managedNotAllowed' | 'serverTierExceeded';
  disallowReason?: string;
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

export interface ServerHealthReport {
  disk: {
    ok: boolean;
    usedPercent: number;
    availGb: number;
    mount: string;
    warn: boolean;
    critical: boolean;
    message: string;
  };
  orphans: Array<{
    name: string;
    slug: string;
    status: string;
    ports: string;
  }>;
  pushifyContainerCount: number;
}

export const getServerHealth = async (
  serverId: string
): Promise<ApiResponse<ServerHealthReport>> => {
  try {
    const response = await api.get<{ data: ServerHealthReport }>(`/servers/${serverId}/health`);
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

export const updateServer = async (
  serverId: string,
  input: { name?: string; description?: string | null; autoSnapshotEnabled?: boolean },
): Promise<ApiResponse<Server>> => {
  try {
    const response = await api.patch<{ data: Server }>(`/servers/${serverId}`, input);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getServerResizeOptions = async (
  serverId: string,
): Promise<ApiResponse<ServerSizeOption[]>> => {
  try {
    const response = await api.get<{ data: ServerSizeOption[] }>(
      `/servers/${serverId}/resize-options`,
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const resizeServer = async (
  serverId: string,
  size: ServerSize,
): Promise<ApiResponse<Server>> => {
  try {
    const response = await api.post<{ data: Server }>(`/servers/${serverId}/resize`, { size });
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export interface ServerSnapshot {
  id: string;
  name: string;
  description?: string;
  sizeGb: number;
  status: string;
  progress?: number | null;
  createdAt: string;
}

export const listServerSnapshots = async (
  serverId: string,
): Promise<ApiResponse<ServerSnapshot[]>> => {
  try {
    const response = await api.get<{ data: ServerSnapshot[] }>(`/servers/${serverId}/snapshots`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createServerSnapshot = async (
  serverId: string,
  input?: { name?: string; description?: string },
): Promise<ApiResponse<ServerSnapshot>> => {
  try {
    const response = await api.post<{ data: ServerSnapshot }>(
      `/servers/${serverId}/snapshots`,
      input ?? {},
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteServerSnapshot = async (
  serverId: string,
  snapshotId: string,
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/servers/${serverId}/snapshots/${snapshotId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const restoreServerSnapshot = async (
  serverId: string,
  snapshotId: string,
): Promise<ApiResponse<Server>> => {
  try {
    const response = await api.post<{ data: Server }>(
      `/servers/${serverId}/snapshots/${snapshotId}/restore`,
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export interface ServerTimelineEvent {
  type: string;
  at: string;
  detail?: string;
}

export interface ServerTimelineDeployment {
  id: string;
  status: string;
  trigger: string;
  createdAt: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
}

export interface ServerTimeline {
  lifecycle: ServerTimelineEvent[];
  deployments: ServerTimelineDeployment[];
  projects: { id: string; name: string; slug: string }[];
}

export const getServerTimeline = async (
  serverId: string,
): Promise<ApiResponse<ServerTimeline>> => {
  try {
    const response = await api.get<{ data: ServerTimeline }>(`/servers/${serverId}/timeline`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export interface ServerSshInfo {
  host: string | null;
  username: string;
  port: number;
  publicKey: string | null;
  hasPrivateKey: boolean;
}

export const getServerSshInfo = async (
  serverId: string,
): Promise<ApiResponse<ServerSshInfo>> => {
  try {
    const response = await api.get<{ data: ServerSshInfo }>(`/servers/${serverId}/ssh-info`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getServerSshKey = async (
  serverId: string,
): Promise<
  ApiResponse<{
    privateKey: string;
    host: string | null;
    username: string;
    port: number;
    connectCommand: string;
  }>
> => {
  try {
    const response = await api.get<{
      data: {
        privateKey: string;
        host: string | null;
        username: string;
        port: number;
        connectCommand: string;
      };
    }>(`/servers/${serverId}/ssh-key`);
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
  provider: ServerProvider,
  region?: string,
): Promise<ApiResponse<ServerSizeOption[]>> => {
  try {
    const response = await api.get<{ data: ServerSizeOption[] }>(
      `/servers/providers/${provider}/sizes`,
      { params: region ? { region } : undefined },
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
  updateServer,
  getServerResizeOptions,
  resizeServer,
  listServerSnapshots,
  createServerSnapshot,
  deleteServerSnapshot,
  restoreServerSnapshot,
  getServerTimeline,
  getServerSshInfo,
  getServerSshKey,
  getProviderRegions,
  getProviderImages,
  getProviderSizes,
  getProviderServerTypes,
};
