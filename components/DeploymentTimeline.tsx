'use client';

import { Check, Loader2, X } from 'lucide-react';
import { useTranslation } from '@/hooks';
import {
  getDeploymentTimelineSteps,
  type DeploymentTimelineStep,
} from '@/lib/deployment-utils';
import type { Deployment } from '@/lib/api/types';
import { cn } from '@/lib/utils';

function StepMark({ state }: { state: DeploymentTimelineStep['state'] }) {
  if (state === 'done') {
    return <Check className="w-3 h-3 text-[var(--status-success)]" aria-hidden />;
  }
  if (state === 'error') {
    return <X className="w-3 h-3 text-[var(--status-error)]" aria-hidden />;
  }
  if (state === 'active') {
    return <Loader2 className="w-3 h-3 animate-spin" aria-hidden />;
  }
  return <span className="w-3 text-center opacity-60" aria-hidden>·</span>;
}

/** The pipeline as one quiet mono line: queued / build / deploy / live. */
export function DeploymentTimeline({ deployment }: { deployment: Deployment }) {
  const { t } = useTranslation();
  const steps = getDeploymentTimelineSteps(deployment);

  return (
    <ol className="dash-pipeline mt-3 pt-3 border-t border-[var(--border-subtle)]">
      {steps.map((step, i) => (
        <li key={step.key} className="contents">
          {i > 0 && <span className="dash-pipeline-sep" aria-hidden>/</span>}
          <span
            className={cn(
              'dash-pipeline-step',
              step.state === 'active' && 'is-active',
              step.state === 'error' && 'is-error',
            )}
          >
            <StepMark state={step.state} />
            {t('projectDetail', step.labelKey)}
            {step.duration ? <span className="opacity-70">{step.duration}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
