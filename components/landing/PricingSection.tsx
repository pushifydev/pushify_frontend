'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Check, X, Star, Zap, Server, Database, Rocket, Users, Globe,
  HardDrive, Clock, Activity, HeartPulse, Headphones, Wifi, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import NumberFlow from '@number-flow/react';
import { useTranslation } from '@/hooks';
import { useAvailablePlans } from '@/hooks/useBilling';
import type { PlanType, PlanLimits } from '@/lib/api';
import type { TranslationKeys } from '@/lib/i18n/locales/en';

const PLAN_ORDER: PlanType[] = ['free', 'hobby', 'pro', 'business', 'enterprise'];

const PLAN_META: Record<PlanType, { nameKey: string; descKey: string; buttonKey: string; href: string; isPopular: boolean; accent: string; yearlyDiscount: number }> = {
  free:       { nameKey: 'planFree', descKey: 'planFreeDesc', buttonKey: 'planFreeButton', href: '/register', isPopular: false, accent: 'var(--text-muted)', yearlyDiscount: 0 },
  hobby:      { nameKey: 'planHobby', descKey: 'planHobbyDesc', buttonKey: 'planHobbyButton', href: '/register?plan=hobby', isPopular: false, accent: '#6366f1', yearlyDiscount: 0.2 },
  pro:        { nameKey: 'planPro', descKey: 'planProDesc', buttonKey: 'planProButton', href: '/register?plan=pro', isPopular: true, accent: '#a78bfa', yearlyDiscount: 0.2 },
  business:   { nameKey: 'planBusiness', descKey: 'planBusinessDesc', buttonKey: 'planBusinessButton', href: '/register?plan=business', isPopular: false, accent: '#f59e0b', yearlyDiscount: 0.2 },
  enterprise: { nameKey: 'planEnterprise', descKey: 'planEnterpriseDesc', buttonKey: 'planEnterpriseButton', href: '/register?plan=enterprise', isPopular: false, accent: '#22c55e', yearlyDiscount: 0.2 },
};

type BillingLabelKey = keyof TranslationKeys['billing'];

interface FeatureRow {
  key: keyof PlanLimits;
  labelKey: BillingLabelKey;
  icon: typeof Server;
  type: 'number' | 'boolean';
  unit?: string;
}

const FEATURE_ROWS: FeatureRow[] = [
  { key: 'servers', labelKey: 'servers', icon: Server, type: 'number' },
  { key: 'databases', labelKey: 'databases', icon: Database, type: 'number' },
  { key: 'projects', labelKey: 'projects', icon: Rocket, type: 'number' },
  { key: 'deploymentsPerMonth', labelKey: 'deploymentsPerMonthShort', icon: Zap, type: 'number' },
  { key: 'teamMembers', labelKey: 'teamMembers', icon: Users, type: 'number' },
  { key: 'customDomains', labelKey: 'customDomains', icon: Globe, type: 'number' },
  { key: 'storageGb', labelKey: 'storageGb', icon: HardDrive, type: 'number', unit: 'GB' },
  { key: 'bandwidthGb', labelKey: 'bandwidthGb', icon: Wifi, type: 'number', unit: 'GB' },
  { key: 'buildMinutesPerMonth', labelKey: 'buildMinutes', icon: Clock, type: 'number', unit: 'min' },
  { key: 'previewDeployments', labelKey: 'previewDeployments', icon: Activity, type: 'boolean' },
  { key: 'healthChecks', labelKey: 'healthChecks', icon: HeartPulse, type: 'boolean' },
  { key: 'prioritySupport', labelKey: 'prioritySupport', icon: Headphones, type: 'boolean' },
];

function formatValue(
  value: number | boolean,
  type: 'number' | 'boolean',
  unit: string | undefined,
  unlimitedLabel: string,
): string {
  if (type === 'boolean') return '';
  if (typeof value === 'number') {
    if (value === 0) return '—';
    if (value >= 9999 || value === -1) return unlimitedLabel;
    return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString();
  }
  return String(value);
}

function fmtNum(n: number, unlimitedLabel: string): string {
  if (n === 0) return '—';
  if (n >= 9999 || n === -1) return unlimitedLabel;
  return n.toLocaleString();
}

