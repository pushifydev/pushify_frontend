'use client';

import {
  LandingNavbar,
  HeroSection,
  StatsSection,
  WhatIsPushifySection,
  HowItWorksSection,
  FrameworksSection,
  MarketplacePreviewSection,
  SiteBuilderSection,
  ComparisonSection,
  SecuritySection,
  BillingHowItWorksSection,
  FAQSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';
// NOTE: SocialProofSection is intentionally not rendered yet — it holds placeholder
// testimonials. Re-add <SocialProofSection /> below once real, attributable quotes
// are in the i18n files (sp1/sp2/sp3). Component + i18n remain in the codebase.

export default function LandingPage() {
  return (
    <div className="lp-page min-h-screen overflow-x-hidden">
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        @keyframes marquee-reverse {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 40s linear infinite;
        }
      `}</style>

      <LandingNavbar />
      <HeroSection />
      <StatsSection />
      <WhatIsPushifySection />
      <HowItWorksSection />
      <FrameworksSection />
      <MarketplacePreviewSection />
      <SiteBuilderSection />
      <ComparisonSection />
      <SecuritySection />
      <BillingHowItWorksSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
