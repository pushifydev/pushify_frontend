'use client';

import { GitBranch, Server, Database, Code2 } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { Eyebrow } from './Eyebrow';

export function HomeFeatures() {
  const { t } = useTranslation();
  const items = [
    { icon: GitBranch, title: t('homepage', 'homeF1Title'), body: t('homepage', 'homeF1Body') },
    { icon: Server, title: t('homepage', 'homeF2Title'), body: t('homepage', 'homeF2Body') },
    { icon: Database, title: t('homepage', 'homeF3Title'), body: t('homepage', 'homeF3Body') },
    { icon: Code2, title: t('homepage', 'homeF4Title'), body: t('homepage', 'homeF4Body') },
  ];

  return (
    <section className="hp-section" id="features">
      <div className="hp-wrap">
        <Eyebrow>{t('homepage', 'homeFeaturesEyebrow')}</Eyebrow>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <h2 className="hp-h2 max-w-[44rem]">
            {/* Two sentences, two lines: balancing them as one paragraph left a word stranded. */}
            {t('homepage', 'homeFeaturesTitle')
              .split(/(?<=\.)\s+/)
              .map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
          </h2>
          <p className="hp-lead max-w-[30rem]">{t('homepage', 'homeFeaturesLead')}</p>
        </div>
        <div className="hp-features mt-16">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="hp-feature">
              <Icon className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-8 text-[1.25rem] font-medium">{title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: 'var(--hp-body)' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
