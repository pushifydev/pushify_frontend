'use client';

import { MarketingShell, CTASection } from '@/components/landing';
import { OpenSourceSection } from '@/components/landing/OpenSourceSection';

export default function OpenSourcePage() {
  return (
    <MarketingShell noPad>
      <OpenSourceSection />
      <CTASection />
    </MarketingShell>
  );
}
