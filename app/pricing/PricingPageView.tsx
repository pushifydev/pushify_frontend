'use client';

import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { HomeCost, HomeFaq } from '@/components/landing/home';
import { useTranslation } from '@/hooks';
import type { AvailablePlans } from '@/lib/api';
import { PricingPlans } from './PricingPlans';

const copy = {
  en: {
    label: 'Pricing',
    title: 'A flat plan for the platform.',
    lead: 'Start free on a server you own. Upgrade for more projects and teammates. Managed servers are billed by the hour, on their own.',
  },
  tr: {
    label: 'Fiyatlandırma',
    title: 'Platform için sabit bir plan.',
    lead: 'Kendi sunucunuzda ücretsiz başlayın. Daha fazla proje ve ekip üyesi için yükseltin. Yönetilen sunucular ayrıca, saatlik faturalanır.',
  },
};

export function PricingPageView({ initialPlans }: { initialPlans?: AvailablePlans }) {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];

  return (
    <MarketingShell noPad>
      <MarketingPageHero label={c.label} title={c.title} description={c.lead} />
      <PricingPlans initialPlans={initialPlans} />
      {/* The same estimate as the homepage, and the billing questions people ask before paying. */}
      <HomeCost />
      <HomeFaq />
    </MarketingShell>
  );
}
