import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';
import type { UsageStats } from './billing.service';

const handleError = <T>(error: unknown): ApiResponse<T> => {
  const axiosError = error as AxiosError<{ error: ApiError }>;
  return {
    error: axiosError.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server',
    },
  };
};

export interface DeploymentCounts {
  running: number;
  inProgress: number;
  failed: number;
  failedLast24h: number;
}

export interface RecentFailedDeployment {
  id: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  errorMessage: string | null;
  createdAt: string;
}

export type ActionSeverity = 'critical' | 'warning' | 'info';

export interface DashboardActionItem {
  id: string;
  severity: ActionSeverity;
  title: string;
  description: string;
  href: string;
}

export type UsageWarningKey = keyof UsageStats;

export interface UsageWarning {
  key: UsageWarningKey;
  used: number;
  limit: number;
  percent: number;
}

export interface DashboardInfraWalletAlert {
  isLowBalance: boolean;
  balanceCents: number;
  runwayDays: number | null;
}

export interface DashboardOverview {
  deployments: DeploymentCounts;
  recentFailures: RecentFailedDeployment[];
  actionItems: DashboardActionItem[];
  usageWarnings: UsageWarning[];
  infraWallet: DashboardInfraWalletAlert | null;
}

export const getDashboardOverview = async (): Promise<ApiResponse<DashboardOverview>> => {
  try {
    const response = await api.get<{ data: DashboardOverview }>('/dashboard/overview');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const dashboardService = {
  getOverview: getDashboardOverview,
};
