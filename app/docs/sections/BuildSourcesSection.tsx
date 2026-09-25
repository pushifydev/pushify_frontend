'use client';

import { Callout, CodeBlock, DocsHeading, SectionHeading } from '../components';
import type { SectionProps } from './shared';

/**
 * Three ways to get code onto a server — a repository, a ready image, or a compose stack — and
 * the credentials each needs. Like the SSO guide, the parts that go wrong are outside Pushify:
 * a registry token with the wrong scope looks identical to a typo until the build fails.
 */
export function BuildSourcesSection({ c }: SectionProps) {
  const s = c.buildSources;

  return (
    <div className="space-y-8">
      <SectionHeading id="buildSources" title={s.title} description={s.description} />

      <div className="space-y-3">
        <DocsHeading id="build-sources-registries">{s.registriesTitle}</DocsHeading>
        <p className="docs-p">{s.registriesText}</p>
        {s.registries.map((registry) => (
          <div key={registry.name} className="pt-3">
            <h4 className="docs-h3">
              {registry.name} <code className="docs-inline-code ml-1 align-middle">{registry.host}</code>
            </h4>
            <ol className="docs-ol">
              {registry.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
        <Callout type="info" title={s.registryScopeTitle}>
          {s.registryScopeText}
        </Callout>
      </div>

      <div className="space-y-3">
        <DocsHeading id="build-sources-image">{s.imageTitle}</DocsHeading>
        <p className="docs-p">{s.imageText}</p>
        <CodeBlock code={s.imageExample} title={s.imageRefLabel} />
        <ul className="docs-ul">
          {s.imageNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <DocsHeading id="build-sources-compose">{s.composeTitle}</DocsHeading>
        <p className="docs-p">{s.composeText}</p>
        <CodeBlock code={s.composeExample} language="yaml" title="compose.yaml" />
        <ul className="docs-ul">
          {s.composeNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
        <Callout type="warning" title={s.composePortsTitle}>
          {s.composePortsText}
        </Callout>
      </div>
    </div>
  );
}
