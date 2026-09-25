'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';
import { useDocsContent } from '@/hooks/useDocsContent';

export function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/25',
    POST: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/25',
    PATCH: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400 dark:border-amber-500/25',
    PUT: 'bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400 dark:border-orange-500/25',
    DELETE: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400 dark:border-red-500/25',
  };

  return <span className={`docs-method ${colors[method] || ''}`}>{method}</span>;
}

/** What the title bar says when a block has no filename of its own. */
const LANGUAGE_LABELS: Record<string, string> = {
  bash: 'shell',
  json: 'json',
  yaml: 'yaml',
  javascript: 'javascript',
  http: 'http',
  text: 'text',
};

/**
 * The marketing kit's `.hp-code` panel with a working title bar: a name on the left
 * (a filename, or what the block is), the language on the right, then a copy button.
 */
export function CodeBlock({
  code,
  language,
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  const { content } = useDocsContent();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context, permissions) — the code stays selectable.
    }
  };

  const lang = language ? (LANGUAGE_LABELS[language] ?? language) : undefined;

  return (
    <div className="hp-code docs-code">
      <div className="hp-code-title docs-code-bar">
        {title && <span className="docs-code-name">{title}</span>}
        {lang && lang !== title && <span className="docs-code-lang">{lang}</span>}
        <button
          type="button"
          onClick={handleCopy}
          className="docs-code-copy"
          aria-label={copied ? content.labels.copied : content.labels.copyCode}
          data-copied={copied || undefined}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span aria-hidden="true">{copied ? content.labels.copied : content.labels.copy}</span>
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
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
    <div className="docs-endpoint-card" data-open={expanded || undefined}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="docs-endpoint-header"
        aria-expanded={expanded}
      >
        <MethodBadge method={method} />
        <code className="docs-endpoint-path">{path}</code>
        {scope && <code className="docs-scope-badge">{scope}</code>}
        <ChevronDown className="docs-endpoint-chevron" aria-hidden="true" />
      </button>

      {expanded && (
        <div className="docs-endpoint-body">
          <p className="docs-muted">{description}</p>
          {scope && (
            <p className="docs-endpoint-scope md:hidden">
              <code className="docs-scope-badge docs-scope-badge-inline">{scope}</code>
            </p>
          )}

          {params && params.length > 0 && (
            <div>
              <h4 className="docs-label">{labels.parameters}</h4>
              <div className="docs-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">{labels.paramName}</th>
                      <th scope="col">{labels.paramType}</th>
                      <th scope="col">{labels.paramDesc}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((p) => (
                      <tr key={p.name}>
                        <td className="docs-td-name">
                          <code>{p.name}</code>
                          {p.required && <span className="docs-required">{content.labels.required}</span>}
                        </td>
                        <td className="docs-td-type">{p.type}</td>
                        <td>{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {request && <CodeBlock code={request} language="bash" title={labels.request} />}
          {response && <CodeBlock code={response} language="json" title={labels.response} />}
        </div>
      )}
    </div>
  );
}

/** The link that appears next to a heading on hover, so any heading can be shared. */
function HeadingAnchor({ id, label }: { id: string; label: string }) {
  return (
    <a href={`#${id}`} className="docs-anchor" aria-label={`${label}: ${id}`}>
      #
    </a>
  );
}

export function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  const { content } = useDocsContent();
  // h2, not h1 — the page's single h1 lives in IntroSection; 10 h1s flatten the
  // document outline for crawlers and AI section-extractors.
  return (
    <div className="docs-section-heading">
      <h2 id={id} className="docs-heading">
        {title}
        <HeadingAnchor id={id} label={content.labels.linkToSection} />
      </h2>
      <p>{description}</p>
    </div>
  );
}

/** A sub-section title under a hairline, with an anchor. `size="sm"` is a group inside one. */
export function DocsHeading({
  id,
  children,
  size = 'md',
}: {
  id: string;
  children: ReactNode;
  size?: 'md' | 'sm';
}) {
  const { content } = useDocsContent();
  const Tag = size === 'sm' ? 'h4' : 'h3';
  return (
    <Tag id={id} className={`docs-heading ${size === 'sm' ? 'docs-h3' : 'docs-h2'}`}>
      {children}
      <HeadingAnchor id={id} label={content.labels.linkToSection} />
    </Tag>
  );
}

export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: 'info' | 'warning' | 'success';
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={`docs-callout docs-callout-${type}`} role="note">
      {title && <p className="docs-callout-title">{title}</p>}
      <div className="docs-callout-body">{children}</div>
    </div>
  );
}
