'use client';

import { useTranslation } from '@/hooks';
import { Eyebrow } from './Eyebrow';

export function HomeFaq() {
  const { t } = useTranslation();
  const faqs = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({
    q: t('homepage', `faq${i}Q` as 'faq1Q'),
    a: t('homepage', `faq${i}A` as 'faq1A'),
  }));

  return (
    <section className="hp-section" id="faq" aria-labelledby="hp-faq-title">
      <div className="hp-wrap">
        <div className="hp-center">
          <Eyebrow>{t('homepage', 'faqEyebrow')}</Eyebrow>
          <h2 id="hp-faq-title" className="hp-h2 mt-6">
            {t('homepage', 'faqHeadline1')} {t('homepage', 'faqHeadline2a')}
            {t('homepage', 'faqHeadlineEm')}
            {t('homepage', 'faqHeadline2b')}
          </h2>
        </div>
        <div className="hp-faq mt-14">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <div>{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
