'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks';
import { Reveal } from '@/components/landing/Reveal';

/**
 * Honest side-by-side estimate. Competitor numbers are their published list
 * prices (checked 2026-09-10, links below); the usage assumptions are stated
 * on the page and editable, never hidden.
 */

const VERCEL_PRO_SEAT = 20; // $/seat/month
const RAILWAY_PRO_BASE = 20; // $/workspace/month, includes $20 usage
const RAILWAY_VCPU_MONTH = 20; // $/vCPU/month
const RAILWAY_GB_MONTH = 10; // $/GB RAM/month
const PUSHIFY_HOBBY = 15;
const PUSHIFY_PRO = 29;

const copy = {
  en: {
    title: 'What would this cost elsewhere?',
    intro: 'Rough monthly estimate from published list prices. Adjust the inputs to your setup.',
    projects: 'Projects',
    seats: 'Team members',
    serverCost: 'Your server cost',
    serverHint: 'What you pay your VPS provider per month (any provider, you set it)',
    perProject: 'Per project: vCPU · GB RAM',
    result: 'Estimated monthly',
    vercelNote: (seats: number) => `${seats} × $${VERCEL_PRO_SEAT} Pro seats. Bandwidth beyond 1 TB and function usage billed extra.`,
    railwayNote: (p: number, cpu: number, ram: number) => `$${RAILWAY_PRO_BASE} Pro (incl. $20 usage) + ${p} × (${cpu} vCPU × $${RAILWAY_VCPU_MONTH} + ${ram} GB × $${RAILWAY_GB_MONTH}). Egress extra.`,
    pushifyNote: (plan: string, server: number) => `${plan} plan + $${server} to your server provider. Unlimited seats on the plan’s member limit, no per-GB metering, no per-seat fee.`,
    assumptions: 'Sources & assumptions',
    sources: [
      { label: 'Vercel pricing', href: 'https://vercel.com/pricing' },
      { label: 'Railway pricing', href: 'https://railway.com/pricing' },
      { label: 'Pushify pricing (above)', href: '#plans' },
    ],
    disclaimer: 'List prices checked 2026-09-10. Usage-based bills vary; this is an estimate, not a quote.',
  },
  tr: {
    title: 'Bu iş başka yerde kaça mal olurdu?',
    intro: 'Yayınlanmış liste fiyatlarından kaba aylık tahmin. Girdileri kendi kurulumunuza göre ayarlayın.',
    projects: 'Proje',
    seats: 'Ekip üyesi',
    serverCost: 'Sunucu maliyetiniz',
    serverHint: 'VPS sağlayıcınıza aylık ödediğiniz tutar (herhangi bir sağlayıcı, siz belirlersiniz)',
    perProject: 'Proje başına: vCPU · GB RAM',
    result: 'Tahmini aylık',
    vercelNote: (seats: number) => `${seats} × $${VERCEL_PRO_SEAT} Pro koltuğu. 1 TB üstü bant genişliği ve fonksiyon kullanımı ayrıca faturalanır.`,
    railwayNote: (p: number, cpu: number, ram: number) => `$${RAILWAY_PRO_BASE} Pro ($20 kullanım dahil) + ${p} × (${cpu} vCPU × $${RAILWAY_VCPU_MONTH} + ${ram} GB × $${RAILWAY_GB_MONTH}). Çıkış trafiği ayrı.`,
    pushifyNote: (plan: string, server: number) => `${plan} planı + sunucu sağlayıcınıza $${server}. Plan üye limiti dahilinde koltuk ücreti yok, GB başına ölçüm yok.`,
    assumptions: 'Kaynaklar & varsayımlar',
    sources: [
      { label: 'Vercel fiyatları', href: 'https://vercel.com/pricing' },
      { label: 'Railway fiyatları', href: 'https://railway.com/pricing' },
      { label: 'Pushify fiyatları (yukarıda)', href: '#plans' },
    ],
    disclaimer: 'Liste fiyatları 2026-09-10 tarihinde kontrol edildi. Kullanıma dayalı faturalar değişir; bu bir tahmindir, teklif değildir.',
  },
} as const;

