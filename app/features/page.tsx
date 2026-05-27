'use client';

import { MarketingShell, CTASection } from '@/components/landing';
import { FeaturesSection } from '@/components/landing/FeaturesSection';

export default function FeaturesPage() {
  return (
    <MarketingShell noPad>
      <FeaturesSection />
      <CTASection />
    </MarketingShell>
  );
}
