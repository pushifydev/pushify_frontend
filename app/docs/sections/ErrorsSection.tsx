'use client';

import { CodeBlock, SectionHeading } from '../components';
import type { SectionProps } from './shared';

const statusCodeColors: Record<string, string> = {
  '200': 'text-emerald-600 dark:text-emerald-400',
  '201': 'text-emerald-600 dark:text-emerald-400',
  '400': 'text-amber-600 dark:text-amber-400',
  '401': 'text-red-600 dark:text-red-400',
  '403': 'text-red-600 dark:text-red-400',
  '404': 'text-red-600 dark:text-red-400',
  '429': 'text-orange-600 dark:text-orange-400',
  '500': 'text-red-600 dark:text-red-400',
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
              <tr className="border-b">
                <th className="text-left px-4 py-3 docs-muted-sm font-medium text-xs">{c.labels.code}</th>
                <th className="text-left px-4 py-3 docs-muted-sm font-medium text-xs">{c.labels.description}</th>
              </tr>
            </thead>
            <tbody>
              {c.errors.statusRows.map((item) => (
                <tr key={item.code} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold text-sm ${statusCodeColors[item.code]}`}>{item.code}</span>
                  </td>
                  <td className="px-4 py-3 docs-muted">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="docs-h2 mb-3">{c.errors.responseFormatTitle}</h2>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {c.errors.errorCodes.map((item) => (
            <div
              key={item.code}
              className="flex items-start gap-3 px-3.5 py-3 rounded-lg docs-card-sm"
            >
              <code className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono shrink-0">
                {item.code}
              </code>
              <span className="docs-muted-sm text-xs leading-relaxed">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="docs-h2 mb-3">{c.errors.rateLimitsTitle}</h2>
        <p className="text-sm docs-muted-sm mb-4">
          {c.errors.rateLimitsIntro}
        </p>
        <div className="docs-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3 docs-muted-sm font-medium text-xs">{c.labels.plan}</th>
                <th className="text-left px-4 py-3 docs-muted-sm font-medium text-xs">{c.labels.rateLimit}</th>
              </tr>
            </thead>
            <tbody>
              {c.errors.rateLimitRows.map((item) => (
                <tr key={item.plan} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--lp-ink)' }}>{item.plan}</td>
                  <td className="px-4 py-3 docs-muted font-mono text-xs">{item.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs docs-muted-sm mt-3">
          {c.errors.rateLimitFooter}
        </p>
      </div>

      <div>
        <h2 className="docs-h2 mb-3">{c.errors.exampleTitle}</h2>
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
