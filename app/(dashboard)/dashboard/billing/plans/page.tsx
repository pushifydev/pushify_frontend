'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Check, X, Star, Zap,
  Server, Folder, Rocket, Users, Globe, Key,
  HardDrive, Wifi, Clock, Activity, HeartPulse, Headphones,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useAvailablePlans, useBillingInfo, useCreateCheckoutSession, useCreatePortalSession } from '@/hooks';
import type { PlanType, PlanLimits } from '@/lib/api';
import type { TranslationKeys } from '@/lib/i18n/locales/en';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api/get-error-message';
import { appT } from '@/lib/i18n/app-translate';
import { Skeleton, SkeletonPlanCompareCard } from '@/components/Skeleton';

const PLAN_ORDER: PlanType[] = ['free', 'hobby', 'pro', 'business', 'enterprise'];

const PLAN_ACCENTS: Record<PlanType, string> = {
  free: '#52525e',
  hobby: '#6366f1',
  pro: '#a78bfa',
  business: '#f59e0b',
  enterprise: '#22c55e',
};

const PLAN_ICONS: Record<PlanType, typeof Zap> = {
  free: Zap,
  hobby: Rocket,
  pro: Star,
  business: Globe,
  enterprise: HeartPulse,
};

type BillingLabelKey = keyof TranslationKeys['billing'];

interface LimitRow {
  key: keyof PlanLimits;
  labelKey: BillingLabelKey;
  icon: typeof Server;
  type: 'number' | 'boolean';
  unit?: string;
}

const LIMIT_ROWS: LimitRow[] = [
  { key: 'apiRequestsPerMinute', labelKey: 'apiRequestsPerMinuteShort', icon: Key, type: 'number', unit: '/min' },
  { key: 'servers', labelKey: 'servers', icon: Server, type: 'number' },
  { key: 'projects', labelKey: 'projects', icon: Folder, type: 'number' },
  { key: 'deploymentsPerMonth', labelKey: 'deploymentsPerMonthShort', icon: Rocket, type: 'number' },
  { key: 'teamMembers', labelKey: 'teamMembers', icon: Users, type: 'number' },
  { key: 'customDomains', labelKey: 'customDomains', icon: Globe, type: 'number' },
  { key: 'storageGb', labelKey: 'storageGb', icon: HardDrive, type: 'number', unit: 'GB' },
  { key: 'bandwidthGb', labelKey: 'bandwidthGb', icon: Wifi, type: 'number', unit: 'GB' },
  { key: 'buildMinutesPerMonth', labelKey: 'buildMinutes', icon: Clock, type: 'number', unit: 'min' },
  { key: 'previewDeployments', labelKey: 'previewDeployments', icon: Activity, type: 'boolean' },
  { key: 'healthChecks', labelKey: 'healthChecks', icon: HeartPulse, type: 'boolean' },
  { key: 'prioritySupport', labelKey: 'prioritySupport', icon: Headphones, type: 'boolean' },
];

function formatLimit(
  value: number | boolean,
  type: 'number' | 'boolean',
  unit: string | undefined,
  unlimitedLabel: string,
): string {
  if (type === 'boolean') return '';
  if (typeof value === 'number') {
    if (value >= 9999 || value === -1) return unlimitedLabel;
    return unit ? `${value} ${unit}` : `${value}`;
  }
  return String(value);
}

