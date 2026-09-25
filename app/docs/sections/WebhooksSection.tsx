'use client';

import { CodeBlock, SectionHeading, Callout, DocsHeading } from '../components';
import type { SectionProps } from './shared';

export function WebhooksSection({ c, apiBase }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionHeading id="webhooks" title={c.webhooks.title} description={c.webhooks.description} />

      <div>
        <DocsHeading id="webhooks-how-it-works">{c.webhooks.howItWorks}</DocsHeading>
        <ol className="docs-steps">
          {c.webhooks.steps.map((s, i) => (
            <li key={i}>
              <span className="docs-step-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h4 className="docs-cell-title">{s.title}</h4>
                <p className="docs-muted-sm mt-0.5">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <DocsHeading id="webhooks-manual">{c.webhooks.manualTitle}</DocsHeading>
        <p className="docs-muted mb-4">
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
          language="http"
        />
      </div>

      <div>
        <DocsHeading id="webhooks-github-actions">{c.webhooks.githubTitle}</DocsHeading>
        <p className="docs-muted mb-4">
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
          title=".github/workflows/deploy.yml"
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
