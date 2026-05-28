'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type BillingSectionProps = {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function BillingSection({
  icon: Icon,
  iconColor = 'var(--accent-cyan)',
  title,
  description,
  action,
  children,
}: BillingSectionProps) {
  return (
    <div className="dash-panel p-4 sm:p-6 space-y-5">
      <div className={`flex gap-3 ${description ? 'items-start' : 'items-center'}`}>
        <div
          className="w-10 h-10 rounded-lg dash-section-icon"
          style={{ background: 'var(--dash-accent-bg)' }}
        >
          <Icon className="w-5 h-5 shrink-0" style={{ color: iconColor }} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          {description && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
