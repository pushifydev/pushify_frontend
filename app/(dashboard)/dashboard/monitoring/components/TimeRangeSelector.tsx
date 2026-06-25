'use client';

import { useTranslation } from '@/hooks';

export function TimeRangeSelector({
  selected,
  onChange,
  t,
}: {
  selected: number;
  onChange: (h: number) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const options = [
    { value: 1, label: t('monitoring', 'last1Hour') },
    { value: 6, label: t('monitoring', 'last6Hours') },
    { value: 24, label: t('monitoring', 'last24Hours') },
  ];

  return (
    <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
            selected === opt.value
              ? 'dash-accent-fill'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
