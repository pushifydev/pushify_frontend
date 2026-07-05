'use client';

import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';
import { Reveal } from './Reveal';

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

        <div className="relative grid md:grid-cols-3 gap-8 md:gap-10">
          {/* Connector between the steps (desktop) — the pipeline is a sequence */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] border-t border-dashed"
            style={{ borderColor: 'color-mix(in srgb, var(--lp-ink) 18%, transparent)' }}
          />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <article className="lp-card p-6 md:p-8 relative h-full">
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
