'use client';

import Link from 'next/link';
import { Rocket, ArrowRight, Github } from 'lucide-react';
import { useTranslation } from '@/hooks';

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--accent-cyan)] rounded-full blur-[300px] opacity-[0.05]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          {t('landing', 'readyToLaunch')}{' '}
          <span className="gradient-text">{t('landing', 'launch')}</span>?
        </h2>

        <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl mx-auto leading-relaxed">
          {t('landing', 'ctaDescription')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="group btn btn-primary h-14 px-10 text-base font-semibold"
          >
            <Rocket className="w-5 h-5" />
            {t('landing', 'startDeployingFree')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <a
            href="https://github.com/pushifydev"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary h-14 px-10 text-base font-semibold"
          >
            <Github className="w-5 h-5" />
            {t('landing', 'starOnGithub')}
          </a>
        </div>
      </div>
    </section>
  );
}
