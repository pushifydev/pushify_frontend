'use client';

import { useTranslation } from '@/hooks';
import { GitBranch, Server, Rocket, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    {
      n: '01',
      Icon: GitBranch,
      title: t('homepage', 'step1Title'),
      desc: t('homepage', 'step1Desc'),
    },
    {
      n: '02',
      Icon: Server,
      title: t('homepage', 'step2Title'),
      desc: t('homepage', 'step2Desc'),
    },
    {
      n: '03',
      Icon: Rocket,
      title: t('homepage', 'step3Title'),
      desc: t('homepage', 'step3Desc'),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 mb-5">
            <Rocket className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
            <span className="text-xs text-[var(--accent-purple)] terminal-text uppercase tracking-wider">
              {t('homepage', 'howItWorksEyebrow')}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t('homepage', 'howItWorksTitle')}
          </h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            {t('homepage', 'howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-[var(--glass-border-strong)] to-transparent" />

          {steps.map(({ n, Icon, title, desc }, i) => (
            <div
              key={n}
              className="relative flex flex-col items-start p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-[var(--accent-cyan)]/30 transition-all group"
            >
              <div className="flex items-center justify-between w-full mb-5">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 flex items-center justify-center group-hover:bg-[var(--accent-cyan)]/20 transition-colors">
                  <Icon className="w-5 h-5 text-[var(--accent-cyan)]" />
                </div>
                <span className="text-3xl font-extrabold text-[var(--text-muted)]/40 tracking-tight">
                  {n}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                {title}
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:inline-block w-4 h-4 text-[var(--text-muted)]/40" />
                )}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
