'use client';

import {
  LayoutDashboard, FolderKanban, Server, Database, BarChart3, Users, Receipt,
  Search, Rocket, GitBranch,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';
import { Reveal } from './Reveal';

/**
 * Full-width, high-fidelity replica of the actual dashboard — the product, shown big.
 * Pure code (no image assets): stays crisp on any display and adapts to light/dark.
 */

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: FolderKanban, label: 'Projects', active: true },
  { icon: Server, label: 'Servers' },
  { icon: Database, label: 'Databases' },
  { icon: BarChart3, label: 'Monitoring' },
  { icon: Users, label: 'Team' },
  { icon: Receipt, label: 'Billing' },
];

const DEPLOYS = [
  { name: 'my-app', branch: 'main', commit: 'de55144', status: 'Live', ok: true, time: '2m ago', dur: '47s' },
  { name: 'api-service', branch: 'main', commit: 'a91c2f0', status: 'Live', ok: true, time: '1h ago', dur: '39s' },
  { name: 'marketing-site', branch: 'main', commit: 'f3d81b7', status: 'Building', ok: false, time: 'now', dur: '—' },
  { name: 'docs-site', branch: 'main', commit: '77e09c3', status: 'Live', ok: true, time: '3h ago', dur: '12s' },
];

/** Simple CPU area chart — precomputed points, no runtime randomness */
function MetricsChart() {
  const points = [18, 22, 20, 34, 28, 42, 38, 52, 44, 61, 50, 58, 47, 64, 55, 70, 60, 66, 58, 72];
  const w = 260;
  const h = 64;
  const step = w / (points.length - 1);
  const line = points.map((p, i) => `${(i * step).toFixed(1)},${(h - (p / 100) * h).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={`0,${h} ${line} ${w},${h}`}
        fill="color-mix(in srgb, var(--lp-ink) 6%, transparent)"
        stroke="none"
      />
      <polyline points={line} fill="none" stroke="var(--lp-ink)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

export function ProductShowcaseSection() {
  const { t } = useTranslation();

  return (
    <section id="product" className="lp-section border-t-0 pt-4 md:pt-8">
      <div className="lp-container">
        <LandingSectionHeader
          label={t('landing', 'showcaseEyebrow')}
          title={t('landing', 'showcaseTitle')}
          description={t('landing', 'showcaseLead')}
          align="center"
          className="mx-auto text-center"
        />

        <Reveal>
          <div className="lp-preview !rounded-2xl" style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.05)' }}>
            {/* Browser chrome */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b border-[var(--lp-border)]"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/80" />
              <span
                className="ml-3 inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-md"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--lp-muted)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--lp-border)',
                }}
              >
                pushify.dev/dashboard
              </span>
            </div>

            {/* App body */}
            <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[180px_1fr]" style={{ background: 'var(--bg-primary)' }}>
              {/* Sidebar */}
              <aside
                className="border-r border-[var(--lp-border)] py-3 px-2 sm:px-3 space-y-0.5"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center gap-2 px-2 pb-3">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)' }}
                  >
                    P
                  </span>
                  <span className="hidden sm:block text-sm font-semibold" style={{ color: 'var(--lp-ink)' }}>
                    Pushify
                  </span>
                </div>
                {NAV.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px]"
                    style={
                      item.active
                        ? { background: 'var(--hover-overlay-lg)', color: 'var(--lp-ink)', fontWeight: 600 }
                        : { color: 'var(--lp-muted)' }
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:block">{item.label}</span>
                  </div>
                ))}
              </aside>

              {/* Main */}
              <div className="p-4 sm:p-6 min-w-0">
                {/* Top bar */}
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="text-base font-semibold tracking-tight" style={{ color: 'var(--lp-ink)' }}>
                    Projects
                  </h3>
                  <span
                    className="hidden md:inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ml-auto"
                    style={{ color: 'var(--lp-muted)', border: '1px solid var(--lp-border)', background: 'var(--bg-secondary)' }}
                  >
                    <Search className="w-3.5 h-3.5" />
                    Search…
                    <kbd
                      className="text-[10px] px-1 rounded"
                      style={{ border: '1px solid var(--lp-border)', fontFamily: 'var(--font-mono)' }}
                    >
                      ⌘K
                    </kbd>
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg md:ml-0 ml-auto"
                    style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)' }}
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    New Project
                  </span>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Active projects', value: '12' },
                    { label: 'Servers', value: '3' },
                    { label: 'Deploys this week', value: '47' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl p-3 sm:p-4"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--lp-border)' }}
                    >
                      <div
                        className="text-lg sm:text-xl font-semibold tracking-tight"
                        style={{ color: 'var(--lp-ink)', fontFamily: 'var(--font-mono)' }}
                      >
                        {s.value}
                      </div>
                      <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--lp-muted)' }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-[1fr_280px] gap-3">
                  {/* Deployments list */}
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--lp-border)' }}>
                    <div
                      className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider border-b border-[var(--lp-border)]"
                      style={{ color: 'var(--lp-muted)', background: 'var(--bg-secondary)' }}
                    >
                      Recent deployments
                    </div>
                    {DEPLOYS.map((d, i) => (
                      <div
                        key={d.name}
                        className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-[var(--lp-border)]' : ''}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${d.ok ? 'bg-[#22c55e]' : 'bg-[#eab308] animate-pulse'}`}
                        />
                        <span className="text-[13px] font-semibold truncate" style={{ color: 'var(--lp-ink)' }}>
                          {d.name}
                        </span>
                        <span
                          className="hidden sm:inline-flex items-center gap-1 text-[11px] shrink-0"
                          style={{ color: 'var(--lp-muted)', fontFamily: 'var(--font-mono)' }}
                        >
                          <GitBranch className="w-3 h-3" />
                          {d.branch} · {d.commit}
                        </span>
                        <span
                          className="ml-auto text-[11px] px-2 py-0.5 rounded-full shrink-0"
                          style={
                            d.ok
                              ? { color: '#16a34a', background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)' }
                              : { color: '#a16207', background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.3)' }
                          }
                        >
                          {d.status}
                        </span>
                        <span
                          className="hidden md:block text-[11px] w-14 text-right shrink-0"
                          style={{ color: 'var(--lp-muted)', fontFamily: 'var(--font-mono)' }}
                        >
                          {d.dur}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Metrics panel */}
                  <div className="rounded-xl p-4 hidden lg:flex flex-col" style={{ border: '1px solid var(--lp-border)', background: 'var(--bg-secondary)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--lp-muted)' }}>
                        CPU — my-app
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--lp-muted)', fontFamily: 'var(--font-mono)' }}>
                        24h
                      </span>
                    </div>
                    <div
                      className="text-xl font-semibold tracking-tight mb-2"
                      style={{ color: 'var(--lp-ink)', fontFamily: 'var(--font-mono)' }}
                    >
                      38%
                    </div>
                    <MetricsChart />
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--lp-border)]">
                      <span className="text-[11px]" style={{ color: 'var(--lp-muted)' }}>Memory</span>
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--lp-ink)', fontFamily: 'var(--font-mono)' }}>
                        512 MB / 1 GB
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px]" style={{ color: 'var(--lp-muted)' }}>Uptime</span>
                      <span className="text-[11px] font-semibold" style={{ color: '#16a34a', fontFamily: 'var(--font-mono)' }}>
                        ● Healthy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
