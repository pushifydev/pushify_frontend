'use client';

import { AlertCircle } from 'lucide-react';

export function AuthErrorAlert({ message }: { message: string }) {
  return (
    <div className="mb-6 p-4 rounded-lg bg-[var(--status-error)]/10 border border-[var(--status-error)]/20 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-[var(--status-error)] shrink-0 mt-0.5" />
      <p className="text-sm text-[var(--status-error)]">{message}</p>
    </div>
  );
}
