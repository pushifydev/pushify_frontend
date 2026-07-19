'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  CreditCard,
  Sparkles,
  Mail,
  Check,
  X,
  AlertTriangle,
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
import { InvoicesSection } from './components/InvoicesSection';
import { CancelSubscriptionModal } from './components/CancelSubscriptionModal';
import { BillingSection } from './components/BillingSection';
import { UsageLimitsAlert, UsageLimitsSection } from './components/UsageLimitsSection';
import { formatMessage } from '@/lib/i18n/format-message';
import type { UsageLimitKey, UsageStats } from '@/lib/api/services/billing.service';

const USAGE_BOOST_LABEL_KEYS: Record<UsageLimitKey, keyof import('@/lib/i18n/locales/en').TranslationKeys['billing']> = {
  servers: 'servers',
  databases: 'databases',
  projects: 'projects',
  deploymentsThisMonth: 'deploymentsThisMonth',
  buildMinutesThisMonth: 'buildMinutesThisMonth',
  storageGb: 'storageGb',
  bandwidthGb: 'bandwidthGb',
  teamMembers: 'teamMembers',
  customDomains: 'customDomains',
};

const planAccents: Record<PlanType, string> = {
  free:       STATUS_COLORS.neutral,
  hobby:      STATUS_COLORS.cyan,
  pro:        STATUS_COLORS.purple,
  business:   STATUS_COLORS.orange,
  enterprise: STATUS_COLORS.green,
};

export default function BillingPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);
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
            toast.error(t('errors', 'somethingWentWrong'), {
              description: result.error.message,
            });
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
      <div className="dash-page max-w-4xl space-y-6 animate-slide-in">
        <SkeletonPageHeader />
        {[1, 2, 3].map((i) => (
          <SkeletonBillingSummaryCard key={i} />
        ))}
      </div>
    );
  }

  const planAccent = billingInfo ? planAccents[billingInfo.plan] : STATUS_COLORS.neutral;

  return (
    <div className="dash-page max-w-4xl space-y-6 animate-slide-in">

      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('billing', 'title')}</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {t('billing', 'description')}
        </p>
      </div>

      {billingInfo?.billingStatus === 'past_due' && (
        <div className="dash-panel dash-callout-attention p-4 flex gap-3 items-start">
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

      {billingInfo?.grandfather?.active && billingInfo.grandfather.until && (
        <div className="dash-panel p-4 flex gap-3 items-start border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5">
          <Sparkles className="w-5 h-5 shrink-0 text-[var(--accent-cyan)] mt-0.5" />
          <div className="min-w-0 space-y-2">
            <p className="text-sm text-[var(--text-secondary)]">
              {formatMessage(t('billing', 'grandfatherBanner'), {
                date: new Date(billingInfo.grandfather.until).toLocaleDateString(),
              })}
            </p>
            {billingInfo.grandfather.boostedResources.length > 0 && (
              <ul className="text-xs text-[var(--text-muted)] space-y-1 tabular-nums">
                {billingInfo.grandfather.boostedResources.map((key) => {
                  const item = billingInfo.usage[key as keyof UsageStats];
                  if (!item.planLimit) return null;
                  return (
                    <li key={key}>
                      {formatMessage(t('billing', 'grandfatherBoostItem'), {
                        label: t('billing', USAGE_BOOST_LABEL_KEYS[key]),
                        planLimit: String(item.planLimit),
                        limit: item.unlimited ? t('billing', 'unlimited') : String(item.limit),
                      })}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      <InfraWalletSection />

      <InvoicesSection />

      {billingInfo && <UsageLimitsAlert usage={billingInfo.usage} />}

      {/* Current Plan */}
      <div className="dash-card p-4 sm:p-6 space-y-0">
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
        {billingInfo && billingInfo.price > 0 && (
          <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors"
            >
              {t('billing', 'cancelSubscriptionLink')}
            </button>
          </div>
        )}
      </div>

      <CancelSubscriptionModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} />

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

      {billingInfo && <UsageLimitsSection usage={billingInfo.usage} />}

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
