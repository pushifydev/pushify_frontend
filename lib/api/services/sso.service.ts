import { AxiosError } from 'axios';
import { api, API_BASE_URL } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

/** The organization's identity provider. The client secret is never returned. */
export interface SsoConnection {
  id: string;
  issuer: string;
  clientId: string;
  emailDomains: string[];
  enforced: boolean;
  defaultRole: string;
  lastUsedAt: string | null;
  /** What to enter as the redirect URI at the provider */
  redirectUri: string;
}

export interface SaveSsoConnectionInput {
  issuer: string;
  clientId: string;
  /** Omitted on an update keeps the stored one */
  clientSecret?: string;
  emailDomains: string[];
  enforced?: boolean;
  defaultRole?: string;
}

export interface SsoAvailability {
  available: boolean;
  /** The address may only sign in through the provider */
  enforced: boolean;
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

/** Does this address sign in through a provider? Asked as the login form is filled in. */
export const checkSso = async (email: string): Promise<ApiResponse<SsoAvailability>> => {
  try {
    const response = await api.get<{ data: SsoAvailability }>(`/sso/check?email=${encodeURIComponent(email)}`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Where to send the browser to sign in. A full page navigation, not a fetch: the provider
 * answers with its own login page and then redirects back.
 */
export const ssoStartUrl = (email: string): string =>
  `${API_BASE_URL}/sso/start?email=${encodeURIComponent(email)}`;

export const getSsoConnection = async (): Promise<ApiResponse<SsoConnection | null>> => {
  try {
    const response = await api.get<{ data: SsoConnection | null }>('/sso/connection');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const saveSsoConnection = async (
  input: SaveSsoConnectionInput
): Promise<ApiResponse<SsoConnection>> => {
  try {
    const response = await api.put<{ data: SsoConnection }>('/sso/connection', input);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteSsoConnection = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await api.delete<{ data: { success: boolean } }>('/sso/connection');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};
