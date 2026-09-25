'use client';

import { useId, useState } from 'react';
import { useTranslation } from '@/hooks';
import { estimate, estimateNotes, ESTIMATE_SOURCES } from '@/lib/pricing-estimate';
import { Eyebrow } from './Eyebrow';

type Field = {
  key: 'projects' | 'seats' | 'serverCost' | 'cpu' | 'ram';
  label: string;
  hint?: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
};

function Slider({ field, value, onChange }: { field: Field; value: number; onChange: (v: number) => void }) {
  const id = useId();
  const pct = ((value - field.min) / (field.max - field.min)) * 100;
  return (
    <div className="hp-calc-row">
      <label htmlFor={id} className="min-w-0">
        <span className="block text-[0.95rem] font-medium tracking-[-0.01em]">{field.label}</span>
        {field.hint && (
          <span className="block text-xs mt-0.5" style={{ color: 'var(--hp-muted)' }}>
            {field.hint}
          </span>
        )}
      </label>
      <output htmlFor={id} className="text-[0.95rem] tabular-nums text-right sm:text-left">
        {field.format(value)}
      </output>
      <input
        id={id}
        type="range"
        className="hp-range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        aria-valuetext={field.format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--hp-pct' as string]: `${pct}%` }}
      />
    </div>
  );
}

/** The pricing page's estimate (same module, same list prices) as sliders on the homepage. */
export function HomeCost() {
  const { t, locale } = useTranslation();
  const n = estimateNotes[locale === 'tr' ? 'tr' : 'en'];
  const [v, setV] = useState({ projects: 3, seats: 2, serverCost: 5, cpu: 0.5, ram: 0.5 });
  const e = estimate(v);
  const perMonth = t('homepage', 'homeCostPerMonth');

  const fields: Field[] = [
    { key: 'projects', label: t('homepage', 'homeCostProjects'), min: 1, max: 20, step: 1, format: (x) => String(x) },
    { key: 'seats', label: t('homepage', 'homeCostSeats'), min: 1, max: 15, step: 1, format: (x) => String(x) },
    { key: 'serverCost', label: t('homepage', 'homeCostServer'), hint: t('homepage', 'homeCostServerHint'), min: 0, max: 100, step: 1, format: (x) => `$${x}` },
    { key: 'cpu', label: t('homepage', 'homeCostCpu'), min: 0.25, max: 4, step: 0.25, format: (x) => String(x) },
    { key: 'ram', label: t('homepage', 'homeCostRam'), min: 0.25, max: 8, step: 0.25, format: (x) => String(x) },
  ];

  const totals = [
    { name: 'Vercel', total: e.vercel, note: n.vercel(v.seats) },
    { name: 'Railway', total: e.railway, note: n.railway(v.projects, v.cpu, v.ram) },
    { name: 'Pushify', total: e.pushify, note: n.pushify(e.pushifyPlan.name, v.serverCost), ours: true },
  ];

  return (
    <section className="hp-section" id="cost" aria-labelledby="hp-cost-title">
      <div className="hp-wrap">
        <div className="hp-center">
          <Eyebrow>{t('homepage', 'homeCostEyebrow')}</Eyebrow>
          <h2 id="hp-cost-title" className="hp-h2 mt-6">
            {t('homepage', 'homeCostTitle')}
          </h2>
          <p className="hp-lead mt-5 max-w-[36rem]">{t('homepage', 'homeCostLead')}</p>
        </div>

        <div className="hp-calc mt-14">
          {fields.map((f) => (
            <Slider key={f.key} field={f} value={v[f.key]} onChange={(x) => setV((s) => ({ ...s, [f.key]: x }))} />
          ))}
          <div className="hp-totals" aria-live="polite">
            {totals.map((r) => (
              <div key={r.name} className="hp-total" data-ours={r.ours === true}>
                <div className="hp-eyebrow" style={{ color: r.ours ? 'var(--hp-live)' : undefined }}>
                  {r.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span
                    className="text-[2rem] font-medium tracking-[-0.03em] tabular-nums"
                    style={{ color: r.ours ? 'var(--hp-live)' : 'var(--hp-ink)' }}
                  >
                    ~${r.total}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--hp-muted)' }}>
                    {perMonth}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--hp-muted)' }}>
                  {r.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed" style={{ color: 'var(--hp-muted)' }}>
          {t('homepage', 'homeCostSources')}:{' '}
          {ESTIMATE_SOURCES.map((s, i) => (
            <span key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {s.name}
              </a>
              {i < ESTIMATE_SOURCES.length - 1 ? ' · ' : ''}
            </span>
          ))}{' '}
          — {n.disclaimer}
        </p>
      </div>
    </section>
  );
}
