'use client';

import Link from 'next/link';
import { Zap, Terminal, Shield, Rocket, Folder, Server, Database, ArrowRight } from 'lucide-react';
import { CodeBlock, Callout } from '../components';
import type { DocsSectionId } from '@/lib/i18n/docs';
import type { SectionProps } from './shared';

const exploreSections: DocsSectionId[] = ['projects', 'deployments', 'servers', 'databases'];
const exploreIcons = [Folder, Rocket, Server, Database];

const introFeatureIcons = [
  { icon: Terminal, iconClass: 'text-[var(--lp-ink)]', bgClass: 'bg-[var(--hover-overlay-lg)]' },
  { icon: Shield, iconClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-500/10' },
  { icon: Rocket, iconClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-500/10' },
];

export function IntroSection({
  c,
  apiBase,
  onNavigate,
}: SectionProps & { onNavigate: (s: DocsSectionId) => void }) {
  const step0 = c.intro.steps[0];

  return (
    <div className="space-y-10">
      <div>
        <div className="docs-badge mb-4">
          <Zap className="w-3 h-3" /> {c.intro.badge}
        </div>
        <h1 className="docs-h1">{c.intro.title}</h1>
        <p className="text-lg docs-lead leading-relaxed max-w-2xl">
          {c.intro.lead}
        </p>
        <div className="mt-4 max-w-2xl space-y-3">
          <Callout type="info" title={c.labels.description}>
            {c.intro.idNote}
          </Callout>
          <Callout type="info" title={c.intro.infraNoteTitle}>
            {c.intro.infraNote}
          </Callout>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {c.intro.features.map((f, i) => {
          const meta = introFeatureIcons[i];
          const Icon = meta.icon;
          return (
            <div key={f.title} className="p-5 docs-card">
              <div className={`w-9 h-9 rounded-lg ${meta.bgClass} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${meta.iconClass}`} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--lp-ink)' }}>{f.title}</h3>
              <p className="text-xs docs-muted-sm">{f.desc}</p>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-sm font-semibold docs-h3 mb-2">{c.labels.baseUrl}</h3>
        <CodeBlock code={apiBase} />
      </div>

      <div>
        <h2 className="docs-h2 mb-5">{c.labels.quickStart}</h2>
        <div className="space-y-4">
          {c.intro.steps.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="docs-step-num shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <h4 className="text-sm font-medium" style={{ color: 'var(--lp-ink)' }}>{s.title}</h4>
                <p className="text-sm docs-muted-sm">
                  {i === 0 && step0.linkText ? (
                    <>
                      {step0.descBefore}
                      <Link href="/dashboard/settings" className="docs-link">
                        {step0.linkText}
                      </Link>
                      {step0.descAfter}
                    </>
                  ) : (
                    s.desc
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="docs-h2">{c.labels.explore}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {c.intro.exploreLinks.map((link, i) => {
            const Icon = exploreIcons[i];
            return (
              <button
                key={exploreSections[i]}
                type="button"
                onClick={() => onNavigate(exploreSections[i])}
                className="docs-card-interactive w-full group"
              >
                <Icon className="w-5 h-5 shrink-0 transition-opacity group-hover:opacity-80" style={{ color: 'var(--lp-muted)' }} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--lp-ink)' }}>{link.label}</h4>
                  <p className="text-xs docs-muted-sm">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 transition-opacity group-hover:opacity-80" style={{ color: 'var(--lp-muted)' }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
