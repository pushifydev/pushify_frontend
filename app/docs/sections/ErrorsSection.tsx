'use client';

import { CodeBlock, SectionHeading } from '../components';
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
      <SectionHeading title={c.errors.title} description={c.errors.description} />

      <div>
        <h2 className="docs-h2">{c.errors.httpStatusTitle}</h2>
        <div className="docs-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>{c.labels.code}</th>
                <th>{c.labels.description}</th>
              </tr>
            </thead>
            <tbody>
              {c.errors.statusRows.map((item) => (
                <tr key={item.code}>
                  <td>
                    <span className={`font-mono font-medium text-sm ${statusCodeColors[item.code]}`}>{item.code}</span>
                  </td>
                  <td>{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="docs-h2">{c.errors.responseFormatTitle}</h2>
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
        <h2 className="docs-h2">{c.errors.commonCodesTitle}</h2>
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
        <h2 className="docs-h2">{c.errors.rateLimitsTitle}</h2>
        <p className="docs-muted mb-5">
          {c.errors.rateLimitsIntro}
        </p>
        <div className="docs-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>{c.labels.plan}</th>
                <th>{c.labels.rateLimit}</th>
              </tr>
            </thead>
            <tbody>
              {c.errors.rateLimitRows.map((item) => (
                <tr key={item.plan}>
                  <td style={{ color: 'var(--hp-ink)' }}>{item.plan}</td>
                  <td className="font-mono text-xs">{item.limit}</td>
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
        <h2 className="docs-h2">{c.errors.exampleTitle}</h2>
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
