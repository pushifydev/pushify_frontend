'use client';

import type { ReactNode } from 'react';

/** The catalogue's long descriptions use a little markdown: paragraphs, `- ` lists and **bold**. */
function bold(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-medium" style={{ color: 'var(--lp-ink, var(--text-primary))' }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

export function LongDescription({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed" style={{ color: 'var(--lp-body, var(--text-secondary))' }}>
      {text.split(/\n\s*\n/).map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim());
        if (lines.length > 0 && lines.every((l) => /^\s*[-*] /.test(l))) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1.5 marker:text-[var(--lp-muted,var(--text-muted))]">
              {lines.map((l, j) => (
                <li key={j}>{bold(l.replace(/^\s*[-*] /, ''))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{bold(lines.join(' '))}</p>;
      })}
    </div>
  );
}
