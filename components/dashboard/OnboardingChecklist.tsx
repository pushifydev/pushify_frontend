'use client';

import Link from 'next/link';
import { Check, ArrowRight, X } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useState, useEffect } from 'react';

const DISMISS_KEY = 'pushify-onboarding-dismissed';

export interface OnboardingProgress {
  hasServer: boolean;
  hasProject: boolean;
  hasLiveDeploy: boolean;
}

interface OnboardingChecklistProps {
  progress: OnboardingProgress;
}

type StepId = 'server' | 'project' | 'deploy';

const STEPS: { id: StepId; href: string }[] = [
  { id: 'server', href: '/dashboard/servers/new' },
  { id: 'project', href: '/dashboard/projects/new' },
  { id: 'deploy', href: '/dashboard/projects/new' },
];

function stepDone(id: StepId, progress: OnboardingProgress): boolean {
  if (id === 'server') return progress.hasServer;
  if (id === 'project') return progress.hasProject;
  return progress.hasLiveDeploy;
}

export function OnboardingChecklist({ progress }: OnboardingChecklistProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(true);

  const allDone =
    progress.hasServer && progress.hasProject && progress.hasLiveDeploy;

  useEffect(() => {
    if (allDone) return;
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, [allDone]);

  if (allDone || dismissed) {
    return null;
  }

  const completedCount = STEPS.filter((s) => stepDone(s.id, progress)).length;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <section className="min-w-0" aria-labelledby="dash-onboarding-title">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <h2 id="dash-onboarding-title" className="dash-section-label">
          {t('dashboard', 'onboardingTitle')}
          <span className="ml-2 tabular-nums opacity-70">
            {completedCount}/{STEPS.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={dismiss}
          className="dash-icon-action"
          aria-label={t('dashboard', 'onboardingDismiss')}
          title={t('dashboard', 'onboardingDismiss')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <ol className="dash-rows">
        {STEPS.map((step, index) => {
          const done = stepDone(step.id, progress);
          const prevDone = index === 0 || stepDone(STEPS[index - 1].id, progress);
          const titleKey =
            step.id === 'server'
              ? 'onboardingStepServerTitle'
              : step.id === 'project'
                ? 'onboardingStepProjectTitle'
                : 'onboardingStepDeployTitle';
          const descKey =
            step.id === 'server'
              ? 'onboardingStepServerDesc'
              : step.id === 'project'
                ? 'onboardingStepProjectDesc'
                : 'onboardingStepDeployDesc';

          return (
            <li
              key={step.id}
              className="dash-row flex flex-col sm:flex-row sm:items-center gap-3"
              style={{ opacity: prevDone || done ? 1 : 0.55 }}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="w-4 h-5 flex items-center justify-center shrink-0" aria-hidden>
                  {done ? (
                    <Check className="w-3.5 h-3.5 text-[var(--status-success)]" strokeWidth={2.5} />
                  ) : (
                    <span className={`dash-status-dot ${prevDone ? 'is-active' : ''}`} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${done ? 'text-[var(--text-muted)] line-through decoration-[var(--border-default)]' : 'text-[var(--text-primary)]'}`}>
                    {t('dashboard', titleKey)}
                  </p>
                  <p className="text-xs mt-0.5 text-[var(--text-muted)]">{t('dashboard', descKey)}</p>
                </div>
              </div>
              {!done && prevDone && (
                <Link href={step.href} className="btn btn-primary btn-sm shrink-0 justify-center self-start sm:self-auto">
                  {t('dashboard', 'onboardingContinue')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {!done && !prevDone && (
                <span className="dash-section-label shrink-0">{t('dashboard', 'onboardingLocked')}</span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2.5 text-xs">
        <Link href="/docs" className="dash-link">
          {t('dashboard', 'onboardingDocs')}
        </Link>
        <Link href="/dashboard/marketplace" className="dash-link">
          {t('dashboard', 'onboardingMarketplace')}
        </Link>
        <Link href="/dashboard/sites" className="dash-link">
          {t('dashboard', 'onboardingSiteStudio')}
        </Link>
      </div>
    </section>
  );
}
