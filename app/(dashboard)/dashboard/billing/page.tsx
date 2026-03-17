'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { useTranslation, useBillingInfo, useAvailablePlans, useUpdateBillingEmail } from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import type { PlanType } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { ComparePlansModal } from './components';

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
  const { organization } = useAuthStore();
  const { data: billingInfo, isLoading } = useBillingInfo();
  const { data: availablePlans } = useAvailablePlans();
  const updateBillingEmail = useUpdateBillingEmail();

  const [billingEmail, setBillingEmail]   = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSuccess, setEmailSuccess]   = useState(false);
  const [emailError, setEmailError]       = useState<string | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);

  const handleUpdateEmail = async () => {
    setEmailError(null);
    setEmailSuccess(false);
    try {
      await updateBillingEmail.mutateAsync({ billingEmail: billingEmail.trim() });
      setEmailSuccess(true);
      setShowEmailForm(false);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to update email');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-7 w-32 rounded-lg animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
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

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('billing', 'title')}</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {t('billing', 'description')}
        </p>
      </div>

      {/* Current Plan */}
      <div
        className="relative rounded-xl p-5 overflow-hidden"
        style={{
          background: 'var(--bg-secondary)',
          borderWidth: '2px 1px 1px 1px',
          borderStyle: 'solid',
          borderColor: `${planAccent}45 var(--glass-border) var(--glass-border) var(--glass-border)`,
          borderRadius: 12,
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{ background: `radial-gradient(circle at top right, ${planAccent}18 0%, transparent 70%)` }}
        />

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${planAccent}18`, border: `1px solid ${planAccent}30` }}
            >
              <Sparkles className="w-5 h-5" style={{ color: planAccent }} />
            </div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('billing', 'currentPlan')}
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {billingInfo?.planName || t('billing', 'free')}
                </span>
                {billingInfo && billingInfo.price > 0 && (
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    ${billingInfo.price}{t('billing', 'perMonth')}
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {organization?.name || 'Personal'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPlansModal(true)}
            className="btn btn-primary shrink-0"
          >
            {t('billing', 'comparePlans')}
          </button>
        </div>
      </div>

      {/* Usage Stats */}
      {billingInfo && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
        >
          <div
            className="flex items-center gap-2.5 px-5 py-3.5"
            style={{ borderBottom: '1px solid var(--glass-border)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.1)' }}
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <span className="text-sm font-medium">{t('billing', 'usage')}</span>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.entries(billingInfo.usage) as [keyof typeof billingInfo.usage, (typeof billingInfo.usage)[keyof typeof billingInfo.usage]][]).map(([key, value]) => {
                const Icon       = usageIcons[key];
                const percentage = getUsagePercentage(value.used, value.limit, value.unlimited);
                const isWarning  = !value.unlimited && percentage >= 80;
                const isDanger   = !value.unlimited && percentage >= 100;
                const barColor   = isDanger ? STATUS_COLORS.error : isWarning ? STATUS_COLORS.warning : STATUS_COLORS.cyan;

                return (
                  <div
                    key={key}
                    className="rounded-lg p-4"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-divider)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {t('billing', key as keyof typeof usageIcons)}
                        </span>
                      </div>
                      <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {value.used} / {value.unlimited ? '∞' : value.limit}
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
          </div>
        </div>
      )}

      {/* Features */}
      {billingInfo && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
        >
          <div
            className="flex items-center gap-2.5 px-5 py-3.5"
            style={{ borderBottom: '1px solid var(--glass-border)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(167,139,250,0.1)' }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-purple)' }} />
            </div>
            <span className="text-sm font-medium">{t('billing', 'features')}</span>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.entries(billingInfo.features) as [keyof typeof billingInfo.features, boolean][]).map(([key, enabled]) => (
                <div
                  key={key}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{
                    background:  enabled ? 'rgba(34,197,94,0.06)'  : 'var(--bg-tertiary)',
                    border:      enabled ? '1px solid rgba(34,197,94,0.15)' : '1px solid var(--glass-divider)',
                  }}
                >
                  {enabled ? (
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: STATUS_COLORS.success }} />
                  ) : (
                    <X className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  )}
                  <span
                    className="text-xs"
                    style={{ color: enabled ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                  >
                    {t('billing', key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Billing Email */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(96,165,250,0.1)' }}
          >
            <Mail className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <h2 className="text-sm font-medium">{t('billing', 'billingEmail')}</h2>
          </div>
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {t('billing', 'billingEmailDesc')}
        </p>

        {emailError && (
          <div
            className="mb-3 px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: STATUS_COLORS.pink }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {emailError}
          </div>
        )}

        {emailSuccess && (
          <div
            className="mb-3 px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: STATUS_COLORS.success }}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            {t('billing', 'emailUpdated')}
          </div>
        )}

        {!showEmailForm ? (
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {billingInfo?.billingEmail || '—'}
            </span>
            <button
              onClick={() => { setBillingEmail(billingInfo?.billingEmail || ''); setShowEmailForm(true); }}
              className="btn btn-primary"
            >
              {t('billing', 'updateEmail')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              value={billingEmail}
              onChange={e => setBillingEmail(e.target.value)}
              placeholder={t('billing', 'billingEmailPlaceholder')}
              className="input flex-1"
            />
            <button
              onClick={handleUpdateEmail}
              disabled={!billingEmail.trim() || updateBillingEmail.isPending}
              className="btn btn-primary"
            >
              {updateBillingEmail.isPending ? t('billing', 'updating') : t('common', 'save')}
            </button>
            <button
              onClick={() => { setShowEmailForm(false); setEmailError(null); }}
              className="btn btn-secondary"
            >
              {t('common', 'cancel')}
            </button>
          </div>
        )}
      </div>

      {/* Compare Plans Modal */}
      {availablePlans && (
        <ComparePlansModal
          isOpen={showPlansModal}
          onClose={() => setShowPlansModal(false)}
          plans={availablePlans}
          currentPlan={billingInfo?.plan || 'free'}
        />
      )}
    </div>
  );
}
