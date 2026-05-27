'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks';
import { Plus, Minus } from 'lucide-react';
import { LandingSectionHeader } from './LandingSectionHeader';

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
    <section id="faq" className="lp-section">
      <div className="lp-container max-w-3xl">
        <LandingSectionHeader
          label={t('homepage', 'faqEyebrow')}
          title={
            <>
              {t('homepage', 'faqHeadline1')}{' '}
              {t('homepage', 'faqHeadline2a')}
              {t('homepage', 'faqHeadlineEm')}
              {t('homepage', 'faqHeadline2b')}
            </>
          }
          align="center"
          className="mx-auto text-center"
        />

        <div className="border-t border-[var(--lp-border)]">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            const Icon = isOpen ? Minus : Plus;
            return (
              <div key={i} className="border-b border-[var(--lp-border)]">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-start justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[1.0625rem] font-medium leading-snug pr-4" style={{ color: 'var(--lp-ink)' }}>
                    {item.q}
                  </span>
                  <span
                    className="w-8 h-8 shrink-0 rounded-full border flex items-center justify-center transition-colors"
                    style={{
                      borderColor: 'var(--lp-border)',
                      background: isOpen ? 'var(--lp-btn)' : 'transparent',
                      color: isOpen ? 'var(--lp-btn-fg)' : 'var(--lp-ink)',
                    }}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-sm leading-relaxed pr-12" style={{ color: 'var(--lp-body)' }}>
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
