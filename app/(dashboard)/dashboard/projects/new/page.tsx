'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  GitBranch,
  Loader2,
  Rocket,
  Settings,
  Terminal,
} from 'lucide-react';
import {
  useCreateProject,
  useTranslation,
  useServers,
} from '@/hooks';
import { toast } from 'sonner';
import { createDeployment, getApiErrorMessage } from '@/lib/api';
import { buildGitWebhookUrl } from '@/lib/build-webhook-url';
import type { CreateProjectInput } from '@/lib/api';
import { FRAMEWORKS } from '@/lib/frameworks';
import {
  ProgressSteps,
  ImportSourceStep,
  ConfigureStep,
  EnvironmentStep,
  ReviewStep,
  WebhookSecretModal,
  type Step,
  type EnvVariable,
} from './components';
import { useImportSource } from './hooks';

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const createProject = useCreateProject();

  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [isCreating, setIsCreating] = useState(false);
  const [webhookSecretDialog, setWebhookSecretDialog] = useState<{
    projectId: string;
    secret: string;
    webhookUrl: string;
  } | null>(null);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [buildCommand, setBuildCommand] = useState('');
  const [installCommand, setInstallCommand] = useState('npm install');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [startCommand, setStartCommand] = useState('');
  const [rootDirectory, setRootDirectory] = useState('./');
  const [port, setPort] = useState<number | undefined>(3000);
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | undefined>(undefined);

  // Servers
  const { data: servers = [], isLoading: isLoadingServers } = useServers();
  const availableServers = servers.filter(
    (s) => s.status === 'running' && s.setupStatus === 'completed'
  );

  useEffect(() => {
    const fromQuery = searchParams.get('serverId');
    if (fromQuery) setSelectedServerId(fromQuery);
  }, [searchParams]);

  // Import source (git/github/gitlab/template) state + logic
  const importSource = useImportSource({ projectName, setProjectName });
  const {
    sourceType,
    repositoryUrl,
    gitBranch,
    frameworkDetection,
  } = importSource;

  // "Deploy to Pushify" button entry (/new?repo=…): prefill the git source so the
  // visitor lands on a wizard that already knows what to build. /new has already
  // validated the URL; this only trusts https.
  useEffect(() => {
    const repo = searchParams.get('repo');
    if (!repo || !repo.startsWith('https://')) return;
    importSource.setSourceType('git');
    importSource.setRepositoryUrl(repo);
    const branch = searchParams.get('branch');
    if (branch) importSource.setGitBranch(branch);
    const tail = repo.replace(/\/+$/, '').split('/').pop()?.replace(/\.git$/, '');
    if (tail) setProjectName((current) => current || tail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'source', label: t('newProject', 'importSource'), icon: <GitBranch className="w-4 h-4" /> },
    { id: 'configure', label: t('newProject', 'configure'), icon: <Settings className="w-4 h-4" /> },
    { id: 'environment', label: t('newProject', 'envVars'), icon: <Terminal className="w-4 h-4" /> },
    { id: 'review', label: t('newProject', 'review'), icon: <Rocket className="w-4 h-4" /> },
  ];

  const stepOrder: Step[] = ['source', 'configure', 'environment', 'review'];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  // Apply framework defaults when selected
  useEffect(() => {
    if (selectedFramework) {
      const framework = FRAMEWORKS.find(f => f.id === selectedFramework);
      if (framework) {
        setBuildCommand(framework.buildCommand);
        setInstallCommand(framework.installCommand);
        setOutputDirectory(framework.outputDirectory);
        if (framework.startCommand) setStartCommand(framework.startCommand);
      }
    }
  }, [selectedFramework]);

  // Apply framework detection results
  useEffect(() => {
    if (frameworkDetection?.framework) {
      const detectedId = frameworkDetection.framework.toLowerCase();
      const matchedFramework = FRAMEWORKS.find(f =>
        f.id === detectedId || f.name.toLowerCase() === detectedId
      );
      if (matchedFramework) {
        setSelectedFramework(matchedFramework.id);
      }
      if (frameworkDetection.buildCommand) setBuildCommand(frameworkDetection.buildCommand);
      if (frameworkDetection.installCommand) setInstallCommand(frameworkDetection.installCommand);
      if (frameworkDetection.outputDirectory) setOutputDirectory(frameworkDetection.outputDirectory);
      if (frameworkDetection.startCommand) setStartCommand(frameworkDetection.startCommand);
    }
  }, [frameworkDetection]);

  const canProceed = () => {
    switch (currentStep) {
      case 'source':
        if (sourceType === 'template') return !!selectedFramework;
        if (sourceType === 'github') return !!importSource.selectedRepo && !!gitBranch;
        if (sourceType === 'gitlab') return !!importSource.selectedGitLabRepo && !!gitBranch;
        return repositoryUrl.trim().length > 0;
      case 'configure':
        return projectName.trim().length > 0 && selectedFramework !== null;
      case 'environment':
        return true; // Optional step
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextIndex]);
    }
  };

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(stepOrder[prevIndex]);
    }
  };

  const addEnvVariable = () => {
    setEnvVariables([
      ...envVariables,
      { id: crypto.randomUUID(), key: '', value: '', isSecret: false },
    ]);
  };

  const updateEnvVariable = (id: string, field: keyof EnvVariable, value: string | boolean) => {
    setEnvVariables(envVariables.map(env =>
      env.id === id ? { ...env, [field]: value } : env
    ));
  };

  const removeEnvVariable = (id: string) => {
    setEnvVariables(envVariables.filter(env => env.id !== id));
  };

  const finalizeCreation = async (projectId: string) => {
    await createDeployment(projectId, {
      branch: gitBranch || undefined,
    });
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleSubmit = async () => {
    setIsCreating(true);

    try {
      const input: CreateProjectInput = {
        name: projectName,
        description: description || undefined,
        gitRepoUrl: repositoryUrl || undefined,
        gitBranch: gitBranch || undefined,
        gitProvider:
          sourceType === 'github'
            ? 'github'
            : sourceType === 'gitlab'
              ? 'gitlab'
              : repositoryUrl.includes('github.com')
                ? 'github'
                : repositoryUrl.includes('gitlab')
                  ? 'gitlab'
                  : repositoryUrl.includes('bitbucket.org')
                    ? 'bitbucket'
                    : undefined,
        framework: selectedFramework || undefined,
        buildCommand: buildCommand || undefined,
        installCommand: installCommand || undefined,
        outputDirectory: outputDirectory || undefined,
        startCommand: startCommand || undefined,
        rootDirectory: rootDirectory !== './' ? rootDirectory : undefined,
        port: port,
        autoDeploy,
        serverId: selectedServerId,
      };

      const result = await createProject.mutateAsync(input);

      if (!result?.id) {
        return;
      }

      const secret = result.webhookSecret?.trim();
      if (secret) {
        const webhookUrl = buildGitWebhookUrl(
          result.id,
          input.gitProvider,
          input.gitRepoUrl
        );
        setWebhookSecretDialog({ projectId: result.id, secret, webhookUrl });
        return;
      }

      await finalizeCreation(result.id);
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(t('common', 'operationFailed'), {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyWebhookUrl = async () => {
    if (!webhookSecretDialog) return;
    await navigator.clipboard.writeText(webhookSecretDialog.webhookUrl);
    toast.success(t('newProject', 'webhookUrlCopied'));
  };

  const copyWebhookSecret = async () => {
    if (!webhookSecretDialog) return;
    await navigator.clipboard.writeText(webhookSecretDialog.secret);
    toast.success(t('newProject', 'webhookSecretCopied'));
  };

  const closeWebhookDialogAndDeploy = async () => {
    if (!webhookSecretDialog) return;
    const { projectId } = webhookSecretDialog;
    setWebhookSecretDialog(null);
    setIsCreating(true);
    try {
      await finalizeCreation(projectId);
    } catch (error) {
      console.error('Failed to start deployment:', error);
      toast.error(t('common', 'operationFailed'), {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
    <div className="max-w-4xl mx-auto animate-slide-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('projects', 'title')}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[var(--text-primary)]">{t('newProject', 'title')}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t('newProject', 'title')}</h1>
        <p className="text-[var(--text-secondary)]">{t('newProject', 'subtitle')}</p>
      </div>

      {/* Progress Steps */}
      <ProgressSteps
        steps={steps}
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        setCurrentStep={setCurrentStep}
      />

      {/* Step Content */}
      <div className="p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        {/* Step 1: Import Source */}
        {currentStep === 'source' && (
          <ImportSourceStep
            sourceType={importSource.sourceType}
            setSourceType={importSource.setSourceType}
            repositoryUrl={importSource.repositoryUrl}
            setRepositoryUrl={importSource.setRepositoryUrl}
            gitBranch={importSource.gitBranch}
            setGitBranch={importSource.setGitBranch}
            selectedRepo={importSource.selectedRepo}
            setSelectedRepo={importSource.setSelectedRepo}
            repoSearchQuery={importSource.repoSearchQuery}
            setRepoSearchQuery={importSource.setRepoSearchQuery}
            selectedGitLabRepo={importSource.selectedGitLabRepo}
            setSelectedGitLabRepo={importSource.setSelectedGitLabRepo}
            gitlabRepoSearchQuery={importSource.gitlabRepoSearchQuery}
            setGitlabRepoSearchQuery={importSource.setGitlabRepoSearchQuery}
            githubStatus={importSource.githubStatus}
            isLoadingGitHubStatus={importSource.isLoadingGitHubStatus}
            githubConnect={importSource.githubConnect}
            githubAppInstall={importSource.githubAppInstall}
            appInstallations={importSource.appInstallations}
            githubBusy={importSource.githubBusy}
            handleDisconnectGithub={importSource.handleDisconnectGithub}
            handleChangeGithubAccount={importSource.handleChangeGithubAccount}
            gitlabStatus={importSource.gitlabStatus}
            isLoadingGitLabStatus={importSource.isLoadingGitLabStatus}
            gitlabConnect={importSource.gitlabConnect}
            gitlabBusy={importSource.gitlabBusy}
            handleDisconnectGitlab={importSource.handleDisconnectGitlab}
            handleChangeGitlabAccount={importSource.handleChangeGitlabAccount}
            isLoadingRepos={importSource.isLoadingRepos}
            hasMore={importSource.hasMore}
            loadMore={importSource.loadMore}
            isLoadingMore={importSource.isLoadingMore}
            githubBranches={importSource.githubBranches}
            isLoadingBranches={importSource.isLoadingBranches}
            filteredRepos={importSource.filteredRepos}
            isLoadingGitLabRepos={importSource.isLoadingGitLabRepos}
            gitlabHasMore={importSource.gitlabHasMore}
            gitlabLoadMore={importSource.gitlabLoadMore}
            isLoadingMoreGitlab={importSource.isLoadingMoreGitlab}
            gitlabBranches={importSource.gitlabBranches}
            isLoadingGitLabBranches={importSource.isLoadingGitLabBranches}
            filteredGitlabRepos={importSource.filteredGitlabRepos}
            frameworkDetection={importSource.frameworkDetection}
            isDetectingFramework={importSource.isDetectingFramework}
            selectedFramework={selectedFramework}
            setSelectedFramework={setSelectedFramework}
            setProjectName={setProjectName}
          />
        )}

        {/* Step 2: Configure */}
        {currentStep === 'configure' && (
          <ConfigureStep
            projectName={projectName}
            setProjectName={setProjectName}
            description={description}
            setDescription={setDescription}
            selectedFramework={selectedFramework}
            setSelectedFramework={setSelectedFramework}
            rootDirectory={rootDirectory}
            setRootDirectory={setRootDirectory}
            installCommand={installCommand}
            setInstallCommand={setInstallCommand}
            buildCommand={buildCommand}
            setBuildCommand={setBuildCommand}
            outputDirectory={outputDirectory}
            setOutputDirectory={setOutputDirectory}
            startCommand={startCommand}
            setStartCommand={setStartCommand}
            port={port}
            setPort={setPort}
            isLoadingServers={isLoadingServers}
            availableServers={availableServers}
            selectedServerId={selectedServerId}
            setSelectedServerId={setSelectedServerId}
          />
        )}

        {/* Step 3: Environment Variables */}
        {currentStep === 'environment' && (
          <EnvironmentStep
            envVariables={envVariables}
            addEnvVariable={addEnvVariable}
            updateEnvVariable={updateEnvVariable}
            removeEnvVariable={removeEnvVariable}
          />
        )}

        {/* Step 4: Review */}
        {currentStep === 'review' && (
          <ReviewStep
            projectName={projectName}
            description={description}
            selectedFramework={selectedFramework}
            gitBranch={gitBranch}
            repositoryUrl={repositoryUrl}
            rootDirectory={rootDirectory}
            installCommand={installCommand}
            buildCommand={buildCommand}
            outputDirectory={outputDirectory}
            envVariables={envVariables}
            autoDeploy={autoDeploy}
            setAutoDeploy={setAutoDeploy}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-subtle)]">
          <button
            onClick={goPrev}
            disabled={currentStepIndex === 0}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common', 'back')}
          </button>

          {currentStep !== 'review' ? (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common', 'continue')}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isCreating || !canProceed()}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('newProject', 'creating')}
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  {t('newProject', 'createAndDeploy')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>

    <WebhookSecretModal
      webhookSecretDialog={webhookSecretDialog}
      isCreating={isCreating}
      closeWebhookDialogAndDeploy={closeWebhookDialogAndDeploy}
      copyWebhookUrl={copyWebhookUrl}
      copyWebhookSecret={copyWebhookSecret}
    />
    </>
  );
}
