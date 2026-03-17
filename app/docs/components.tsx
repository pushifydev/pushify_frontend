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

// Method Badge
export function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    POST: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    PATCH: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    PUT: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    DELETE: 'bg-red-500/15 text-red-400 border-red-500/25',
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border shrink-0 ${colors[method] || ''}`}
    >
      {method}
    </span>
  );
}

// Code Block with self-contained copy
export function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="p-4 rounded-lg bg-[#08080d] border border-white/[0.06] overflow-x-auto">
        <code className="text-[13px] leading-relaxed font-mono text-white/75">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// Collapsible Endpoint Card
export function EndpointCard({
  method,
  path,
  description,
  scope,
  request,
  response,
  params,
}: {
  method: string;
  path: string;
  description: string;
  scope?: string;
  request?: string;
  response?: string;
  params?: { name: string; type: string; required?: boolean; desc: string }[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-colors hover:border-white/[0.1]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <MethodBadge method={method} />
        <code className="text-white/90 font-mono text-sm flex-1 truncate">{path}</code>
        {scope && (
          <code className="hidden md:inline px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400/60 text-xs font-mono shrink-0">
            {scope}
          </code>
        )}
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.06] pt-4">
          <p className="text-white/50 text-sm leading-relaxed">{description}</p>

          {params && params.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                Parameters
              </h4>
              <div className="rounded-lg border border-white/[0.06] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="text-left px-3 py-2 text-white/40 font-medium text-xs">Name</th>
                      <th className="text-left px-3 py-2 text-white/40 font-medium text-xs">Type</th>
                      <th className="text-left px-3 py-2 text-white/40 font-medium text-xs">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((p) => (
                      <tr key={p.name} className="border-b border-white/[0.04] last:border-0">
                        <td className="px-3 py-2">
                          <code className="text-cyan-400/80 text-xs font-mono">{p.name}</code>
                          {p.required && (
                            <span className="ml-1 text-red-400/60 text-[10px]">*</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-white/40 text-xs font-mono">{p.type}</td>
                        <td className="px-3 py-2 text-white/50 text-xs">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {request && (
            <div>
              <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Request
              </h4>
              <CodeBlock code={request} language="bash" />
            </div>
          )}

          {response && (
            <div>
              <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Response
              </h4>
              <CodeBlock code={response} language="json" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Section heading
export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
      <p className="text-base text-white/50 leading-relaxed max-w-2xl">{description}</p>
    </div>
  );
}

// Info/warning callout
export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: 'info' | 'warning' | 'success';
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  };

  return (
    <div className={`p-4 rounded-xl border ${styles[type]}`}>
      {title && <h4 className="font-semibold mb-1 text-sm">{title}</h4>}
      <div className="text-sm text-white/60 leading-relaxed">{children}</div>
    </div>
  );
}
