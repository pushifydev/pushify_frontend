'use client';

import { MarketingShell } from '@/components/landing';
import { PricingSection } from '@/components/landing/PricingSection';

export default function PricingPage() {
  return (
    <MarketingShell noPad>
      <PricingSection />
    </MarketingShell>
  );
}
