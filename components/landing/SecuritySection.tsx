'use client';

import { KeyRound, Container, ShieldCheck, Bug, Lock, FileClock, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';
import { Reveal } from './Reveal';

function SecurityCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="lp-card p-5 h-full hover:border-[var(--lp-muted)] transition-colors">
      <div className="flex items-center gap-3 mb-2.5">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)' }}
        >
          <Icon className="w-4 h-4" />
        </span>
        <h4 className="text-sm font-semibold" style={{ color: 'var(--lp-ink)' }}>{title}</h4>
      </div>
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--lp-body)' }}>{desc}</p>
    </div>
  );
}

export function SecuritySection() {
  const { t } = useTranslation();

  const items: { icon: LucideIcon; title: string; desc: string }[] = [
    { icon: KeyRound, title: t('homepage', 'securityFeat1Title'), desc: t('homepage', 'securityFeat1Desc') },
    { icon: Container, title: t('homepage', 'securityFeat2Title'), desc: t('homepage', 'securityFeat2Desc') },
    { icon: ShieldCheck, title: t('homepage', 'securityFeat3Title'), desc: t('homepage', 'securityFeat3Desc') },
    { icon: Bug, title: t('homepage', 'securityFeat4Title'), desc: t('homepage', 'securityFeat4Desc') },
    { icon: Lock, title: t('homepage', 'securityFeat5Title'), desc: t('homepage', 'securityFeat5Desc') },
    { icon: FileClock, title: t('homepage', 'securityFeat6Title'), desc: t('homepage', 'securityFeat6Desc') },
  ];

  return (
    <section id="security" className="lp-section">
      <div className="lp-container">
        <LandingSectionHeader
          label={t('homepage', 'securityEyebrow')}
          title={t('homepage', 'securityHeadline')}
          description={t('homepage', 'securitySubtitle')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={(i % 3) * 90} className="h-full">
              <SecurityCard icon={it.icon} title={it.title} desc={it.desc} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
