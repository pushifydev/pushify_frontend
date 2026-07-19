'use client';

import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { PricingSection } from '@/components/landing/PricingSection';
import { useTranslation } from '@/hooks';
import type { AvailablePlans } from '@/lib/api';

export function PricingPageView({ initialPlans }: { initialPlans?: AvailablePlans }) {
  const { t } = useTranslation();

  return (
    <MarketingShell noPad>
      <MarketingPageHero
        label={t('landing', 'pricingBadge')}
        title={
          <>
            {t('landing', 'simpleTransparent')}{' '}
            <span style={{ color: 'var(--lp-muted)' }}>
              {t('landing', 'transparentGradient')}
            </span>{' '}
            {t('landing', 'pricing').toLowerCase()}
          </>
        }
        description={t('landing', 'pricingSubtitle')}
      />
      <PricingSection pageLayout initialPlans={initialPlans} />
    </MarketingShell>
  );
}
