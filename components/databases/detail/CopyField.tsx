'use client';

import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { iconButtonClass } from './_shared';

export function CopyField({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
  mono = true,
  masked,
  onToggleMask,
  copyValue,
}: {
  label: string;
  /** what is shown; may be masked */
  value: string;
  /** what the copy button puts on the clipboard; defaults to `value` */
  copyValue?: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (value: string, key: string) => void;
  mono?: boolean;
  masked?: boolean;
  onToggleMask?: () => void;
}) {
  const { t } = useTranslation();
  const copied = copiedField === fieldKey;
  const maskLabel = masked ? t('databases', 'showCredentials') : t('databases', 'hideCredentials');
  const copyLabel = copied ? t('databases', 'copied') : `${t('databases', 'copyField')} · ${label}`;

  return (
    <div className="space-y-1.5 min-w-0">
      <span className="dash-section-label block">{label}</span>
      <div
        className="flex items-center gap-1 rounded-[10px] pl-3 pr-1 py-1"
        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
      >
        <span
          className={`flex-1 min-w-0 truncate text-[13px] ${mono ? 'font-mono' : ''}`}
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </span>
        {onToggleMask && (
          <button
            type="button"
            onClick={onToggleMask}
            className={iconButtonClass}
            aria-label={maskLabel}
            aria-pressed={!masked}
            title={maskLabel}
          >
            {masked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => onCopy(copyValue ?? value, fieldKey)}
          className={iconButtonClass}
          style={copied ? { color: 'var(--status-success)' } : undefined}
          aria-label={copyLabel}
          title={copyLabel}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
