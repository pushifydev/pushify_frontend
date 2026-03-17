import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export type PlanType = 'free' | 'hobby' | 'pro' | 'business' | 'enterprise';

export interface UsageItem {
  used: number;
  limit: number;
  unlimited: boolean;
}

export interface UsageStats {
  servers: UsageItem;
  projects: UsageItem;
  deploymentsThisMonth: UsageItem;
  teamMembers: UsageItem;
  customDomains: UsageItem;
}

export interface BillingFeatures {
  previewDeployments: boolean;
  healthChecks: boolean;
  prioritySupport: boolean;
}

export interface BillingInfo {
  plan: PlanType;
  planName: string;
  price: number;
  billingEmail: string | null;
  usage: UsageStats;
  features: BillingFeatures;
}

export interface PlanLimits {
  servers: number;
  projects: number;
  deploymentsPerMonth: number;
  teamMembers: number;
  customDomains: number;
  storageGb: number;
  bandwidthGb: number;
  buildMinutesPerMonth: number;
  previewDeployments: boolean;
  healthChecks: boolean;
  prioritySupport: boolean;
}

export interface PlanInfo {
  name: string;
  price: number;
  limits: PlanLimits;
}

export type AvailablePlans = Record<PlanType, PlanInfo>;

export interface UpdateBillingEmailInput {
  billingEmail: string;
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

export const getBillingInfo = async (): Promise<ApiResponse<BillingInfo>> => {
  try {
    const response = await api.get<{ data: BillingInfo }>('/billing');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getAvailablePlans = async (): Promise<ApiResponse<AvailablePlans>> => {
  try {
    const response = await api.get<{ data: AvailablePlans }>('/billing/plans');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateBillingEmail = async (
  input: UpdateBillingEmailInput
): Promise<ApiResponse<void>> => {
  try {
    await api.patch('/billing/email', input);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const billingService = {
  getBillingInfo,
  getAvailablePlans,
  updateBillingEmail,
};
