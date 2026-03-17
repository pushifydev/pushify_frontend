import { AxiosError } from 'axios';
import { api } from '../client';
import type { ApiResponse, ApiError } from '../types';

// ============ Types ============

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface OrganizationDetails {
  id: string;
  name: string;
  slug: string;
  plan: string;
  billingEmail: string | null;
  role: MemberRole;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
}

export interface AddMemberInput {
  email: string;
  role?: MemberRole;
}

export interface UpdateMemberRoleInput {
  role: MemberRole;
}

export type InvitationStatus = 'pending' | 'accepted' | 'revoked';

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  note: string | null;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvitationInfo {
  id: string;
  email: string;
  role: MemberRole;
  expiresAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SendInvitationInput {
  email: string;
  role?: 'admin' | 'member' | 'viewer';
  note?: string;
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

export const getOrganization = async (): Promise<ApiResponse<OrganizationDetails>> => {
  try {
    const response = await api.get<{ data: OrganizationDetails }>('/organizations');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateOrganization = async (
  input: UpdateOrganizationInput
): Promise<ApiResponse<OrganizationDetails>> => {
  try {
    const response = await api.patch<{ data: OrganizationDetails; message: string }>(
      '/organizations',
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getMembers = async (): Promise<ApiResponse<OrganizationMember[]>> => {
  try {
    const response = await api.get<{ data: OrganizationMember[] }>('/organizations/members');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const addMember = async (
  input: AddMemberInput
): Promise<ApiResponse<OrganizationMember>> => {
  try {
    const response = await api.post<{ data: OrganizationMember; message: string }>(
      '/organizations/members',
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateMemberRole = async (
  userId: string,
  input: UpdateMemberRoleInput
): Promise<ApiResponse<OrganizationMember>> => {
  try {
    const response = await api.patch<{ data: OrganizationMember; message: string }>(
      `/organizations/members/${userId}`,
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const removeMember = async (
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/organizations/members/${userId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Invitation API Functions ============

export const getInvitations = async (): Promise<ApiResponse<OrganizationInvitation[]>> => {
  try {
    const response = await api.get<{ data: OrganizationInvitation[] }>('/organizations/invitations');
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const sendInvitation = async (
  input: SendInvitationInput
): Promise<ApiResponse<OrganizationInvitation>> => {
  try {
    const response = await api.post<{ data: OrganizationInvitation; message: string }>(
      '/organizations/invitations',
      input
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const revokeInvitation = async (
  invitationId: string
): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/organizations/invitations/${invitationId}`);
    return { data: undefined };
  } catch (error) {
    return handleError(error);
  }
};

export const getInvitationInfo = async (
  token: string
): Promise<ApiResponse<InvitationInfo>> => {
  try {
    const response = await api.get<{ data: InvitationInfo }>(`/auth/invitations/info?token=${token}`);
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

export const acceptInvitation = async (
  token: string
): Promise<ApiResponse<{ organizationId: string; organization: { id: string; name: string; slug: string } }>> => {
  try {
    const response = await api.post<{ data: { organizationId: string; organization: { id: string; name: string; slug: string } }; message: string }>(
      '/auth/invitations/accept',
      { token }
    );
    return { data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
};

// ============ Export as namespace ============

export const organizationsService = {
  getOrganization,
  updateOrganization,
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
  getInvitations,
  sendInvitation,
  revokeInvitation,
  getInvitationInfo,
  acceptInvitation,
};
