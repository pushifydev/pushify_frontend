'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from '@/hooks';

/** A shell command the user runs themselves, with a copy button. */
export function CommandLine({ command }: { command: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — the command stays selectable
    }
  };
  return (
    <div className="flex items-start gap-2 rounded-[10px] border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-3 py-2">
      <code className="terminal-text flex-1 text-xs break-all select-all text-[var(--text-primary)]">{command}</code>
      <button type="button" onClick={copy} className="btn btn-secondary btn-sm shrink-0" aria-label={t('servers', 'copyCommand')}>
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? t('servers', 'commandCopied') : t('servers', 'copyCommand')}
      </button>
    </div>
  );
}
