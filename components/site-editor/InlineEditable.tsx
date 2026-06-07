'use client';

interface InlineEditableProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export function InlineEditable({
  value,
  onChange,
  className = '',
  multiline,
  placeholder,
}: InlineEditableProps) {
  const Tag = multiline ? 'p' : 'span';

  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      data-placeholder={placeholder}
      className={`outline-none focus:ring-2 focus:ring-[var(--se-primary)]/40 rounded px-0.5 -mx-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--se-muted)] empty:before:opacity-60 ${className}`}
      onBlur={(e) => {
        const next = e.currentTarget.textContent?.trim() ?? '';
        if (next !== value) onChange(next);
      }}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
    >
      {value}
    </Tag>
  );
}
