'use client';

import { MarketingShell, SiteBuilderSection, CTASection } from '@/components/landing';

export default function SitesPage() {
  return (
    <MarketingShell noPad>
      <div className="pt-16 md:pt-20">
        <SiteBuilderSection />
      </div>
      <CTASection />
    </MarketingShell>
  );
}
