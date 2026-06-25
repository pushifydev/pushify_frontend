'use client';

import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { STATUS_COLORS } from '@/lib/constants';

export function CopyField({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
  mono = true,
  masked,
  onToggleMask,
}: {
  label: string;
  value: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (value: string, key: string) => void;
  mono?: boolean;
  masked?: boolean;
  onToggleMask?: () => void;
}) {
  const copied = copiedField === fieldKey;
  return (
    <div className="space-y-1.5">
      <span
        style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </span>
      <div
        className="flex items-center gap-1 rounded-lg pl-3 pr-1 py-2"
        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
      >
        <span
          className={`flex-1 min-w-0 truncate text-sm ${mono ? 'font-mono' : ''}`}
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </span>
        {onToggleMask && (
          <button
            type="button"
            onClick={onToggleMask}
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--hover-overlay)]"
            style={{ color: 'var(--text-muted)' }}
          >
            {masked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => onCopy(value, fieldKey)}
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--hover-overlay)]"
          style={{ color: copied ? STATUS_COLORS.success : 'var(--text-muted)' }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
