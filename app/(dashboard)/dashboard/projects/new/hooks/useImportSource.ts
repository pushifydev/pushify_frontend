'use client';

import { useState, useEffect } from 'react';
import {
  useTranslation,
  useGitHubStatus,
  useGitHubConnect,
  useGitHubAppInstall,
  useGitHubAppInstallations,
  useGitHubAppRepositories,
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
} from '@/hooks';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api';
import type { GitHubRepo, GitLabRepo } from '@/lib/api';
import type { GitHubAppRepository } from '@/lib/api/services/github.service';

interface UseImportSourceArgs {
  projectName: string;
  setProjectName: (value: string) => void;
}

export function useImportSource({ projectName, setProjectName }: UseImportSourceArgs) {
  const { t } = useTranslation();

  // Form state
  const [sourceType, setSourceType] = useState<'git' | 'github' | 'gitlab' | 'template'>('git');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('main');

  // GitHub-related state
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedGitLabRepo, setSelectedGitLabRepo] = useState<GitLabRepo | null>(null);
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [gitlabRepoSearchQuery, setGitlabRepoSearchQuery] = useState('');

  // GitHub hooks
  const { data: githubStatus, isLoading: isLoadingGitHubStatus } = useGitHubStatus();
  const githubConnect = useGitHubConnect();
  // The App is the preferred path; the hook reports whether the platform has one configured.
  const { data: appInstallations } = useGitHubAppInstallations();
  const githubAppInstall = useGitHubAppInstall();

  // ── GitHub App repo picker ──
  // Installations are org-scoped and outlive the person who set them up, so when one
  // exists it is the default source of repositories; OAuth stays available as a fallback.
  const [selectedAppInstallationId, setSelectedAppInstallationId] = useState<number | null>(null);
  const [selectedAppRepo, setSelectedAppRepo] = useState<GitHubAppRepository | null>(null);
  const [appRepoSearchQuery, setAppRepoSearchQuery] = useState('');
  const [preferOAuthPicker, setPreferOAuthPicker] = useState(false);
  const installations = appInstallations?.installations ?? [];
  const hasAppInstallation = installations.length > 0;
  const useAppPicker = hasAppInstallation && !preferOAuthPicker;

  useEffect(() => {
    if (selectedAppInstallationId !== null) return;
    const first = installations.find((i) => !i.suspended) ?? installations[0];
    if (first) setSelectedAppInstallationId(first.installationId);
  }, [installations, selectedAppInstallationId]);

  const { data: appRepos, isLoading: isLoadingAppRepos, error: appReposError } = useGitHubAppRepositories(
    useAppPicker ? selectedAppInstallationId : null,
  );
  const filteredAppRepos = (appRepos ?? []).filter((repo) =>
    repo.fullName.toLowerCase().includes(appRepoSearchQuery.toLowerCase()),
  );

  const selectAppRepo = (repo: GitHubAppRepository) => {
    setSelectedAppRepo(repo);
    setSelectedRepo(null);
    setRepositoryUrl(repo.htmlUrl);
    setGitBranch(repo.defaultBranch || 'main');
    if (!projectName) {
      const name = repo.fullName.split('/').pop() ?? '';
      setProjectName(name.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
    }
  };
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

  // Auto-detect project name from repo URL
  useEffect(() => {
    if (repositoryUrl && !projectName) {
      const match = repositoryUrl.match(/\/([^/]+?)(\.git)?$/);
      if (match) {
        setProjectName(match[1].toLowerCase().replace(/[^a-z0-9-]/g, '-'));
      }
    }
  }, [repositoryUrl, projectName]);

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

  return {
    // Source type
    sourceType,
    setSourceType,

    // Resolved values consumed downstream (configure/review/submit/canProceed)
    repositoryUrl,
    setRepositoryUrl,
    gitBranch,
    setGitBranch,

    // GitHub selection + search
    selectedRepo,
    setSelectedRepo,
    repoSearchQuery,
    setRepoSearchQuery,

    // GitLab selection + search
    selectedGitLabRepo,
    setSelectedGitLabRepo,
    gitlabRepoSearchQuery,
    setGitlabRepoSearchQuery,

    // GitHub status / connect
    githubStatus,
    isLoadingGitHubStatus,
    githubConnect,
    githubAppInstall,
    appInstallations,
    hasAppInstallation,
    useAppPicker,
    setPreferOAuthPicker,
    installations,
    selectedAppInstallationId,
    setSelectedAppInstallationId,
    selectedAppRepo,
    selectAppRepo,
    appRepoSearchQuery,
    setAppRepoSearchQuery,
    filteredAppRepos,
    isLoadingAppRepos,
    appReposError,
    githubBusy,
    handleDisconnectGithub,
    handleChangeGithubAccount,

    // GitLab status / connect
    gitlabStatus,
    isLoadingGitLabStatus,
    gitlabConnect,
    gitlabBusy,
    handleDisconnectGitlab,
    handleChangeGitlabAccount,

    // GitHub repos / branches
    isLoadingRepos,
    hasMore,
    loadMore,
    isLoadingMore,
    githubBranches,
    isLoadingBranches,
    filteredRepos,

    // GitLab repos / branches
    isLoadingGitLabRepos,
    gitlabHasMore,
    gitlabLoadMore,
    isLoadingMoreGitlab,
    gitlabBranches,
    isLoadingGitLabBranches,
    filteredGitlabRepos,

    // Framework detection
    frameworkDetection,
    isDetectingFramework,
  };
}
