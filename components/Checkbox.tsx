'use client';

import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, description, disabled }: CheckboxProps) {
  return (
    <div
      className={`flex items-start gap-3 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!disabled) onChange(!checked); }}
    >
      <div
        className="mt-0.5 w-[18px] h-[18px] shrink-0 rounded-[5px] flex items-center justify-center transition-all duration-150"
        style={{
          background: checked ? 'var(--accent-cyan)' : 'transparent',
          border: checked ? '1.5px solid var(--accent-cyan)' : '1.5px solid var(--border-strong)',
          boxShadow: checked ? '0 0 0 2px rgba(99,102,241,0.15)' : 'none',
        }}
      >
        {checked && <Check className="w-3 h-3" style={{ color: '#020206' }} strokeWidth={3} />}
      </div>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <span className="text-sm font-medium block" style={{ color: 'var(--text-primary)' }}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs block mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
