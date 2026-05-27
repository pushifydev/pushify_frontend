'use client';

import { Github, Star, GitFork } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';

export function OpenSourceSection() {
  const { t } = useTranslation();

  return (
    <section id="open-source" className="lp-section border-t-0 pt-0">
      <div className="lp-container">
        <LandingSectionHeader
          label={t('landing', 'openSourceBadge')}
          title={
            <>
              {t('landing', 'builtInTheOpen')}
              <br />
              {t('landing', 'poweredByCommunity')}
            </>
          }
          description={t('landing', 'openSourceDescription')}
          align="center"
          className="mx-auto text-center max-w-2xl"
        />

        <a
          href="https://github.com/pushifydev"
          target="_blank"
          rel="noopener noreferrer"
          className="lp-card flex flex-col items-center gap-5 p-8 md:p-10 max-w-md mx-auto hover:border-[var(--lp-muted)] transition-colors"
        >
          <Github className="w-10 h-10" style={{ color: 'var(--lp-ink)' }} strokeWidth={1.5} />
          <div className="text-center">
            <div className="text-lg font-semibold tracking-tight" style={{ color: 'var(--lp-ink)' }}>
              pushifydev/pushify
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--lp-muted)' }}>
              {t('landing', 'openSourceCloudPlatform')}
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--lp-muted)' }}>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              {t('landing', 'githubStatStar')}
            </span>
            <span className="flex items-center gap-1.5">
              <GitFork className="w-4 h-4" />
              {t('landing', 'githubStatFork')}
            </span>
          </div>
          <span className="lp-cta">{t('landing', 'viewOnGithub')}</span>
        </a>

        <div
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-sm"
          style={{ color: 'var(--lp-muted)' }}
        >
          <span>{t('landing', 'mitLicensed')}</span>
          <span>{t('landing', 'selfHostable')}</span>
          <span>{t('landing', 'communityDriven')}</span>
          <span>{t('landing', 'noVendorLockIn')}</span>
        </div>
      </div>
    </section>
  );
}
