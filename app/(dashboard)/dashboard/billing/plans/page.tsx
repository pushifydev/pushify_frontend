'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAvailablePlans,
  useBillingInfo,
  useChangePlan,
  useCreateCheckoutSession,
  useCreatePortalSession,
  useTranslation,
} from '@/hooks';
import type { PlanType } from '@/lib/api';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api/get-error-message';
import { appT } from '@/lib/i18n/app-translate';
import { formatMessage } from '@/lib/i18n/format-message';
import { Skeleton } from '@/components/Skeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PlansCompareView } from '../components/PlansCompareView';

export default function PlansPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: plans, isLoading: plansLoading } = useAvailablePlans();
  const { data: billingInfo, isLoading: billingLoading } = useBillingInfo();

  const checkout = useCreateCheckoutSession();
  const portal = useCreatePortalSession();
  const changePlan = useChangePlan();
  const [pendingPlan, setPendingPlan] = useState<PlanType | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<PlanType | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const currentPlan = billingInfo?.plan || 'free';
  const isLoading = plansLoading || billingLoading;

  const fail = (err: unknown) => {
    toast.error(appT('errors', 'somethingWentWrong'), { description: getApiErrorMessage(err) });
    setPendingPlan(null);
  };

  const startCheckout = (planKey: PlanType) => {
    setPendingPlan(planKey);
    checkout.mutate({ planType: planKey, billingCycle }, { onError: fail });
  };

  // An organisation that already pays switches its subscription in place: the upgrade is charged
  // to the card on file now. If the bank declines or wants 3-D Secure, Stripe's invoice page takes over.
  const switchPlan = (planKey: PlanType) => {
    setPendingPlan(planKey);
    changePlan.mutate(
      { planType: planKey, billingCycle },
      {
        onSuccess: (result) => {
          if (result.status === 'checkout_required') {
            checkout.mutate({ planType: planKey, billingCycle }, { onError: fail });
            return;
          }
          if (result.status === 'payment_required') {
            toast.message(t('billing', 'openingPaymentPage'));
            window.location.href = result.payUrl;
            return;
          }
          setConfirmPlan(null);
          setPendingPlan(null);
          toast.success(formatMessage(t('billing', 'planChanged'), { plan: plans?.[result.plan]?.name ?? result.plan }));
          router.push('/dashboard/billing');
        },
        onError: (err) => {
          setConfirmPlan(null);
          fail(err);
        },
      },
    );
  };

  const handlePlanAction = (planKey: PlanType) => {
    if (planKey === 'free') {
      setPendingPlan(planKey);
      portal.mutate(undefined, { onError: fail });
      return;
    }
    if (planKey === 'enterprise') {
      window.open('mailto:sales@pushify.dev?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }
    if (currentPlan === 'free') startCheckout(planKey);
    else setConfirmPlan(planKey);
  };

  if (isLoading) {
    return (
      <div className="dash-page max-w-5xl space-y-8 animate-slide-in pb-12 min-w-0">
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

  const isUpgrade = confirmPlan !== null && plans[confirmPlan].price > plans[currentPlan].price;

  return (
    <>
      <PlansCompareView
        plans={plans}
        currentPlan={currentPlan}
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
        pendingPlan={pendingPlan}
        onPlanAction={handlePlanAction}
      />
      <ConfirmDialog
        open={confirmPlan !== null}
        onOpenChange={(open) => {
          if (!open && !changePlan.isPending) setConfirmPlan(null);
        }}
        variant="info"
        title={formatMessage(t('billing', 'changePlanTitle'), { plan: confirmPlan ? plans[confirmPlan].name : '' })}
        description={t('billing', isUpgrade ? 'changePlanUpgradeDesc' : 'changePlanDowngradeDesc')}
        confirmText={t('billing', 'changePlanConfirm')}
        cancelText={t('common', 'cancel')}
        loading={changePlan.isPending || checkout.isPending}
        onConfirm={() => {
          if (confirmPlan) switchPlan(confirmPlan);
        }}
      />
    </>
  );
}
