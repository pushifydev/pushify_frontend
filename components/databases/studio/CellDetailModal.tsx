'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Modal } from '@/components/Modal';
import type { T } from './_shared';

interface CellDetailModalProps {
  column: string;
  value: unknown;
  onClose: () => void;
  t: T;
}

/** Pretty-print JSON, including JSON that arrived as a string. */
function formatValue(value: unknown): { text: string; isJson: boolean } {
  if (value === null || value === undefined) return { text: 'NULL', isJson: false };

  if (typeof value === 'object') {
    return { text: JSON.stringify(value, null, 2), isJson: true };
  }

  const text = String(value);
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return { text: JSON.stringify(JSON.parse(trimmed), null, 2), isJson: true };
    } catch {
      /* not JSON after all */
    }
  }

  return { text, isJson: false };
}

export function CellDetailModal({ column, value, onClose, t }: CellDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const { text, isJson } = formatValue(value);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen onClose={onClose} title={column} description={isJson ? 'JSON' : undefined} maxWidth="2xl">
      <div className="space-y-3">
        <pre
          className="text-xs whitespace-pre-wrap break-words rounded-lg px-3 py-3 max-h-[55vh] overflow-auto"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-secondary)',
          }}
        >
          {text}
        </pre>

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={copy} className="btn btn-secondary text-sm">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t('databases', 'copied') : t('databases', 'studioCopyValue')}
          </button>
          <button type="button" onClick={onClose} className="btn btn-primary text-sm">
            {t('common', 'close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
