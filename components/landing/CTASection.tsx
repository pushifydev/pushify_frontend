'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Copy } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { Reveal } from './Reveal';

const INSTALL_CMD =
  'curl -fsSL https://raw.githubusercontent.com/pushifydev/pushify_backend/master/selfhost/install.sh | bash';

export function CTASection() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="lp-section lp-hero-bg overflow-hidden">
      <div className="lp-container">
        <Reveal>
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

            {/* The open-source promise, made concrete */}
            <p className="text-sm mt-10 mb-3" style={{ color: 'var(--lp-muted)' }}>
              {t('landing', 'selfHostOneLiner')}
            </p>
            <div
              className="flex items-center gap-2 max-w-xl mx-auto rounded-lg pl-4 pr-2 py-2 text-left"
              style={{
                background: '#0a0a0f',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <code
                className="flex-1 overflow-x-auto whitespace-nowrap text-xs scrollbar-none"
                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.8)' }}
              >
                <span style={{ color: '#4ade80' }}>$</span> {INSTALL_CMD}
              </code>
              <button
                onClick={copy}
                className="shrink-0 inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md transition-colors"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: copied ? '#4ade80' : 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                aria-label={t('landing', 'copyCommand')}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('landing', 'copiedCommand') : t('landing', 'copyCommand')}
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
