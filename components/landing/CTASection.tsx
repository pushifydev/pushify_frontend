'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="lp-section">
      <div className="lp-container">
        <div className="max-w-2xl mx-auto text-center">
          <p className="lp-label mb-4">{t('homepage', 'ctaSectionEyebrow')}</p>
          <h2 className="lp-section-title mb-5">
            {t('landing', 'readyToLaunch')} {t('landing', 'launch')}.
          </h2>
          <p className="lp-lead mx-auto mb-8">{t('landing', 'ctaDescription')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="lp-cta group w-full sm:w-auto">
              {t('landing', 'startDeployingFree')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://github.com/pushifydev"
              target="_blank"
              rel="noopener noreferrer"
              className="lp-cta-ghost w-full sm:w-auto"
            >
              {t('landing', 'starOnGithub')}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
