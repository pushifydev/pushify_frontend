'use client';

import { cn } from '@/lib/utils';
import {
  Check,
  X,
  Loader2,
  Star,
  Server,
  ArrowRight,
  Lock,
  GitBranch,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import NumberFlow from '@number-flow/react';
import { useTranslation } from '@/hooks';
import { useAvailablePlans } from '@/hooks/useBilling';
import { LandingSectionHeader } from './LandingSectionHeader';
import type { PlanType, PlanLimits } from '@/lib/api';
import type { TranslationKeys } from '@/lib/i18n/locales/en';

const MAIN_TIERS: PlanType[] = ['hobby', 'pro', 'business'];
const ALL_PLANS: PlanType[] = ['free', 'hobby', 'pro', 'business', 'enterprise'];

type LandingKey = keyof TranslationKeys['landing'];
type BillingLabelKey = keyof TranslationKeys['billing'];

const PLAN_META: Record<
  PlanType,
  {
    nameKey: LandingKey;
    descKey: LandingKey;
    buttonKey: LandingKey;
    href: string;
    isPopular: boolean;
    yearlyDiscount: number;
  }
> = {
  free: {
    nameKey: 'planFree',
    descKey: 'planFreeDesc',
    buttonKey: 'planFreeButton',
    href: '/register',
    isPopular: false,
    yearlyDiscount: 0,
  },
  hobby: {
    nameKey: 'planHobby',
    descKey: 'planHobbyDesc',
    buttonKey: 'planHobbyButton',
    href: '/register?plan=hobby',
    isPopular: false,
    yearlyDiscount: 0.2,
  },
  pro: {
    nameKey: 'planPro',
    descKey: 'planProDesc',
    buttonKey: 'planProButton',
    href: '/register?plan=pro',
    isPopular: true,
    yearlyDiscount: 0.2,
  },
  business: {
    nameKey: 'planBusiness',
    descKey: 'planBusinessDesc',
    buttonKey: 'planBusinessButton',
    href: '/register?plan=business',
    isPopular: false,
    yearlyDiscount: 0.2,
  },
  enterprise: {
    nameKey: 'planEnterprise',
    descKey: 'planEnterpriseDesc',
    buttonKey: 'planEnterpriseButton',
    href: 'mailto:sales@pushify.dev?subject=Enterprise%20Plan',
    isPopular: false,
    yearlyDiscount: 0.2,
  },
};

interface FeatureRow {
  key: keyof PlanLimits;
  labelKey: BillingLabelKey;
  type: 'number' | 'boolean';
  unit?: string;
}

const CARD_METRICS: { key: keyof PlanLimits; labelKey: BillingLabelKey }[] = [
  { key: 'servers', labelKey: 'servers' },
  { key: 'projects', labelKey: 'projects' },
  { key: 'deploymentsPerMonth', labelKey: 'deploymentsPerMonthShort' },
];

const CARD_FEATURES: { key: keyof PlanLimits; labelKey: BillingLabelKey }[] = [
  { key: 'previewDeployments', labelKey: 'previewDeployments' },
  { key: 'healthChecks', labelKey: 'healthChecks' },
  { key: 'prioritySupport', labelKey: 'prioritySupport' },
];

const COMPARE_ROWS: FeatureRow[] = [
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

function fmtNum(n: number, unlimitedLabel: string): string {
  if (n === 0) return '—';
  if (n >= 9999 || n === -1) return unlimitedLabel;
  return n.toLocaleString();
}

function formatCompareValue(
  value: number,
  unit: string | undefined,
  unlimitedLabel: string,
): string {
  if (value === 0) return '—';
  if (value >= 9999 || value === -1) return unlimitedLabel;
  return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString();
}

type PlanBundle = {
  key: PlanType;
  nameKey: LandingKey;
  descKey: LandingKey;
  buttonKey: LandingKey;
  href: string;
  isPopular: boolean;
  yearlyDiscount: number;
  price: number;
  yearlyPrice: number;
  limits: PlanLimits;
};

interface PricingSectionProps {
  pageLayout?: boolean;
}

function PlanCta({ href, isPopular, label }: { href: string; isPopular: boolean; label: string }) {
  const className = cn(
    'group w-full h-11 text-sm font-medium flex items-center justify-center gap-2 rounded-lg',
    isPopular ? 'lp-cta' : 'lp-cta-ghost',
  );

  const content = (
    <>
      {label}
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </>
  );

  if (href.startsWith('mailto:')) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function PriceBlock({
  plan,
  isMonthly,
  labels,
}: {
  plan: PlanBundle;
  isMonthly: boolean;
  labels: { custom: string };
}) {
  if (plan.price < 0) {
    return <span className="lp-pricing-price">{labels.custom}</span>;
  }

  if (plan.price === 0) {
    return <span className="lp-pricing-price">$0</span>;
  }

  const amount = isMonthly ? plan.price : plan.yearlyPrice;

  return (
    <NumberFlow
      className="lp-pricing-price"
      value={amount}
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

function PricingCard({
  plan,
  isMonthly,
  unlimitedLabel,
  labels,
  delay,
}: {
  plan: PlanBundle;
  isMonthly: boolean;
  unlimitedLabel: string;
  labels: { custom: string };
  delay: string;
}) {
  const { t } = useTranslation();

  return (
    <article
      className={cn(
        'lp-pricing-card lp-reveal',
        plan.isPopular && 'lp-pricing-card--featured',
      )}
      style={{ animationDelay: delay }}
    >
      {plan.isPopular && (
        <span className="lp-pricing-badge">
          <Star className="w-3 h-3" strokeWidth={2} />
          {t('landing', 'mostPopular')}
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--lp-ink)' }}>
          {t('landing', plan.nameKey)}
        </h3>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
          {t('landing', plan.descKey)}
        </p>
      </div>

      <div className="mb-1 flex items-baseline gap-2 flex-wrap">
        <PriceBlock plan={plan} isMonthly={isMonthly} labels={labels} />
        {plan.price > 0 && (
          <span className="text-sm" style={{ color: 'var(--lp-muted)' }}>
            / {t('landing', 'month')}
          </span>
        )}
      </div>
      <p className="text-xs mb-6" style={{ color: 'var(--lp-muted)' }}>
        {plan.price === 0
          ? t('landing', 'freeForever')
          : plan.price < 0
            ? t('landing', 'contactForPricing')
            : isMonthly
              ? t('landing', 'billedMonthly')
              : t('landing', 'billedAnnually')}
      </p>

      <div className="lp-pricing-metric-grid mb-6">
        {CARD_METRICS.map((row) => (
          <div key={row.key} className="lp-pricing-metric">
            <span className="lp-pricing-metric__value">
              {fmtNum(plan.limits[row.key] as number, unlimitedLabel)}
            </span>
            <span className="lp-pricing-metric__label">{t('billing', row.labelKey)}</span>
          </div>
        ))}
      </div>

      <ul className="space-y-2.5 flex-1 mb-7">
        {CARD_FEATURES.map((feat) => {
          const on = plan.limits[feat.key] as boolean;
          return (
            <li key={feat.key} className="lp-pricing-feature">
              <span
                className={cn(
                  'lp-pricing-feature__icon',
                  on ? 'lp-pricing-feature__icon--on' : 'lp-pricing-feature__icon--off',
                )}
              >
                {on ? (
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                ) : (
                  <X className="w-3 h-3" strokeWidth={2} />
                )}
              </span>
              <span style={{ color: on ? 'var(--lp-body)' : 'var(--lp-muted)' }}>
                {t('billing', feat.labelKey)}
              </span>
            </li>
          );
        })}
      </ul>

      <PlanCta
        href={plan.href}
        isPopular={plan.isPopular}
        label={t('landing', plan.buttonKey)}
      />
    </article>
  );
}

function PricingBanner({
  plan,
  isMonthly,
  unlimitedLabel,
  labels,
}: {
  plan: PlanBundle;
  isMonthly: boolean;
  unlimitedLabel: string;
  labels: { custom: string };
}) {
  const { t } = useTranslation();

  return (
    <article className="lp-pricing-banner lp-reveal">
      <div className="lp-pricing-banner__main min-w-0">
        <h3 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--lp-ink)' }}>
          {t('landing', plan.nameKey)}
        </h3>
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <PriceBlock plan={plan} isMonthly={isMonthly} labels={labels} />
          {plan.price > 0 && (
            <span className="text-sm" style={{ color: 'var(--lp-muted)' }}>
              / {t('landing', 'month')}
            </span>
          )}
        </div>
        <p className="text-sm mt-2 leading-relaxed max-w-xl" style={{ color: 'var(--lp-muted)' }}>
          {t('landing', plan.descKey)}
        </p>
      </div>

      <div className="lp-pricing-banner__metrics hidden md:flex">
        {CARD_METRICS.map((row) => (
          <div key={row.key} className="text-center min-w-18">
            <span
              className="block text-base font-semibold tabular-nums"
              style={{ color: 'var(--lp-ink)' }}
            >
              {fmtNum(plan.limits[row.key] as number, unlimitedLabel)}
            </span>
            <span className="block text-[10px] mt-0.5" style={{ color: 'var(--lp-muted)' }}>
              {t('billing', row.labelKey)}
            </span>
          </div>
        ))}
      </div>

      <div className="shrink-0 w-full md:w-auto md:min-w-[10rem]">
        <PlanCta
          href={plan.href}
          isPopular={false}
          label={t('landing', plan.buttonKey)}
        />
      </div>
    </article>
  );
}

export function PricingSection({ pageLayout }: PricingSectionProps) {
  const { t } = useTranslation();
  const unlimitedLabel = t('billing', 'unlimited');
  const perMonthSuffix = t('billing', 'perMonth');
  const [isMonthly, setIsMonthly] = useState(true);
  const { data: apiPlans, isLoading } = useAvailablePlans();

  if (isLoading || !apiPlans) {
    return (
      <section
        className={cn(
          'flex items-center justify-center min-h-[32vh]',
          pageLayout ? 'pb-20' : 'lp-section',
        )}
      >
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--lp-muted)' }} />
      </section>
    );
  }

  const buildPlan = (key: PlanType): PlanBundle | null => {
    const plan = apiPlans[key];
    if (!plan) return null;
    const meta = PLAN_META[key];
    const yearlyPrice =
      plan.price < 0 ? plan.price : Math.round(plan.price * (1 - meta.yearlyDiscount));
    return { key, ...meta, price: plan.price, yearlyPrice, limits: plan.limits };
  };

  const allPlans = ALL_PLANS.map(buildPlan).filter(Boolean) as PlanBundle[];
  const freePlan = buildPlan('free');
  const enterprisePlan = buildPlan('enterprise');
  const mainPlans = MAIN_TIERS.map(buildPlan).filter(Boolean) as PlanBundle[];

  const priceLabels = { custom: t('landing', 'custom') };

  const trustItems = [
    { icon: Lock, label: 'SSL' },
    { icon: GitBranch, label: 'CI/CD' },
    { icon: Activity, label: t('billing', 'healthChecks') },
  ];

  const sectionTitle = (
    <>
      {t('landing', 'simpleTransparent')}{' '}
      <span style={{ color: 'var(--lp-muted)' }}>{t('landing', 'transparentGradient')}</span>{' '}
      {t('landing', 'pricing').toLowerCase()}
    </>
  );

  return (
    <section
      id="pricing"
      className={cn(pageLayout ? 'pb-20 md:pb-28' : 'lp-section')}
    >
      <div className="lp-container min-w-0">
        {!pageLayout && (
          <LandingSectionHeader
            label={t('landing', 'pricingBadge')}
            title={sectionTitle}
            description={t('landing', 'pricingSubtitle')}
            align="center"
            className="mx-auto text-center max-w-2xl"
          />
        )}

        <div
          className={cn(
            'lp-pricing-trust lp-reveal mx-auto max-w-2xl',
            pageLayout ? 'mb-8' : 'mb-10',
          )}
          style={{ animationDelay: '60ms' }}
        >
          {trustItems.map((item) => (
            <span key={item.label} className="lp-pricing-trust__item">
              <item.icon className="w-3.5 h-3.5" style={{ color: 'var(--lp-muted)' }} />
              {item.label}
            </span>
          ))}
        </div>

        <div
          className={cn('flex justify-center lp-reveal', pageLayout ? 'mb-10' : 'mb-12')}
          style={{ animationDelay: '100ms' }}
        >
          <div className="lp-pricing-period" role="group" aria-label={t('landing', 'pricingBadge')}>
            <button
              type="button"
              className={cn('lp-pricing-period__btn', isMonthly && 'is-active')}
              onClick={() => setIsMonthly(true)}
            >
              {t('landing', 'monthly')}
            </button>
            <button
              type="button"
              className={cn('lp-pricing-period__btn', !isMonthly && 'is-active')}
              onClick={() => setIsMonthly(false)}
            >
              {t('landing', 'yearly')}
              <span className="lp-pricing-period__save">−20%</span>
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-4 lg:space-y-5">
          {freePlan && (
            <PricingBanner
              plan={freePlan}
              isMonthly={isMonthly}
              unlimitedLabel={unlimitedLabel}
              labels={priceLabels}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
            {mainPlans.map((plan, index) => (
              <PricingCard
                key={plan.key}
                plan={plan}
                isMonthly={isMonthly}
                unlimitedLabel={unlimitedLabel}
                labels={priceLabels}
                delay={`${140 + index * 70}ms`}
              />
            ))}
          </div>

          {enterprisePlan && (
            <PricingBanner
              plan={enterprisePlan}
              isMonthly={isMonthly}
              unlimitedLabel={unlimitedLabel}
              labels={priceLabels}
            />
          )}
        </div>

        <div
          className="max-w-5xl mx-auto mt-16 lg:mt-20 lp-reveal"
          style={{ animationDelay: '380ms' }}
        >
          <div className="text-center mb-8">
            <h3 className="lp-section-title">{t('homepage', 'fullPlanComparisonTitle')}</h3>
            <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'var(--lp-muted)' }}>
              {t('landing', 'pricingSubtitle')}
            </p>
          </div>

          <div className="lp-pricing-compare-wrap">
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div
                  className="grid items-center gap-2 py-4 px-4 sm:px-5 border-b border-[var(--lp-border)]"
                  style={{
                    gridTemplateColumns: 'minmax(140px, 1.3fr) repeat(5, minmax(80px, 1fr))',
                    background: 'var(--bg-tertiary)',
                  }}
                >
                  <div
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--lp-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {t('homepage', 'comparisonColumnFeature')}
                  </div>
                  {allPlans.map((plan) => (
                    <div
                      key={plan.key}
                      className={cn(
                        'text-center min-w-0 py-2 rounded-md',
                        plan.isPopular && 'lp-pricing-compare-col--highlight',
                      )}
                    >
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wide block truncate"
                        style={{ color: 'var(--lp-ink)' }}
                      >
                        {t('landing', plan.nameKey)}
                      </span>
                      <div
                        className="text-sm font-semibold mt-1 tabular-nums"
                        style={{ color: 'var(--lp-ink)' }}
                      >
                        {plan.price < 0 ? (
                          '—'
                        ) : plan.price === 0 ? (
                          '$0'
                        ) : (
                          <>
                            ${isMonthly ? plan.price : plan.yearlyPrice}
                            <span
                              className="block text-[10px] font-normal"
                              style={{ color: 'var(--lp-muted)' }}
                            >
                              {perMonthSuffix}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {COMPARE_ROWS.map((row, rowIdx) => (
                  <div
                    key={String(row.key)}
                    className="grid items-center gap-2 py-3 px-4 sm:px-5"
                    style={{
                      gridTemplateColumns: 'minmax(140px, 1.3fr) repeat(5, minmax(80px, 1fr))',
                      background: rowIdx % 2 === 1 ? 'var(--hover-overlay)' : 'transparent',
                      borderBottom:
                        rowIdx < COMPARE_ROWS.length - 1
                          ? '1px solid var(--lp-border)'
                          : 'none',
                    }}
                  >
                    <div className="text-xs sm:text-sm truncate" style={{ color: 'var(--lp-body)' }}>
                      {t('billing', row.labelKey)}
                    </div>
                    {allPlans.map((plan) => {
                      const value = plan.limits[row.key];
                      if (row.type === 'boolean') {
                        return (
                          <div
                            key={plan.key}
                            className={cn(
                              'text-center py-1',
                              plan.isPopular && 'lp-pricing-compare-col--highlight',
                            )}
                          >
                            {value ? (
                              <Check
                                className="w-4 h-4 mx-auto"
                                style={{ color: 'var(--lp-ink)' }}
                                strokeWidth={2}
                              />
                            ) : (
                              <span style={{ color: 'var(--lp-muted)', opacity: 0.3 }}>—</span>
                            )}
                          </div>
                        );
                      }
                      const formatted = formatCompareValue(
                        value as number,
                        row.unit,
                        unlimitedLabel,
                      );
                      return (
                        <div
                          key={plan.key}
                          className={cn(
                            'text-center py-1',
                            plan.isPopular && 'lp-pricing-compare-col--highlight',
                          )}
                        >
                          <span
                            className="text-[11px] sm:text-xs font-medium tabular-nums"
                            style={{
                              color:
                                formatted === '—' ? 'var(--lp-muted)' : 'var(--lp-ink)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {formatted}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p
          className="text-center text-sm mt-10 max-w-lg mx-auto leading-relaxed"
          style={{ color: 'var(--lp-muted)' }}
        >
          {t('landing', 'pricingBottomNote')}
        </p>
      </div>
    </section>
  );
}
