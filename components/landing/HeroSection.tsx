'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { DeployTerminal } from './DeployTerminal';

export function HeroSection() {
  const { t } = useTranslation();

  const highlights = [
    t('landing', 'heroStatMitLicensed'),
    t('landing', 'edgeLocations'),
    t('landing', 'heroStatDeployFast'),
    t('landing', 'heroStatNoVendorLockIn'),
  ];

  return (
    <section className="lp-hero-bg pt-28 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      <div className="lp-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="lp-reveal text-center lg:text-left" style={{ animationDelay: '40ms' }}>
            <p className="lp-label mb-5">{t('landing', 'openSourcePlatform')}</p>
            <h1 className="lp-hero-title">
              {t('landing', 'heroTitleLead')}{' '}
              <span style={{ color: 'var(--lp-ink)' }}>{t('landing', 'heroTitleEm')}</span>.
            </h1>
            <p className="lp-lead mt-6 max-w-xl mx-auto lg:mx-0">{t('landing', 'heroLead')}</p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-8 lp-reveal"
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

            <ul
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 mt-10 lp-reveal"
              style={{ animationDelay: '200ms' }}
            >
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: 'var(--lp-muted)' }}
                >
                  <span
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{ background: 'var(--lp-muted)' }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Deploy theater — the product, live */}
          <div className="relative lp-reveal" style={{ animationDelay: '180ms' }}>
            {/* Dashboard card peeking behind for depth */}
            <div
              className="hidden md:block absolute -top-12 right-0 w-[400px] max-w-full rounded-xl rotate-2 pointer-events-none select-none"
              aria-hidden="true"
              style={{
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
                opacity: 0.9,
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ borderBottom: '1px solid var(--lp-border)' }}
              >
                <span className="w-2 h-2 rounded-full bg-[#ef4444]/70" />
                <span className="w-2 h-2 rounded-full bg-[#eab308]/70" />
                <span className="w-2 h-2 rounded-full bg-[#22c55e]/70" />
                <span className="ml-2 text-[11px] font-medium" style={{ color: 'var(--lp-muted)' }}>
                  pushify.dev — dashboard
                </span>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { name: 'my-app', meta: 'Next.js · fra1', ok: true, time: '47s' },
                  { name: 'api-service', meta: 'Node.js · fra1', ok: true, time: '39s' },
                  { name: 'docs-site', meta: 'Astro · static', ok: true, time: '12s' },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--lp-border)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#22c55e]" />
                    <span className="text-xs font-semibold" style={{ color: 'var(--lp-ink)' }}>
                      {row.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--lp-muted)' }}>
                      {row.meta}
                    </span>
                    <span
                      className="ml-auto text-[11px]"
                      style={{ color: 'var(--lp-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {row.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-4 md:mt-10 lg:mr-14">
              <DeployTerminal />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
