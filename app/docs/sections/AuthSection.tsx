'use client';

import { CodeBlock, SectionHeading, Callout, DocsHeading } from '../components';
import type { SectionProps } from './shared';

export function AuthSection({ c, apiBase }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionHeading id="auth" title={c.auth.title} description={c.auth.description} />

      <div className="space-y-3">
        <CodeBlock
          code="Authorization: Bearer pk_live_YOUR_API_KEY"
          language="http"
          title={c.labels.headerFormat}
        />
        <CodeBlock
          title={c.labels.exampleRequest}
          code={`curl -X GET "${apiBase}/projects" \\
  -H "Authorization: Bearer pk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
          language="bash"
        />
      </div>

      <div>
        <DocsHeading id="auth-scopes">{c.labels.availableScopes}</DocsHeading>
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

      <div className="space-y-3">
        <Callout type="warning" title={c.auth.securityTitle}>
          {c.auth.securityText}
        </Callout>
        <Callout type="info" title={c.auth.sessionOnlyTitle}>
          {c.auth.sessionOnlyText}
        </Callout>
      </div>
    </div>
  );
}
