'use client';

import { Check, X } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { Eyebrow } from './Eyebrow';

export function HomeDifference() {
  const { t } = useTranslation();
  const hosted = [1, 2, 3, 4].map((i) => t('homepage', `homeDiffHosted${i}` as 'homeDiffHosted1'));
  const ours = [1, 2, 3, 4].map((i) => t('homepage', `homeDiffPushify${i}` as 'homeDiffPushify1'));

  return (
    <section className="hp-section" aria-labelledby="hp-diff-title">
      <div className="hp-wrap">
        <div className="hp-center">
          <Eyebrow>{t('homepage', 'homeDiffEyebrow')}</Eyebrow>
          <h2 id="hp-diff-title" className="hp-h2 mt-6">
            {t('homepage', 'homeDiffTitle')}
          </h2>
          <p className="hp-lead mt-5">{t('homepage', 'homeDiffLead')}</p>
        </div>
        <div className="hp-diff mt-14">
          <div className="hp-diff-card">
            <h3 className="text-[1.15rem] font-medium tracking-[-0.02em]">{t('homepage', 'homeDiffHosted')}</h3>
            <ul className="mt-6 space-y-3.5">
              {hosted.map((x) => (
                <li key={x} className="flex gap-3 text-[0.95rem]" style={{ color: 'var(--hp-body)' }}>
                  <X className="w-4 h-4 mt-1 shrink-0" style={{ color: 'var(--hp-muted)' }} aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="hp-diff-card" data-ours="true">
            <h3 className="text-[1.15rem] font-medium tracking-[-0.02em]">Pushify</h3>
            <ul className="mt-6 space-y-3.5">
              {ours.map((x) => (
                <li key={x} className="flex gap-3 text-[0.95rem]" style={{ color: 'var(--hp-ink)' }}>
                  <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: 'var(--hp-live)' }} aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
