import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============
// Mirror of pushify_backend/src/services/admin.service.ts — every timestamp is an ISO string.

export interface AdminOverview {
  users: { total: number; verified: number; withTwoFactor: number; last7d: number; last30d: number };
  funnel: {
    registered: number;
    verified: number;
    createdProject: number;
    deployed: number;
    deploySucceeded: number;
    connectedServer: number;
    createdDatabase: number;
    paid: number;
  };
  active: { logins7d: number; logins30d: number; activeUsers7d: number; activeUsers30d: number };
  byDay: { day: string; signups: number; logins: number }[];
  deployments: { total: number; last7d: number; failed7d: number; byStatus: { status: string; count: number }[] };
  resources: {
    projects: number;
    activeProjects: number;
    servers: number;
    databases: number;
    organizations: number;
    paidOrganizations: number;
  };
  plans: { plan: string; count: number }[];
}

export type AdminSignupMethod = 'password' | 'github' | 'google';
export type AdminUserSort = 'newest' | 'last_seen' | 'most_active';
export type AdminAuthEventType = 'register' | 'login' | 'login_failed' | 'two_factor_required' | 'two_factor_failed';
export type AdminAuthMethod = 'password' | 'two_factor' | 'github' | 'google';

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  signupMethod: AdminSignupMethod;
  plan: string | null;
  organizations: number;
  projects: number;
  deployments: number;
  failedDeployments: number;
  servers: number;
  databases: number;
  activityCount: number;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  lastSeenAt: string | null;
}

export interface AdminUserOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  billingStatus: string;
  infraWalletBalanceCents: number;
  role: string;
  joinedAt: string;
  createdAt: string;
  memberCount: number;
  projectCount: number;
}

export interface AdminUserProject {
  id: string;
  name: string;
  slug: string;
  status: string;
  gitProvider: string | null;
  gitRepoUrl: string | null;
  organizationId: string;
  createdAt: string;
  deploymentCount: number;
  lastDeploymentStatus: string | null;
  lastDeploymentAt: string | null;
}

export interface AdminUserDeployment {
  id: string;
  projectId: string;
  projectName: string;
  status: string;
  trigger: string;
  branch: string | null;
  commitMessage: string | null;
  errorMessage: string | null;
  triggeredById: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export interface AdminUserServer {
  id: string;
  name: string;
  provider: string;
  status: string;
  setupStatus: string;
  region: string;
  size: string;
  isManaged: boolean;
  ipv4: string | null;
  createdAt: string;
}

export interface AdminUserDatabase {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface AdminUserSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface AdminAuthEvent {
  id: string;
  event: AdminAuthEventType;
  method: AdminAuthMethod;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AdminUserActivity {
  id: string;
  action: string;
  description: string;
  metadata: Record<string, unknown>;
  projectId: string | null;
  projectName: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export type AdminTimelineEntry =
  | { at: string; kind: 'auth'; event: AdminAuthEventType; method: AdminAuthMethod; ipAddress: string | null; userAgent: string | null }
  | { at: string; kind: 'activity'; action: string; description: string; projectName: string | null }
  | { at: string; kind: 'project'; id: string; name: string; gitProvider: string | null }
  | { at: string; kind: 'deployment'; id: string; projectName: string; status: string; trigger: string; errorMessage: string | null }
  | { at: string; kind: 'server'; id: string; name: string; provider: string; isManaged: boolean }
  | { at: string; kind: 'database'; id: string; name: string; type: string };

export interface AdminUserDetail {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    emailVerified: boolean;
    emailVerifiedAt: string | null;
    twoFactorEnabled: boolean;
    hasPassword: boolean;
    githubLinked: boolean;
    googleLinked: boolean;
    signupMethod: AdminSignupMethod;
  };
  organizations: AdminUserOrganization[];
  projects: AdminUserProject[];
  deployments: AdminUserDeployment[];
  servers: AdminUserServer[];
  databases: AdminUserDatabase[];
  sessions: AdminUserSession[];
  authEvents: AdminAuthEvent[];
  activity: AdminUserActivity[];
  timeline: AdminTimelineEntry[];
}

export interface AdminActivityItem {
  id: string;
  action: string;
  description: string;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string } | null;
  organization: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
}

export interface AdminAuthEventItem extends AdminAuthEvent {
  user: { id: string; email: string; name: string } | null;
}

export interface AdminPage {
  limit?: number;
  offset?: number;
}

export interface AdminUserListParams extends AdminPage {
  search?: string;
  sort?: AdminUserSort;
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

const pageParams = (params: object) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, string | number | undefined][]) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

// ============ Admin Functions ============

export const getAdminOverview = async (): Promise<ApiResponse<AdminOverview>> => {
  try {
    const response = await api.get<{ data: AdminOverview }>('/admin/overview');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getAdminUsers = async (
  params: AdminUserListParams = {}
): Promise<ApiResponse<{ users: AdminUserSummary[]; total: number }>> => {
  try {
    const response = await api.get<{ data: { users: AdminUserSummary[]; total: number } }>(
      `/admin/users${pageParams(params)}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getAdminUser = async (userId: string): Promise<ApiResponse<AdminUserDetail>> => {
  try {
    const response = await api.get<{ data: AdminUserDetail }>(`/admin/users/${userId}`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getAdminActivity = async (
  params: AdminPage = {}
): Promise<ApiResponse<{ items: AdminActivityItem[]; total: number }>> => {
  try {
    const response = await api.get<{ data: { items: AdminActivityItem[]; total: number } }>(
      `/admin/activity${pageParams(params)}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getAdminAuthEvents = async (
  params: AdminPage = {}
): Promise<ApiResponse<{ items: AdminAuthEventItem[]; total: number }>> => {
  try {
    const response = await api.get<{ data: { items: AdminAuthEventItem[]; total: number } }>(
      `/admin/auth-events${pageParams(params)}`
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};