export function PricingSection() {
  const { t } = useTranslation();
  const unlimitedLabel = t('billing', 'unlimited');
  const perMonthSuffix = t('billing', 'perMonth');
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const switchRef = useRef<HTMLButtonElement>(null);
  const { data: apiPlans, isLoading } = useAvailablePlans();

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: ['#6366f1', '#a78bfa', '#fbbf24', '#34d399'],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle'],
      });
    }
  };

  if (isLoading || !apiPlans) {
    return (
      <section className="py-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
      </section>
    );
  }

  // Build plan data from API
  const allPlans = PLAN_ORDER.map((key) => {
    const plan = apiPlans[key];
    if (!plan) return null;
    const meta = PLAN_META[key];
    // For custom-priced plans (enterprise = -1) keep the sentinel value as-is
    const yearlyPrice = plan.price < 0 ? plan.price : Math.round(plan.price * (1 - meta.yearlyDiscount));
    return { key, ...meta, price: plan.price, yearlyPrice, limits: plan.limits };
  }).filter(Boolean) as Array<{ key: PlanType; nameKey: string; descKey: string; buttonKey: string; href: string; isPopular: boolean; accent: string; price: number; yearlyPrice: number; limits: PlanLimits }>;

  const mainPlans = allPlans;

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/20 mb-5">
            <Zap className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
            <span className="text-xs text-[var(--accent-amber)] terminal-text uppercase tracking-wider">{t('landing', 'pricingBadge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t('landing', 'simpleTransparent')} <span className="gradient-text">{t('landing', 'transparentGradient')}</span> {t('landing', 'pricing').toLowerCase()}
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            {t('landing', 'pricingSubtitle')}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn('text-sm font-medium', isMonthly ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>{t('landing', 'monthly')}</span>
          <Label>
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
            />
          </Label>
          <span className={cn('text-sm font-medium', !isMonthly ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>
            {t('landing', 'yearly')}
            <span className="ml-1.5 text-xs text-[var(--accent-cyan)] font-semibold">-20%</span>
          </span>
        </div>

        {/* Plan Cards — top 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-20">
          {mainPlans.map((plan, index) => (
            <motion.div
              key={plan.key}
              initial={{ y: 50, opacity: 0 }}
              whileInView={
                isDesktop
                  ? {
                      y: plan.isPopular ? -8 : 0,
                      opacity: 1,
                      scale: plan.isPopular ? 1.02 : 1,
                    }
                  : { y: 0, opacity: 1 }
              }
              viewport={{ once: true }}
              transition={{
                duration: 1.4,
                type: 'spring',
                stiffness: 100,
                damping: 30,
                delay: 0.2 + index * 0.1,
              }}
              className={cn(
                'relative rounded-2xl p-6 flex flex-col',
                'bg-[var(--bg-secondary)] border transition-all duration-300',
                plan.isPopular
                  ? 'border-[var(--accent-cyan)] shadow-lg shadow-[var(--accent-cyan)]/10'
                  : 'border-[var(--glass-border)] hover:border-[var(--glass-border-strong)]',
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent-cyan)] text-white">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-bold">{t('landing', 'mostPopular')}</span>
                </div>
              )}

              <p className="text-sm font-semibold text-[var(--text-muted)] terminal-text uppercase tracking-wider mb-4">
                {t('landing', plan.nameKey as any)}
              </p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-[var(--text-primary)]">
                  {plan.price === 0 ? (
                    '$0'
                  ) : plan.price < 0 ? (
                    t('landing', 'custom' as any)
                  ) : (
                    <NumberFlow
                      value={isMonthly ? plan.price : plan.yearlyPrice}
                      format={{ style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                      transformTiming={{ duration: 500, easing: 'ease-out' }}
                      willChange
                    />
                  )}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-[var(--text-muted)]">/ {t('landing', 'month' as any)}</span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-5">
                {plan.price === 0
                  ? t('landing', 'freeForever')
                  : plan.price < 0
                    ? t('landing', 'contactForPricing' as any)
                    : isMonthly
                      ? t('landing', 'billedMonthly')
                      : t('landing', 'billedAnnually')}
              </p>

              {/* Quick highlights */}
              <div className="space-y-2 mb-6 pb-6 border-b border-[var(--glass-border)]">
                {[
                  { icon: Server, value: fmtNum(plan.limits.servers, unlimitedLabel), labelKey: 'servers' as const },
                  { icon: Rocket, value: fmtNum(plan.limits.projects, unlimitedLabel), labelKey: 'projects' as const },
                  { icon: Zap, value: fmtNum(plan.limits.deploymentsPerMonth, unlimitedLabel), labelKey: 'deploymentsPerMonthShort' as const },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <item.icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      {t('billing', item.labelKey)}
                    </span>
                    <span className="font-medium text-[var(--text-primary)] terminal-text text-xs">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Boolean features */}
              <ul className="flex-1 space-y-2 mb-6">
                {([
                  { key: 'previewDeployments' as const, labelKey: 'previewDeployments' as const },
                  { key: 'healthChecks' as const, labelKey: 'healthChecks' as const },
                  { key: 'prioritySupport' as const, labelKey: 'prioritySupport' as const },
                ] as const).map((feat) => (
                  <li key={feat.key} className="flex items-center gap-2.5 text-sm">
                    {plan.limits[feat.key] ? (
                      <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-[var(--text-muted)] opacity-40 shrink-0" />
                    )}
                    <span className={plan.limits[feat.key] ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)] opacity-60'}>
                      {t('billing', feat.labelKey)}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  'w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200',
                  plan.isPopular
                    ? 'bg-[var(--accent-cyan)] text-white hover:bg-[var(--accent-cyan-dim)] shadow-md shadow-[var(--accent-cyan)]/30'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--glass-border)] hover:border-[var(--glass-border-strong)] hover:bg-[var(--hover-overlay-lg)]',
                )}
              >
                {t('landing', plan.buttonKey as any)}
              </Link>

              <p className="text-xs text-[var(--text-muted)] text-center mt-3">{t('landing', plan.descKey as any)}</p>
            </motion.div>
          ))}
        </div>

        {/* Full Comparison Table */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
            {t('homepage', 'fullPlanComparisonTitle')}
          </h3>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
            }}
          >
            {/* Table header */}
            <div
              className="grid items-center py-4 px-5"
              style={{
                gridTemplateColumns: '200px repeat(5, 1fr)',
                borderBottom: '1px solid var(--glass-border)',
              }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {t('homepage', 'comparisonColumnFeature')}
              </div>
              {allPlans.map((plan) => (
                <div key={plan.key} className="text-center">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: plan.accent }}
                  >
                    {t('landing', plan.nameKey as any)}
                  </span>
                  <div className="text-lg font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    ${isMonthly ? plan.price : plan.yearlyPrice}
                    {plan.price > 0 && (
                      <span className="text-xs font-normal text-[var(--text-muted)]">{perMonthSuffix}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {FEATURE_ROWS.map((row, rowIdx) => (
              <div
                key={String(row.key)}
                className="grid items-center py-3 px-5"
                style={{
                  gridTemplateColumns: '200px repeat(5, 1fr)',
                  background: rowIdx % 2 === 0 ? 'transparent' : 'var(--hover-overlay)',
                  borderBottom: rowIdx < FEATURE_ROWS.length - 1 ? '1px solid var(--glass-divider)' : 'none',
                }}
              >
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <row.icon className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  {t('billing', row.labelKey)}
                </div>
                {allPlans.map((plan) => {
                  const value = plan.limits[row.key];
                  const isBool = row.type === 'boolean';

                  return (
                    <div key={plan.key} className="text-center">
                      {isBool ? (
                        value ? (
                          <Check className="w-4 h-4 mx-auto" style={{ color: '#22c55e' }} />
                        ) : (
                          <X className="w-4 h-4 mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                        )
                      ) : (
                        <span
                          className="text-xs font-medium"
                          style={{
                            color: formatValue(value as number, 'number', row.unit, unlimitedLabel) === unlimitedLabel
                              ? plan.accent
                              : formatValue(value as number, 'number', row.unit, unlimitedLabel) === '—'
                              ? 'var(--text-muted)'
                              : 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {formatValue(value as number, 'number', row.unit, unlimitedLabel)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-8">
          {t('landing', 'pricingBottomNote')}
        </p>
      </div>
    </section>
  );
}
