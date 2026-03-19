'use client';

import { buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Server, Database, Rocket, Users, Globe, HardDrive, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import NumberFlow from '@number-flow/react';
import { useTranslation } from '@/hooks';

interface PricingPlan {
  nameKey: 'planFree' | 'planPro' | 'planBusiness';
  price: number;
  yearlyPrice: number;
  periodKey: 'forever' | 'month';
  featureKeys: string[];
  limits: { label: string; value: string; icon: React.ReactNode }[];
  descKey: 'planFreeDesc' | 'planProDesc' | 'planBusinessDesc';
  buttonKey: 'planFreeButton' | 'planProButton' | 'planBusinessButton';
  href: string;
  isPopular: boolean;
  accent: string;
}

const PLANS: PricingPlan[] = [
  {
    nameKey: 'planFree',
    price: 0,
    yearlyPrice: 0,
    periodKey: 'forever',
    featureKeys: [
      '3 {planProjects}',
      '100 {planDeploysMonth}',
      '1 {planTeamMembers}',
      '1 {planCustomDomain}',
      '1 GB {planStorage}',
      '10 GB {planBandwidth}',
      '{planCommunitySupport}',
    ],
    limits: [
      { label: 'Projects', value: '3', icon: <Rocket className="w-3.5 h-3.5" /> },
      { label: 'Deploys', value: '100/mo', icon: <Zap className="w-3.5 h-3.5" /> },
      { label: 'Storage', value: '1 GB', icon: <HardDrive className="w-3.5 h-3.5" /> },
    ],
    descKey: 'planFreeDesc',
    buttonKey: 'planFreeButton',
    href: '/register',
    isPopular: false,
    accent: 'var(--text-muted)',
  },
  {
    nameKey: 'planPro',
    price: 25,
    yearlyPrice: 20,
    periodKey: 'month',
    featureKeys: [
      '50 {planProjects}',
      '3 {planServers}',
      '5 {planDatabases}',
      '2,000 {planDeploysMonth}',
      '10 {planTeamMembers}',
      '20 {planCustomDomains}',
      '50 GB {planStorage}',
      '{planPreviewDeployments}',
      '{planHealthChecks}',
      '{planPrioritySupport}',
    ],
    limits: [
      { label: 'Projects', value: '50', icon: <Rocket className="w-3.5 h-3.5" /> },
      { label: 'Servers', value: '3', icon: <Server className="w-3.5 h-3.5" /> },
      { label: 'Deploys', value: '2K/mo', icon: <Zap className="w-3.5 h-3.5" /> },
    ],
    descKey: 'planProDesc',
    buttonKey: 'planProButton',
    href: '/register?plan=pro',
    isPopular: true,
    accent: 'var(--accent-cyan)',
  },
  {
    nameKey: 'planBusiness',
    price: 99,
    yearlyPrice: 79,
    periodKey: 'month',
    featureKeys: [
      '200 {planProjects}',
      '10 {planServers}',
      '20 {planDatabases}',
      '10,000 {planDeploysMonth}',
      '50 {planTeamMembers}',
      '100 {planCustomDomains}',
      '200 GB {planStorage}',
      '{planPreviewDeployments}',
      '{planHealthChecks}',
      '{planPrioritySupport}',
    ],
    limits: [
      { label: 'Projects', value: '200', icon: <Rocket className="w-3.5 h-3.5" /> },
      { label: 'Servers', value: '10', icon: <Server className="w-3.5 h-3.5" /> },
      { label: 'Deploys', value: '10K/mo', icon: <Zap className="w-3.5 h-3.5" /> },
    ],
    descKey: 'planBusinessDesc',
    buttonKey: 'planBusinessButton',
    href: '/register?plan=business',
    isPopular: false,
    accent: 'var(--accent-purple)',
  },
];

function resolveFeature(template: string, t: (ns: 'landing', key: any) => string): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => t('landing', key));
}

export function PricingSection() {
  const { t } = useTranslation();
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const switchRef = useRef<HTMLButtonElement>(null);

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
        colors: ['#22d3ee', '#a78bfa', '#fbbf24', '#34d399'],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle'],
      });
    }
  };

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

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.nameKey}
              initial={{ y: 50, opacity: 0 }}
              whileInView={
                isDesktop
                  ? {
                      y: plan.isPopular ? -12 : 0,
                      opacity: 1,
                      x: index === 2 ? -20 : index === 0 ? 20 : 0,
                      scale: index === 0 || index === 2 ? 0.96 : 1.0,
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
                index === 0 && 'origin-right',
                index === 2 && 'origin-left',
              )}
            >
              {/* Popular badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent-cyan)] text-[var(--bg-primary)]">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-bold">{t('landing', 'mostPopular')}</span>
                </div>
              )}

              {/* Plan name */}
              <p className="text-sm font-semibold text-[var(--text-muted)] terminal-text uppercase tracking-wider mb-4">
                {t('landing', plan.nameKey)}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-[var(--text-primary)]">
                  {plan.price === 0 ? (
                    '$0'
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
                  <span className="text-sm text-[var(--text-muted)]">/ {t('landing', plan.periodKey)}</span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-5">
                {plan.price === 0 ? t('landing', 'freeForever') : isMonthly ? t('landing', 'billedMonthly') : t('landing', 'billedAnnually')}
              </p>

              {/* Quick limits */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[var(--glass-border)]">
                {plan.limits.map((limit, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <span className="text-[var(--accent-cyan)]">{limit.icon}</span>
                    <span className="font-medium">{limit.value}</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.featureKeys.map((featureTemplate, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-[var(--accent-cyan)] mt-0.5 shrink-0" />
                    <span className="text-[var(--text-secondary)]">{resolveFeature(featureTemplate, t)}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={cn(
                  'w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200',
                  plan.isPopular
                    ? 'bg-[var(--accent-cyan)] text-[var(--bg-primary)] hover:brightness-110 shadow-md shadow-[var(--accent-cyan)]/20'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--glass-border)] hover:border-[var(--glass-border-strong)] hover:bg-[var(--hover-overlay-lg)]',
                )}
              >
                {t('landing', plan.buttonKey)}
              </Link>

              <p className="text-xs text-[var(--text-muted)] text-center mt-3">{t('landing', plan.descKey)}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-8">
          {t('landing', 'pricingBottomNote')}
        </p>
      </div>
    </section>
  );
}
