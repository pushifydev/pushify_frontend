'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';

export function HeroSection() {
  const { t } = useTranslation();

  const stats = [
    { num: '01', label: 'MIT licensed' },
    { num: '02', label: t('landing', 'edgeLocations') },
    { num: '03', label: '< 60s deploy' },
    { num: '04', label: '0 vendor lock-in' },
  ];

  const ticker = [
    'DEP-9142 ▸ next.js ▸ fra1 ▸ 47s',
    'DEP-9141 ▸ supabase ▸ ams1 ▸ 2m12s',
    'DEP-9140 ▸ rails ▸ nbg1 ▸ 1m04s',
    'DEP-9139 ▸ pocketbase ▸ hel1 ▸ 38s',
    'DEP-9138 ▸ wordpress ▸ fsn1 ▸ 1m29s',
    'DEP-9137 ▸ go-fiber ▸ fra1 ▸ 22s',
    'DEP-9136 ▸ astro ▸ ams1 ▸ 19s',
    'DEP-9135 ▸ django ▸ nbg1 ▸ 54s',
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Restrained backdrop */}
      <div className="lp-grid-backdrop" />

      {/* Top meta-rail */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pt-28 pb-3 flex items-center justify-between gap-6">
        <div className="lp-eyebrow flex items-center gap-3">
          <span className="lp-crosshair" />
          <span>PSH-01 / OPEN SOURCE PLATFORM</span>
        </div>
        <div className="lp-eyebrow flex items-center gap-2.5">
          <span className="lp-live-dot" />
          <span className="hidden sm:inline">DEPLOYMENTS LIVE</span>
          <span className="sm:hidden">LIVE</span>
        </div>
      </div>

      <div className="relative z-10 lp-rule mx-6 md:mx-10" />

      {/* Editorial headline block */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-12">
        <div className="grid grid-cols-12 gap-y-10">
          <div className="hidden md:block col-span-1 lp-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-muted)] pt-3">
            §&nbsp;Hero
          </div>

          <h1
            className="col-span-12 md:col-span-11 lp-editorial lp-reveal text-[14vw] md:text-[9vw] lg:text-[8vw] xl:text-[140px] text-[var(--text-primary)]"
            style={{ animationDelay: '60ms' }}
          >
            <span className="block">{t('branding', 'deployAt')}</span>
            <span className="block">
              <span className="text-[var(--accent-cyan)]">{t('branding', 'speedOfThought')}.</span>
            </span>
          </h1>
        </div>

        {/* Sub-rail: lede + CTAs */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-10 mt-16 md:mt-20">
          <div className="hidden md:block col-span-1 lp-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-muted)]">
            Lede
          </div>
          <p
            className="col-span-12 md:col-span-6 text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] max-w-[58ch] lp-reveal"
            style={{ animationDelay: '180ms' }}
          >
            Open-source PaaS for teams that want Vercel-grade developer
            experience without the vendor lock-in. Connect a repository,
            choose a server <span className="lp-mono text-[13px] text-[var(--text-muted)]">(yours or ours)</span>,
            and ship to production with HTTPS, builds, and zero-downtime
            cutover — in under a minute.
          </p>

          <div
            className="col-span-12 md:col-span-5 flex flex-wrap items-start gap-3 lp-reveal"
            style={{ animationDelay: '300ms' }}
          >
            <Link href="/register" className="lp-cta group">
              {t('landing', 'getStartedFree')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://github.com/pushifydev"
              target="_blank"
              rel="noopener noreferrer"
              className="lp-cta-ghost"
            >
              ★ Star on GitHub
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="relative z-10 lp-rule mx-6 md:mx-10" />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8">
          {stats.map((s, i) => (
            <div
              key={s.num}
              className="flex items-baseline gap-3 lp-reveal"
              style={{ animationDelay: `${420 + i * 80}ms` }}
            >
              <span className="lp-mono text-[12px] tracking-[0.14em] text-[var(--accent-cyan)] tabular-nums">
                {s.num}
              </span>
              <span className="lp-mono text-[12px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent deployments ticker */}
      <div className="relative z-10 border-y border-[var(--glass-border)] bg-[var(--bg-secondary)]/40">
        <div className="overflow-hidden py-3 mask-fade">
          <div className="lp-ticker-track">
            {[...ticker, ...ticker].map((t, i) => (
              <span
                key={i}
                className="lp-mono text-[12px] tracking-[0.08em] uppercase whitespace-nowrap text-[var(--text-secondary)] flex items-center gap-3"
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--status-success)' }}
                />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .mask-fade {
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            #000 10%,
            #000 90%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            #000 10%,
            #000 90%,
            transparent 100%
          );
        }
      `}</style>
    </section>
  );
}
