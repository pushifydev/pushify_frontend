'use client';

import Link from 'next/link';
import { Terminal, Shield, Rocket, Folder, Server, Database, ArrowRight } from 'lucide-react';
import { CodeBlock, Callout, DocsHeading } from '../components';
import type { DocsSectionId } from '@/lib/i18n/docs';
import type { SectionProps } from './shared';

const exploreSections: DocsSectionId[] = ['projects', 'deployments', 'servers', 'databases'];
const exploreIcons = [Folder, Rocket, Server, Database];

const introFeatureIcons = [Terminal, Shield, Rocket];

export function IntroSection({
  c,
  apiBase,
  onNavigate,
}: SectionProps & { onNavigate: (s: DocsSectionId) => void }) {
  const step0 = c.intro.steps[0];

  return (
    <div className="space-y-10">
      <div>
        <p className="lp-label">{c.intro.badge}</p>
        <h1 className="docs-h1">{c.intro.title}</h1>
        <p className="docs-lead">{c.intro.lead}</p>
        <div className="mt-8 max-w-2xl space-y-3">
          <Callout type="info" title={c.intro.idNoteTitle}>
            {c.intro.idNote}
          </Callout>
          <Callout type="info" title={c.intro.infraNoteTitle}>
            {c.intro.infraNote}
          </Callout>
        </div>
      </div>

      <div className="hp-rule-grid grid-cols-1 sm:grid-cols-3">
        {c.intro.features.map((f, i) => {
          const Icon = introFeatureIcons[i] ?? Terminal;
          return (
            <div key={f.title} className="docs-cell">
              <Icon className="docs-cell-icon" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="docs-cell-title">{f.title}</h3>
              <p className="docs-muted-sm mt-1">{f.desc}</p>
            </div>
          );
        })}
      </div>

      <CodeBlock code={apiBase} title={c.labels.baseUrl} />

      <div>
        <DocsHeading id="intro-quick-start">{c.labels.quickStart}</DocsHeading>
        <ol className="docs-steps">
          {c.intro.steps.map((s, i) => (
            <li key={i}>
              <span className="docs-step-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h4 className="docs-cell-title">{s.title}</h4>
                <p className="docs-muted-sm mt-0.5">
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
            </li>
          ))}
        </ol>
      </div>

      <div>
        <DocsHeading id="intro-explore">{c.labels.explore}</DocsHeading>
        <div className="hp-rule-grid grid-cols-1 sm:grid-cols-2">
          {c.intro.exploreLinks.map((link, i) => {
            const Icon = exploreIcons[i];
            return (
              <button
                key={exploreSections[i]}
                type="button"
                onClick={() => onNavigate(exploreSections[i])}
                className="docs-cell group"
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} style={{ color: 'var(--hp-ink)' }} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <h3 className="docs-cell-title">{link.label}</h3>
                  <p className="docs-muted-sm">{link.desc}</p>
                </div>
                <ArrowRight
                  className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  style={{ color: 'var(--hp-muted)' }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
