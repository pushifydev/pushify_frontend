'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks';
import { Plus, Minus } from 'lucide-react';

export function FAQSection() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    { q: t('homepage', 'faq1Q'), a: t('homepage', 'faq1A') },
    { q: t('homepage', 'faq2Q'), a: t('homepage', 'faq2A') },
    { q: t('homepage', 'faq3Q'), a: t('homepage', 'faq3A') },
    { q: t('homepage', 'faq4Q'), a: t('homepage', 'faq4A') },
    { q: t('homepage', 'faq5Q'), a: t('homepage', 'faq5A') },
    { q: t('homepage', 'faq6Q'), a: t('homepage', 'faq6A') },
  ];

  return (
    <section id="faq" className="relative border-t border-[var(--glass-border)]">
      <div className="absolute right-2 md:right-10 top-10 lp-index select-none" aria-hidden>
        05
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 mb-14 md:mb-20">
          <div className="col-span-12 md:col-span-3 flex items-start gap-3">
            <span className="lp-crosshair mt-2" />
            <div className="lp-eyebrow">§&nbsp;05 / {t('homepage', 'faqEyebrow')}</div>
          </div>
          <h2 className="col-span-12 md:col-span-9 lp-editorial text-[40px] md:text-[72px] lg:text-[88px] leading-[0.98] tracking-[-0.025em]">
            <span className="block">{t('homepage', 'faqHeadline1')}</span>
            <span className="block">
              {t('homepage', 'faqHeadline2a')}
              <em className="text-[var(--accent-cyan)]">{t('homepage', 'faqHeadlineEm')}</em>
              {t('homepage', 'faqHeadline2b')}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="hidden md:block col-span-1 lp-mono text-[11px] tracking-[0.18em] uppercase opacity-50 pt-2">
            Q & A
          </div>
          <div className="col-span-12 md:col-span-11 border-t border-[var(--glass-border-strong)]">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              const Icon = isOpen ? Minus : Plus;
              return (
                <div
                  key={i}
                  className="border-b border-[var(--glass-border-md)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full grid grid-cols-12 items-start gap-4 py-6 md:py-7 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className="col-span-1 lp-mono text-[12px] tracking-[0.14em] opacity-50 pt-2 tabular-nums">
                      Q.{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="col-span-9 md:col-span-10 text-[17px] md:text-[20px] font-semibold leading-[1.35] tracking-[-0.01em] text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                      {item.q}
                    </span>
                    <span className="col-span-2 md:col-span-1 flex justify-end items-start pt-2">
                      <span
                        className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors"
                        style={{
                          borderColor: isOpen
                            ? 'var(--accent-cyan)'
                            : 'var(--glass-border-strong)',
                          background: isOpen
                            ? 'var(--accent-cyan)'
                            : 'transparent',
                          color: isOpen ? 'var(--ink-deep)' : 'var(--text-primary)',
                        }}
                      >
                        <Icon className="w-4 h-4" strokeWidth={2.2} />
                      </span>
                    </span>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 pb-7">
                        <span className="col-span-1 lp-mono text-[12px] tracking-[0.14em] opacity-50 tabular-nums">
                          A.{String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="col-span-11 md:col-span-10 text-[16px] leading-[1.65] text-[var(--text-secondary)] max-w-[68ch]">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
