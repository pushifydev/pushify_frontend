'use client';

import { useTranslation } from '@/hooks';
import { Cloud, Lock, Server, Sparkles } from 'lucide-react';

export function WhatIsPushifySection() {
  const { t } = useTranslation();

  const pillars = [
    {
      Icon: Cloud,
      title: 'PaaS',
      desc: 'Vercel-style DX',
    },
    {
      Icon: Server,
      title: 'Self-host',
      desc: 'Your servers, your data',
    },
    {
      Icon: Lock,
      title: 'Open source',
      desc: 'MIT-licensed, no lock-in',
    },
    {
      Icon: Sparkles,
      title: 'Marketplace',
      desc: '24+ ready-to-use apps',
    },
  ];

  return (
    <section id="what-is-pushify" className="relative py-24 border-y border-[var(--glass-border)]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-cyan)] rounded-full blur-[140px] opacity-[0.04]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 mb-5">
            <Cloud className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-xs text-[var(--accent-cyan)] terminal-text uppercase tracking-wider">
              {t('homepage', 'whatIsPushifyEyebrow')}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            {t('homepage', 'whatIsPushifyTitle')}
          </h2>

          <div className="space-y-4 text-lg text-[var(--text-secondary)] leading-relaxed">
            <p>{t('homepage', 'whatIsPushifyP1')}</p>
            <p>{t('homepage', 'whatIsPushifyP2')}</p>
            <p>{t('homepage', 'whatIsPushifyP3')}</p>
          </div>
        </div>

        {/* Four pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {pillars.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center p-5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-[var(--accent-cyan)]/30 hover:bg-[var(--hover-overlay-md)] transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-cyan)]/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-[var(--accent-cyan)]" />
              </div>
              <div className="font-semibold text-sm mb-1">{title}</div>
              <div className="text-xs text-[var(--text-muted)]">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
