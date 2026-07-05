'use client';

import type { ReactNode } from 'react';
import { GitBranch, Github, Server } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';
import { Reveal } from './Reveal';

/** Small product vignettes — each step shown in the product's own visual language. */

function RepoVignette() {
  return (
    <div
      className="rounded-lg p-3 flex items-center gap-2.5"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--lp-border)' }}
    >
      <Github className="w-4 h-4 shrink-0" style={{ color: 'var(--lp-ink)' }} />
      <span
        className="text-xs truncate"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-body)' }}
      >
        github.com/you/my-app
      </span>
      <span
        className="ml-auto inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full shrink-0"
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--lp-ink)',
          border: '1px solid var(--lp-border)',
          background: 'var(--bg-primary)',
        }}
      >
        <GitBranch className="w-3 h-3" />
        main
      </span>
    </div>
  );
}

function ServerVignette() {
  return (
    <div
      className="rounded-lg p-3 flex items-center gap-2.5"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--lp-border)' }}
    >
      <Server className="w-4 h-4 shrink-0" style={{ color: 'var(--lp-ink)' }} />
      <span className="text-xs font-semibold" style={{ color: 'var(--lp-ink)' }}>
        fra1
      </span>
      <span className="text-[11px] truncate" style={{ color: 'var(--lp-muted)' }}>
        Hetzner · 2 vCPU · 4 GB
      </span>
      <span
        className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 bg-[#22c55e]"
        aria-hidden="true"
      />
    </div>
  );
}

function DeployVignette() {
  return (
    <div
      className="rounded-lg p-3 space-y-1"
      style={{
        background: '#0a0a0f',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
      }}
    >
      <div style={{ color: 'rgba(255,255,255,0.85)' }}>$ git push origin main</div>
      <div style={{ color: '#4ade80' }}>● Live at my-app.pushify.dev — 47s</div>
    </div>
  );
}

export function HowItWorksSection() {
  const { t } = useTranslation();

  const steps: { n: string; title: string; desc: string; vignette: ReactNode }[] = [
    {
      n: '1',
      title: t('homepage', 'step1Title'),
      desc: t('homepage', 'step1Desc'),
      vignette: <RepoVignette />,
    },
    {
      n: '2',
      title: t('homepage', 'step2Title'),
      desc: t('homepage', 'step2Desc'),
      vignette: <ServerVignette />,
    },
    {
      n: '3',
      title: t('homepage', 'step3Title'),
      desc: t('homepage', 'step3Desc'),
      vignette: <DeployVignette />,
    },
  ];

  return (
    <section id="how-it-works" className="lp-section">
      <div className="lp-container">
        <LandingSectionHeader
          label={t('homepage', 'howItWorksEyebrow')}
          title={
            <>
              {t('homepage', 'howItWorksH1Before')}
              {t('homepage', 'howItWorksH1Em')}{' '}
              {t('homepage', 'howItWorksH2Before')}
              {t('homepage', 'howItWorksH2Em')}
              {t('homepage', 'howItWorksH2After')} {t('homepage', 'howItWorksH3')}
            </>
          }
          description={t('homepage', 'howItWorksSubtitle')}
        />

        <div className="relative grid md:grid-cols-3 gap-8 md:gap-10">
          {/* Connector between the steps (desktop) — the pipeline is a sequence */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] border-t border-dashed"
            style={{ borderColor: 'color-mix(in srgb, var(--lp-ink) 18%, transparent)' }}
          />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <article className="lp-card p-6 md:p-8 relative h-full flex flex-col">
                <span
                  className="inline-flex w-8 h-8 items-center justify-center rounded-full text-sm font-semibold mb-5"
                  style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)' }}
                >
                  {s.n}
                </span>
                <h3 className="text-lg font-semibold tracking-tight mb-3" style={{ color: 'var(--lp-ink)' }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--lp-body)' }}>
                  {s.desc}
                </p>
                <div className="mt-auto">{s.vignette}</div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
