'use client';

import { Callout, CodeBlock, DocsHeading, SectionHeading } from '../components';
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
      <SectionHeading id="sso" title={s.title} description={s.description} />

      <div className="space-y-3">
        <DocsHeading id="sso-before">{s.beforeTitle}</DocsHeading>
        <p className="docs-p">{s.beforeText}</p>
        <CodeBlock code={s.redirectExample} title={s.redirectLabel} />
        <Callout type="warning" title={s.redirectWarningTitle}>
          {s.redirectWarning}
        </Callout>
      </div>

      {s.providers.map((provider) => (
        <div key={provider.name} className="space-y-3">
          <DocsHeading id={`sso-${provider.slug}`}>{provider.name}</DocsHeading>
          <ol className="docs-ol">
            {provider.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <CodeBlock code={provider.issuer} title={s.issuerLabel} />
        </div>
      ))}

      <div className="space-y-3">
        <DocsHeading id="sso-finish">{s.finishTitle}</DocsHeading>
        <ol className="docs-ol">
          {s.finishSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <DocsHeading id="sso-require">{s.enforceTitle}</DocsHeading>
        <p className="docs-p">{s.enforceText}</p>
        <Callout type="warning" title={s.lockoutTitle}>
          {s.lockoutText}
        </Callout>
      </div>

      <div className="space-y-3">
        <DocsHeading id="sso-troubleshooting">{s.troubleTitle}</DocsHeading>
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
