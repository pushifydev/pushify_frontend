'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="relative border-t border-[var(--glass-border)] overflow-hidden">
      {/* Restrained glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(99,102,241,0.10), transparent 70%)',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-36">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-3 flex items-start gap-3">
            <span className="lp-crosshair mt-2" />
            <div className="lp-eyebrow">§&nbsp;06 / Begin</div>
          </div>

          <h2 className="col-span-12 md:col-span-9 lp-editorial text-[var(--text-primary)] text-[40px] md:text-[72px] lg:text-[92px] leading-[0.98] tracking-[-0.025em]">
            <span className="block">{t('landing', 'readyToLaunch')}</span>
            <span className="block text-[var(--accent-cyan)]">
              {t('landing', 'launch')}.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="hidden md:block col-span-3" />
          <p className="col-span-12 md:col-span-5 text-[16px] md:text-[18px] leading-[1.6] text-[var(--text-secondary)] max-w-[52ch]">
            {t('landing', 'ctaDescription')}
          </p>
          <div className="col-span-12 md:col-span-4 flex flex-col md:items-end gap-3">
            <Link href="/register" className="lp-cta group">
              {t('landing', 'startDeployingFree')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://github.com/pushifydev"
              target="_blank"
              rel="noopener noreferrer"
              className="lp-cta-ghost"
            >
              ★ {t('landing', 'starOnGithub')}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
