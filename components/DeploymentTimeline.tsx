'use client';

import { Check, Circle, Loader2, X } from 'lucide-react';
import { useTranslation } from '@/hooks';
import {
  getDeploymentTimelineSteps,
  type DeploymentTimelineStep,
} from '@/lib/deployment-utils';
import type { Deployment } from '@/lib/api/types';
import { cn } from '@/lib/utils';

function StepIcon({ state }: { state: DeploymentTimelineStep['state'] }) {
  if (state === 'done') {
    return <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />;
  }
  if (state === 'error') {
    return <X className="w-3.5 h-3.5 text-[var(--status-error)]" />;
  }
  if (state === 'active') {
    return <Loader2 className="w-3.5 h-3.5 text-[var(--accent-cyan)] animate-spin" />;
  }
  return <Circle className="w-3 h-3 text-[var(--text-muted)]" />;
}

export function DeploymentTimeline({ deployment }: { deployment: Deployment }) {
  const { t } = useTranslation();
  const steps = getDeploymentTimelineSteps(deployment);

  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 text-xs text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border-subtle)]">
      {steps.map((step, i) => (
        <li key={step.key} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[var(--border-default)] px-0.5">→</span>}
          <StepIcon state={step.state} />
          <span
            className={cn(
              step.state === 'active' && 'text-[var(--text-primary)] font-medium',
              step.state === 'error' && 'text-[var(--status-error)]',
            )}
          >
            {t('projectDetail', step.labelKey)}
            {step.duration ? ` (${step.duration})` : ''}
          </span>
        </li>
      ))}
    </ol>
  );
}
