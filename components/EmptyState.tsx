'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="rounded-xl p-12 text-center"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
    >
      <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
      <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto 20px' }}>
        {description}
      </p>
      {action && (
        <Link href={action.href} className="btn btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}
