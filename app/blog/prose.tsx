import type { ReactNode } from 'react';
import Link from 'next/link';
import type { BlogBlock } from '@/lib/blog';

/**
 * Server-rendered prose for blog posts. Inline markdown subset:
 * **bold**, `code`, [text](url). Links to pushify.dev render as <Link>.
 */

const INLINE_RE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE_RE).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx}>{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const internal = href.startsWith('/');
      return internal ? (
        <Link key={idx} href={href}>
          {label}
        </Link>
      ) : (
        <a key={idx} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    return part;
  });
}

export function BlogProse({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="blog-prose">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2 key={idx} id={block.id}>
                {renderInline(block.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={idx} id={block.id}>
                {renderInline(block.text)}
              </h3>
            );
          case 'p':
            return <p key={idx}>{renderInline(block.text)}</p>;
          case 'ul':
            return (
              <ul key={idx}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={idx}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case 'pre':
            return (
              <pre key={idx} data-lang={block.lang || undefined}>
                <code>{block.code}</code>
              </pre>
            );
          case 'quote':
            return <blockquote key={idx}>{renderInline(block.text)}</blockquote>;
          case 'hr':
            return <hr key={idx} />;
        }
      })}
    </div>
  );
}
