'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Plus,
  Rocket,
  Settings,
  Trash2,
  Zap,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Box,
  Terminal,
  FolderCode,
  Server,
} from 'lucide-react';
import {
  useCreateProject,
  useTranslation,
  useGitHubStatus,
  useGitHubConnect,
  useGitHubRepos,
  useGitHubBranches,
  useFrameworkDetection,
  useServers,
} from '@/hooks';
import { createDeployment } from '@/lib/api';
import type { CreateProjectInput, GitHubRepo } from '@/lib/api';
import { FRAMEWORKS } from '@/lib/frameworks';

type Step = 'source' | 'configure' | 'environment' | 'review';

interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const createProject = useCreateProject();

  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [sourceType, setSourceType] = useState<'git' | 'github' | 'template'>('git');
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

  // GitHub-related state
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [repoSearchQuery, setRepoSearchQuery] = useState('');

  // GitHub hooks
  const { data: githubStatus, isLoading: isLoadingGitHubStatus } = useGitHubStatus();
  const githubConnect = useGitHubConnect();
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
  const { data: frameworkDetection, isLoading: isDetectingFramework } = useFrameworkDetection(
    selectedRepo?.full_name.split('/')[0] ?? '',
    selectedRepo?.name ?? '',
    gitBranch,
    !!selectedRepo && !!gitBranch
  );

  // Filter repos based on search
  const filteredRepos = githubRepos?.filter(repo =>
    repo.name.toLowerCase().includes(repoSearchQuery.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(repoSearchQuery.toLowerCase())
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

  const canProceed = () => {
    switch (currentStep) {
      case 'source':
        if (sourceType === 'template') return !!selectedFramework;
        if (sourceType === 'github') return !!selectedRepo && !!gitBranch;
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

  const handleSubmit = async () => {
    setIsCreating(true);

    try {
      const input: CreateProjectInput = {
        name: projectName,
        description: description || undefined,
        gitRepoUrl: repositoryUrl || undefined,
        gitBranch: gitBranch || undefined,
        gitProvider: repositoryUrl.includes('github.com') ? 'github' :
                     repositoryUrl.includes('gitlab.com') ? 'gitlab' :
                     repositoryUrl.includes('bitbucket.org') ? 'bitbucket' : undefined,
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

      if (result?.id) {
        // Trigger initial deployment (backend will use project's gitBranch or git default)
        await createDeployment(result.id, {
          branch: gitBranch || undefined,
        });
      }

      router.push(`/dashboard/projects/${result?.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      setIsCreating(false);
    }
  };

  return (
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
                    ? 'bg-[var(--accent-cyan)] text-[var(--bg-primary)]'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {/* Connected status */}
                    <div className="flex items-center gap-2 text-sm text-[var(--status-success)]">
                      <Check className="w-4 h-4" />
                      {t('newProject', 'connectedAs')} <span className="font-medium">@{githubStatus.username}</span>
                    </div>

                    {/* Search repos */}
                    <div className="relative">
                      <input
                        type="text"
                        value={repoSearchQuery}
                        onChange={(e) => setRepoSearchQuery(e.target.value)}
                        placeholder={t('newProject', 'searchRepos')}
                        className="input pl-10"
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
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t('newProject', 'configureProject')}</h2>
              <p className="text-[var(--text-secondary)]">{t('newProject', 'configureProjectDesc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('newProject', 'projectName')} *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="my-awesome-project"
                  className="input"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">{t('newProject', 'projectNameHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('newProject', 'description')}</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('newProject', 'descriptionPlaceholder')}
                  className="input"
                />
              </div>
            </div>

            {/* Framework Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">{t('newProject', 'framework')} *</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {FRAMEWORKS.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw.id)}
                    className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                      selectedFramework === fw.id
                        ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{fw.icon}</span>
                    <span className="text-xs font-medium">{fw.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Build Settings */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-lg font-semibold mb-4">{t('newProject', 'buildSettings')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'rootDirectory')}</label>
                  <input
                    type="text"
                    value={rootDirectory}
                    onChange={(e) => setRootDirectory(e.target.value)}
                    placeholder="./"
                    className="input terminal-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'installCommand')}</label>
                  <input
                    type="text"
                    value={installCommand}
                    onChange={(e) => setInstallCommand(e.target.value)}
                    placeholder="npm install"
                    className="input terminal-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'buildCommand')}</label>
                  <input
                    type="text"
                    value={buildCommand}
                    onChange={(e) => setBuildCommand(e.target.value)}
                    placeholder="npm run build"
                    className="input terminal-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'outputDirectory')}</label>
                  <input
                    type="text"
                    value={outputDirectory}
                    onChange={(e) => setOutputDirectory(e.target.value)}
                    placeholder="dist"
                    className="input terminal-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'startCommand')}</label>
                  <input
                    type="text"
                    value={startCommand}
                    onChange={(e) => setStartCommand(e.target.value)}
                    placeholder="npm start"
                    className="input terminal-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'port')}</label>
                  <input
                    type="number"
                    value={port || ''}
                    onChange={(e) => setPort(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="3000"
                    className="input terminal-text"
                  />
                </div>
              </div>
            </div>

            {/* Deployment Server Selection */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-[var(--accent-cyan)]" />
                {t('newProject', 'deploymentServer')}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {t('newProject', 'deploymentServerDesc')}
              </p>

              {isLoadingServers ? (
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('newProject', 'loadingServers')}
                </div>
              ) : availableServers.length === 0 ? (
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)]">
                  <p className="text-sm text-[var(--text-muted)]">
                    {t('newProject', 'noServersAvailable')}
                  </p>
                  <Link href="/dashboard/servers" className="text-sm text-[var(--accent-cyan)] hover:underline">
                    {t('newProject', 'createServerLink')}
                  </Link>
                </div>
              ) : (
                <div>
                  <select
                    value={selectedServerId || ''}
                    onChange={(e) => setSelectedServerId(e.target.value || undefined)}
                    className="input w-full max-w-md"
                  >
                    <option value="">{t('newProject', 'noServerSelected')}</option>
                    {availableServers.map((server) => (
                      <option key={server.id} value={server.id}>
                        {server.name} ({server.ipv4})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {t('newProject', 'serverSelectionHint')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Environment Variables */}
        {currentStep === 'environment' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t('newProject', 'envVariables')}</h2>
              <p className="text-[var(--text-secondary)]">{t('newProject', 'envVariablesDesc')}</p>
            </div>

            <div className="space-y-3">
              {envVariables.map((env) => (
                <EnvVariableRow
                  key={env.id}
                  env={env}
                  onUpdate={(field, value) => updateEnvVariable(env.id, field, value)}
                  onRemove={() => removeEnvVariable(env.id)}
                />
              ))}

              <button
                onClick={addEnvVariable}
                className="w-full p-4 rounded-xl border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-cyan)] text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('newProject', 'addEnvVariable')}
              </button>
            </div>

            {envVariables.length === 0 && (
              <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] text-center">
                <Terminal className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)]">{t('newProject', 'noEnvVariables')}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">{t('newProject', 'envVariablesLater')}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t('newProject', 'reviewDeploy')}</h2>
              <p className="text-[var(--text-secondary)]">{t('newProject', 'reviewDeployDesc')}</p>
            </div>

            {/* Project Summary */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[var(--bg-tertiary)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center">
                    <Box className="w-7 h-7 text-[var(--bg-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{projectName}</h3>
                    <p className="text-[var(--text-muted)]">{description || t('newProject', 'noDescription')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[var(--text-muted)]">{t('newProject', 'framework')}:</span>
                    <span className="ml-2 font-medium">
                      {FRAMEWORKS.find(f => f.id === selectedFramework)?.name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">{t('newProject', 'branch')}:</span>
                    <span className="ml-2 font-medium terminal-text">{gitBranch || 'main'}</span>
                  </div>
                  {repositoryUrl && (
                    <div className="col-span-2">
                      <span className="text-[var(--text-muted)]">{t('newProject', 'repository')}:</span>
                      <span className="ml-2 font-medium terminal-text text-[var(--accent-cyan)]">{repositoryUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Build Configuration */}
              <div className="p-5 rounded-xl border border-[var(--border-subtle)]">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FolderCode className="w-4 h-4 text-[var(--accent-cyan)]" />
                  {t('newProject', 'buildConfig')}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[var(--text-muted)]">{t('newProject', 'rootDirectory')}:</span>
                    <span className="ml-2 terminal-text">{rootDirectory}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">{t('newProject', 'installCommand')}:</span>
                    <span className="ml-2 terminal-text">{installCommand || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">{t('newProject', 'buildCommand')}:</span>
                    <span className="ml-2 terminal-text">{buildCommand || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">{t('newProject', 'outputDirectory')}:</span>
                    <span className="ml-2 terminal-text">{outputDirectory || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Environment Variables */}
              {envVariables.length > 0 && (
                <div className="p-5 rounded-xl border border-[var(--border-subtle)]">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[var(--accent-purple)]" />
                    {t('newProject', 'envVariables')} ({envVariables.length})
                  </h4>
                  <div className="space-y-2">
                    {envVariables.map((env) => (
                      <div key={env.id} className="flex items-center gap-2 text-sm">
                        <span className="terminal-text text-[var(--accent-cyan)]">{env.key}</span>
                        <span className="text-[var(--text-muted)]">=</span>
                        <span className="terminal-text">
                          {env.isSecret ? '••••••••' : env.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto Deploy Toggle */}
              <div className="p-5 rounded-xl border border-[var(--border-subtle)]">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <h4 className="font-semibold">{t('newProject', 'autoDeploy')}</h4>
                    <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'autoDeployDesc')}</p>
                  </div>
                  <button
                    onClick={() => setAutoDeploy(!autoDeploy)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      autoDeploy ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      autoDeploy ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </label>
              </div>
            </div>
          </div>
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
  );
}

// Environment Variable Row Component
function EnvVariableRow({
  env,
  onUpdate,
  onRemove,
}: {
  env: EnvVariable;
  onUpdate: (field: keyof EnvVariable, value: string | boolean) => void;
  onRemove: () => void;
}) {
  const [showValue, setShowValue] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)]">
      <input
        type="text"
        value={env.key}
        onChange={(e) => onUpdate('key', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
        placeholder="KEY_NAME"
        className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm terminal-text"
      />
      <span className="text-[var(--text-muted)]">=</span>
      <div className="flex-1 relative">
        <input
          type={showValue ? 'text' : 'password'}
          value={env.value}
          onChange={(e) => onUpdate('value', e.target.value)}
          placeholder="value"
          className="w-full px-3 py-2 pr-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm terminal-text"
        />
        <button
          onClick={() => setShowValue(!showValue)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        >
          {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
        <input
          type="checkbox"
          checked={env.isSecret}
          onChange={(e) => onUpdate('isSecret', e.target.checked)}
          className="rounded border-[var(--border-default)]"
        />
        {t('newProject', 'secret')}
      </label>
      <button
        onClick={onRemove}
        className="p-2 text-[var(--text-muted)] hover:text-[var(--status-error)] transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
