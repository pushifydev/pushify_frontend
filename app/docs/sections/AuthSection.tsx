'use client';

import { CodeBlock, SectionHeading, Callout } from '../components';
import type { SectionProps } from './shared';

export function AuthSection({ c, apiBase }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionHeading title={c.auth.title} description={c.auth.description} />

      <div>
        <h3 className="text-sm font-semibold docs-h3 mb-2">{c.labels.headerFormat}</h3>
        <CodeBlock code="Authorization: Bearer pk_live_YOUR_API_KEY" />
      </div>

      <div>
        <h3 className="text-sm font-semibold docs-h3 mb-2">{c.labels.exampleRequest}</h3>
        <CodeBlock
          code={`curl -X GET "${apiBase}/projects" \\
  -H "Authorization: Bearer pk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
          language="bash"
        />
      </div>

      <div>
        <h2 className="docs-h2">{c.labels.availableScopes}</h2>
        <p className="text-sm docs-muted-sm mb-4">
          {c.labels.scopesIntro}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {c.auth.scopes.map((item) => (
            <div
              key={item.scope}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg docs-card-sm"
            >
              <code className="docs-inline-code shrink-0">
                {item.scope}
              </code>
              <span className="docs-muted-sm text-xs">{item.desc}</span>
            </div>
          ))}
        </div>
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
