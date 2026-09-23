'use client';

import { Callout, CodeBlock, SectionHeading } from '../components';
import type { SectionProps } from './shared';

/**
 * A guide rather than an endpoint list. Everything else under /docs describes an API, but SSO
 * is the one feature where the hard part is on the *other* side: nobody can guess what to fill
 * in at Okta or Entra, and getting the redirect URI wrong fails at the very end of the flow
 * with a message from the provider rather than from us.
 */
export function SsoSection({ c }: SectionProps) {
  const s = c.sso;

  return (
    <div className="space-y-8">
      <SectionHeading title={s.title} description={s.description} />

      <div className="space-y-3">
        <h3 className="docs-h3">{s.beforeTitle}</h3>
        <p className="docs-p">{s.beforeText}</p>
        <CodeBlock code={s.redirectExample} />
        <Callout type="warning" title={s.redirectWarningTitle}>
          {s.redirectWarning}
        </Callout>
      </div>

      {s.providers.map((provider) => (
        <div key={provider.name} className="space-y-3">
          <h3 className="docs-h3">{provider.name}</h3>
          <ol className="docs-ol">
            {provider.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <p className="docs-p">
            <strong>{s.issuerLabel}:</strong> <code>{provider.issuer}</code>
          </p>
        </div>
      ))}

      <div className="space-y-3">
        <h3 className="docs-h3">{s.finishTitle}</h3>
        <ol className="docs-ol">
          {s.finishSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h3 className="docs-h3">{s.enforceTitle}</h3>
        <p className="docs-p">{s.enforceText}</p>
        <Callout type="warning" title={s.lockoutTitle}>
          {s.lockoutText}
        </Callout>
      </div>

      <div className="space-y-3">
        <h3 className="docs-h3">{s.troubleTitle}</h3>
        <dl className="docs-dl">
          {s.troubles.map((trouble) => (
            <div key={trouble.problem}>
              <dt>{trouble.problem}</dt>
              <dd>{trouble.fix}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
