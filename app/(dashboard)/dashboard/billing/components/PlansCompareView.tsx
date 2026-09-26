'use client';

import { Check, Minus, Loader2 } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { useTranslation } from '@/hooks';
import type { PlanType, PlanLimits, AvailablePlans } from '@/lib/api';
import type { TranslationKeys } from '@/lib/i18n/locales/en';
import { cn } from '@/lib/utils';
import { PageHeader, MetaLabel } from '@/components/dashboard/PageKit';

/** Tint for the recommended plan, as on the public pricing table. */
const RECOMMENDED_TINT = 'bg-[color-mix(in_srgb,var(--text-primary)_4%,transparent)]';
const RECOMMENDED: PlanType = 'pro';

const PAID_TIERS: PlanType[] = ['hobby', 'pro', 'business'];
const ALL_TIERS: PlanType[] = ['free', 'hobby', 'pro', 'business', 'enterprise'];

const YEARLY_DISCOUNT: Partial<Record<PlanType, number>> = {
  hobby: 0.2,
  pro: 0.2,
  business: 0.2,
};

const CARD_HIGHLIGHTS: { key: keyof PlanLimits; labelKey: keyof TranslationKeys['billing'] }[] = [
  { key: 'servers', labelKey: 'servers' },
  { key: 'projects', labelKey: 'projects' },
  { key: 'teamMembers', labelKey: 'teamMembers' },
  { key: 'healthChecks', labelKey: 'healthChecks' },
];

const COMPARE_ROWS: {
  key: keyof PlanLimits;
  labelKey: keyof TranslationKeys['billing'];
  type: 'number' | 'boolean';
  unit?: string;
}[] = [
  { key: 'apiRequestsPerMinute', labelKey: 'apiRequestsPerMinuteShort', type: 'number', unit: '/min' },
  { key: 'servers', labelKey: 'servers', type: 'number' },
  { key: 'databases', labelKey: 'databases', type: 'number' },
  { key: 'projects', labelKey: 'projects', type: 'number' },
  { key: 'deploymentsPerMonth', labelKey: 'deploymentsPerMonthShort', type: 'number' },
  { key: 'teamMembers', labelKey: 'teamMembers', type: 'number' },
  { key: 'customDomains', labelKey: 'customDomains', type: 'number' },
  { key: 'storageGb', labelKey: 'storageGb', type: 'number', unit: 'GB' },
  { key: 'bandwidthGb', labelKey: 'bandwidthGb', type: 'number', unit: 'GB' },
  { key: 'buildMinutesPerMonth', labelKey: 'buildMinutes', type: 'number', unit: 'min' },
  { key: 'previewDeployments', labelKey: 'previewDeployments', type: 'boolean' },
  { key: 'healthChecks', labelKey: 'healthChecks', type: 'boolean' },
  { key: 'prioritySupport', labelKey: 'prioritySupport', type: 'boolean' },
];

function planDisplayPrice(planKey: PlanType, monthlyPrice: number, cycle: 'monthly' | 'yearly'): number {
  if (monthlyPrice <= 0) return monthlyPrice;
  if (cycle === 'monthly') return monthlyPrice;
  return Math.round(monthlyPrice * (1 - (YEARLY_DISCOUNT[planKey] ?? 0)));
}

function formatLimit(
  value: number | boolean,
  type: 'number' | 'boolean',
  unit: string | undefined,
  unlimitedLabel: string,
): string {
  if (type === 'boolean') return '';
  if (typeof value === 'number') {
    if (value >= 9999 || value === -1) return unlimitedLabel;
    return unit ? `${value.toLocaleString()} ${unit}` : `${value.toLocaleString()}`;
  }
  return String(value);
}

function AnimatedPrice({
  planKey,
  monthlyPrice,
  billingCycle,
  customLabel,
}: {
  planKey: PlanType;
  monthlyPrice: number;
  billingCycle: 'monthly' | 'yearly';
  customLabel: string;
}) {
  if (monthlyPrice < 0) {
    return <span className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{customLabel}</span>;
  }
  if (monthlyPrice === 0) {
    return <span className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">$0</span>;
  }
  return (
    <NumberFlow
      className="text-3xl font-semibold tracking-tight tabular-nums text-[var(--text-primary)]"
      value={planDisplayPrice(planKey, monthlyPrice, billingCycle)}
      format={{
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }}
      transformTiming={{ duration: 400, easing: 'ease-out' }}
      willChange
    />
  );
}

