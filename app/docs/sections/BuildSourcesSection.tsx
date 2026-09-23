'use client';

import { Callout, CodeBlock, SectionHeading } from '../components';
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
      <SectionHeading title={s.title} description={s.description} />

      <div className="space-y-3">
        <h3 className="docs-h3">{s.registriesTitle}</h3>
        <p className="docs-p">{s.registriesText}</p>
        {s.registries.map((registry) => (
          <div key={registry.name} className="space-y-2">
            <p className="docs-p">
              <strong>{registry.name}</strong> — <code>{registry.host}</code>
            </p>
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
        <h3 className="docs-h3">{s.imageTitle}</h3>
        <p className="docs-p">{s.imageText}</p>
        <CodeBlock code={s.imageExample} />
        <ul className="docs-ol" style={{ listStyle: 'disc' }}>
          {s.imageNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="docs-h3">{s.composeTitle}</h3>
        <p className="docs-p">{s.composeText}</p>
        <CodeBlock code={s.composeExample} />
        <ul className="docs-ol" style={{ listStyle: 'disc' }}>
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
