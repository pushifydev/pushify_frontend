'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
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
    note: 'Your own apps run on your servers — their uptime is tracked per project under Health checks in the dashboard.',
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
    note: 'Kendi uygulamalarınız kendi sunucularınızda çalışır — onların erişilebilirliği panelde proje bazında Sağlık kontrolleri altında izlenir.',
    changelog: 'Son sürümler',
  },
} as const;

const DOT: Record<CheckStatus, string> = {
  healthy: '#16a34a',
  degraded: '#d97706',
  unhealthy: '#dc2626',
  unknown: '#9ca3af',
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
    <MarketingShell>
      <MarketingPageHero label={c.label} title={c.title} description={c.intro} />

      <div className="lp-container max-w-2xl pb-24 space-y-8">
        <div
          className="rounded-2xl border px-6 py-5 flex items-center gap-4"
          style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}
          role="status"
          aria-live="polite"
        >
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: DOT[overall], boxShadow: `0 0 0 4px ${DOT[overall]}22` }} />
          <div className="min-w-0">
            <p className="text-lg font-semibold" style={{ color: 'var(--lp-ink)' }}>{overallLabel}</p>
            <p className="text-xs tabular-nums" style={{ color: 'var(--lp-muted)' }}>
              {checkedAt ? `${c.checked}: ${checkedAt.toLocaleTimeString()}` : '…'}
              {health?.version ? ` · ${c.version(health.version)}` : ''}
            </p>
          </div>
        </div>

        <ul className="rounded-2xl border divide-y" style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}>
          {rows.map((r) => (
            <li key={r.key} className="flex items-center gap-3 px-6 py-3.5" style={{ borderColor: 'var(--lp-border)' }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DOT[r.status] }} />
              <span className="text-sm flex-1" style={{ color: 'var(--lp-ink)' }}>{r.label}</span>
              {r.detail && <span className="text-xs tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-muted)' }}>{r.detail}</span>}
            </li>
          ))}
        </ul>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{c.note}</p>

        <p className="text-sm">
          <Link href="/changelog" className="hover:underline underline-offset-4" style={{ color: 'var(--lp-ink)' }}>{c.changelog} →</Link>
        </p>
      </div>
    </MarketingShell>
  );
}
