'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useSignedIn } from '@/hooks/useSignedIn';

export function HomeCta() {
  const { t } = useTranslation();
  const signedIn = useSignedIn();
  return (
    <section className="hp-section">
      <div className="hp-wrap hp-center">
        <h2 className="hp-h2">{t('homepage', 'homeCtaTitle')}</h2>
        <p className="hp-lead mt-5">{t('homepage', 'homeCtaLead')}</p>
        <div className="mt-10 flex justify-center">
          <Link href={signedIn ? '/dashboard' : '/register'} className="hp-btn hp-cta-glow group">
            {signedIn ? t('landing', 'openDashboard') : t('landing', 'getStartedFree')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
