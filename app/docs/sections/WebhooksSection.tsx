'use client';

import { CodeBlock, SectionHeading, Callout } from '../components';
import type { SectionProps } from './shared';

export function WebhooksSection({ c, apiBase }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionHeading title={c.webhooks.title} description={c.webhooks.description} />

      <div>
        <h2 className="docs-h2">{c.webhooks.howItWorks}</h2>
        <div className="space-y-3">
          {c.webhooks.steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3 docs-card-sm">
              <div className="docs-step-num shrink-0">
                {i + 1}
              </div>
              <div>
                <h4 className="text-sm font-medium" style={{ color: 'var(--lp-ink)' }}>{s.title}</h4>
                <p className="text-xs docs-muted-sm mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="docs-h2">{c.webhooks.manualTitle}</h2>
        <p className="text-sm docs-muted-sm mb-3">
          {c.webhooks.manualDesc}
        </p>
        <CodeBlock
          code={`POST ${apiBase}/webhooks/github/:projectId

Headers:
  X-Hub-Signature-256: sha256=<HMAC signature>
  Content-Type: application/json

Body:
{
  "ref": "refs/heads/main",
  "head_commit": {
    "id": "abc123",
    "message": "Deploy new feature"
  }
}`}
          language="text"
        />
      </div>

      <div>
        <h2 className="docs-h2">{c.webhooks.githubTitle}</h2>
        <p className="text-sm docs-muted-sm mb-3">
          {c.webhooks.githubDesc}
        </p>
        <CodeBlock
          code={`# .github/workflows/deploy.yml
name: Deploy to Pushify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger deployment
        run: |
          curl -X POST "${apiBase}/projects/\${{ secrets.PROJECT_ID }}/deployments" \\
            -H "Authorization: Bearer \${{ secrets.PUSHIFY_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{
              "branch": "main",
              "commitHash": "\${{ github.sha }}",
              "commitMessage": "\${{ github.event.head_commit.message }}"
            }'`}
          language="yaml"
        />
      </div>

      <Callout type="info" title={c.webhooks.secretTitle}>
        {c.webhooks.secretText.split('GET /projects/:id/webhook').map((part, i, arr) =>
          i < arr.length - 1 ? (
            <span key={i}>
              {part}
              <code className="docs-inline-code">GET /projects/:id/webhook</code>
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </Callout>
    </div>
  );
}
