'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  Terminal,
  Code2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useDocsContent } from '@/hooks/useDocsContent';

export function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/25',
    POST: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/25',
    PATCH: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400 dark:border-amber-500/25',
    PUT: 'bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400 dark:border-orange-500/25',
    DELETE: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400 dark:border-red-500/25',
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border shrink-0 ${colors[method] || ''}`}
    >
      {method}
    </span>
  );
}

export function CodeBlock({ code }: { code: string; language?: string }) {
  const { content } = useDocsContent();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="docs-code-block group">
      <pre>
        <code>{code}</code>
      </pre>
      <button type="button" onClick={handleCopy} className="docs-code-copy" aria-label={content.labels.copyCode}>
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export function EndpointCard({
  method,
  path,
  description,
  scope,
  request,
  response,
  params,
  labels: labelsOverride,
}: {
  method: string;
  path: string;
  description: string;
  scope?: string;
  request?: string;
  response?: string;
  params?: { name: string; type: string; required?: boolean; desc: string }[];
  labels?: {
    parameters: string;
    paramName: string;
    paramType: string;
    paramDesc: string;
    request: string;
    response: string;
  };
}) {
  const { content } = useDocsContent();
  const labels = labelsOverride ?? content.labels;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="docs-endpoint-card">
      <button type="button" onClick={() => setExpanded(!expanded)} className="docs-endpoint-header">
        <MethodBadge method={method} />
        <code className="docs-endpoint-path">{path}</code>
        {scope && <code className="docs-scope-badge">{scope}</code>}
        {expanded ? (
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--lp-muted)' }} />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--lp-muted)' }} />
        )}
      </button>

      {expanded && (
        <div
          className="px-4 pb-4 space-y-4 pt-4"
          style={{ borderTop: '1px solid var(--lp-border)' }}
        >
          <p className="docs-muted">{description}</p>

          {params && params.length > 0 && (
            <div>
              <h4 className="docs-h3 uppercase tracking-wider">{labels.parameters}</h4>
              <div className="docs-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{labels.paramName}</th>
                      <th>{labels.paramType}</th>
                      <th>{labels.paramDesc}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((p) => (
                      <tr key={p.name}>
                        <td>
                          <code className="docs-inline-code">{p.name}</code>
                          {p.required && (
                            <span className="ml-1 text-red-500 text-[10px]">*</span>
                          )}
                        </td>
                        <td className="font-mono text-xs" style={{ color: 'var(--lp-muted)' }}>
                          {p.type}
                        </td>
                        <td className="docs-muted-sm">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {request && (
            <div>
              <h4 className="docs-h3 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Terminal className="w-3.5 h-3.5" /> {labels.request}
              </h4>
              <CodeBlock code={request} language="bash" />
            </div>
          )}

          {response && (
            <div>
              <h4 className="docs-h3 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Code2 className="w-3.5 h-3.5" /> {labels.response}
              </h4>
              <CodeBlock code={response} language="json" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SectionHeading({ title, description }: { title: string; description: string }) {
  // h2, not h1 — the page's single h1 lives in IntroSection; 10 h1s flatten the
  // document outline for crawlers and AI section-extractors.
  return (
    <div className="docs-section-heading mb-8">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: 'info' | 'warning' | 'success';
  title?: string;
  children: React.ReactNode;
}) {
  const className =
    type === 'warning'
      ? 'docs-callout-warning'
      : type === 'success'
        ? 'docs-callout-success'
        : 'docs-callout-info';

  return (
    <div className={className}>
      {title && <h4 className="font-semibold mb-1 text-sm" style={{ color: 'var(--lp-ink)' }}>{title}</h4>}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
