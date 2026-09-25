'use client';

import { CodeBlock, SectionHeading, DocsHeading } from '../components';
import type { SectionProps } from './shared';

const statusCodeColors: Record<string, string> = {
  // The -600 shades measured 3.0–3.5:1 on the light canvas, under the 4.5:1 body-text floor.
  '200': 'text-emerald-700 dark:text-emerald-400',
  '201': 'text-emerald-700 dark:text-emerald-400',
  '400': 'text-amber-700 dark:text-amber-400',
  '401': 'text-red-700 dark:text-red-400',
  '403': 'text-red-700 dark:text-red-400',
  '404': 'text-red-700 dark:text-red-400',
  '429': 'text-orange-700 dark:text-orange-400',
  '500': 'text-red-700 dark:text-red-400',
};

export function ErrorsSection({ c, apiBase }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionHeading id="errors" title={c.errors.title} description={c.errors.description} />

      <div>
        <DocsHeading id="errors-status-codes">{c.errors.httpStatusTitle}</DocsHeading>
        <div className="docs-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{c.labels.code}</th>
                <th scope="col">{c.labels.description}</th>
              </tr>
            </thead>
            <tbody>
              {c.errors.statusRows.map((item) => (
                <tr key={item.code}>
                  <td className="docs-td-name">
                    <span className={`docs-status ${statusCodeColors[item.code] ?? ''}`}>{item.code}</span>
                  </td>
                  <td>{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <DocsHeading id="errors-response-format">{c.errors.responseFormatTitle}</DocsHeading>
        <CodeBlock
          code={`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired API key"
  }
}`}
          language="json"
        />
      </div>

      <div>
        <DocsHeading id="errors-codes">{c.errors.commonCodesTitle}</DocsHeading>
        <dl className="docs-rows">
          {c.errors.errorCodes.map((item) => (
            <div key={item.code}>
              <dt>
                <code className="docs-inline-code">{item.code}</code>
              </dt>
              <dd className="docs-muted-sm">{item.desc}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <DocsHeading id="errors-rate-limits">{c.errors.rateLimitsTitle}</DocsHeading>
        <p className="docs-muted mb-5">
          {c.errors.rateLimitsIntro}
        </p>
        <div className="docs-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{c.labels.plan}</th>
                <th scope="col">{c.labels.rateLimit}</th>
              </tr>
            </thead>
            <tbody>
              {c.errors.rateLimitRows.map((item) => (
                <tr key={item.plan}>
                  <td style={{ color: 'var(--hp-ink)' }}>{item.plan}</td>
                  <td className="docs-td-type">{item.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="docs-muted-sm mt-3">
          {c.errors.rateLimitFooter}
        </p>
      </div>

      <div>
        <DocsHeading id="errors-example">{c.errors.exampleTitle}</DocsHeading>
        <CodeBlock
          code={`async function apiRequest(endpoint, options = {}) {
  const response = await fetch('${apiBase}' + endpoint, {
    ...options,
    headers: {
      'Authorization': 'Bearer ' + process.env.PUSHIFY_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}`}
          language="javascript"
        />
      </div>
    </div>
  );
}
