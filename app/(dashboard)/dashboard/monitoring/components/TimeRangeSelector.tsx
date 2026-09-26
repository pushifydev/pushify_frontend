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
    <div className="dash-segmented shrink-0" role="group" aria-label={t('monitoring', 'overview')}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={selected === opt.value}
          className="terminal-text text-xs!"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
