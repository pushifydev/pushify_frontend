'use client';

import type { HTMLAttributes } from 'react';

const skeletonBg = { background: 'var(--bg-tertiary)' } as const;

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={skeletonBg}
      aria-hidden
      {...props}
    />
  );
}

/** Projects grid — matches glass card height ~160px */
export function SkeletonProjectCard() {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="flex gap-3 mb-4">
        <Skeleton className="w-9 h-9 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2 min-w-0">
          <Skeleton className="h-4 w-[65%] max-w-[160px]" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-full max-w-[220px] mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

/** Servers grid — top accent border area */
export function SkeletonServerCard() {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--bg-secondary)',
        borderWidth: '2px 1px 1px 1px',
        borderStyle: 'solid',
        borderColor: 'var(--glass-border)',
        borderRadius: 12,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full mb-3" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
    </div>
  );
}

/** Dashboard “your projects” row */
export function SkeletonDashboardProjectRow() {
  return (
    <div
      className="flex items-stretch rounded-xl overflow-hidden min-h-[56px]"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
    >
      <div className="w-[3px] shrink-0 self-stretch animate-pulse" style={skeletonBg} />
      <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-[45%] max-w-[200px]" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="hidden sm:flex gap-3 shrink-0">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/** Activity log row (wrap with dividers in the parent when stacking) */
export function SkeletonActivityRow() {
  return (
    <div className="flex items-start gap-4 px-5 py-3.5">
      <Skeleton className="w-7 h-7 rounded-lg shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}

/** Title + subtitle — billing, team, databases headers */
export function SkeletonPageHeader() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-7 w-44 max-w-[55%]" />
      <Skeleton className="h-4 w-72 max-w-[90%]" />
    </div>
  );
}

/** Billing summary / usage blocks */
export function SkeletonBillingSummaryCard() {
  return (
    <div
      className="rounded-xl p-5 overflow-hidden"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderRadius: 12,
      }}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3 min-w-0">
          <Skeleton className="h-5 w-52 max-w-full" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-2 w-full rounded-full max-w-md" />
        </div>
      </div>
    </div>
  );
}

/** Team members table shell */
export function SkeletonTeamPanel() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
    >
      <div
        className="flex items-center gap-2.5 px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
        <Skeleton className="h-4 w-28" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-3.5"
          style={{
            borderTop: i === 0 ? 'none' : '1px solid var(--glass-divider)',
          }}
        >
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-40 max-w-[70%]" />
            <Skeleton className="h-3 w-56 max-w-[85%]" />
          </div>
          <Skeleton className="h-8 w-16 rounded-lg shrink-0 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}

/** Monitoring gauge cards (matches GaugeCard layout) */
export function SkeletonMonitoringGaugeCard() {
  return (
    <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
      </div>
      <Skeleton className="h-9 w-28 mb-2" />
      <Skeleton className="h-3 w-36 mb-3" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

/** Chart + toolbar strip */
export function SkeletonMonitoringChartBlock() {
  return (
    <div
      className="h-72 rounded-xl border border-[var(--border-subtle)] p-5 flex flex-col gap-4"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Skeleton className="h-5 w-48 max-w-full" />
        <Skeleton className="h-9 w-56 rounded-lg shrink-0" />
      </div>
      <Skeleton className="flex-1 min-h-[140px] rounded-lg w-full" />
    </div>
  );
}

/** Marketplace template tile (~h-52) */
export function SkeletonMarketplaceTemplateCard() {
  return (
    <div
      className="rounded-xl h-52 flex flex-col overflow-hidden"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderRadius: 12,
      }}
    >
      <Skeleton className="h-[120px] w-full rounded-none shrink-0" />
      <div className="p-4 flex-1 flex flex-col gap-2 min-h-0">
        <Skeleton className="h-4 w-[72%]" />
        <Skeleton className="h-3 w-full flex-1 min-h-[32px]" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Billing /plans comparison column */
export function SkeletonPlanCompareCard() {
  return (
    <div
      className="flex flex-col rounded-xl p-5 min-h-[300px]"
      style={{
        background: 'var(--bg-secondary)',
        borderWidth: '2px 1px 1px 1px',
        borderStyle: 'solid',
        borderColor: 'var(--glass-border)',
        borderRadius: 12,
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-10 w-28 mb-5" />
      <div className="h-px w-full mb-4 shrink-0" style={{ background: 'var(--glass-border)' }} />
      <div className="space-y-2 flex-1">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-lg mt-4 shrink-0" />
    </div>
  );
}

/** Project detail — header, tabs, overview panels */
export function SkeletonProjectDetailPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-in">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-px" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2 shrink-0">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-1 overflow-hidden border-b border-[var(--border-subtle)] pb-px">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-t-lg shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-xl lg:col-span-2" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl w-full" />
    </div>
  );
}

/** Narrow list row — API keys, settings rows */
export function SkeletonKeyValueRow() {
  return (
    <div className="p-5 bg-[var(--bg-secondary)]">
      <Skeleton className="h-5 w-44 max-w-[70%] mb-3" />
      <Skeleton className="h-4 w-full max-w-lg" />
    </div>
  );
}
