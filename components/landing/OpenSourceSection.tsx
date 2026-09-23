'use client';

import { ArrowUpRight, Github } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';

/** The repositories that exist. `pushifydev/pushify` is a 404. */
const REPOS = ['pushify_backend', 'pushify_frontend'] as const;

export function OpenSourceSection() {
  const { t } = useTranslation();

  return (
    <section id="open-source" className="lp-section border-t-0 pt-0">
      <div className="lp-container">
        <LandingSectionHeader
          as="h1"
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

        {/* This card used to name a single repository, `pushifydev/pushify`, which does not exist
            — on the one page whose job is to prove the project is open source. These are the two
            repositories that do, and the counts are gone: a Star and Fork row with no numbers in
            it reads as something that failed to load. */}
        <div className="lp-card max-w-md mx-auto p-8 md:p-10">
          <Github
            className="w-10 h-10 mx-auto"
            style={{ color: 'var(--lp-ink)' }}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-sm text-center mt-5" style={{ color: 'var(--lp-muted)' }}>
            {t('landing', 'openSourceCloudPlatform')}
          </p>

          <div className="mt-6 space-y-2">
            {REPOS.map((repo) => (
              <a
                key={repo}
                href={`https://github.com/pushifydev/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:border-[var(--lp-muted)]"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--lp-border)' }}
              >
                <span
                  className="text-sm font-medium truncate"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-ink)' }}
                >
                  pushifydev/{repo}
                </span>
                <ArrowUpRight
                  className="w-4 h-4 ml-auto shrink-0"
                  style={{ color: 'var(--lp-muted)' }}
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>

          <a
            href="https://github.com/pushifydev"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-cta w-full justify-center mt-6"
          >
            {t('landing', 'viewOnGithub')}
          </a>
        </div>

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
