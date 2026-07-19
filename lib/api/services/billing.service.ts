import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export type PlanType = 'free' | 'hobby' | 'pro' | 'business' | 'enterprise';

export interface UsageItem {
  used: number;
  /** Enforced limit (may include grandfather bonus) */
  limit: number;
  /** Subscribed plan limit when different from `limit` */
  planLimit?: number;
  unlimited: boolean;
}

export type UsageLimitKey = keyof UsageStats;

export interface UsageStats {
  servers: UsageItem;
  databases: UsageItem;
  projects: UsageItem;
  deploymentsThisMonth: UsageItem;
  teamMembers: UsageItem;
  customDomains: UsageItem;
  buildMinutesThisMonth: UsageItem;
  storageGb: UsageItem;
  bandwidthGb: UsageItem;
}

export interface GrandfatherInfo {
  active: boolean;
  until: string | null;
  boostedResources: UsageLimitKey[];
}

export interface BillingFeatures {
  previewDeployments: boolean;
  healthChecks: boolean;
  prioritySupport: boolean;
}

export type BillingStatus = 'active' | 'past_due' | 'suspended';

export interface BillingInfo {
  plan: PlanType;
  planName: string;
  price: number;
  billingStatus: BillingStatus;
  billingEmail: string | null;
  /** Per API key, per minute (-1 = unlimited) */
  apiRequestsPerMinute: number;
  usage: UsageStats;
  features: BillingFeatures;
  grandfather: GrandfatherInfo;
}

export interface PlanLimits {
  apiRequestsPerMinute: number;
  servers: number;
  databases: number;
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

// ============ Stripe Types ============

export interface CheckoutInput {
  planType: PlanType;
  billingCycle: 'monthly' | 'yearly';
}

export interface SubscriptionStatus {
  plan: PlanType;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasPaymentMethod: boolean;
}

// ============ Stripe API Functions ============

export const createCheckoutSession = async (
  input: CheckoutInput
): Promise<ApiResponse<{ url: string }>> => {
  try {
    const response = await api.post<{ data: { url: string } }>('/billing/checkout', input);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createPortalSession = async (): Promise<ApiResponse<{ url: string }>> => {
  try {
    const response = await api.post<{ data: { url: string } }>('/billing/portal');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getSubscriptionStatus = async (): Promise<ApiResponse<SubscriptionStatus>> => {
  try {
    const response = await api.get<{ data: SubscriptionStatus }>('/billing/subscription');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export type CancellationReason =
  | 'too_expensive'
  | 'missing_features'
  | 'bugs'
  | 'switched'
  | 'project_ended'
  | 'other';

export const sendCancellationFeedback = async (input: {
  reason: CancellationReason;
  comment?: string;
}): Promise<ApiResponse<{ recorded: boolean }>> => {
  try {
    const response = await api.post<{ data: { recorded: boolean } }>(
      '/billing/cancellation-feedback',
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const cancelSubscription = async (): Promise<ApiResponse<void>> => {
  try {
    await api.post('/billing/cancel');
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const resumeSubscription = async (): Promise<ApiResponse<void>> => {
  try {
    await api.post('/billing/resume');
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Infrastructure wallet ============

export interface InfraWalletSummary {
  balanceCents: number;
  balanceUsd: string;
  marginPercent: number;
  estimatedMonthlyBurnCents: number;
  runningManagedServers: number;
  topUpAmountsCents: readonly number[];
  isLowBalance: boolean;
  runwayDays: number | null;
}

export interface InfraWalletTransaction {
  id: string;
  type: string;
  amountCents: number;
  balanceAfterCents: number;
  description: string | null;
  serverId: string | null;
  createdAt: string;
}

export interface InfraBillingData {
  wallet: InfraWalletSummary;
  transactions: InfraWalletTransaction[];
}

export const getInfraBilling = async (): Promise<ApiResponse<InfraBillingData>> => {
  try {
    const response = await api.get<{ data: InfraBillingData }>('/billing/infra');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const createInfraTopUpSession = async (
  amountCents: number,
): Promise<ApiResponse<{ url: string }>> => {
  try {
    const response = await api.post<{ data: { url: string } }>('/billing/infra/topup', {
      amountCents,
    });
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export type InfraTopUpConfirmResult = {
  credited: boolean;
  alreadyCredited?: boolean;
  paymentStatus: string | null;
  balanceCents: number;
  amountCents: number;
};

export const confirmInfraTopUp = async (
  sessionId: string,
): Promise<ApiResponse<InfraTopUpConfirmResult>> => {
  try {
    const response = await api.post<{ data: InfraTopUpConfirmResult }>('/billing/infra/confirm', {
      sessionId,
    });
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const billingService = {
  getBillingInfo,
  getAvailablePlans,
  updateBillingEmail,
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  cancelSubscription,
  resumeSubscription,
  getInfraBilling,
  createInfraTopUpSession,
  confirmInfraTopUp,
};

// ============ Invoices ============

export interface Invoice {
  id: string;
  number: string | null;
  createdAt: string;
  amountDueCents: number;
  amountPaidCents: number;
  currency: string;
  status: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

export const getInvoices = async (): Promise<ApiResponse<Invoice[]>> => {
  try {
    const response = await api.get<{ data: Invoice[] }>('/billing/invoices');
    return { data: response.data.data };
  } catch (error) {
    const axiosError = error as import('axios').AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};
