import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

/** What deleting the current organization will touch (owner only). */
export interface OrganizationDeletionPreview {
  name: string;
  plan: string;
  hasSubscription: boolean;
  walletBalanceCents: number;
  includedCreditCents: number;
  managedServers: { id: string; name: string }[];
  connectedServers: { id: string; name: string }[];
  domains: { domainName: string; expiresAt: string }[];
  graceDays: number;
  deletionScheduledFor: string | null;
}

export interface DeletionServerOutcome {
  serverId: string;
  name: string;
  host: string | null;
  keyRemoved: boolean;
  manualCommand: string | null;
}

export interface DeletionScheduled {
  scheduledFor: string;
  servers: DeletionServerOutcome[];
  walletBalanceCents: number;
  /** Account deletions: the organizations scheduled along with the account */
  organizations?: string[];
}

export interface DeletionCredentials {
  password?: string;
  twoFactorCode?: string;
}

const handleError = <T>(error: unknown): ApiResponse<T> => {
  const axiosError = error as AxiosError<{ error: ApiError }>;
  return {
    error: axiosError.response?.data?.error || { code: 'NETWORK_ERROR', message: 'Unable to connect to server' },
  };
};

export const getOrganizationDeletionPreview = async (): Promise<ApiResponse<OrganizationDeletionPreview>> => {
  try {
    const res = await api.get<{ data: OrganizationDeletionPreview }>('/organizations/deletion');
    return { data: res.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const requestOrganizationDeletion = async (
  input: DeletionCredentials & { confirmName: string },
): Promise<ApiResponse<DeletionScheduled>> => {
  try {
    const res = await api.post<{ data: DeletionScheduled }>('/organizations/deletion', input);
    return { data: res.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const restoreOrganization = async (): Promise<ApiResponse<{ restored: boolean }>> => {
  try {
    const res = await api.delete<{ data: { restored: boolean } }>('/organizations/deletion');
    return { data: res.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const requestAccountDeletion = async (
  input: DeletionCredentials & { confirmEmail: string },
): Promise<ApiResponse<DeletionScheduled>> => {
  try {
    const res = await api.post<{ data: DeletionScheduled }>('/auth/me/deletion', input);
    return { data: res.data.data };
  } catch (error) {
    return handleError(error);
  }
};

/** No session needed: the token comes from a refused sign-in. */
export const restoreAccount = async (restoreToken: string): Promise<ApiResponse<{ restored: boolean }>> => {
  try {
    const res = await api.post<{ data: { restored: boolean } }>('/auth/deletion/restore', { restoreToken });
    return { data: res.data.data };
  } catch (error) {
    return handleError(error);
  }
};
