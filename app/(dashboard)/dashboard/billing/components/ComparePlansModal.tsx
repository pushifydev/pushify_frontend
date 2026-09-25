'use client';

import { X, Check, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks';
import type { AvailablePlans, PlanType } from '@/lib/api';

interface ComparePlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: AvailablePlans;
  currentPlan: PlanType;
}

const planOrder: PlanType[] = ['free', 'hobby', 'pro', 'business', 'enterprise'];

export function ComparePlansModal({ isOpen, onClose, plans, currentPlan }: ComparePlansModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const formatLimit = (value: number) => {
    if (value === -1) return t('billing', 'unlimited');
    return value.toString();
  };

  return (
    <div className="dash-app dash-modal-root">
      {/* Backdrop */}
      <div className="dash-modal-overlay" onClick={onClose} aria-hidden />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-plans-title"
        className="dash-modal is-flush max-w-[95vw]"
      >
        {/* Header */}
        <div className="dash-modal-bar shrink-0" style={{ padding: '1.25rem 1.5rem', alignItems: 'flex-start' }}>
          <div className="min-w-0">
            <span className="dash-eyebrow block mb-2">{t('billing', 'title')}</span>
            <h2 id="compare-plans-title" className="dash-modal-title">{t('billing', 'comparePlans')}</h2>
            <p className="dash-modal-description">{t('billing', 'description')}</p>
          </div>
          <button type="button" onClick={onClose} className="dash-modal-close" aria-label={t('common', 'close')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plans - Horizontal Scroll */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <div className="inline-flex gap-5 min-w-max pb-4">
            {planOrder.map((planKey) => {
              const plan = plans[planKey];
              const isCurrent = planKey === currentPlan;

              return (
                <div
                  key={planKey}
                  className={`w-full sm:w-[280px] shrink-0 rounded-[14px] border p-6 transition-colors ${
                    isCurrent
                      ? 'border-[var(--accent-cyan)] bg-[var(--bg-secondary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-default)]'
                  }`}
                >
                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="dash-icon-box w-10! h-10! rounded-xl!">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      {isCurrent && (
                        <span className="text-xs px-2.5 py-1 rounded-full dash-accent-fill font-semibold">
                          {t('billing', 'currentPlanBadge')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div>
                      {plan.price === 0 ? (
                        <span className="text-3xl font-bold">{t('billing', 'free')}</span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">${plan.price}</span>
                          <span className="text-[var(--text-muted)] text-sm">{t('billing', 'perMonth')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-[var(--border-subtle)]">
                    <LimitRow
                      label={t('billing', 'apiRequestsPerMinuteShort')}
                      value={
                        plan.limits.apiRequestsPerMinute === -1
                          ? t('billing', 'unlimited')
                          : `${plan.limits.apiRequestsPerMinute}/min`
                      }
                    />
                    <LimitRow label={t('billing', 'servers')} value={formatLimit(plan.limits.servers)} />
                    <LimitRow label={t('billing', 'projects')} value={formatLimit(plan.limits.projects)} />
                    <LimitRow label={t('billing', 'deploymentsThisMonth')} value={formatLimit(plan.limits.deploymentsPerMonth)} />
                    <LimitRow label={t('billing', 'teamMembers')} value={formatLimit(plan.limits.teamMembers)} />
                    <LimitRow label={t('billing', 'customDomains')} value={formatLimit(plan.limits.customDomains)} />
                    <LimitRow label={t('billing', 'storageGb')} value={`${formatLimit(plan.limits.storageGb)} GB`} />
                    <LimitRow label={t('billing', 'bandwidthGb')} value={`${formatLimit(plan.limits.bandwidthGb)} GB`} />
                    <LimitRow label={t('billing', 'buildMinutes')} value={formatLimit(plan.limits.buildMinutesPerMonth)} />
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <FeatureRow
                      label={t('billing', 'previewDeployments')}
                      enabled={plan.limits.previewDeployments}
                    />
                    <FeatureRow
                      label={t('billing', 'healthChecks')}
                      enabled={plan.limits.healthChecks}
                    />
                    <FeatureRow
                      label={t('billing', 'prioritySupport')}
                      enabled={plan.limits.prioritySupport}
                    />
                  </div>

                  {/* Action Button */}
                  <div>
                    {isCurrent ? (
                      <button disabled className="btn btn-secondary w-full">
                        {t('billing', 'currentPlanBadge')}
                      </button>
                    ) : (
                      <button className="btn btn-primary w-full">
                        {t('billing', 'upgradePlan')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {enabled ? (
        <div className="w-5 h-5 rounded-full bg-[var(--hover-overlay-lg)] flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-[var(--text-primary)]" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
          <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        </div>
      )}
      <span className={`text-sm ${enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
        {label}
      </span>
    </div>
  );
}
