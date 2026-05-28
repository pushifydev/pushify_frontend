'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
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
  type UpdateBillingEmailInput,
  type CheckoutInput,
} from '@/lib/api';

// Query Keys
export const billingKeys = {
  all: ['billing'] as const,
  info: () => [...billingKeys.all, 'info'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  infra: () => [...billingKeys.all, 'infra'] as const,
};

// ============ Queries ============

export function useBillingInfo() {
  return useQuery({
    queryKey: billingKeys.info(),
    queryFn: async () => {
      const result = await getBillingInfo();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}

export function useAvailablePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: async () => {
      const result = await getAvailablePlans();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    staleTime: 1000 * 60 * 60, // Plans don't change often - cache for 1 hour
  });
}

// ============ Mutations ============

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: async () => {
      const result = await getSubscriptionStatus();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}

// ============ Mutations ============

export function useUpdateBillingEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBillingEmailInput) => {
      const result = await updateBillingEmail(input);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.info() });
    },
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const result = await createCheckoutSession(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: async () => {
      const result = await createPortalSession();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await cancelSubscription();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await resumeSubscription();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useInfraBilling() {
  return useQuery({
    queryKey: billingKeys.infra(),
    queryFn: async () => {
      const result = await getInfraBilling();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });
}

export function useInfraTopUp() {
  return useMutation({
    mutationFn: async (amountCents: number) => {
      const result = await createInfraTopUpSession(amountCents);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}
