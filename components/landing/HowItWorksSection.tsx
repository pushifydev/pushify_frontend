'use client';

import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';

export function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    { n: '1', title: t('homepage', 'step1Title'), desc: t('homepage', 'step1Desc') },
    { n: '2', title: t('homepage', 'step2Title'), desc: t('homepage', 'step2Desc') },
    { n: '3', title: t('homepage', 'step3Title'), desc: t('homepage', 'step3Desc') },
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

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {steps.map((s) => (
            <article key={s.n} className="lp-card p-6 md:p-8">
              <span
                className="inline-flex w-8 h-8 items-center justify-center rounded-full text-sm font-semibold mb-5"
                style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)' }}
              >
                {s.n}
              </span>
              <h3 className="text-lg font-semibold tracking-tight mb-3" style={{ color: 'var(--lp-ink)' }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                {s.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
