'use client';

import { useState, useEffect } from 'react';
import {
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
} from '@/hooks';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api';
import type { GitHubRepo, GitLabRepo } from '@/lib/api';

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
