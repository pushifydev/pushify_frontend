'use client';

import { KeyRound, Container, ShieldCheck, Bug, Lock, FileClock, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';

function SecurityCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="lp-card p-5 hover:border-[var(--lp-muted)] transition-colors">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3.5"
        style={{ color: 'var(--accent-cyan)', background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)' }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <h4 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--lp-ink)' }}>{title}</h4>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{desc}</p>
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
          {items.map((it) => (
            <SecurityCard key={it.title} icon={it.icon} title={it.title} desc={it.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}