function BillingToggle({
  isMonthly,
  onChange,
}: {
  isMonthly: boolean;
  onChange: (cycle: 'monthly' | 'yearly') => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="dash-segmented shrink-0" role="group" aria-label={t('billing', 'billingCycleMonthly') + ' / ' + t('billing', 'billingCycleYearly')}>
      {(['monthly', 'yearly'] as const).map((cycle) => {
        const active = (cycle === 'monthly') === isMonthly;
        return (
          <button key={cycle} type="button" onClick={() => onChange(cycle)} aria-pressed={active}>
            {cycle === 'monthly' ? t('billing', 'billingCycleMonthly') : t('billing', 'billingCycleYearly')}
            {cycle === 'yearly' && (
              <span className="terminal-text text-[10px] opacity-70">{t('billing', 'billingCycleYearlySave')}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PlanButton({
  isCurrent,
  isUpgrade,
  pending,
  disabled,
  onClick,
}: {
  isCurrent: boolean;
  isUpgrade: boolean;
  pending: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  let label = t('billing', 'upgradeButton');
  if (isCurrent) label = t('billing', 'currentPlan');
  else if (!isUpgrade) label = t('billing', 'downgradeButton');

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-busy={pending}
      className={cn(
        'btn w-full justify-center disabled:cursor-not-allowed',
        isCurrent ? 'btn-secondary disabled:opacity-100 text-[var(--text-muted)]' : isUpgrade ? 'btn-primary' : 'btn-secondary',
        !isCurrent && 'disabled:opacity-50',
      )}
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" aria-hidden /> : label}
    </button>
  );
}

function PaidPlanColumn({
  planKey,
  plan,
  billingCycle,
  isMonthly,
  isCurrent,
  isRecommended,
  isUpgrade,
  pending,
  actionDisabled,
  onAction,
  unlimitedLabel,
}: {
  planKey: PlanType;
  plan: AvailablePlans[PlanType];
  billingCycle: 'monthly' | 'yearly';
  isMonthly: boolean;
  isCurrent: boolean;
  isRecommended: boolean;
  isUpgrade: boolean;
  pending: boolean;
  actionDisabled: boolean;
  onAction: () => void;
  unlimitedLabel: string;
}) {
  const { t } = useTranslation();

  return (
    <article
      className={cn(
        'dash-plans-col flex flex-col flex-shrink-0 snap-start',
        isRecommended && 'dash-plans-col--focus',
        isCurrent && !isRecommended && 'dash-plans-col--current',
      )}
    >
      <div className="flex flex-col h-full p-6 sm:p-7 min-h-[20rem]">
        <div className="mb-5 min-h-[1.25rem]">
          {isRecommended && (
            <span className="dash-section-label text-[var(--text-primary)]!">
              {t('billing', 'planMostPopular')}
            </span>
          )}
          {isCurrent && !isRecommended && (
            <span className="dash-section-label">
              {t('billing', 'currentPlanBadge')}
            </span>
          )}
        </div>

        <h3 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
          {plan.name}
          {isCurrent && isRecommended && <span className="badge badge-neutral">{t('billing', 'currentPlanBadge')}</span>}
        </h3>

        <div className="mt-4 mb-8">
          <div className="flex items-baseline gap-1">
            <AnimatedPrice
              planKey={planKey}
              monthlyPrice={plan.price}
              billingCycle={billingCycle}
              customLabel={t('billing', 'planPriceCustom')}
            />
            {plan.price >= 0 && (
              <span className="text-sm text-[var(--text-muted)]">{t('billing', 'perMonth')}</span>
            )}
          </div>
          {plan.price > 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              {isMonthly ? t('billing', 'billedMonthly') : t('billing', 'billedAnnually')}
            </p>
          )}
          {plan.price === 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5">{t('billing', 'planFreeForeverLabel')}</p>
          )}
          {plan.price < 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5">{t('billing', 'planContactPricing')}</p>
          )}
        </div>

        <ul className="space-y-2.5 flex-1 mb-8 text-sm text-[var(--text-secondary)]">
          {CARD_HIGHLIGHTS.map((row) => {
            const value = plan.limits[row.key];
            if (row.key === 'healthChecks') {
              const on = value as boolean;
              return (
                <li key={row.key} className="flex items-center gap-2">
                  {on ? (
                    <Check className="w-3.5 h-3.5 text-[var(--text-primary)]" strokeWidth={2} />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-40" strokeWidth={2} />
                  )}
                  <span>{t('billing', row.labelKey)}</span>
                </li>
              );
            }
            const text = formatLimit(value as number, 'number', undefined, unlimitedLabel);
            return (
              <li key={row.key}>
                <span className="text-[var(--text-primary)] font-medium">{text}</span>{' '}
                {t('billing', row.labelKey).toLowerCase()}
              </li>
            );
          })}
        </ul>

        <PlanButton
          isCurrent={isCurrent}
          isUpgrade={isUpgrade}
          pending={pending}
          disabled={actionDisabled}
          onClick={onAction}
        />
      </div>
    </article>
  );
}

function EdgePlanRow({
  planKey,
  plan,
  billingCycle,
  isCurrent,
  isUpgrade,
  pending,
  actionDisabled,
  onAction,
  variant,
}: {
  planKey: PlanType;
  plan: AvailablePlans[PlanType];
  billingCycle: 'monthly' | 'yearly';
  isCurrent: boolean;
  isUpgrade: boolean;
  pending: boolean;
  actionDisabled: boolean;
  onAction: () => void;
  variant: 'free' | 'enterprise';
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 px-6 py-5 border-t border-[var(--border-subtle)]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">{plan.name}</h3>
          {isCurrent && (
            <span className="badge badge-neutral">
              {t('billing', 'currentPlanBadge')}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {variant === 'free' ? t('billing', 'planFreeForeverLabel') : t('billing', 'planContactPricing')}
        </p>
        {variant === 'free' && (
          <div className="flex items-baseline gap-1 mt-2">
            <AnimatedPrice
              planKey={planKey}
              monthlyPrice={plan.price}
              billingCycle={billingCycle}
              customLabel={t('billing', 'planPriceCustom')}
            />
            <span className="text-xs text-[var(--text-muted)]">{t('billing', 'perMonth')}</span>
          </div>
        )}
      </div>
      <div className="w-full sm:w-36 shrink-0">
        <PlanButton
          isCurrent={isCurrent}
          isUpgrade={isUpgrade}
          pending={pending}
          disabled={actionDisabled}
          onClick={onAction}
        />
      </div>
    </div>
  );
}

function ComparisonTable({
  plans,
  unlimitedLabel,
}: {
  plans: AvailablePlans;
  unlimitedLabel: string;
}) {
  const { t } = useTranslation();

  return (
    <section className="min-w-0">
      <h2 className="dash-section-label mb-1.5">{t('homepage', 'fullPlanComparisonTitle')}</h2>
      <p className="text-[13px] text-[var(--text-secondary)] mb-4">{t('billing', 'comparePlansSubtitle')}</p>

      <div className="rounded-[14px] border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-secondary)]">
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <table className="min-w-[720px] w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th
                  scope="col"
                  className="dash-plans-th-sticky text-left font-normal py-3 pl-4 sm:pl-5 pr-3 w-[36%] font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]"
                >
                  {t('homepage', 'comparisonColumnFeature')}
                </th>
                {ALL_TIERS.map((key) => {
                  const p = plans[key];
                  if (!p) return null;
                  const rec = key === RECOMMENDED;
                  return (
                    <th
                      key={key}
                      scope="col"
                      className={cn(
                        'font-normal py-3 px-3 text-center min-w-[5.5rem] font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.1em]',
                        rec ? cn('text-[var(--text-primary)]', RECOMMENDED_TINT) : 'text-[var(--text-muted)]',
                      )}
                    >
                      {p.name}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-[var(--border-subtle)] last:border-0">
                  <th
                    scope="row"
                    className="dash-plans-th-sticky text-left font-normal py-3 pl-4 sm:pl-5 pr-3 text-[var(--text-secondary)] bg-[var(--bg-secondary)]"
                  >
                    {t('billing', row.labelKey)}
                  </th>
                  {ALL_TIERS.map((key) => {
                    const p = plans[key];
                    if (!p) return null;
                    const value = p.limits[row.key];
                    return (
                      <td
                        key={key}
                        className={cn(
                          'py-3 px-3 text-center text-[var(--text-primary)]',
                          key === RECOMMENDED && RECOMMENDED_TINT,
                        )}
                      >
                        {row.type === 'boolean' ? (
                          (value as boolean) ? (
                            <Check className="w-3.5 h-3.5 mx-auto" strokeWidth={2} aria-label="✓" />
                          ) : (
                            <span className="text-[var(--text-muted)] opacity-40" aria-label="—">—</span>
                          )
                        ) : (
                          <span className="terminal-text tabular-nums text-xs">
                            {formatLimit(value as number, 'number', row.unit, unlimitedLabel)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export interface PlansCompareViewProps {
  plans: AvailablePlans;
  currentPlan: PlanType;
  billingCycle: 'monthly' | 'yearly';
  onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void;
  pendingPlan: PlanType | null;
  onPlanAction: (planKey: PlanType) => void;
}

export function PlansCompareView({
  plans,
  currentPlan,
  billingCycle,
  onBillingCycleChange,
  pendingPlan,
  onPlanAction,
}: PlansCompareViewProps) {
  const { t } = useTranslation();
  const isMonthly = billingCycle === 'monthly';
  const unlimitedLabel = t('billing', 'unlimited');
  const currentIdx = ALL_TIERS.indexOf(currentPlan);

  const stateFor = (planKey: PlanType) => {
    const tierIndex = ALL_TIERS.indexOf(planKey);
    return {
      isCurrent: currentPlan === planKey,
      isUpgrade: tierIndex > currentIdx,
      actionDisabled: currentPlan === planKey || (pendingPlan !== null && pendingPlan !== planKey),
    };
  };

  return (
    <div className="dash-page max-w-5xl space-y-8 animate-slide-in pb-12 min-w-0">
      <div className="space-y-4">
        <PageHeader
          back={{ href: '/dashboard/billing', label: t('billing', 'title') }}
          title={t('billing', 'comparePlans')}
          description={t('billing', 'comparePlansSubtitle')}
          meta={[
            plans[currentPlan] ? (
              <MetaLabel key="current">
                {t('billing', 'currentPlanBadge')}: {plans[currentPlan].name}
              </MetaLabel>
            ) : null,
          ]}
          actions={<BillingToggle isMonthly={isMonthly} onChange={onBillingCycleChange} />}
        />
      </div>

      <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden min-w-0">
        <div className="dash-plans-scroll min-w-0">
          {PAID_TIERS.map((planKey) => {
            const plan = plans[planKey];
            if (!plan) return null;
            const s = stateFor(planKey);
            return (
              <PaidPlanColumn
                key={planKey}
                planKey={planKey}
                plan={plan}
                billingCycle={billingCycle}
                isMonthly={isMonthly}
                isRecommended={planKey === 'pro'}
                pending={pendingPlan === planKey}
                unlimitedLabel={unlimitedLabel}
                onAction={() => onPlanAction(planKey)}
                {...s}
              />
            );
          })}
        </div>

        {plans.free && (
          <EdgePlanRow
            planKey="free"
            plan={plans.free}
            billingCycle={billingCycle}
            variant="free"
            pending={pendingPlan === 'free'}
            onAction={() => onPlanAction('free')}
            {...stateFor('free')}
          />
        )}

        {plans.enterprise && (
          <EdgePlanRow
            planKey="enterprise"
            plan={plans.enterprise}
            billingCycle={billingCycle}
            variant="enterprise"
            pending={pendingPlan === 'enterprise'}
            onAction={() => onPlanAction('enterprise')}
            {...stateFor('enterprise')}
          />
        )}
      </div>

      <ComparisonTable plans={plans} unlimitedLabel={unlimitedLabel} />

      <p className="text-xs text-[var(--text-muted)] leading-relaxed text-center max-w-lg mx-auto -mt-2">
        {t('billing', 'plansPricingNote')}
      </p>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed text-center max-w-md mx-auto">
        {t('billing', 'plansFooterLead')}{' '}
        {t('billing', 'plansFooterNeedCustom')}{' '}
        <a href="mailto:support@pushify.dev" className="underline underline-offset-2 hover:opacity-80">
          {t('billing', 'plansContactUs')}
        </a>
      </p>
    </div>
  );
}
