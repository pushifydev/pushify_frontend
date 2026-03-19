'use client';

import { LandingNavbar, LandingFooter } from '@/components/landing';
import { PricingSection } from '@/components/landing/PricingSection';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <LandingNavbar />
      <div className="pt-16">
        <PricingSection />
      </div>
      <LandingFooter />
    </div>
  );
}
