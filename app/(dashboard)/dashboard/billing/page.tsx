'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  CreditCard,
  TrendingUp,
  Sparkles,
  Mail,
  Check,
  X,
  AlertTriangle,
  Server,
  Database,
  Folder,
  Rocket,
  Users,
  Globe,
  Key,
} from 'lucide-react';
import { useTranslation, useBillingInfo, useUpdateBillingEmail, billingKeys } from '@/hooks';
import { confirmInfraTopUp } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import type { PlanType } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import Link from 'next/link';
import { SkeletonPageHeader, SkeletonBillingSummaryCard } from '@/components/Skeleton';
import { InfraWalletSection } from './components/InfraWalletSection';
import { BillingSection } from './components/BillingSection';

const planAccents: Record<PlanType, string> = {
  free:       STATUS_COLORS.neutral,
  hobby:      STATUS_COLORS.cyan,
  pro:        STATUS_COLORS.purple,
  business:   STATUS_COLORS.orange,
  enterprise: STATUS_COLORS.green,
};

const usageIcons = {
  servers:             Server,
  databases:           Database,
  projects:            Folder,
  deploymentsThisMonth: Rocket,
  teamMembers:         Users,
  customDomains:       Globe,
};

export default function BillingPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const { data: billingInfo, isLoading } = useBillingInfo();
  const updateBillingEmail = useUpdateBillingEmail();

  useEffect(() => {
    const topup = searchParams.get('infra_topup');
    const sessionId = searchParams.get('session_id');

    const clearTopUpParams = () => {
      window.history.replaceState(null, '', '/dashboard/billing');
    };

    if (topup === 'success') {
      (async () => {
        if (sessionId) {
          const result = await confirmInfraTopUp(sessionId);
          if (result.error) {
            toast.error(result.error.message);
            clearTopUpParams();
            return;
          }
          if (result.data?.credited) {
            toast.success(t('billing', 'infraTopUpSuccess'));
          } else {
            toast.message(t('billing', 'infraTopUpPending'));
          }
        } else {
          toast.success(t('billing', 'infraTopUpSuccess'));
        }
        queryClient.invalidateQueries({ queryKey: billingKeys.infra() });
        clearTopUpParams();
      })();
    } else if (topup === 'cancelled') {
      toast.message(t('billing', 'infraTopUpCancelled'));
      clearTopUpParams();
    }
  }, [searchParams, queryClient, t]);

  const [billingEmail, setBillingEmail]   = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSuccess, setEmailSuccess]   = useState(false);
  const [emailError, setEmailError]       = useState<string | null>(null);

  const handleUpdateEmail = async () => {
    setEmailError(null);
    setEmailSuccess(false);
    try {
      await updateBillingEmail.mutateAsync({ billingEmail: billingEmail.trim() });
      setEmailSuccess(true);
      setShowEmailForm(false);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : t('billing', 'emailUpdateFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">
        <SkeletonPageHeader />
        {[1, 2, 3].map((i) => (
          <SkeletonBillingSummaryCard key={i} />
        ))}
      </div>
    );
  }

  const planAccent = billingInfo ? planAccents[billingInfo.plan] : STATUS_COLORS.neutral;

  const getUsagePercentage = (used: number, limit: number, unlimited: boolean) => {
    if (unlimited) return Math.min((used / 100) * 100, 30);
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">

      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('billing', 'title')}</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {t('billing', 'description')}
        </p>
      </div>

      {billingInfo?.billingStatus === 'past_due' && (
        <div
          className="rounded-xl p-4 flex gap-3 items-start"
          style={{
            background: `${STATUS_COLORS.orange}14`,
            border: `1px solid ${STATUS_COLORS.orange}44`,
          }}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: STATUS_COLORS.orange }} />
          <div className="space-y-1 min-w-0">
            <p className="font-medium text-sm">{t('billing', 'billingStatusPastDueTitle')}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('billing', 'billingStatusPastDueDesc')}
            </p>
            <Link href="/dashboard/billing/plans" className="text-sm font-medium underline-offset-2 hover:underline">
              {t('billing', 'comparePlans')}
            </Link>
          </div>
        </div>
      )}

      {billingInfo?.billingStatus === 'suspended' && (
        <div
          className="rounded-xl p-4 flex gap-3 items-start"
          style={{
            background: `${STATUS_COLORS.error}14`,
            border: `1px solid ${STATUS_COLORS.error}44`,
          }}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: STATUS_COLORS.error }} />
          <div className="space-y-1 min-w-0">
            <p className="font-medium text-sm">{t('billing', 'billingStatusSuspendedTitle')}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('billing', 'billingStatusSuspendedDesc')}
            </p>
            <Link href="/dashboard/billing/plans" className="text-sm font-medium underline-offset-2 hover:underline">
              {t('billing', 'comparePlans')}
            </Link>
          </div>
        </div>
      )}

      <InfraWalletSection />

      {/* Current Plan */}
      <div
        className="rounded-xl p-6 space-y-0"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
          boxShadow: `inset 0 2px 0 0 ${planAccent}55`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${planAccent}18` }}
            >
              <CreditCard className="w-5 h-5" style={{ color: planAccent }} />
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wide mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {t('billing', 'currentPlan')}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {billingInfo?.planName || t('billing', 'free')}
                </span>
                {billingInfo && billingInfo.price > 0 && (
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    ${billingInfo.price}
                    {t('billing', 'perMonth')}
                  </span>
                )}
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {organization?.name || t('billing', 'personalOrganization')}
              </p>
            </div>
          </div>
          <Link href="/dashboard/billing/plans" className="btn btn-primary shrink-0">
            {t('billing', 'comparePlans')}
          </Link>
        </div>
      </div>

      {billingInfo && (
        <BillingSection
          icon={Key}
          title={t('billing', 'apiRateLimit')}
          description={t('billing', 'apiRateLimitHint')}
          action={
            <Link
              href="/dashboard/settings?tab=api-keys"
              className="btn btn-secondary text-xs shrink-0 hidden sm:inline-flex"
            >
              {t('apiKeys', 'title')}
            </Link>
          }
        >
          <div
            className="rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {billingInfo.apiRequestsPerMinute === -1
                ? t('billing', 'unlimited')
                : t('billing', 'apiRateLimitValue').replace(
                    '{count}',
                    String(billingInfo.apiRequestsPerMinute)
                  )}
            </p>
            <Link
              href="/dashboard/settings?tab=api-keys"
              className="btn btn-secondary text-xs shrink-0 sm:hidden"
            >
              {t('apiKeys', 'title')}
            </Link>
          </div>
        </BillingSection>
      )}

      {billingInfo && (
        <BillingSection
          icon={TrendingUp}
          title={t('billing', 'usage')}
          description={t('billing', 'usageDescription')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.entries(billingInfo.usage) as [keyof typeof billingInfo.usage, (typeof billingInfo.usage)[keyof typeof billingInfo.usage]][]).map(([key, value]) => {
              const Icon       = usageIcons[key];
              const percentage = getUsagePercentage(value.used, value.limit, value.unlimited);
              const isWarning  = !value.unlimited && percentage >= 80;
              const isDanger   = !value.unlimited && percentage >= 100;
              const barColor   = isDanger ? STATUS_COLORS.error : isWarning ? STATUS_COLORS.warning : 'var(--accent-cyan)';

              return (
                <div
                  key={key}
                  className="rounded-lg p-4"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-cyan)' }} />
                      <p
                        className="text-xs uppercase tracking-wide truncate"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {t('billing', key as keyof typeof usageIcons)}
                      </p>
                    </div>
                    <span
                      className="text-sm font-semibold tabular-nums shrink-0"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {value.used}
                      <span style={{ color: 'var(--text-muted)' }}> / </span>
                      {value.unlimited ? '∞' : value.limit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass-border)' }}>
                    <div
                      className="h-full rounded-full bar-grow"
                      style={{ width: `${percentage}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </BillingSection>
      )}

      {billingInfo && (
        <BillingSection
          icon={Sparkles}
          iconColor="var(--accent-purple)"
          title={t('billing', 'features')}
          description={t('billing', 'featuresDescription')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.entries(billingInfo.features) as [keyof typeof billingInfo.features, boolean][]).map(([key, enabled]) => (
              <div
                key={key}
                className="rounded-lg p-4 flex items-center gap-3"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: enabled ? 'rgba(34,197,94,0.12)' : 'var(--bg-secondary)',
                    border: enabled ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--glass-border)',
                  }}
                >
                  {enabled ? (
                    <Check className="w-4 h-4" style={{ color: STATUS_COLORS.success }} />
                  ) : (
                    <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {t('billing', key)}
                </span>
              </div>
            ))}
          </div>
        </BillingSection>
      )}

      <BillingSection
        icon={Mail}
        iconColor="#60a5fa"
        title={t('billing', 'billingEmail')}
        description={t('billing', 'billingEmailDesc')}
      >
        {emailError && (
          <div
            className="px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: STATUS_COLORS.pink,
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {emailError}
          </div>
        )}

        {emailSuccess && (
          <div
            className="px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
            style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              color: STATUS_COLORS.success,
            }}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            {t('billing', 'emailUpdated')}
          </div>
        )}

        {!showEmailForm ? (
          <div
            className="rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                {t('billing', 'billingEmailCurrent')}
              </p>
              <p
                className="text-lg font-medium truncate"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
              >
                {billingInfo?.billingEmail || '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBillingEmail(billingInfo?.billingEmail || '');
                setShowEmailForm(true);
              }}
              className="btn btn-primary shrink-0"
            >
              {t('billing', 'updateEmail')}
            </button>
          </div>
        ) : (
          <div className="rounded-lg p-4 space-y-3" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              {t('billing', 'billingEmailNew')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={billingEmail}
                onChange={e => setBillingEmail(e.target.value)}
                placeholder={t('billing', 'billingEmailPlaceholder')}
                className="input flex-1"
              />
              <button
                type="button"
                onClick={handleUpdateEmail}
                disabled={!billingEmail.trim() || updateBillingEmail.isPending}
                className="btn btn-primary shrink-0"
              >
                {updateBillingEmail.isPending ? t('billing', 'updating') : t('common', 'save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setEmailError(null);
                }}
                className="btn btn-secondary shrink-0"
              >
                {t('common', 'cancel')}
              </button>
            </div>
          </div>
        )}
      </BillingSection>

    </div>
  );
}
