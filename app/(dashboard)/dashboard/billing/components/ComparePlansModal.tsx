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

const planColors: Record<PlanType, string> = {
  free: 'from-gray-500 to-gray-600',
  hobby: 'from-blue-500 to-cyan-500',
  pro: 'from-purple-500 to-pink-500',
  business: 'from-orange-500 to-amber-500',
  enterprise: 'from-emerald-500 to-teal-500',
};

export function ComparePlansModal({ isOpen, onClose, plans, currentPlan }: ComparePlansModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const formatLimit = (value: number) => {
    if (value === -1) return t('billing', 'unlimited');
    return value.toString();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-[95vw] max-h-[90vh] overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] shrink-0">
          <div>
            <h2 className="text-xl font-bold">{t('billing', 'comparePlans')}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {t('billing', 'description')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
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
                  className={`w-[280px] shrink-0 rounded-xl border p-6 transition-all ${
                    isCurrent
                      ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5 ring-2 ring-[var(--accent-cyan)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-default)]'
                  }`}
                >
                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${planColors[planKey]}`}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      {isCurrent && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-semibold">
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
                      <button disabled className="btn btn-secondary w-full h-11 opacity-50 cursor-not-allowed">
                        {t('billing', 'currentPlanBadge')}
                      </button>
                    ) : (
                      <button className="btn btn-primary w-full h-11">
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
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {enabled ? (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
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
