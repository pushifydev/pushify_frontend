'use client';

import Link from 'next/link';
import { Check, Circle, Server, FolderKanban, Rocket, ArrowRight, X } from 'lucide-react';
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

const STEPS: { id: StepId; href: string; icon: typeof Server }[] = [
  { id: 'server', href: '/dashboard/servers/new', icon: Server },
  { id: 'project', href: '/dashboard/projects/new', icon: FolderKanban },
  { id: 'deploy', href: '/dashboard/projects/new', icon: Rocket },
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
    <section
      className="dash-panel !p-0 mb-5 sm:mb-6 overflow-hidden min-w-0"
      aria-label={t('dashboard', 'onboardingTitle')}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-4 border-b border-[var(--border-subtle)]">
        <div>
          <p className="text-sm font-semibold">{t('dashboard', 'onboardingTitle')}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard', 'onboardingSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="text-xs font-medium tabular-nums"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {completedCount}/{STEPS.length}
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label={t('dashboard', 'onboardingDismiss')}
          >
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      <ol className="divide-y divide-[var(--border-subtle)]">
        {STEPS.map((step, index) => {
          const done = stepDone(step.id, progress);
          const prevDone = index === 0 || stepDone(STEPS[index - 1].id, progress);
          const Icon = step.icon;
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
            <li key={step.id} className="flex items-stretch">
              <div
                className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 min-w-0"
                style={{ opacity: prevDone || done ? 1 : 0.55 }}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                    done
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {done ? (
                    <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                  ) : (
                    <Icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t('dashboard', titleKey)}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {t('dashboard', descKey)}
                  </p>
                </div>
                {!done && prevDone && (
                  <Link
                    href={step.href}
                    className="btn btn-primary text-xs shrink-0 w-full sm:w-auto justify-center"
                  >
                    {t('dashboard', 'onboardingContinue')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {!done && !prevDone && (
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {t('dashboard', 'onboardingLocked')}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="px-4 sm:px-5 py-3 flex flex-wrap gap-x-4 gap-y-2 text-xs" style={{ background: 'var(--bg-tertiary)' }}>
        <Link href="/docs" className="dash-link hover:underline">
          {t('dashboard', 'onboardingDocs')}
        </Link>
        <Link href="/dashboard/marketplace" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard', 'onboardingMarketplace')}
        </Link>
        <Link href="/dashboard/sites" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard', 'onboardingSiteStudio')}
        </Link>
      </div>
    </section>
  );
}
