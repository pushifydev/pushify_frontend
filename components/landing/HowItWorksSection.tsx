'use client';

import { useTranslation } from '@/hooks';

export function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    { n: '01', title: t('homepage', 'step1Title'), desc: t('homepage', 'step1Desc') },
    { n: '02', title: t('homepage', 'step2Title'), desc: t('homepage', 'step2Desc') },
    { n: '03', title: t('homepage', 'step3Title'), desc: t('homepage', 'step3Desc') },
  ];

  return (
    <section id="how-it-works" className="relative border-t border-[var(--glass-border)]">
      <div className="absolute right-2 md:right-10 top-10 lp-index select-none" aria-hidden>
        02
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        {/* Header */}
        <div className="grid grid-cols-12 gap-6 mb-16 md:mb-20">
          <div className="col-span-12 md:col-span-3 flex items-start gap-3">
            <span className="lp-crosshair mt-2" />
            <div className="lp-eyebrow">§&nbsp;02 / {t('homepage', 'howItWorksEyebrow')}</div>
          </div>

          <h2 className="col-span-12 md:col-span-9 lp-editorial text-[40px] md:text-[72px] lg:text-[92px] leading-[0.98] tracking-[-0.025em]">
            <span className="block">
              {t('homepage', 'howItWorksH1Before')}
              <em>{t('homepage', 'howItWorksH1Em')}</em>
            </span>
            <span className="block">
              {t('homepage', 'howItWorksH2Before')}
              <em className="text-[var(--accent-cyan)]">{t('homepage', 'howItWorksH2Em')}</em>
              {t('homepage', 'howItWorksH2After')}
            </span>
            <span className="block">{t('homepage', 'howItWorksH3')}</span>
          </h2>

          <p className="col-span-12 md:col-start-4 md:col-span-7 text-[16px] md:text-[18px] leading-[1.55] text-[var(--text-muted)] max-w-[58ch]">
            {t('homepage', 'howItWorksSubtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-y-0 md:gap-x-2">
          {steps.map((s, i) => (
            <article
              key={s.n}
              className={`relative px-0 md:px-8 py-8 md:py-10 ${
                i > 0 ? 'md:border-l md:border-[var(--glass-border-md)]' : ''
              }`}
            >
              {/* Connector arrow on desktop */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:flex absolute -right-3 top-12 w-6 h-6 items-center justify-center"
                  aria-hidden
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path
                      d="M3 12h17m0 0-5-5m5 5-5 5"
                      fill="none"
                      stroke="var(--accent-cyan)"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              <div className="flex items-baseline gap-4 mb-6">
                <span className="lp-editorial text-[64px] md:text-[88px] leading-none text-[var(--accent-cyan)]">
                  {s.n}
                </span>
                <span className="lp-mono text-[10px] uppercase tracking-[0.18em] opacity-50">
                  {t('homepage', 'howItWorksStepLabel').replace('{step}', `0${i + 1}`)}
                </span>
              </div>

              <h3 className="lp-editorial text-[28px] md:text-[34px] leading-[1.05] mb-4">
                {s.title}.
              </h3>

              <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)] max-w-[40ch]">
                {s.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
