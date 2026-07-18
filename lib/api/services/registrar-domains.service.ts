import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export interface DomainSearchResult {
  domainName: string;
  available: boolean;
  premium: boolean;
  priceCents: number | null;
  renewalPriceCents: number | null;
}

export interface PurchasedDomain {
  id: string;
  organizationId: string;
  projectId: string | null;
  domainName: string;
  registrar: string;
  status: 'active' | 'expired';
  years: number;
  purchasePriceCents: number;
  autoRenew: boolean;
  registeredAt: string;
  expiresAt: string;
  lastRenewalError: string | null;
  createdAt: string;
}

export interface PurchaseDomainInput {
  domainName: string;
  projectId?: string;
}

export interface PurchaseDomainResult {
  domain: PurchasedDomain;
  balanceAfterCents: number;
  attached: boolean;
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

export const getDomainSalesConfig = async (): Promise<ApiResponse<{ enabled: boolean }>> => {
  try {
    const response = await api.get<{ data: { enabled: boolean } }>('/domains/config');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const searchDomains = async (
  query: string
): Promise<ApiResponse<DomainSearchResult[]>> => {
  try {
    const response = await api.get<{ data: DomainSearchResult[] }>('/domains/search', {
      params: { q: query },
    });
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getPurchasedDomains = async (): Promise<ApiResponse<PurchasedDomain[]>> => {
  try {
    const response = await api.get<{ data: PurchasedDomain[] }>('/domains');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const purchaseDomain = async (
  input: PurchaseDomainInput
): Promise<ApiResponse<PurchaseDomainResult>> => {
  try {
    const response = await api.post<{ data: PurchaseDomainResult }>('/domains/purchase', input);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const setDomainAutoRenew = async (
  domainName: string,
  enabled: boolean
): Promise<ApiResponse<PurchasedDomain>> => {
  try {
    const response = await api.patch<{ data: PurchasedDomain }>(
      `/domains/${encodeURIComponent(domainName)}/auto-renew`,
      { enabled }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};
