'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrganization,
  getMyOrganizations,
  switchOrganization,
  updateOrganization,
  getMembers,
  addMember,
  updateMemberRole,
  updateMemberProjectAccess,
  updateMemberStudioAccess,
  removeMember,
  getInvitations,
  sendInvitation,
  revokeInvitation,
  acceptInvitation,
  type UpdateOrganizationInput,
  type AddMemberInput,
  type UpdateMemberRoleInput,
  type UpdateMemberProjectAccessInput,
  type SendInvitationInput,
  type StudioAccess,
} from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

// Query Keys
export const organizationKeys = {
  all: ['organization'] as const,
  details: () => [...organizationKeys.all, 'details'] as const,
  mine: () => [...organizationKeys.all, 'mine'] as const,
  members: () => [...organizationKeys.all, 'members'] as const,
  invitations: () => [...organizationKeys.all, 'invitations'] as const,
};

// ============ Queries ============

export function useOrganization() {
  return useQuery({
    queryKey: organizationKeys.details(),
    queryFn: async () => {
      const result = await getOrganization();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}

export function useOrganizationMembers() {
  return useQuery({
    queryKey: organizationKeys.members(),
    queryFn: async () => {
      const result = await getMembers();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

/** All workspaces the user belongs to — powers the switcher. */
export function useMyOrganizations() {
  return useQuery({
    queryKey: organizationKeys.mine(),
    queryFn: async () => {
      const result = await getMyOrganizations();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

// ============ Mutations ============

/**
 * Switch the active workspace. switchOrganization() persists the new scoped tokens; here we
 * reflect the org in the auth store and refetch every query so all org-scoped data reloads.
 */
export function useSwitchOrganization() {
  const queryClient = useQueryClient();
  const setOrganization = useAuthStore((s) => s.setOrganization);

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const result = await switchOrganization(organizationId);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (organization) => {
      setOrganization(organization);
      queryClient.invalidateQueries();
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateOrganizationInput) => {
      const result = await updateOrganization(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.details() });
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddMemberInput) => {
      const result = await addMember(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members() });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, input }: { userId: string; input: UpdateMemberRoleInput }) => {
      const result = await updateMemberRole(userId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members() });
    },
  });
}

/** Data-browser permission for one member (owner/admin only). */
export function useUpdateMemberStudioAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, access }: { userId: string; access: StudioAccess }) => {
      const result = await updateMemberStudioAccess(userId, access);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members() });
    },
  });
}

export function useUpdateMemberProjectAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      input,
    }: {
      userId: string;
      input: UpdateMemberProjectAccessInput;
    }) => {
      const result = await updateMemberProjectAccess(userId, input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members() });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await removeMember(userId);
      if (result.error) throw new Error(result.error.message);
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members() });
    },
  });
}

// ============ Invitation Queries ============

export function useOrganizationInvitations() {
  return useQuery({
    queryKey: organizationKeys.invitations(),
    queryFn: async () => {
      const result = await getInvitations();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });
}

// ============ Invitation Mutations ============

export function useSendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendInvitationInput) => {
      const result = await sendInvitation(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.invitations() });
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const result = await revokeInvitation(invitationId);
      if (result.error) throw new Error(result.error.message);
      return invitationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.invitations() });
    },
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async (token: string) => {
      const result = await acceptInvitation(token);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}
