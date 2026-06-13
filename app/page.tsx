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
  SocialProofSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

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
      <SocialProofSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
