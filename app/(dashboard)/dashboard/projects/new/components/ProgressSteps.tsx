'use client';

import { Check } from 'lucide-react';
import type { Step } from './types';

interface ProgressStepsProps {
  steps: { id: Step; label: string; icon?: React.ReactNode }[];
  currentStep: Step;
  currentStepIndex: number;
  setCurrentStep: (step: Step) => void;
}

/** The wizard's steps as the dashboard's underline strip: numbered, done steps ticked, later ones locked. */
export function ProgressSteps({
  steps,
  currentStep,
  currentStepIndex,
  setCurrentStep,
}: ProgressStepsProps) {
  return (
    <nav className="dash-tabs" aria-label="Steps">
      <ol className="flex items-stretch gap-6 min-w-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = step.id === currentStep;
          const reachable = index <= currentStepIndex;

          return (
            <li key={step.id} className="flex">
              <button
                type="button"
                onClick={() => reachable && setCurrentStep(step.id)}
                disabled={!reachable}
                aria-current={isCurrent ? 'step' : undefined}
                className={`dash-tab${isCurrent ? ' is-active' : ''} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 text-[var(--status-success)]" aria-hidden />
                ) : (
                  <span className="tabular-nums opacity-70">{String(index + 1).padStart(2, '0')}</span>
                )}
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
