'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Sparkles,
  Check,
  X,
  AlertTriangle,
  ArrowUpRight,
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

/** Uppercase micro-label used across the ledger strip */
function LedgerLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5 text-[var(--text-muted)]">
      {children}
    </p>
  );
}

export default function BillingPage() {
  const { t, locale } = useTranslation();
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
      <div className="dash-page max-w-4xl space-y-5 animate-slide-in">
        <SkeletonPageHeader />
        {[1, 2, 3].map((i) => (
          <SkeletonBillingSummaryCard key={i} />
        ))}
      </div>
    );
  }

  const planAccent = billingInfo ? planAccents[billingInfo.plan] : STATUS_COLORS.neutral;
  const isPaid = !!billingInfo && billingInfo.price > 0;
  const statusOk = billingInfo?.billingStatus === 'active';
  const renewalDate = billingInfo?.currentPeriodEnd
    ? new Date(billingInfo.currentPeriodEnd).toLocaleDateString(
        locale === 'tr' ? 'tr-TR' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' },
      )
    : null;

  const featureEntries = billingInfo
    ? (Object.entries(billingInfo.features) as [keyof typeof billingInfo.features, boolean][])
    : [];

  return (
    <div className="dash-page max-w-4xl space-y-5 animate-slide-in">

      <div>
        <p className="dash-eyebrow mb-1">{organization?.name || t('billing', 'personalOrganization')}</p>
        <h1 className="text-xl font-semibold tracking-tight">{t('billing', 'title')}</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {t('billing', 'description')}
        </p>
      </div>

      {billingInfo?.billingStatus === 'past_due' && (
        <div className="dash-callout dash-callout-attention">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: STATUS_COLORS.orange }} />
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
          className="dash-callout"
          style={{
            background: `${STATUS_COLORS.error}0F`,
            borderColor: `${STATUS_COLORS.error}3D`,
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: STATUS_COLORS.error }} />
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

      {billingInfo && <UsageLimitsAlert usage={billingInfo.usage} />}

      {/* ── Plan summary — the page's anchor ─────────────────────────────── */}
      <section
        className="dash-card p-5 sm:p-6"
        style={{
          borderWidth: '2px 1px 1px 1px',
          borderTopColor: planAccent,
          borderRadius: 12,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <LedgerLabel>{t('billing', 'currentPlan')}</LedgerLabel>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-[1.75rem] leading-none font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {billingInfo?.planName || t('billing', 'free')}
              </span>
              {isPaid && (
                <span
                  className="text-sm tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
                >
                  ${billingInfo!.price}
                  {t('billing', 'perMonth')}
                </span>
              )}
            </div>
            <p className="flex items-center gap-1.5 text-sm mt-2.5" style={{ color: 'var(--text-secondary)' }}>
              <span
                className="dash-status-dot"
                style={{ background: statusOk ? STATUS_COLORS.success : STATUS_COLORS.warning }}
                aria-hidden
              />
              {statusOk
                ? t('billing', 'billingStatusActive')
                : billingInfo?.billingStatus === 'past_due'
                  ? t('billing', 'billingStatusPastDueTitle')
                  : t('billing', 'billingStatusSuspendedTitle')}
            </p>
          </div>
          <Link href="/dashboard/billing/plans" className="btn btn-primary shrink-0 w-full sm:w-auto justify-center">
            {t('billing', 'comparePlans')}
          </Link>
        </div>

        {/* Ledger strip — email · renewal · API limit */}
        <div
          className="mt-5 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="min-w-0 sm:pr-5">
            <LedgerLabel>{t('billing', 'billingEmail')}</LedgerLabel>
            <div className="flex items-center gap-2 min-w-0">
              <p
                className="text-sm truncate tabular-nums"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
                title={billingInfo?.billingEmail || undefined}
              >
                {billingInfo?.billingEmail || '—'}
              </p>
              {!showEmailForm && (
                <button
                  type="button"
                  onClick={() => {
                    setBillingEmail(billingInfo?.billingEmail || '');
                    setEmailError(null);
                    setShowEmailForm(true);
                  }}
                  className="text-xs font-medium shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('common', 'edit')}
                </button>
              )}
            </div>
          </div>
          <div
            className="min-w-0 sm:px-5 sm:border-l border-t sm:border-t-0 pt-4 sm:pt-0"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <LedgerLabel>{t('billing', 'nextRenewal')}</LedgerLabel>
            <p
              className="text-sm tabular-nums"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
            >
              {isPaid && renewalDate ? renewalDate : '—'}
            </p>
          </div>
          <div
            className="min-w-0 sm:pl-5 sm:border-l border-t sm:border-t-0 pt-4 sm:pt-0"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <LedgerLabel>{t('billing', 'apiRateLimit')}</LedgerLabel>
            <p
              className="text-sm tabular-nums"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
            >
              {billingInfo
                ? billingInfo.apiRequestsPerMinute === -1
                  ? t('billing', 'unlimited')
                  : formatMessage(t('billing', 'apiRateLimitValue'), {
                      count: String(billingInfo.apiRequestsPerMinute),
                    })
                : '—'}
            </p>
          </div>
        </div>

        {showEmailForm && (
          <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={billingEmail}
                onChange={e => setBillingEmail(e.target.value)}
                placeholder={t('billing', 'billingEmailPlaceholder')}
                className="input flex-1"
                autoFocus
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
            {emailError && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: STATUS_COLORS.error }}>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {emailError}
              </p>
            )}
          </div>
        )}

        {/* Plan features as quiet chips + cancel link */}
        {billingInfo && (
          <div
            className="mt-4 pt-4 border-t flex flex-wrap items-center gap-x-4 gap-y-2"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {featureEntries.map(([key, enabled]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 text-xs"
                style={{ color: enabled ? 'var(--text-secondary)' : 'var(--text-muted)' }}
              >
                {enabled ? (
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: STATUS_COLORS.success }} />
                ) : (
                  <X className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                )}
                {t('billing', key)}
              </span>
            ))}
            {isPaid && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="ml-auto text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors"
              >
                {t('billing', 'cancelSubscriptionLink')}
              </button>
            )}
          </div>
        )}
      </section>

      {billingInfo?.grandfather?.active && billingInfo.grandfather.until && (
        <div className="dash-callout" style={{ borderColor: 'color-mix(in srgb, var(--accent-cyan) 30%, transparent)', background: 'color-mix(in srgb, var(--accent-cyan) 5%, transparent)' }}>
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent-cyan)]" />
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

      <CancelSubscriptionModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} />

      <InfraWalletSection />

      {billingInfo && <UsageLimitsSection usage={billingInfo.usage} />}

      <InvoicesSection />

    </div>
  );
}
