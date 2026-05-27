'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';

export function HeroSection() {
  const { t } = useTranslation();

  const highlights = [
    t('landing', 'heroStatMitLicensed'),
    t('landing', 'edgeLocations'),
    t('landing', 'heroStatDeployFast'),
    t('landing', 'heroStatNoVendorLockIn'),
  ];

  return (
    <section className="pt-28 md:pt-32 pb-16 md:pb-20">
      <div className="lp-container">
        <div className="max-w-3xl mx-auto text-center lp-reveal" style={{ animationDelay: '40ms' }}>
          <p className="lp-label mb-5">{t('landing', 'openSourcePlatform')}</p>
          <h1 className="lp-hero-title">
            {t('branding', 'deployAt')}{' '}
            <span style={{ color: 'var(--lp-ink)' }}>{t('branding', 'speedOfThought')}</span>.
          </h1>
          <p className="lp-lead mt-6 max-w-xl mx-auto">{t('landing', 'heroLead')}</p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 lp-reveal"
            style={{ animationDelay: '120ms' }}
          >
            <Link href="/register" className="lp-cta group w-full sm:w-auto">
              {t('landing', 'getStartedFree')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://github.com/pushifydev"
              target="_blank"
              rel="noopener noreferrer"
              className="lp-cta-ghost w-full sm:w-auto"
            >
              {t('landing', 'heroStarGithub')}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Product preview — Cal.com-style framed UI mock */}
        <div
          className="lp-preview mt-14 md:mt-20 max-w-4xl mx-auto lp-reveal"
          style={{ animationDelay: '200ms' }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3 border-b border-[var(--lp-border)]"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/80" />
            <span className="ml-3 text-xs font-medium" style={{ color: 'var(--lp-muted)' }}>
              pushify.dev — dashboard
            </span>
          </div>
          <div className="p-6 md:p-8 grid sm:grid-cols-3 gap-4 md:gap-6">
            {[
              { label: 'Project', value: 'my-app', sub: 'Next.js · running' },
              { label: 'Server', value: 'fra1', sub: 'Hetzner · 2 vCPU' },
              { label: 'Last deploy', value: '47s', sub: 'main · auto' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg p-4 border border-[var(--lp-border)]"
                style={{ background: 'var(--bg-primary)' }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--lp-muted)' }}>
                  {item.label}
                </p>
                <p className="text-lg font-semibold tracking-tight" style={{ color: 'var(--lp-ink)' }}>
                  {item.value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--lp-muted)' }}>
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        <ul
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 md:mt-14 lp-reveal"
          style={{ animationDelay: '280ms' }}
        >
          {highlights.map((item) => (
            <li key={item} className="text-sm" style={{ color: 'var(--lp-muted)' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
