'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles, Check, X, AlertTriangle } from 'lucide-react';
import {
  useTranslation,
  useBillingInfo,
  useUpdateBillingEmail,
  useSubscriptionStatus,
  useResumeSubscription,
  useOrganization,
  useInvoices,
  useInfraBilling,
  usePayOutstanding,
  useUpdatePaymentMethod,
  billingKeys,
} from '@/hooks';
import { confirmInfraTopUp } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { SkeletonPageHeader, SkeletonBillingSummaryCard } from '@/components/Skeleton';
import { InfraWalletSection } from './components/InfraWalletSection';
import { InvoicesSection } from './components/InvoicesSection';
import { CancelSubscriptionModal } from './components/CancelSubscriptionModal';
import { UsageLimitsAlert, UsageLimitsSection } from './components/UsageLimitsSection';
import { formatMessage } from '@/lib/i18n/format-message';
import { PageHeader, MetaLabel } from '@/components/dashboard/PageKit';
import { SettingsField, SettingsSection } from '@/components/dashboard/SettingsParts';
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

export default function BillingPage() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);
  // The store only learns the organisation at login; after a reload it is empty, so ask the API
  // (as the sidebar's workspace switcher does) and fall back to the store.
  const storeOrganization = useAuthStore((s) => s.organization);
  const { data: currentOrganization } = useOrganization();
  const organization = currentOrganization ?? storeOrganization;
  const { data: billingInfo, isLoading } = useBillingInfo();
  // A cancelled-at-period-end subscription can be resumed until the period ends.
  const { data: subscription } = useSubscriptionStatus();
  const resumeSubscription = useResumeSubscription();
  const updateBillingEmail = useUpdateBillingEmail();
  // Same queries the wallet / invoice sections use (shared cache): only index sections that render.
  const { data: infraData } = useInfraBilling();
  const { data: invoices = [] } = useInvoices();
  const payOutstanding = usePayOutstanding();
  const updatePaymentMethod = useUpdatePaymentMethod();

  const handlePayNow = () => {
    payOutstanding.mutate(undefined, {
      onSuccess: (result) => {
        if (result.status === 'paid') toast.success(t('billing', 'paymentReceived'));
        else if (result.status === 'nothing_due') toast.message(t('billing', 'nothingDue'));
        else {
          toast.message(t('billing', 'openingPaymentPage'));
          window.location.href = result.payUrl;
        }
      },
      onError: (err) => toast.error(t('errors', 'somethingWentWrong'), { description: err.message }),
    });
  };

  const handleUpdateCard = () => {
    updatePaymentMethod.mutate(undefined, {
      onError: (err) => toast.error(t('errors', 'somethingWentWrong'), { description: err.message }),
    });
  };

  useEffect(() => {
    const topup = searchParams.get('infra_topup');
    const sessionId = searchParams.get('session_id');

    // Back from Stripe's card page: the webhook retries unpaid invoices on the new card.
    if (searchParams.get('card') === 'updated') {
      toast.success(t('billing', 'cardUpdated'));
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      window.history.replaceState(null, '', '/dashboard/billing');
      return;
    }

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
  const [emailError, setEmailError]       = useState<string | null>(null);

  const handleUpdateEmail = async () => {
    setEmailError(null);
    try {
      await updateBillingEmail.mutateAsync({ billingEmail: billingEmail.trim() });
      setShowEmailForm(false);
      toast.success(t('billing', 'emailUpdated'));
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : t('billing', 'emailUpdateFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="dash-page max-w-5xl min-w-0 space-y-5 animate-slide-in">
        <SkeletonPageHeader />
        {[1, 2, 3].map((i) => (
          <SkeletonBillingSummaryCard key={i} />
        ))}
      </div>
    );
  }

  const isPaid = !!billingInfo && billingInfo.price > 0;
  const cancelScheduled = isPaid && !!subscription?.cancelAtPeriodEnd;
  const periodEndLabel = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const statusOk = billingInfo?.billingStatus === 'active';
  const statusLabel = statusOk
    ? t('billing', 'billingStatusActive')
    : billingInfo?.billingStatus === 'past_due'
      ? t('billing', 'billingStatusPastDueTitle')
      : t('billing', 'billingStatusSuspendedTitle');
  const renewalDate = billingInfo?.currentPeriodEnd
    ? new Date(billingInfo.currentPeriodEnd).toLocaleDateString(
        locale === 'tr' ? 'tr-TR' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' },
      )
    : null;

  const featureEntries = billingInfo
    ? (Object.entries(billingInfo.features) as [keyof typeof billingInfo.features, boolean][])
    : [];

  const sections = [
    { id: 'billing-plan', label: t('billing', 'currentPlan'), show: true },
    { id: 'billing-wallet', label: t('billing', 'infraWalletTitle'), show: !!infraData },
    { id: 'billing-usage', label: t('billing', 'usage'), show: !!billingInfo },
    { id: 'billing-invoices', label: t('billing', 'invoicesTitle'), show: invoices.length > 0 },
  ].filter((s) => s.show);

  return (
    <div className="dash-page max-w-5xl min-w-0 space-y-6 pb-10 animate-slide-in">
      <PageHeader
        title={t('billing', 'title')}
        description={t('billing', 'description')}
        badge={
          billingInfo ? (
            <span className={`badge shrink-0 ${statusOk ? 'badge-success' : billingInfo.billingStatus === 'past_due' ? 'badge-warning' : 'badge-error'}`}>
              {statusLabel}
            </span>
          ) : undefined
        }
        meta={[
          <MetaLabel key="org">{organization?.name || t('billing', 'personalOrganization')}</MetaLabel>,
          <MetaLabel key="plan">{billingInfo?.planName || t('billing', 'free')}</MetaLabel>,
          isPaid && renewalDate ? (
            <span key="renew" className="terminal-text text-xs">
              {t('billing', 'nextRenewal')} {renewalDate}
            </span>
          ) : null,
        ]}
        actions={
          <Link href="/dashboard/billing/plans" className="btn btn-primary justify-center">
            {t('billing', 'comparePlans')}
          </Link>
        }
      />

      {billingInfo?.billingStatus === 'past_due' && (
        <div className="dash-callout dash-callout-attention" role="alert">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--status-warning)]" aria-hidden />
          <div className="space-y-1 min-w-0">
            <p className="font-medium text-sm">{t('billing', 'billingStatusPastDueTitle')}</p>
            <p className="text-[13px] text-[var(--text-secondary)]">{t('billing', 'billingStatusPastDueDesc')}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePayNow}
                disabled={payOutstanding.isPending}
              >
                {payOutstanding.isPending && (
                  <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                )}
                {t('billing', 'payNow')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleUpdateCard}
                disabled={updatePaymentMethod.isPending}
              >
                {t('billing', 'updateCard')}
              </button>
            </div>
          </div>
        </div>
      )}

      {billingInfo?.billingStatus === 'suspended' && (
        <div
          className="dash-callout"
          role="alert"
          style={{
            background: 'color-mix(in srgb, var(--status-error) 6%, transparent)',
            borderColor: 'color-mix(in srgb, var(--status-error) 24%, transparent)',
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--status-error)]" aria-hidden />
          <div className="space-y-1 min-w-0">
            <p className="font-medium text-sm">{t('billing', 'billingStatusSuspendedTitle')}</p>
            <p className="text-[13px] text-[var(--text-secondary)]">{t('billing', 'billingStatusSuspendedDesc')}</p>
            <Link href="/dashboard/billing/plans" className="dash-link">
              {t('billing', 'comparePlans')}
            </Link>
          </div>
        </div>
      )}

      {billingInfo && <UsageLimitsAlert usage={billingInfo.usage} />}

      {billingInfo?.grandfather?.active && billingInfo.grandfather.until && (
        <div className="dash-callout">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[var(--text-muted)]" aria-hidden />
          <div className="min-w-0 space-y-2">
            <p className="text-[13px] text-[var(--text-secondary)]">
              {formatMessage(t('billing', 'grandfatherBanner'), {
                date: new Date(billingInfo.grandfather.until).toLocaleDateString(),
              })}
            </p>
            {billingInfo.grandfather.boostedResources.length > 0 && (
              <ul className="terminal-text text-[11px] text-[var(--text-muted)] space-y-1 tabular-nums">
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

      <div className="dash-settings">
        <nav className="dash-settings-nav" aria-label={t('billing', 'title')}>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
        </nav>

        <div className="dash-settings-stack">
          {/* ── Plan summary ── */}
          <SettingsSection
            id="billing-plan"
            title={t('billing', 'currentPlan')}
            description={
              <span className="inline-flex items-center gap-1.5">
                <span className={`dash-status-dot ${statusOk ? 'is-success' : 'is-warning'}`} aria-hidden />
                {statusLabel}
              </span>
            }
            footer={
              billingInfo ? (
                <>
                  <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 min-w-0 flex-1">
                    {featureEntries.map(([key, enabled]) => (
                      <li
                        key={key}
                        className={`inline-flex items-center gap-1.5 text-xs ${enabled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}
                      >
                        {enabled ? (
                          <Check className="w-3.5 h-3.5 shrink-0 text-[var(--status-success)]" aria-hidden />
                        ) : (
                          <X className="w-3.5 h-3.5 shrink-0" aria-hidden />
                        )}
                        <span className={enabled ? undefined : 'line-through decoration-[var(--border-default)]'}>
                          {t('billing', key)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {cancelScheduled ? (
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
                      {formatMessage(t('billing', 'cancelScheduled'), { date: periodEndLabel })}
                      <button
                        type="button"
                        disabled={resumeSubscription.isPending}
                        onClick={() =>
                          resumeSubscription.mutate(undefined, {
                            onSuccess: () => toast.success(t('billing', 'resumed')),
                          })
                        }
                        className="btn btn-secondary btn-sm"
                      >
                        {t('billing', 'resumeSubscription')}
                      </button>
                    </span>
                  ) : isPaid ? (
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(true)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--status-error)] transition-colors"
                    >
                      {t('billing', 'cancelSubscriptionLink')}
                    </button>
                  ) : null}
                </>
              ) : undefined
            }
          >
            <SettingsField label={t('billing', 'currentPlan')}>
              <div className="flex items-baseline gap-2.5 flex-wrap md:pt-1">
                <span className="text-[1.375rem] leading-none font-medium tracking-tight text-[var(--text-primary)]">
                  {billingInfo?.planName || t('billing', 'free')}
                </span>
                {isPaid && (
                  <span className="terminal-text text-[13px] tabular-nums text-[var(--text-secondary)]">
                    ${billingInfo!.price}
                    {t('billing', 'perMonth')}
                  </span>
                )}
              </div>
            </SettingsField>

            <SettingsField label={t('billing', 'billingEmail')} htmlFor={showEmailForm ? 'billing-email' : undefined}>
              {showEmailForm ? (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="billing-email"
                      type="email"
                      value={billingEmail}
                      onChange={e => setBillingEmail(e.target.value)}
                      placeholder={t('billing', 'billingEmailPlaceholder')}
                      className="input flex-1"
                      autoFocus
                    />
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleUpdateEmail}
                        disabled={!billingEmail.trim() || updateBillingEmail.isPending}
                        className="btn btn-primary"
                      >
                        {updateBillingEmail.isPending ? t('billing', 'updating') : t('common', 'save')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmailForm(false);
                          setEmailError(null);
                        }}
                        className="btn btn-secondary"
                      >
                        {t('common', 'cancel')}
                      </button>
                    </div>
                  </div>
                  {emailError && (
                    <p className="text-xs flex items-center gap-1.5 text-[var(--status-error)]" role="alert">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      {emailError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 min-w-0 md:pt-1.5">
                  <span
                    className="terminal-text text-[13px] truncate text-[var(--text-primary)]"
                    title={billingInfo?.billingEmail || undefined}
                  >
                    {billingInfo?.billingEmail || '—'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBillingEmail(billingInfo?.billingEmail || '');
                      setEmailError(null);
                      setShowEmailForm(true);
                    }}
                    className="btn btn-ghost btn-sm shrink-0"
                  >
                    {t('common', 'edit')}
                  </button>
                </div>
              )}
            </SettingsField>

            <SettingsField label={t('billing', 'nextRenewal')}>
              <p className="terminal-text text-[13px] tabular-nums text-[var(--text-primary)] md:pt-2">
                {isPaid && renewalDate ? renewalDate : '—'}
              </p>
            </SettingsField>

            <SettingsField label={t('billing', 'apiRateLimit')}>
              <p className="terminal-text text-[13px] tabular-nums text-[var(--text-primary)] md:pt-2">
                {billingInfo
                  ? billingInfo.apiRequestsPerMinute === -1
                    ? t('billing', 'unlimited')
                    : formatMessage(t('billing', 'apiRateLimitValue'), {
                        count: String(billingInfo.apiRequestsPerMinute),
                      })
                  : '—'}
              </p>
            </SettingsField>
          </SettingsSection>

          <InfraWalletSection id="billing-wallet" />

          {billingInfo && <UsageLimitsSection id="billing-usage" usage={billingInfo.usage} />}

          <InvoicesSection id="billing-invoices" />
        </div>
      </div>

      <CancelSubscriptionModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} />
    </div>
  );
}
