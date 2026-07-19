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
  status: 'active' | 'expired' | 'transfer_pending' | 'transfer_failed';
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
  /** Registration term (default 1, max 5) */
  years?: number;
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

export const createDomainPurchaseCheckout = async (
  input: PurchaseDomainInput
): Promise<ApiResponse<{ url: string; amountCents: number }>> => {
  try {
    const response = await api.post<{ data: { url: string; amountCents: number } }>(
      '/domains/purchase/checkout',
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const confirmDomainPurchase = async (
  sessionId: string
): Promise<ApiResponse<{ fulfilled: boolean; alreadyProcessed: boolean; paymentStatus: string | null }>> => {
  try {
    const response = await api.post<{
      data: { fulfilled: boolean; alreadyProcessed: boolean; paymentStatus: string | null };
    }>('/domains/purchase/confirm', { sessionId });
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

// ============ Domain management (DNS / transfer / settings / forwarding) ============

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'SRV' | 'NS';

export interface DomainDnsRecord {
  id: string;
  host: string;
  fqdn: string;
  type: DnsRecordType;
  answer: string;
  ttl?: number;
  priority?: number;
}

export interface DnsRecordInput {
  host: string;
  type: DnsRecordType;
  answer: string;
  ttl?: number;
  priority?: number;
}

export interface DomainDetails {
  domain: PurchasedDomain;
  locked: boolean | null;
  nameservers: string[];
}

export interface DomainEmailForwarding {
  emailBox: string;
  emailTo: string;
}

export interface TransferQuote {
  domainName: string;
  retailCents: number;
}

export const getDomainDetails = async (
  domainName: string
): Promise<ApiResponse<DomainDetails>> => {
  try {
    const response = await api.get<{ data: DomainDetails }>(
      `/domains/${encodeURIComponent(domainName)}/details`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const listDomainDns = async (
  domainName: string
): Promise<ApiResponse<DomainDnsRecord[]>> => {
  try {
    const response = await api.get<{ data: DomainDnsRecord[] }>(
      `/domains/${encodeURIComponent(domainName)}/dns`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createDomainDns = async (
  domainName: string,
  record: DnsRecordInput
): Promise<ApiResponse<DomainDnsRecord>> => {
  try {
    const response = await api.post<{ data: DomainDnsRecord }>(
      `/domains/${encodeURIComponent(domainName)}/dns`,
      record
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateDomainDns = async (
  domainName: string,
  recordId: string,
  record: DnsRecordInput
): Promise<ApiResponse<DomainDnsRecord>> => {
  try {
    const response = await api.put<{ data: DomainDnsRecord }>(
      `/domains/${encodeURIComponent(domainName)}/dns/${encodeURIComponent(recordId)}`,
      record
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteDomainDns = async (
  domainName: string,
  recordId: string
): Promise<ApiResponse<{ deleted: boolean }>> => {
  try {
    const response = await api.delete<{ data: { deleted: boolean } }>(
      `/domains/${encodeURIComponent(domainName)}/dns/${encodeURIComponent(recordId)}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const setDomainLock = async (
  domainName: string,
  locked: boolean
): Promise<ApiResponse<{ locked: boolean }>> => {
  try {
    const response = await api.post<{ data: { locked: boolean } }>(
      `/domains/${encodeURIComponent(domainName)}/lock`,
      { locked }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const setDomainNameservers = async (
  domainName: string,
  nameservers: string[]
): Promise<ApiResponse<{ nameservers: string[] }>> => {
  try {
    const response = await api.post<{ data: { nameservers: string[] } }>(
      `/domains/${encodeURIComponent(domainName)}/nameservers`,
      { nameservers }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getDomainAuthCode = async (
  domainName: string
): Promise<ApiResponse<{ authCode: string }>> => {
  try {
    const response = await api.post<{ data: { authCode: string } }>(
      `/domains/${encodeURIComponent(domainName)}/auth-code`,
      {}
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getTransferQuote = async (
  domainName: string
): Promise<ApiResponse<TransferQuote>> => {
  try {
    const response = await api.get<{ data: TransferQuote }>('/domains/transfer/quote', {
      params: { domain: domainName },
    });
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const startDomainTransfer = async (input: {
  domainName: string;
  authCode: string;
}): Promise<ApiResponse<{ domain: PurchasedDomain; balanceAfterCents: number }>> => {
  try {
    const response = await api.post<{
      data: { domain: PurchasedDomain; balanceAfterCents: number };
    }>('/domains/transfer', input);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const listDomainEmailForwarding = async (
  domainName: string
): Promise<ApiResponse<DomainEmailForwarding[]>> => {
  try {
    const response = await api.get<{ data: DomainEmailForwarding[] }>(
      `/domains/${encodeURIComponent(domainName)}/email-forwarding`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const addDomainEmailForwarding = async (
  domainName: string,
  forwarding: DomainEmailForwarding
): Promise<ApiResponse<DomainEmailForwarding>> => {
  try {
    const response = await api.post<{ data: DomainEmailForwarding }>(
      `/domains/${encodeURIComponent(domainName)}/email-forwarding`,
      forwarding
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteDomainEmailForwarding = async (
  domainName: string,
  emailBox: string
): Promise<ApiResponse<{ deleted: boolean }>> => {
  try {
    const response = await api.delete<{ data: { deleted: boolean } }>(
      `/domains/${encodeURIComponent(domainName)}/email-forwarding/${encodeURIComponent(emailBox)}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const publicSearchDomains = async (
  query: string
): Promise<ApiResponse<DomainSearchResult[]>> => {
  try {
    const response = await api.get<{ data: DomainSearchResult[] }>('/domains/public-search', {
      params: { q: query },
    });
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};
