'use client';

import { LandingNavbar, LandingFooter } from '@/components/landing';
import { HomeHero, HomeFeatures, HomeProduct, HomeDeploys, HomeCost, HomeDifference, HomeFaq, HomeCta } from '@/components/landing/home';

/**
 * The homepage: monochrome, light falling on black, one live-green accent. Dark-only for now
 * (lib/marketing-routes.ts); styles in app/marketing.css. The longer sections that
 * used to live here — marketplace, site builder, security, billing — have their own pages.
 */
export default function LandingPage() {
  return (
    <div className="hp min-h-screen overflow-x-hidden">
      <LandingNavbar />
      <main>
        <HomeHero />
        <HomeFeatures />
        <HomeProduct />
        <HomeDeploys />
        <HomeCost />
        <HomeDifference />
        <HomeFaq />
        <HomeCta />
      </main>
      <LandingFooter lit />
    </div>
  );
}
