'use client';

import { CreditCard, Server, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';
import { cn } from '@/lib/utils';

const PLATFORM_ITEM_KEYS = [
  'billingPlatformItem1',
  'billingPlatformItem2',
  'billingPlatformItem3',
  'billingPlatformItem4',
  'billingPlatformItem5',
] as const;

const INFRA_ITEM_KEYS = [
  'billingInfraItem1',
  'billingInfraItem2',
  'billingInfraItem3',
  'billingInfraItem4',
  'billingInfraItem5',
] as const;

type BillingKey =
  | (typeof PLATFORM_ITEM_KEYS)[number]
  | (typeof INFRA_ITEM_KEYS)[number]
  | 'billingHowItWorksBadge'
  | 'billingHowItWorksTitle'
  | 'billingHowItWorksSubtitle'
  | 'billingPlatformTitle'
  | 'billingPlatformIntro'
  | 'billingInfraTitle'
  | 'billingInfraIntro'
  | 'billingByosNote'
  | 'billingPolicyTitle'
  | 'billingPolicyBody'
  | 'billingCtaPricing';

function BillingList({ keys }: { keys: readonly BillingKey[] }) {
  const { t } = useTranslation();

  return (
    <ul className="space-y-2.5">
      {keys.map((key) => (
        <li key={key} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
          <span
            className="mt-[0.45rem] w-1.5 h-1.5 shrink-0 rounded-full"
            style={{ background: 'var(--lp-muted)' }}
            aria-hidden
          />
          <span>{t('landing', key)}</span>
        </li>
      ))}
    </ul>
  );
}

function BillingCard({
  icon: Icon,
  titleKey,
  introKey,
  itemKeys,
  delay,
}: {
  icon: typeof CreditCard;
  titleKey: BillingKey;
  introKey: BillingKey;
  itemKeys: readonly BillingKey[];
  delay: string;
}) {
  const { t } = useTranslation();

  return (
    <article className="lp-pricing-card lp-reveal h-full" style={{ animationDelay: delay }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="lp-pricing-feature__icon lp-pricing-feature__icon--on shrink-0">
          <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        </span>
        <h3 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--lp-ink)' }}>
          {t('landing', titleKey)}
        </h3>
      </div>
      <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--lp-body)' }}>
        {t('landing', introKey)}
      </p>
      <BillingList keys={itemKeys} />
    </article>
  );
}

interface BillingHowItWorksSectionProps {
  embedded?: boolean;
  className?: string;
}

export function BillingHowItWorksSection({ embedded, className }: BillingHowItWorksSectionProps) {
  const { t } = useTranslation();

  const content = (
    <>
      {!embedded ? (
        <LandingSectionHeader
          label={t('landing', 'billingHowItWorksBadge')}
          title={t('landing', 'billingHowItWorksTitle')}
          description={t('landing', 'billingHowItWorksSubtitle')}
          align="center"
          className="mx-auto text-center max-w-2xl mb-10"
        />
      ) : (
        <div className="text-center mb-8 lp-reveal">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--lp-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {t('landing', 'billingHowItWorksBadge')}
          </p>
          <h3 className="lp-section-title">{t('landing', 'billingHowItWorksTitle')}</h3>
          <p
            className="text-sm mt-3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--lp-muted)' }}
          >
            {t('landing', 'billingHowItWorksSubtitle')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        <BillingCard
          icon={CreditCard}
          titleKey="billingPlatformTitle"
          introKey="billingPlatformIntro"
          itemKeys={PLATFORM_ITEM_KEYS}
          delay="0ms"
        />
        <BillingCard
          icon={Server}
          titleKey="billingInfraTitle"
          introKey="billingInfraIntro"
          itemKeys={INFRA_ITEM_KEYS}
          delay="80ms"
        />
      </div>

      <p
        className="text-center text-sm leading-relaxed mt-6 max-w-2xl mx-auto lp-reveal"
        style={{ color: 'var(--lp-muted)', animationDelay: '120ms' }}
      >
        {t('landing', 'billingByosNote')}
      </p>

      <div
        className="lp-pricing-card lp-reveal flex gap-3 items-start mt-5"
        style={{ animationDelay: '160ms' }}
        role="note"
      >
        <span className="lp-pricing-feature__icon lp-pricing-feature__icon--on shrink-0 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--lp-ink)' }}>
            {t('landing', 'billingPolicyTitle')}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
            {t('landing', 'billingPolicyBody')}
          </p>
        </div>
      </div>

      {!embedded && (
        <p className="text-center mt-8 lp-reveal" style={{ animationDelay: '200ms' }}>
          <Link
            href="/pricing"
            className="text-sm font-medium underline-offset-4 hover:underline"
            style={{ color: 'var(--lp-ink)' }}
          >
            {t('landing', 'billingCtaPricing')}
          </Link>
        </p>
      )}
    </>
  );

  if (embedded) {
    return <div className={cn('max-w-5xl mx-auto w-full min-w-0', className)}>{content}</div>;
  }

  return (
    <section id="billing" className={cn('lp-section', className)}>
      <div className="lp-container max-w-5xl">{content}</div>
    </section>
  );
}
