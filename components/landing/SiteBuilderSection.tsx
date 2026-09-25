'use client';

import Link from 'next/link';
import {
  ChevronLeft, Monitor, Smartphone, Home, FileText, Plus, GripVertical,
  MousePointer2, Files, Palette, Globe, ArrowRight, type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';
import { Reveal } from './Reveal';
import { ProductScreenshot } from './ProductScreenshot';

/* ───────────────── Editor mockup (shared with /features) ───────────────── */
export function SiteBuilderMockup() {
  const { t } = useTranslation();
  const pages = [
    { name: 'Home', icon: Home, active: true },
    { name: 'About', icon: FileText, active: false },
    { name: 'Pricing', icon: FileText, active: false },
    { name: 'Contact', icon: FileText, active: false },
  ];

  return (
    <div className="rounded-[14px] overflow-hidden border border-[var(--hp-line)] bg-[var(--hp-card)]" aria-hidden="true">
      {/* Toolbar */}
      <div
        className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 border-b border-[var(--hp-line)]"
      >
        <span className="hidden sm:flex gap-1.5 mr-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--hp-line-strong)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--hp-line-strong)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--hp-line-strong)]" />
        </span>
        <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: 'var(--lp-muted)' }} />
        <span className="text-xs truncate" style={{ color: 'var(--hp-muted)', fontFamily: 'var(--font-label)' }}>
          {t('homepage', 'siteBuilderMockToolbar')}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-0.5 rounded-md p-0.5" style={{ background: 'var(--hp-bg)' }}>
            <span className="p-1 rounded" style={{ background: 'var(--hp-line)' }}>
              <Monitor className="w-3.5 h-3.5" style={{ color: 'var(--lp-ink)' }} />
            </span>
            <span className="p-1 rounded">
              <Smartphone className="w-3.5 h-3.5" style={{ color: 'var(--lp-muted)' }} />
            </span>
          </div>
          <span
            className="text-[11px] font-medium px-3 py-1 rounded-full"
            style={{ background: 'var(--hp-btn)', color: 'var(--hp-btn-fg)' }}
          >
            {t('homepage', 'siteBuilderMockPublish')}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 sm:grid-cols-[164px_1fr]">
        {/* Left: pages panel */}
        <div
          className="hidden sm:flex flex-col gap-1.5 p-3 border-r border-[var(--hp-line)]"
        >
          <div className="flex items-center gap-1.5 px-1 pb-1">
            <Files className="w-3.5 h-3.5" style={{ color: 'var(--lp-ink)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--hp-ink)' }}>Pages</span>
          </div>
          {pages.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 border text-[11px] font-medium"
              style={
                p.active
                  ? { borderColor: 'var(--hp-line-strong)', background: 'var(--hp-line)', color: 'var(--lp-ink)' }
                  : { borderColor: 'var(--hp-line)', background: 'var(--hp-bg)', color: 'var(--hp-muted)' }
              }
            >
              <p.icon className="w-3 h-3 shrink-0" />
              <span className="truncate">{p.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium" style={{ color: 'var(--lp-ink)' }}>
            <Plus className="w-3 h-3" />
            Add page
          </div>
        </div>

        {/* Center: canvas */}
        <div className="p-4 sm:p-6" style={{ background: 'var(--hp-bg)' }}>
          <div className="mx-auto max-w-md rounded-lg overflow-hidden bg-white border border-[var(--hp-line)]">
            {/* faux site nav */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
              <span className="w-4 h-4 rounded-md" style={{ background: 'var(--sb-brand)' }} />
              <span className="text-[10px] font-bold text-gray-900">Acme</span>
              <div className="ml-auto flex items-center gap-2.5">
                {['Home', 'About', 'Pricing'].map((l) => (
                  <span key={l} className="text-[9px] text-gray-400">{l}</span>
                ))}
              </div>
            </div>

            {/* selected hero block */}
            <div className="relative m-2 rounded-md p-4 sm:p-5" style={{ outline: '2px solid var(--sb-brand)', outlineOffset: '-1px' }}>
              <span
                className="absolute -top-2.5 left-2 flex items-center gap-1 text-[8px] font-semibold text-white px-1.5 py-0.5 rounded"
                style={{ background: 'var(--sb-brand)' }}
              >
                <GripVertical className="w-2.5 h-2.5" /> Hero
              </span>
              <p className="text-[8px] font-semibold tracking-widest uppercase mb-1.5" style={{ color: 'var(--sb-brand)' }}>
                Welcome to Acme
              </p>
              <h3 className="text-base sm:text-lg font-bold leading-tight text-gray-900">
                Your site,<br />on your own server.
              </h3>
              <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                Edit every word right on the page. No code, no templates to wrangle.
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-[9px] font-semibold text-white px-2.5 py-1 rounded-md" style={{ background: 'var(--sb-brand)' }}>
                  Get started
                </span>
                <span className="text-[9px] font-semibold text-gray-600 px-2.5 py-1 rounded-md border border-gray-200">
                  Learn more
                </span>
              </div>
            </div>

            {/* features row */}
            <div className="grid grid-cols-3 gap-2 px-2 pb-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-md border border-gray-100 p-2">
                  <span className="block w-3.5 h-3.5 rounded mb-1.5" style={{ background: 'color-mix(in srgb, var(--sb-brand) 25%, #e5e7eb)' }} />
                  <span className="block h-1 rounded-full bg-gray-200 mb-1 w-3/4" />
                  <span className="block h-1 rounded-full bg-gray-100 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Value card ───────────────── */
function ValueCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="lp-card p-5 h-full hover:border-[var(--lp-muted)] transition-colors">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3.5"
        style={{ color: 'var(--lp-ink)', background: 'var(--lp-border)' }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <h4 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--lp-ink)' }}>{title}</h4>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{desc}</p>
    </div>
  );
}

/* ───────────────── Section ───────────────── */
export function SiteBuilderSection() {
  const { t } = useTranslation();

  return (
    <section id="site-builder" className="lp-section">
      <div className="lp-container">
        <LandingSectionHeader
          label={t('homepage', 'siteBuilderEyebrow')}
          title={t('homepage', 'siteBuilderHeadline')}
          description={t('homepage', 'siteBuilderSubtitle')}
        />

        {/* Catalog first, then the editor — the order someone actually meets them in. */}
        <Reveal>
          <div className="max-w-4xl mx-auto">
            <ProductScreenshot
              light="/product/sitestudio-light.webp"
              dark="/product/sitestudio-dark.webp"
              alt={t('homepage', 'siteBuilderShotAlt')}
              caption={t('homepage', 'siteBuilderShotCaption')}
            />
          </div>
        </Reveal>

        <Reveal>
          <div className="max-w-4xl mx-auto mt-8">
            <SiteBuilderMockup />
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {[
            { icon: MousePointer2, title: t('homepage', 'siteBuilderFeat1Title'), desc: t('homepage', 'siteBuilderFeat1Desc') },
            { icon: Files, title: t('homepage', 'siteBuilderFeat2Title'), desc: t('homepage', 'siteBuilderFeat2Desc') },
            { icon: Palette, title: t('homepage', 'siteBuilderFeat3Title'), desc: t('homepage', 'siteBuilderFeat3Desc') },
            { icon: Globe, title: t('homepage', 'siteBuilderFeat4Title'), desc: t('homepage', 'siteBuilderFeat4Desc') },
          ].map((card, i) => (
            <Reveal key={card.title} delay={i * 90} className="h-full">
              <ValueCard icon={card.icon} title={card.title} desc={card.desc} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/register" className="lp-cta group">
            {t('homepage', 'siteBuilderCTA')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
