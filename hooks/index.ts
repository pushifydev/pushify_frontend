// Projects
export {
  projectKeys,
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useUpdateProjectStatus,
  useWebhookInfo,
  useRegenerateWebhookSecret,
  useInstallGitHubWebhook,
  useUpdateProjectSettings,
} from './useProjects';

// Deployments
export {
  deploymentKeys,
  useDeployments,
  useDeployment,
  useDeploymentLogs,
  useCreateDeployment,
  useCancelDeployment,
  useRedeployDeployment,
  useRollbackDeployment,
} from './useDeployments';

// Deployment Logs Stream
export { useDeploymentLogsStream } from './useDeploymentLogsStream';

// Container Logs Stream
export { useContainerLogsStream } from './useContainerLogsStream';

// Environment Variables
export {
  envVarKeys,
  useEnvVars,
  useCreateEnvVar,
  useUpdateEnvVar,
  useDeleteEnvVar,
  useBulkCreateEnvVars,
  useCloneEnvVars,
} from './useEnvVars';

// Domains
export {
  domainKeys,
  useDomains,
  useDnsSetup,
  useAddDomain,
  useDeleteDomain,
  useSetPrimaryDomain,
  useVerifyDomain,
  useNginxSettings,
  useUpdateNginxSettings,
} from './useDomains';

// GitHub
export {
  githubKeys,
  useGitHubStatus,
  useGitHubRepos,
  useGitHubBranches,
  useFrameworkDetection,
  useGitHubConnect,
  useGitHubCallback,
  useGitHubDisconnect,
} from './useGitHub';

// GitLab
export {
  gitlabKeys,
  useGitLabStatus,
  useGitLabRepos,
  useGitLabBranches,
  useGitLabFrameworkDetection,
  useGitLabConnect,
  useGitLabCallback,
  useGitLabDisconnect,
} from './useGitLab';

// Notifications
export {
  notificationKeys,
  useNotificationChannels,
  useNotificationLogs,
  useCreateNotificationChannel,
  useUpdateNotificationChannel,
  useDeleteNotificationChannel,
  useTestNotificationChannel,
} from './useNotifications';

// Metrics
export {
  metricsKeys,
  useMetricsOverview,
  useMetricsSummary,
  useMetricsTimeSeries,
} from './useMetrics';

// Health Checks
export {
  healthCheckKeys,
  useHealthCheckConfig,
  useHealthCheckLogs,
  useUpdateHealthCheckConfig,
  useDeleteHealthCheckConfig,
} from './useHealthCheck';

// API Keys
export {
  apiKeyKeys,
  useApiKeys,
  useApiKeyScopes,
  useCreateApiKey,
  useUpdateApiKey,
  useRevokeApiKey,
} from './useApiKeys';

// Organization
export {
  organizationKeys,
  useOrganization,
  useOrganizationMembers,
  useMyOrganizations,
  useSwitchOrganization,
  useUpdateOrganization,
  useAddMember,
  useUpdateMemberRole,
  useRemoveMember,
  useOrganizationInvitations,
  useSendInvitation,
  useRevokeInvitation,
  useAcceptInvitation,
} from './useOrganization';

// Billing
export {
  billingKeys,
  useBillingInfo,
  useAvailablePlans,
  useUpdateBillingEmail,
  useSubscriptionStatus,
  useCreateCheckoutSession,
  useCreatePortalSession,
  useCancelSubscription,
  useResumeSubscription,
  useInfraBilling,
  useInfraTopUp,
} from './useBilling';

// Dashboard overview
export { dashboardKeys, useDashboardOverview } from './useDashboardOverview';

// Alerts overview
export { alertsKeys, useAlertsOverview } from './useAlertsOverview';

// Servers
export {
  serverKeys,
  useServers,
  useServer,
  useProviderRegions,
  useProviderImages,
  useProviderSizes,
  useProviderServerTypes,
  useCreateServer,
  useDeleteServer,
  useStartServer,
  useStopServer,
  useRebootServer,
  useSyncServer,
  useServerResizeOptions,
  useResizeServer,
  useUpdateServer,
  useServerSnapshots,
  useCreateServerSnapshot,
  useDeleteServerSnapshot,
  useRestoreServerSnapshot,
  useServerTimeline,
  useServerSshInfo,
  useDownloadServerSshKey,
} from './useServers';

// Databases
export {
  databaseKeys,
  useDatabases,
  useDatabase,
  useDatabaseCredentials,
  useDatabaseTypes,
  useCreateDatabase,
  useUpdateDatabase,
  useDeleteDatabase,
  useConnectDatabase,
  useDisconnectDatabase,
  useToggleExternalAccess,
  useStartDatabase,
  useStopDatabase,
  useRestartDatabase,
  useResetDatabasePassword,
  useDatabaseBackups,
  useCreateDatabaseBackup,
  useRestoreDatabaseBackup,
  useDeleteDatabaseBackup,
} from './useDatabases';

// WebSocket Real-time Events
export {
  useDeploymentStatusEvents,
  useMetricsPushEvents,
  useServerStatusEvents,
  useHealthCheckEvents,
  useBackupStatusEvents,
} from './useRealtimeEvents';

// Translation
export { useTranslation } from './useTranslation';
export { useDocsContent } from './useDocsContent';

// 2FA
export {
  twoFactorKeys,
  use2FAStatus,
  useSetup2FA,
  useEnable2FA,
  useDisable2FA,
  useRegenerateBackupCodes,
} from './use2FA';

// Profile
export { useUpdateProfile, useChangePassword } from './useProfile';

// Sessions
export {
  sessionKeys,
  useSessions,
  useTerminateSession,
  useTerminateOtherSessions,
} from './useSessions';

// AI Assistant
export { useAiAssistant, type ChatEntry } from './useAiAssistant';

// Marketplace
export {
  marketplaceKeys,
  useMarketplaceTemplates,
  useMarketplaceTemplate,
  useDeployMarketplaceApp,
  useMarketplaceDeployments,
} from './useMarketplace';

// Site Studio
export {
  siteStudioKeys,
  useSiteStudioTemplates,
  useSiteStudioTemplate,
  useSiteStudioStacks,
  useLaunchSite,
} from './useSiteStudio';

// Site Editor
export {
  siteEditorKeys,
  useSiteEditor,
  useUpdateSiteSeo,
  useUpdateSiteBlocks,
  useUpdateSiteTheme,
  useUpdateSiteCms,
  usePublishSite,
} from './useSiteEditor';
