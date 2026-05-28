'use client';

import { useState } from 'react';
import { useAvailablePlans, useBillingInfo, useCreateCheckoutSession, useCreatePortalSession } from '@/hooks';
import type { PlanType } from '@/lib/api';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api/get-error-message';
import { appT } from '@/lib/i18n/app-translate';
import { Skeleton } from '@/components/Skeleton';
import { PlansCompareView } from '../components/PlansCompareView';

export default function PlansPage() {
  const { data: plans, isLoading: plansLoading } = useAvailablePlans();
  const { data: billingInfo, isLoading: billingLoading } = useBillingInfo();

  const checkout = useCreateCheckoutSession();
  const portal = useCreatePortalSession();
  const [pendingPlan, setPendingPlan] = useState<PlanType | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const currentPlan = billingInfo?.plan || 'free';
  const isLoading = plansLoading || billingLoading;

  const handlePlanAction = (planKey: PlanType) => {
    setPendingPlan(planKey);
    if (planKey === 'free') {
      portal.mutate(undefined, {
        onError: (err) => {
          toast.error(appT('errors', 'somethingWentWrong'), { description: getApiErrorMessage(err) });
          setPendingPlan(null);
        },
      });
      return;
    }
    if (planKey === 'enterprise') {
      window.open('mailto:sales@pushify.dev?subject=Enterprise Plan Inquiry', '_blank');
      setPendingPlan(null);
      return;
    }
    checkout.mutate(
      { planType: planKey, billingCycle },
      {
        onError: (err) => {
          toast.error(appT('errors', 'somethingWentWrong'), { description: getApiErrorMessage(err) });
          setPendingPlan(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="dash-page max-w-4xl space-y-10 animate-slide-in pb-12 min-w-0">
        <Skeleton className="h-4 w-28" />
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-full max-w-sm rounded" />
          </div>
          <Skeleton className="h-9 w-52 rounded-lg shrink-0" />
        </div>
        <Skeleton className="h-[22rem] w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!plans) return null;

  return (
    <PlansCompareView
      plans={plans}
      currentPlan={currentPlan}
      billingCycle={billingCycle}
      onBillingCycleChange={setBillingCycle}
      pendingPlan={pendingPlan}
      onPlanAction={handlePlanAction}
    />
  );
}
