'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useSignedIn } from '@/hooks/useSignedIn';
import { Eyebrow } from './Eyebrow';

/** Centered thesis under a single shaft of light that rises on load — a push going live. */
export function HomeHero() {
  const { t } = useTranslation();
  const signedIn = useSignedIn();

  return (
    <section className="hp-hero">
      <div className="hp-beam" aria-hidden="true" />
      <div className="hp-pool" aria-hidden="true" />
      <div className="hp-wrap hp-center">
        <Eyebrow className="hp-rise" >{t('landing', 'openSourcePlatform')}</Eyebrow>
        {/* The headline is the page's LCP element: it slides in but is never transparent, so it counts as painted at once. */}
        <h1 className="hp-h1 hp-rise-solid mt-7">
          {t('landing', 'heroTitleLead')}
          <br />
          {t('landing', 'heroTitleEm')}.
        </h1>
        <p className="hp-lead hp-rise mt-7 max-w-[38rem]" style={{ animationDelay: '160ms' }}>
          {t('homepage', 'homeHeroLead')}
        </p>
        <div className="hp-rise mt-10 flex flex-col sm:flex-row items-center justify-center gap-3" style={{ animationDelay: '240ms' }}>
          <Link href={signedIn ? '/dashboard' : '/register'} className="hp-btn group w-full sm:w-auto">
            {signedIn ? t('landing', 'openDashboard') : t('landing', 'getStartedFree')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <a href="https://github.com/pushifydev" target="_blank" rel="noopener noreferrer" className="hp-btn-ghost w-full sm:w-auto">
            {t('landing', 'heroStarGithub')}
          </a>
        </div>
      </div>
    </section>
  );
}
