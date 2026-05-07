'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks';
import { ChevronDown, HelpCircle } from 'lucide-react';

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
    <section id="faq" className="relative py-24 border-t border-[var(--glass-border)]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 mb-5">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
            <span className="text-xs text-[var(--accent-purple)] terminal-text uppercase tracking-wider">
              {t('homepage', 'faqEyebrow')}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t('homepage', 'faqTitle')}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-xl border transition-colors ${
                  isOpen
                    ? 'border-[var(--accent-cyan)]/30 bg-[var(--bg-secondary)]'
                    : 'border-[var(--glass-border)] bg-[var(--bg-secondary)]/60 hover:border-[var(--glass-border-strong)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-base">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-[var(--text-muted)] transition-transform ${
                      isOpen ? 'rotate-180 text-[var(--accent-cyan)]' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-[var(--text-secondary)] leading-relaxed">
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
