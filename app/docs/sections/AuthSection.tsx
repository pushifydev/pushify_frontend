'use client';

import { CodeBlock, SectionHeading, Callout } from '../components';
import type { SectionProps } from './shared';

export function AuthSection({ c, apiBase }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionHeading title={c.auth.title} description={c.auth.description} />

      <div>
        <h3 className="docs-label">{c.labels.headerFormat}</h3>
        <CodeBlock code="Authorization: Bearer pk_live_YOUR_API_KEY" />
      </div>

      <div>
        <h3 className="docs-label">{c.labels.exampleRequest}</h3>
        <CodeBlock
          code={`curl -X GET "${apiBase}/projects" \\
  -H "Authorization: Bearer pk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
          language="bash"
        />
      </div>

      <div>
        <h2 className="docs-h2">{c.labels.availableScopes}</h2>
        <p className="docs-muted mb-5">
          {c.labels.scopesIntro}
        </p>
        <dl className="docs-rows">
          {c.auth.scopes.map((item) => (
            <div key={item.scope}>
              <dt>
                <code className="docs-inline-code">{item.scope}</code>
              </dt>
              <dd className="docs-muted-sm">{item.desc}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Callout type="warning" title={c.auth.securityTitle}>
        {c.auth.securityText}
      </Callout>

      <Callout type="info" title={c.auth.sessionOnlyTitle}>
        {c.auth.sessionOnlyText}
      </Callout>
    </div>
  );
}
