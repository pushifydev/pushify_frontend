'use client';

import { Github, Star, GitFork, Heart } from 'lucide-react';
import { useTranslation } from '@/hooks';

export function OpenSourceSection() {
  const { t } = useTranslation();

  return (
    <section id="open-source" className="relative py-24 border-y border-[var(--glass-border)]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/20 mb-5">
          <Heart className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
          <span className="text-xs text-[var(--accent-amber)] terminal-text uppercase tracking-wider">{t('landing', 'openSourceBadge')}</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {t('landing', 'builtInTheOpen')}<br />
          <span className="gradient-text">{t('landing', 'poweredByCommunity')}</span>
        </h2>

        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('landing', 'openSourceDescription')}
        </p>

        {/* GitHub card */}
        <a
          href="https://github.com/pushifydev"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex flex-col items-center gap-6 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:border-[var(--accent-cyan)]/30 transition-all duration-300 w-full max-w-md mx-auto"
        >
          <Github className="w-12 h-12 text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors" />

          <div>
            <div className="text-lg font-bold mb-1">pushifydev/pushify</div>
            <div className="text-sm text-[var(--text-secondary)]">{t('landing', 'openSourceCloudPlatform')}</div>
          </div>

          <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              Star
            </span>
            <span className="flex items-center gap-1.5">
              <GitFork className="w-4 h-4" />
              Fork
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3178c6]" />
              TypeScript
            </span>
          </div>

          <span className="btn btn-primary h-10 px-6 text-sm">
            {t('landing', 'viewOnGithub')}
            <Github className="w-4 h-4" />
          </span>
        </a>

        {/* Trust points */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-10 text-sm text-[var(--text-muted)]">
          <span>{t('landing', 'mitLicensed')}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
          <span>{t('landing', 'selfHostable')}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
          <span>{t('landing', 'communityDriven')}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
          <span>{t('landing', 'noVendorLockIn')}</span>
        </div>
      </div>
    </section>
  );
}
