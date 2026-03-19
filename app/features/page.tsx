'use client';

import { LandingNavbar, LandingFooter, CTASection } from '@/components/landing';
import { FeaturesSection } from '@/components/landing/FeaturesSection';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <LandingNavbar />
      <div className="pt-16">
        <FeaturesSection />
        <CTASection />
      </div>
      <LandingFooter />
    </div>
  );
}
