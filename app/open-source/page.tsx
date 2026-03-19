'use client';

import { LandingNavbar, LandingFooter, CTASection } from '@/components/landing';
import { OpenSourceSection } from '@/components/landing/OpenSourceSection';

export default function OpenSourcePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <LandingNavbar />
      <div className="pt-16">
        <OpenSourceSection />
        <CTASection />
      </div>
      <LandingFooter />
    </div>
  );
}
