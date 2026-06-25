'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  GitBranch,
  Github,
  Globe,
  Loader2,
  Rocket,
  RefreshCw,
  Settings,
  Unlink,
  Zap,
  EyeOff,
  AlertCircle,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  useCreateProject,
  useTranslation,
  useGitHubStatus,
  useGitHubConnect,
  useGitHubDisconnect,
  useGitHubRepos,
  useGitHubBranches,
  useFrameworkDetection,
  useGitLabStatus,
  useGitLabConnect,
  useGitLabDisconnect,
  useGitLabRepos,
  useGitLabBranches,
  useGitLabFrameworkDetection,
  useServers,
} from '@/hooks';
import { toast } from 'sonner';
import { createDeployment, getApiErrorMessage } from '@/lib/api';
import { buildGitWebhookUrl } from '@/lib/build-webhook-url';
import type { CreateProjectInput, GitHubRepo, GitLabRepo } from '@/lib/api';
import { FRAMEWORKS } from '@/lib/frameworks';
import {
  ProgressSteps,
  ConfigureStep,
  EnvironmentStep,
  ReviewStep,
  WebhookSecretModal,
  type Step,
  type EnvVariable,
} from './components';

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
  const [sourceType, setSourceType] = useState<'git' | 'github' | 'gitlab' | 'template'>('git');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('main');
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

  // GitHub-related state
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedGitLabRepo, setSelectedGitLabRepo] = useState<GitLabRepo | null>(null);
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [gitlabRepoSearchQuery, setGitlabRepoSearchQuery] = useState('');

  // GitHub hooks
  const { data: githubStatus, isLoading: isLoadingGitHubStatus } = useGitHubStatus();
  const githubConnect = useGitHubConnect();
  const githubDisconnect = useGitHubDisconnect();
  const githubBusy = githubConnect.isPending || githubDisconnect.isPending;

  const resetGithubSelection = () => {
    setSelectedRepo(null);
    setRepoSearchQuery('');
  };

  const handleDisconnectGithub = async () => {
    try {
      await githubDisconnect.mutateAsync();
      resetGithubSelection();
      toast.success(t('newProject', 'githubDisconnected'));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleChangeGithubAccount = async () => {
    try {
      await githubDisconnect.mutateAsync();
      resetGithubSelection();
      githubConnect.mutate();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const resetGitlabSelection = () => {
    setSelectedGitLabRepo(null);
    setGitlabRepoSearchQuery('');
  };

  const handleDisconnectGitlab = async () => {
    try {
      await gitlabDisconnect.mutateAsync();
      resetGitlabSelection();
      toast.success(t('newProject', 'gitlabDisconnected'));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleChangeGitlabAccount = async () => {
    try {
      await gitlabDisconnect.mutateAsync();
      resetGitlabSelection();
      gitlabConnect.mutate();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const { data: githubRepos, isLoading: isLoadingRepos, hasMore, loadMore, isLoadingMore } = useGitHubRepos({
    enabled: githubStatus?.connected ?? false,
    sort: 'pushed',
    perPage: 30,
  });
  const { data: githubBranches, isLoading: isLoadingBranches } = useGitHubBranches(
    selectedRepo?.full_name.split('/')[0] ?? '',
    selectedRepo?.name ?? '',
    !!selectedRepo
  );
  const { data: githubFrameworkDetection, isLoading: isDetectingGithubFramework } = useFrameworkDetection(
    selectedRepo?.full_name.split('/')[0] ?? '',
    selectedRepo?.name ?? '',
    gitBranch,
    sourceType === 'github' && !!selectedRepo && !!gitBranch,
  );

  const { data: gitlabStatus, isLoading: isLoadingGitLabStatus } = useGitLabStatus();
  const gitlabConnect = useGitLabConnect();
  const gitlabDisconnect = useGitLabDisconnect();
  const gitlabBusy = gitlabConnect.isPending || gitlabDisconnect.isPending;

  const { data: gitlabRepos, isLoading: isLoadingGitLabRepos, hasMore: gitlabHasMore, loadMore: gitlabLoadMore, isLoadingMore: isLoadingMoreGitlab } = useGitLabRepos({
    enabled: (gitlabStatus?.connected ?? false) && sourceType === 'gitlab',
    perPage: 30,
  });
  const { data: gitlabBranches, isLoading: isLoadingGitLabBranches } = useGitLabBranches(
    selectedGitLabRepo?.id ?? 0,
    sourceType === 'gitlab' && !!selectedGitLabRepo,
  );
  const { data: gitlabFrameworkDetection, isLoading: isDetectingGitlabFramework } = useGitLabFrameworkDetection(
    selectedGitLabRepo?.id ?? 0,
    gitBranch,
    sourceType === 'gitlab' && !!selectedGitLabRepo && !!gitBranch,
  );

  const frameworkDetection =
    sourceType === 'gitlab' ? gitlabFrameworkDetection : githubFrameworkDetection;
  const isDetectingFramework =
    sourceType === 'gitlab' ? isDetectingGitlabFramework : isDetectingGithubFramework;

  // Filter repos based on search
  const filteredRepos = githubRepos?.filter(repo =>
    repo.name.toLowerCase().includes(repoSearchQuery.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(repoSearchQuery.toLowerCase())
  ) ?? [];

  const filteredGitlabRepos = gitlabRepos?.filter(repo =>
    repo.name.toLowerCase().includes(gitlabRepoSearchQuery.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(gitlabRepoSearchQuery.toLowerCase())
  ) ?? [];

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'source', label: t('newProject', 'importSource'), icon: <GitBranch className="w-4 h-4" /> },
    { id: 'configure', label: t('newProject', 'configure'), icon: <Settings className="w-4 h-4" /> },
    { id: 'environment', label: t('newProject', 'envVars'), icon: <Terminal className="w-4 h-4" /> },
    { id: 'review', label: t('newProject', 'review'), icon: <Rocket className="w-4 h-4" /> },
  ];

  const stepOrder: Step[] = ['source', 'configure', 'environment', 'review'];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  // Auto-detect project name from repo URL
  useEffect(() => {
    if (repositoryUrl && !projectName) {
      const match = repositoryUrl.match(/\/([^/]+?)(\.git)?$/);
      if (match) {
        setProjectName(match[1].toLowerCase().replace(/[^a-z0-9-]/g, '-'));
      }
    }
  }, [repositoryUrl, projectName]);

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

  // Update repo URL and branch when GitHub repo is selected
  useEffect(() => {
    if (selectedRepo) {
      setRepositoryUrl(selectedRepo.clone_url);
      setGitBranch(selectedRepo.default_branch);
      // Auto-set project name from repo
      if (!projectName) {
        setProjectName(selectedRepo.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
      }
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (selectedGitLabRepo) {
      setRepositoryUrl(selectedGitLabRepo.clone_url);
      setGitBranch(selectedGitLabRepo.default_branch);
      if (!projectName) {
        setProjectName(selectedGitLabRepo.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
      }
    }
  }, [selectedGitLabRepo]);

  const canProceed = () => {
    switch (currentStep) {
      case 'source':
        if (sourceType === 'template') return !!selectedFramework;
        if (sourceType === 'github') return !!selectedRepo && !!gitBranch;
        if (sourceType === 'gitlab') return !!selectedGitLabRepo && !!gitBranch;
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
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t('newProject', 'importSource')}</h2>
              <p className="text-[var(--text-secondary)]">{t('newProject', 'importSourceDesc')}</p>
            </div>

            {/* Source Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setSourceType('git')}
                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                  sourceType === 'git'
                    ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                }`}
              >
                <GitBranch className={`w-8 h-8 mb-3 ${sourceType === 'git' ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`} />
                <h3 className="font-semibold mb-1">{t('newProject', 'gitUrl')}</h3>
                <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'gitUrlDesc')}</p>
              </button>

              <button
                onClick={() => setSourceType('github')}
                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 relative ${
                  sourceType === 'github'
                    ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                }`}
              >
                {githubStatus?.connected && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs bg-[var(--status-success)]/20 text-[var(--status-success)] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {t('newProject', 'connected')}
                  </div>
                )}
                <Github className={`w-8 h-8 mb-3 ${sourceType === 'github' ? 'text-[var(--accent-purple)]' : 'text-[var(--text-muted)]'}`} />
                <h3 className="font-semibold mb-1">{t('newProject', 'connectGithub')}</h3>
                <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'connectGithubDesc')}</p>
              </button>

              <button
                onClick={() => setSourceType('gitlab')}
                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 relative ${
                  sourceType === 'gitlab'
                    ? 'border-orange-500 bg-orange-500/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                }`}
              >
                {gitlabStatus?.connected && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs bg-[var(--status-success)]/20 text-[var(--status-success)] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {t('newProject', 'connected')}
                  </div>
                )}
                <Globe className={`w-8 h-8 mb-3 ${sourceType === 'gitlab' ? 'text-orange-500' : 'text-[var(--text-muted)]'}`} />
                <h3 className="font-semibold mb-1">{t('newProject', 'connectGitlab')}</h3>
                <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'connectGitlabDesc')}</p>
              </button>

              <button
                onClick={() => setSourceType('template')}
                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                  sourceType === 'template'
                    ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                }`}
              >
                <Sparkles className={`w-8 h-8 mb-3 ${sourceType === 'template' ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`} />
                <h3 className="font-semibold mb-1">{t('newProject', 'template')}</h3>
                <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'templateDesc')}</p>
              </button>
            </div>

            {/* Git URL Input */}
            {sourceType === 'git' && (
              <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'repositoryUrl')}</label>
                  <input
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'branch')}</label>
                  <input
                    type="text"
                    value={gitBranch}
                    onChange={(e) => setGitBranch(e.target.value)}
                    placeholder="main"
                    className="input"
                  />
                </div>
              </div>
            )}

            {/* GitHub Connect */}
            {sourceType === 'github' && (
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                {isLoadingGitHubStatus ? (
                  <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-purple)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'checkingGitHub')}</p>
                  </div>
                ) : !githubStatus?.connected ? (
                  <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] text-center">
                    <Github className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{t('newProject', 'githubIntegration')}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-4">{t('newProject', 'githubIntegrationDesc')}</p>
                    <button
                      onClick={() => githubConnect.mutate()}
                      disabled={githubConnect.isPending}
                      className="btn btn-primary"
                    >
                      {githubConnect.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('newProject', 'connecting')}
                        </>
                      ) : (
                        <>
                          <Github className="w-4 h-4" />
                          {t('newProject', 'connectGithubBtn')}
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2 text-sm text-[var(--status-success)] min-w-0">
                        <Check className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {t('newProject', 'connectedAs')}{' '}
                          <span className="font-medium">@{githubStatus.username}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleChangeGithubAccount}
                          disabled={githubBusy}
                          className="btn btn-secondary text-xs py-1.5 px-3"
                        >
                          {githubBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          {t('newProject', 'changeGithubAccount')}
                        </button>
                        <button
                          type="button"
                          onClick={handleDisconnectGithub}
                          disabled={githubBusy}
                          className="btn btn-ghost text-xs py-1.5 px-3 text-[var(--text-secondary)]"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          {t('newProject', 'disconnectGithub')}
                        </button>
                      </div>
                    </div>

                    {/* Search repos */}
                    <div className="relative">
                      <input
                        type="text"
                        value={repoSearchQuery}
                        onChange={(e) => setRepoSearchQuery(e.target.value)}
                        placeholder={t('newProject', 'searchRepos')}
                        className="input pl-10!"
                      />
                      <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    </div>

                    {/* Repository list */}
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)]">
                      {isLoadingRepos ? (
                        <div className="p-6 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-purple)] mx-auto mb-2" />
                          <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'loadingRepos')}</p>
                        </div>
                      ) : filteredRepos.length === 0 ? (
                        <div className="p-6 text-center text-[var(--text-muted)]">
                          {repoSearchQuery ? t('newProject', 'noReposFound') : t('newProject', 'noRepos')}
                        </div>
                      ) : (
                        <>
                          {filteredRepos.map((repo) => (
                            <button
                              key={repo.id}
                              onClick={() => setSelectedRepo(repo)}
                              className={`w-full p-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-tertiary)] transition-colors ${
                                selectedRepo?.id === repo.id ? 'bg-[var(--accent-purple)]/10' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  selectedRepo?.id === repo.id
                                    ? 'bg-[var(--accent-purple)] text-white'
                                    : 'bg-[var(--bg-tertiary)]'
                                }`}>
                                  {repo.private ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Globe className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{repo.name}</div>
                                  <div className="text-xs text-[var(--text-muted)] truncate">
                                    {repo.description || repo.full_name}
                                  </div>
                                </div>
                                {selectedRepo?.id === repo.id && (
                                  <Check className="w-5 h-5 text-[var(--accent-purple)]" />
                                )}
                              </div>
                            </button>
                          ))}
                          {/* Load More Button */}
                          {hasMore && !repoSearchQuery && (
                            <button
                              onClick={() => loadMore()}
                              disabled={isLoadingMore}
                              className="w-full p-3 text-center text-sm text-[var(--accent-purple)] hover:bg-[var(--bg-tertiary)] transition-colors border-t border-[var(--border-subtle)] disabled:opacity-50"
                            >
                              {isLoadingMore ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  {t('newProject', 'loadingMore')}
                                </span>
                              ) : (
                                t('newProject', 'loadMore')
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Branch selection */}
                    {selectedRepo && (
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('newProject', 'branch')}</label>
                        {isLoadingBranches ? (
                          <div className="input flex items-center gap-2 text-[var(--text-muted)]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('newProject', 'loadingBranches')}
                          </div>
                        ) : (
                          <select
                            value={gitBranch}
                            onChange={(e) => setGitBranch(e.target.value)}
                            className="input"
                          >
                            {githubBranches?.map((branch) => (
                              <option key={branch.name} value={branch.name}>
                                {branch.name} {branch.protected && '🔒'}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {/* Framework detection status */}
                    {selectedRepo && gitBranch && (
                      <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-sm">
                        {isDetectingFramework ? (
                          <div className="flex items-center gap-2 text-[var(--text-muted)]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('newProject', 'detectingFramework')}
                          </div>
                        ) : frameworkDetection?.framework ? (
                          <div className="flex items-center gap-2 text-[var(--status-success)]">
                            <Zap className="w-4 h-4" />
                            {t('newProject', 'detectedFramework')}: <span className="font-medium">{frameworkDetection.framework}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[var(--text-muted)]">
                            <AlertCircle className="w-4 h-4" />
                            {t('newProject', 'noFrameworkDetected')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {sourceType === 'gitlab' && (
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                {isLoadingGitLabStatus ? (
                  <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
                    <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'checkingGitLab')}</p>
                  </div>
                ) : !gitlabStatus?.connected ? (
                  <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] text-center">
                    <Globe className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{t('newProject', 'gitlabIntegration')}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-4">{t('newProject', 'gitlabIntegrationDesc')}</p>
                    <button
                      onClick={() => gitlabConnect.mutate()}
                      disabled={gitlabConnect.isPending}
                      className="btn btn-primary"
                    >
                      {gitlabConnect.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('newProject', 'connecting')}
                        </>
                      ) : (
                        t('newProject', 'connectGitlabBtn')
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2 text-sm text-[var(--status-success)] min-w-0">
                        <Check className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {t('newProject', 'connectedAs')}{' '}
                          <span className="font-medium">@{gitlabStatus.username}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleChangeGitlabAccount}
                          disabled={gitlabBusy}
                          className="btn btn-secondary text-xs py-1.5 px-3"
                        >
                          {gitlabBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          {t('newProject', 'changeGitlabAccount')}
                        </button>
                        <button
                          type="button"
                          onClick={handleDisconnectGitlab}
                          disabled={gitlabBusy}
                          className="btn btn-ghost text-xs py-1.5 px-3 text-[var(--text-secondary)]"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          {t('newProject', 'disconnectGitlab')}
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={gitlabRepoSearchQuery}
                        onChange={(e) => setGitlabRepoSearchQuery(e.target.value)}
                        placeholder={t('newProject', 'searchRepos')}
                        className="input pl-10!"
                      />
                      <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    </div>

                    <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)]">
                      {isLoadingGitLabRepos ? (
                        <div className="p-6 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
                          <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'loadingRepos')}</p>
                        </div>
                      ) : filteredGitlabRepos.length === 0 ? (
                        <div className="p-6 text-center text-[var(--text-muted)]">
                          {gitlabRepoSearchQuery ? t('newProject', 'noReposFound') : t('newProject', 'noRepos')}
                        </div>
                      ) : (
                        <>
                          {filteredGitlabRepos.map((repo) => (
                            <button
                              key={repo.id}
                              onClick={() => setSelectedGitLabRepo(repo)}
                              className={`w-full p-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-tertiary)] transition-colors ${
                                selectedGitLabRepo?.id === repo.id ? 'bg-orange-500/10' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{repo.full_name}</div>
                                  <div className="text-xs text-[var(--text-muted)] truncate">
                                    {repo.description || repo.html_url}
                                  </div>
                                </div>
                                {selectedGitLabRepo?.id === repo.id && (
                                  <Check className="w-5 h-5 text-orange-500" />
                                )}
                              </div>
                            </button>
                          ))}
                          {gitlabHasMore && !gitlabRepoSearchQuery && (
                            <button
                              onClick={() => gitlabLoadMore()}
                              disabled={isLoadingMoreGitlab}
                              className="w-full p-3 text-center text-sm text-orange-500 hover:bg-[var(--bg-tertiary)] transition-colors border-t border-[var(--border-subtle)]"
                            >
                              {isLoadingMoreGitlab ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  {t('newProject', 'loadingMore')}
                                </span>
                              ) : (
                                t('newProject', 'loadMore')
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {selectedGitLabRepo && (
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('newProject', 'branch')}</label>
                        {isLoadingGitLabBranches ? (
                          <div className="input flex items-center gap-2 text-[var(--text-muted)]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('newProject', 'loadingBranches')}
                          </div>
                        ) : (
                          <select
                            value={gitBranch}
                            onChange={(e) => setGitBranch(e.target.value)}
                            className="input"
                          >
                            {gitlabBranches?.map((branch) => (
                              <option key={branch.name} value={branch.name}>
                                {branch.name} {branch.protected && '🔒'}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {selectedGitLabRepo && gitBranch && (
                      <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-sm">
                        {isDetectingFramework ? (
                          <div className="flex items-center gap-2 text-[var(--text-muted)]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('newProject', 'detectingFramework')}
                          </div>
                        ) : frameworkDetection?.framework ? (
                          <div className="flex items-center gap-2 text-[var(--status-success)]">
                            <Zap className="w-4 h-4" />
                            {t('newProject', 'detectedFramework')}:{' '}
                            <span className="font-medium">{frameworkDetection.framework}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[var(--text-muted)]">
                            <AlertCircle className="w-4 h-4" />
                            {t('newProject', 'noFrameworkDetected')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Template Selection */}
            {sourceType === 'template' && (
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FRAMEWORKS.slice(0, 6).map((fw) => (
                    <button
                      key={fw.id}
                      onClick={() => {
                        setSelectedFramework(fw.id);
                        setProjectName(`my-${fw.id}-app`);
                      }}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        selectedFramework === fw.id
                          ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                      }`}
                    >
                      <span className="text-3xl mb-2 block">{fw.icon}</span>
                      <span className="font-medium">{fw.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
