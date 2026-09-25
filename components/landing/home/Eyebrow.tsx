/** `[ LABEL ]` — the brackets are typographic, not read aloud. */
export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`hp-eyebrow ${className}`}>
      <span aria-hidden="true">[&nbsp;</span>
      {children}
      <span aria-hidden="true">&nbsp;]</span>
    </p>
  );
}