export default function PlansPage() {
  const { t } = useTranslation();
  const { data: plans, isLoading: plansLoading } = useAvailablePlans();
  const { data: billingInfo, isLoading: billingLoading } = useBillingInfo();

  const checkout = useCreateCheckoutSession();
  const portal = useCreatePortalSession();
  const [pendingPlan, setPendingPlan] = useState<PlanType | null>(null);
  const currentPlan = billingInfo?.plan || 'free';
  const isLoading = plansLoading || billingLoading;
  const unlimitedLabel = t('billing', 'unlimited');

  const handlePlanAction = (planKey: PlanType) => {
    setPendingPlan(planKey);
    if (planKey === 'free') {
      // Downgrade to free — open portal to cancel
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
      return;
    }
    checkout.mutate(
      { planType: planKey, billingCycle: 'monthly' },
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
      <div className="dash-page max-w-7xl space-y-8 animate-slide-in">
        <Skeleton className="h-4 w-36" />
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Skeleton className="h-10 w-80 max-w-full mx-auto rounded-lg" />
          <Skeleton className="h-4 w-full max-w-lg mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {[...Array(5)].map((_, i) => (
            <SkeletonPlanCompareCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!plans) return null;

  return (
    <div className="dash-page max-w-7xl space-y-8 animate-slide-in">
      {/* Back */}
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('billing', 'title')}
      </Link>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {t('billing', 'comparePlans')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('billing', 'comparePlansSubtitle')}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {PLAN_ORDER.map((planKey, i) => {
          const plan = plans[planKey];
          if (!plan) return null;

          const accent = PLAN_ACCENTS[planKey];
          const Icon = PLAN_ICONS[planKey];
          const isCurrent = currentPlan === planKey;
          const isPopular = planKey === 'pro';
          const currentIdx = PLAN_ORDER.indexOf(currentPlan);
          const thisIdx = i;

          let buttonLabel = t('billing', 'upgradeButton');
          let buttonStyle: 'primary' | 'secondary' | 'current' = 'primary';
          if (isCurrent) {
            buttonLabel = t('billing', 'currentPlan');
            buttonStyle = 'current';
          } else if (thisIdx < currentIdx) {
            buttonLabel = t('billing', 'downgradeButton');
            buttonStyle = 'secondary';
          }

          return (
            <div
              key={planKey}
              className="relative flex flex-col rounded-xl overflow-visible"
              style={{
                background: 'var(--bg-secondary)',
                borderWidth: '2px 1px 1px 1px',
                borderStyle: 'solid',
                borderColor: `${accent} var(--border-subtle) var(--border-subtle) var(--border-subtle)`,
                borderRadius: 12,
                ...(isPopular ? { transform: 'scale(1.03)', zIndex: 10 } : {}),
              }}
            >
              {/* Popular badge */}
              {isPopular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap dash-colored-fill"
                  style={{
                    background: accent,
                    boxShadow: `0 0 20px ${accent}40`,
                  }}
                >
                  <Star className="w-2.5 h-2.5 fill-current" />
                  {t('billing', 'planMostPopular')}
                </div>
              )}

              {/* Current plan indicator */}
              {isCurrent && !isPopular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  {t('billing', 'currentPlanBadge')}
                </div>
              )}

              <div className="p-5 flex flex-col h-full">
                {/* Plan header */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${accent}14`,
                      border: `1px solid ${accent}25`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: accent }} />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                    >
                      {plan.name}
                    </h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {plan.price < 0 ? t('billing', 'planPriceCustom') : `$${plan.price}`}
                    </span>
                    {plan.price >= 0 && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t('billing', 'perMonth')}
                      </span>
                    )}
                  </div>
                  {plan.price === 0 && (
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {t('billing', 'planFreeForeverLabel')}
                    </span>
                  )}
                  {plan.price < 0 && (
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {t('billing', 'planContactPricing')}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="mb-4" style={{ borderTop: '1px solid var(--border-subtle)' }} />

                {/* Limits */}
                <div className="space-y-2.5 flex-1 mb-5">
                  {LIMIT_ROWS.map((row) => {
                    const value = plan.limits[row.key];
                    const isBool = row.type === 'boolean';
                    const boolVal = value as boolean;
                    const numStr = formatLimit(
                      value as number | boolean,
                      row.type,
                      row.unit,
                      unlimitedLabel,
                    );

                    return (
                      <div key={row.key} className="flex items-center justify-between text-[12px]">
                        <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                          <row.icon className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                          {t('billing', row.labelKey)}
                        </span>
                        {isBool ? (
                          boolVal ? (
                            <Check className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                          ) : (
                            <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                          )
                        ) : (
                          <span
                            className="font-medium"
                            style={{
                              color: numStr === unlimitedLabel ? accent : 'var(--text-primary)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: 11,
                            }}
                          >
                            {numStr}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <button
                  disabled={isCurrent || (pendingPlan !== null && pendingPlan !== planKey)}
                  onClick={() => handlePlanAction(planKey)}
                  className={`w-full py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-default ${
                    buttonStyle === 'primary' ? 'dash-colored-fill' : ''
                  }`}
                  style={
                    buttonStyle === 'primary'
                      ? { background: accent }
                      : buttonStyle === 'current'
                      ? {
                          background: 'var(--hover-overlay)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-subtle)',
                        }
                      : {
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }
                  }
                >
                  {pendingPlan === planKey ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    buttonLabel
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        {t('billing', 'plansFooterLead')}{' '}
        {t('billing', 'plansFooterNeedCustom')}{' '}
        <a href="mailto:support@pushify.dev" style={{ color: 'var(--accent-cyan)' }}>
          {t('billing', 'plansContactUs')}
        </a>
      </p>
    </div>
  );
}
