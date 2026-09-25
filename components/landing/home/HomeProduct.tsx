'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from '@/hooks';
import { Eyebrow } from './Eyebrow';

/**
 * The product itself: screenshots of the dashboard (dark, taken from the real app with sample
 * data — the caption says so). Three views behind mono tabs; only the chosen one is loaded.
 */

const SHOTS = [
  { id: 'overview', src: '/product/dashboard-overview.webp' },
  { id: 'project', src: '/product/dashboard-project.webp' },
  { id: 'database', src: '/product/dashboard-database.webp' },
] as const;

const copy = {
  en: {
    eyebrow: 'The dashboard',
    title: 'Every app, server and database in one place.',
    lead: 'Deploys, logs, metrics, backups and domains — for the whole team.',
    tabs: { overview: 'Overview', project: 'Project', database: 'Database' },
    alt: {
      overview: 'Pushify dashboard overview with projects, stats and recent activity',
      project: 'A project page with its latest deployment and container metrics',
      database: 'A PostgreSQL database page with connection details and backup history',
    },
    caption: 'The real dashboard, with sample data.',
  },
  tr: {
    eyebrow: 'Panel',
    title: 'Tüm uygulamalar, sunucular ve veritabanları tek yerde.',
    lead: 'Deploy’lar, loglar, metrikler, yedekler ve domainler — tüm ekip için.',
    tabs: { overview: 'Genel bakış', project: 'Proje', database: 'Veritabanı' },
    alt: {
      overview: 'Projeler, istatistikler ve son etkinliklerle Pushify paneli genel bakışı',
      project: 'Son deploy ve konteyner metrikleriyle bir proje sayfası',
      database: 'Bağlantı bilgileri ve yedek geçmişiyle bir PostgreSQL veritabanı sayfası',
    },
    caption: 'Gerçek panel, örnek verilerle.',
  },
};

export function HomeProduct() {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const [active, setActive] = useState<(typeof SHOTS)[number]['id']>('overview');
  const shot = SHOTS.find((s) => s.id === active)!;

  return (
    <section className="hp-section" id="dashboard">
      <div className="hp-wrap">
        <div className="hp-center">
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="hp-h2 mt-6">{c.title}</h2>
          <p className="hp-lead mt-5">{c.lead}</p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="hp-toggle" role="tablist" aria-label={c.eyebrow}>
            {SHOTS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active === s.id}
                aria-pressed={active === s.id}
                aria-controls="hp-product-shot"
                onClick={() => setActive(s.id)}
              >
                {c.tabs[s.id]}
              </button>
            ))}
          </div>
        </div>

        <figure className="hp-shot mt-10" id="hp-product-shot" role="tabpanel">
          <div className="hp-shot-frame">
            <Image
              key={shot.id}
              src={shot.src}
              alt={c.alt[shot.id]}
              width={2880}
              height={1800}
              sizes="(max-width: 1216px) 100vw, 1216px"
              className="hp-shot-img"
            />
          </div>
          <figcaption className="hp-shot-caption">{c.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
