'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { MSection } from '@/components/landing/MarketingKit';
import { useTranslation } from '@/hooks';
import { DOCS_API_BASE_URL } from '@/lib/api/public-url';

/**
 * Live platform status, straight from the API's own health probe — no third
 * party, no manually edited "all systems operational" banner. If this page
 * renders, the website is up; the rest comes from /health/full.
 */

type CheckStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

interface HealthCheck {
  status: string;
  latency?: number;
  message?: string;
  error?: string;
}

interface FullHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version?: string;
  uptime?: number;
  checks: Record<string, HealthCheck>;
}

const copy = {
  en: {
    label: 'Status',
    title: 'Platform status',
    intro: 'Live from the API’s own health probe. Refreshes every 60 seconds.',
    all: 'All systems operational',
    degraded: 'Partial degradation',
    down: 'Major outage',
    unreachable: 'API unreachable',
    components: {
      website: 'Website & dashboard',
      api: 'API',
      database: 'Control-plane database',
      redis: 'Job queue (Redis)',
      docker: 'Build runner',
    },
    latency: (ms: number) => `${ms} ms`,
    uptime: (s: number) => `API uptime ${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`,
    version: (v: string) => `v${v}`,
    checked: 'Last checked',
    nowEyebrow: 'Right now',
    componentsEyebrow: 'Components',
    word: { healthy: 'Operational', degraded: 'Degraded', unhealthy: 'Down', unknown: 'Unknown' },
    yourAppsEyebrow: 'Your apps',
    appsTitle: 'Your apps have their own checks',
    note: 'They run on your servers. Track each one under Health checks in the dashboard.',
    changelog: 'Recent releases',
  },
  tr: {
    label: 'Durum',
    title: 'Platform durumu',
    intro: 'API’nin kendi sağlık probundan canlı. 60 saniyede bir yenilenir.',
    all: 'Tüm sistemler çalışıyor',
    degraded: 'Kısmi bozulma',
    down: 'Büyük kesinti',
    unreachable: 'API’ye ulaşılamıyor',
    components: {
      website: 'Web sitesi & panel',
      api: 'API',
      database: 'Kontrol düzlemi veritabanı',
      redis: 'İş kuyruğu (Redis)',
      docker: 'Build çalıştırıcı',
    },
    latency: (ms: number) => `${ms} ms`,
    uptime: (s: number) => `API çalışma süresi ${Math.floor(s / 3600)}s ${Math.floor((s % 3600) / 60)}dk`,
    version: (v: string) => `v${v}`,
    checked: 'Son kontrol',
    nowEyebrow: 'Şu anda',
    componentsEyebrow: 'Bileşenler',
    word: { healthy: 'Çalışıyor', degraded: 'Bozulma var', unhealthy: 'Çalışmıyor', unknown: 'Bilinmiyor' },
    yourAppsEyebrow: 'Uygulamalarınız',
    appsTitle: 'Uygulamalarınızın kendi kontrolleri var',
    note: 'Onlar sizin sunucularınızda çalışır. Her birini panelde Sağlık kontrolleri altında izleyin.',
    changelog: 'Son sürümler',
  },
} as const;

/* Green only means up. Degraded and down borrow the dashboard's amber and red tokens so a real
   outage is not mistaken for a neutral grey; unknown (still loading, or no data) stays muted. */
const DOT: Record<CheckStatus, string> = {
  healthy: 'var(--hp-live)',
  degraded: 'var(--accent-amber)',
  unhealthy: 'var(--accent-red)',
  unknown: 'var(--hp-muted)',
};

function normalize(status: string | undefined): CheckStatus {
  if (status === 'healthy' || status === 'ok' || status === 'ready') return 'healthy';
  if (status === 'degraded') return 'degraded';
  if (status === 'unhealthy' || status === 'error') return 'unhealthy';
  return 'unknown';
}

export default function StatusPage() {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const [health, setHealth] = useState<FullHealth | null>(null);
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${DOCS_API_BASE_URL}/health/full`, { cache: 'no-store' });
        const json = (await res.json()) as FullHealth;
        if (cancelled) return;
        setHealth(json);
        setReachable(true);
      } catch {
        if (cancelled) return;
        setReachable(false);
      } finally {
        if (!cancelled) setCheckedAt(new Date());
      }
    }
    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const overall: CheckStatus =
    reachable === false ? 'unhealthy' : reachable === null ? 'unknown' : normalize(health?.status);
  const overallLabel =
    reachable === false ? c.unreachable : overall === 'healthy' ? c.all : overall === 'degraded' ? c.degraded : overall === 'unhealthy' ? c.down : '…';

  const rows: { key: string; label: string; status: CheckStatus; detail?: string }[] = [
    { key: 'website', label: c.components.website, status: 'healthy' },
    { key: 'api', label: c.components.api, status: reachable === false ? 'unhealthy' : reachable ? 'healthy' : 'unknown', detail: health?.uptime !== undefined ? c.uptime(health.uptime) : undefined },
    ...(['database', 'redis', 'docker'] as const).map((k) => {
      const check = health?.checks?.[k];
      return {
        key: k,
        label: c.components[k],
        status: reachable === false ? ('unknown' as CheckStatus) : normalize(check?.status),
        detail: check?.latency !== undefined ? c.latency(check.latency) : check?.message || check?.error,
      };
    }),
  ];

  return (
    <MarketingShell noPad>
      <MarketingPageHero label={c.label} title={c.title} description={c.intro} />

      {/* The board is the page: overall state on top, one hairline row per component. */}
      <section className="pb-20 md:pb-24">
        <div className="lp-container max-w-3xl">
          <div className="hp-code">
            <div className="hp-code-title flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span>{c.nowEyebrow}</span>
              <span className="tabular-nums normal-case tracking-normal">
                {checkedAt ? `${c.checked}: ${checkedAt.toLocaleTimeString()}` : '…'}
                {health?.version ? ` · ${c.version(health.version)}` : ''}
              </span>
            </div>
            <div role="status" aria-live="polite" className="px-5 sm:px-8 py-8 sm:py-10 flex items-center gap-4">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: DOT[overall], boxShadow: `0 0 0 4px color-mix(in srgb, ${DOT[overall]} 15%, transparent)` }}
                aria-hidden="true"
              />
              <h2 className="hp-h2" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
                {overallLabel}
              </h2>
            </div>
            <ul aria-label={c.componentsEyebrow} className="border-t" style={{ borderColor: 'var(--hp-line)' }}>
              {rows.map((r) => (
                <li
                  key={r.key}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 sm:px-8 py-4 border-b last:border-b-0"
                  style={{ borderColor: 'var(--hp-line)' }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DOT[r.status] }} aria-hidden="true" />
                  <span className="text-[15px] flex-1 min-w-[10rem]" style={{ color: 'var(--hp-ink)' }}>
                    {r.label}
                  </span>
                  {r.detail && (
                    <span className="hp-mono text-[12px] tabular-nums" style={{ color: 'var(--hp-muted)' }}>
                      {r.detail}
                    </span>
                  )}
                  <span
                    className="hp-mono text-[11px] uppercase tracking-[0.1em]"
                    style={{ color: r.status === 'healthy' ? 'var(--hp-live)' : 'var(--hp-body)' }}
                  >
                    {c.word[r.status]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <MSection eyebrow={c.yourAppsEyebrow} title={c.appsTitle} lead={c.note} width="narrow">
        <Link
          href="/changelog"
          className="hp-mono inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] hover:underline underline-offset-4"
          style={{ color: 'var(--hp-ink)' }}
        >
          {c.changelog}
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </MSection>
    </MarketingShell>
  );
}
