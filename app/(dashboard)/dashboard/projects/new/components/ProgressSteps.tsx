'use client';

import { Check } from 'lucide-react';
import type { Step } from './types';

interface ProgressStepsProps {
  steps: { id: Step; label: string; icon: React.ReactNode }[];
  currentStep: Step;
  currentStepIndex: number;
  setCurrentStep: (step: Step) => void;
}

export function ProgressSteps({
  steps,
  currentStep,
  currentStepIndex,
  setCurrentStep,
}: ProgressStepsProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--border-subtle)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = step.id === currentStep;

          return (
            <button
              key={step.id}
              onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
              disabled={index > currentStepIndex}
              className={`relative z-10 flex flex-col items-center gap-2 ${
                index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted
                  ? 'dash-accent-fill'
                  : isCurrent
                    ? 'bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                }
              `}>
                {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
              }`}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