function NumberField({ label, hint, value, onChange, min, max, step = 1, prefix }: { label: string; hint?: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; prefix?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5" style={{ color: 'var(--lp-muted)' }}>{label}</span>
      <span className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}>
        {prefix && <span className="pl-3 text-sm" style={{ color: 'var(--lp-muted)' }}>{prefix}</span>}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
          className="w-full h-10 px-3 bg-transparent outline-none text-sm tabular-nums"
          style={{ color: 'var(--lp-ink)', fontFamily: 'var(--font-mono)' }}
        />
      </span>
      {hint && <span className="block text-[11px] mt-1" style={{ color: 'var(--lp-muted)' }}>{hint}</span>}
    </label>
  );
}

export function PricingCalculator() {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const [projects, setProjects] = useState(3);
  const [seats, setSeats] = useState(2);
  const [serverCost, setServerCost] = useState(5);
  const [cpu, setCpu] = useState(0.5);
  const [ram, setRam] = useState(0.5);

  const vercel = seats * VERCEL_PRO_SEAT;
  const railway = RAILWAY_PRO_BASE + Math.max(0, projects * (cpu * RAILWAY_VCPU_MONTH + ram * RAILWAY_GB_MONTH) - 20);
  const pushifyPlan = projects <= 5 && seats <= 2 ? { name: 'Hobby', price: PUSHIFY_HOBBY } : { name: 'Pro', price: PUSHIFY_PRO };
  const pushify = pushifyPlan.price + serverCost;

  const rows = [
    { name: 'Vercel', total: vercel, note: c.vercelNote(seats) },
    { name: 'Railway', total: Math.round(railway), note: c.railwayNote(projects, cpu, ram) },
    { name: 'Pushify', total: pushify, note: c.pushifyNote(pushifyPlan.name, serverCost), highlight: true },
  ];

  return (
    <Reveal>
      <section className="lp-container max-w-4xl pb-20">
        <div className="rounded-2xl border p-6 md:p-8" style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}>
          <h2 className="text-xl font-semibold tracking-tight mb-1" style={{ color: 'var(--lp-ink)' }}>{c.title}</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--lp-body)' }}>{c.intro}</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <NumberField label={c.projects} value={projects} onChange={setProjects} min={1} max={50} />
            <NumberField label={c.seats} value={seats} onChange={setSeats} min={1} max={15} />
            <NumberField label={c.serverCost} hint={c.serverHint} value={serverCost} onChange={setServerCost} min={0} max={500} prefix="$" />
            <NumberField label="vCPU / project" value={cpu} onChange={setCpu} min={0.1} max={8} step={0.1} />
            <NumberField label="GB RAM / project" value={ram} onChange={setRam} min={0.1} max={32} step={0.1} />
          </div>

          <div className="divide-y rounded-xl border" style={{ borderColor: 'var(--lp-border)' }}>
            {rows.map((r) => (
              <div key={r.name} className="grid grid-cols-[auto_1fr_auto] items-start gap-4 px-4 py-3" style={{ borderColor: 'var(--lp-border)' }}>
                <span className="text-sm font-semibold w-16" style={{ color: 'var(--lp-ink)' }}>{r.name}</span>
                <span className="text-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{r.note}</span>
                <span className="text-base font-semibold tabular-nums text-right" style={{ fontFamily: 'var(--font-mono)', color: r.highlight ? 'var(--lp-ink)' : 'var(--lp-body)' }}>
                  ~${r.total}<span className="text-xs font-normal" style={{ color: 'var(--lp-muted)' }}>/mo</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 text-[11px] leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
            <span className="font-semibold uppercase tracking-[0.08em]">{c.assumptions}: </span>
            {c.sources.map((s, i) => (
              <span key={s.href}>
                <a href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="underline underline-offset-2">{s.label}</a>
                {i < c.sources.length - 1 ? ' · ' : ''}
              </span>
            ))}
            <span> — {c.disclaimer}</span>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
