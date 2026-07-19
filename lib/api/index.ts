// Axios Instance & Token Management
export { api, getAccessToken, getRefreshToken, setTokens, clearTokens, API_BASE_URL } from './client';
export { DOCS_API_BASE_URL, PRODUCTION_API_BASE_URL } from './public-url';

export { getApiErrorMessage } from './get-error-message';

// Auth Functions
export {
  login,
  register,
  logout,
  getCurrentUser,
  getGithubLoginUrl,
  githubLoginCallback,
  getGoogleLoginUrl,
  googleLoginCallback,
  sendVerificationEmail,
  verifyEmail,
  authService,
} from './services/auth.service';

// Projects Functions
export {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getWebhookInfo,
  regenerateWebhookSecret,
  installGitHubWebhook,
  updateProjectSettings,
  projectsService,
  type WebhookInfo,
  type WebhookSecret,
  type ProjectSettings,
  wakeProject,
} from './services/projects.service';

// Deployments Functions
export {
  getDeployments,
  getDeployment,
  createDeployment,
  cancelDeployment,
  redeployDeployment,
  rollbackDeployment,
  getDeploymentLogs,
  deploymentsService,
} from './services/deployments.service';

// EnvVars Functions
export {
  getEnvVars,
  createEnvVar,
  updateEnvVar,
  deleteEnvVar,
  bulkCreateEnvVars,
  cloneEnvVars,
  type CloneEnvVarsInput,
  type CloneEnvVarsResult,
  envVarsService,
} from './services/envvars.service';

// Domains Functions
export {
  getDomains,
  addDomain,
  deleteDomain,
  setPrimaryDomain,
  verifyDomain,
  getDnsSetup,
  getNginxSettings,
  updateNginxSettings,
  domainsService,
} from './services/domains.service';

// GitHub Functions
export {
  getGitHubStatus,
  getGitHubAuthUrl,
  connectGitHub,
  disconnectGitHub,
  getGitHubRepos,
  getGitHubBranches,
  detectFramework,
  githubService,
  type GitHubStatus,
  type GitHubRepo,
  type GitHubBranch,
  type FrameworkDetection,
} from './services/github.service';

// GitLab Functions
export {
  getGitLabStatus,
  getGitLabAuthUrl,
  connectGitLab,
  disconnectGitLab,
  getGitLabRepos,
  getGitLabBranches,
  detectGitLabFramework,
  gitlabService,
  type GitLabStatus,
  type GitLabRepo,
  type GitLabBranch,
  type GitLabFrameworkDetection,
} from './services/gitlab.service';

// Notifications Functions
export {
  getNotificationChannels,
  createNotificationChannel,
  updateNotificationChannel,
  deleteNotificationChannel,
  testNotificationChannel,
  getNotificationLogs,
  notificationsService,
  type NotificationChannel,
  type NotificationChannelType,
  type NotificationEvent,
  type NotificationLog,
  type SlackConfig,
  type EmailConfig,
  type WebhookConfig,
  type DiscordConfig,
  type ChannelConfig,
  type CreateNotificationChannelInput,
  type UpdateNotificationChannelInput,
} from './services/notifications.service';

// Scheduled Tasks (cron jobs)
export {
  getScheduledTasks,
  createScheduledTask,
  updateScheduledTask,
  deleteScheduledTask,
  runScheduledTask,
  getScheduledTaskRuns,
  type ScheduledTask,
  type ScheduledTaskRun,
  type ScheduledTaskType,
  type ScheduledTaskRunStatus,
  type ScheduledTaskRunResult,
  type CreateScheduledTaskInput,
  type UpdateScheduledTaskInput,
} from './services/scheduled-tasks.service';

// Project Volumes
export {
  getProjectVolumes,
  createProjectVolume,
  deleteProjectVolume,
  type ProjectVolume,
  type CreateProjectVolumeInput,
} from './services/volumes.service';

// Project Logs (explorer)
export {
  searchProjectLogs,
  type ProjectLogLine,
  type ProjectLogSearchResult,
  type ProjectLogSearchParams,
} from './services/project-logs.service';

// Health Check Functions
export {
  getHealthCheckConfig,
  updateHealthCheckConfig,
  deleteHealthCheckConfig,
  getHealthCheckLogs,
  healthCheckService,
  type HealthCheckConfig,
  type HealthCheckLog,
  type HealthCheckStatus,
  type HealthCheckConfigInput,
} from './services/healthcheck.service';

// Preview Deployments Functions
export {
  getPreviewDeployments,
  getActivePreviewDeployments,
  previewService,
  type PreviewDeployment,
  type PreviewStatus,
} from './services/preview.service';

// Metrics Functions
export {
  getMetricsSummary,
  getMetricsTimeSeries,
  getMetricsOverview,
  metricsService,
  type MetricsSummary,
  type MetricsCurrent,
  type MetricsStats24h,
  type TimeSeriesDataPoint,
  type MetricsOverview,
  type ProjectMetricSnapshot,
} from './services/metrics.service';

// API Keys Functions
export {
  getApiKeys,
  getApiKeyScopes,
  createApiKey,
  updateApiKey,
  revokeApiKey,
  getOrganizationApiKeys,
  apiKeysService,
  type ApiKey,
  type ApiKeyWithSecret,
  type CreateApiKeyInput,
  type UpdateApiKeyInput,
  type ApiKeyScopes,
} from './services/apikeys.service';

// Organizations Functions
export {
  getOrganization,
  getMyOrganizations,
  switchOrganization,
  updateOrganization,
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
  getInvitations,
  sendInvitation,
  revokeInvitation,
  getInvitationInfo,
  acceptInvitation,
  organizationsService,
  type OrganizationDetails,
  type UserOrganization,
  type OrganizationMember,
  type MemberRole,
  type UpdateOrganizationInput,
  type AddMemberInput,
  type UpdateMemberRoleInput,
  type OrganizationInvitation,
  type InvitationInfo,
  type InvitationStatus,
  type SendInvitationInput,
} from './services/organizations.service';

// Billing Functions
export {
  getBillingInfo,
  getAvailablePlans,
  updateBillingEmail,
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  cancelSubscription,
  sendCancellationFeedback,
  type CancellationReason,
  resumeSubscription,
  getInfraBilling,
  createInfraTopUpSession,
  confirmInfraTopUp,
  billingService,
  type PlanType,
  type InfraWalletSummary,
  type InfraWalletTransaction,
  type InfraBillingData,
  type UsageItem,
  type UsageStats,
  type BillingFeatures,
  type BillingInfo,
  type PlanLimits,
  type PlanInfo,
  type AvailablePlans,
  type UpdateBillingEmailInput,
  type CheckoutInput,
  type SubscriptionStatus,
  getInvoices,
  type Invoice,
} from './services/billing.service';

// Dashboard Functions
export {
  getDashboardOverview,
  dashboardService,
  type DashboardOverview,
  type DeploymentCounts,
  type RecentFailedDeployment,
  type DashboardActionItem,
  type UsageWarning,
  type ActionSeverity,
} from './services/dashboard.service';

// Alerts Functions
export {
  getAlertsOverview,
  alertsService,
  type AlertsOverview,
  type AlertsSummary,
  type OrgNotificationChannel,
  type OrgNotificationLog,
  type OrgHealthCheckRow,
} from './services/alerts.service';

// Servers Functions
export {
  listServers,
  getServer,
  getServerHealth,
  createServer,
  deleteServer,
  startServer,
  stopServer,
  rebootServer,
  syncServer,
  updateServer,
  getServerResizeOptions,
  resizeServer,
  listServerSnapshots,
  createServerSnapshot,
  deleteServerSnapshot,
  restoreServerSnapshot,
  getServerTimeline,
  getServerSshInfo,
  getServerSshKey,
  getProviderRegions,
  getProviderImages,
  getProviderSizes,
  getProviderServerTypes,
  serversService,
  type Server,
  type ServerStatus,
  type ServerSetupStatus,
  type ServerProvider,
  type ServerSize,
  type CreateServerInput,
  type Region,
  type Image,
  type ServerSizeOption,
  type ProviderServerType,
  type ServerSnapshot,
  type ServerTimeline,
  type ServerSshInfo,
} from './services/servers.service';

// Marketplace Functions
export {
  getMarketplaceTemplates,
  getMarketplaceTemplate,
  deployMarketplaceApp,
  getMarketplaceDeployments,
  marketplaceService,
  type MarketplaceTemplate,
  type MarketplaceCategory,
  type MarketplaceEnvVar,
  type DeployMarketplaceInput,
  type MarketplaceDeployment,
} from './services/marketplace.service';

// Site Studio
export {
  getSiteStudioTemplates,
  getSiteStudioTemplate,
  launchSite,
  siteStudioService,
  type SiteStudioTemplate,
  type SiteStudioCategory,
  type SiteStudioStack,
  type SiteStudioLaunchField,
  getSiteStudioStacks,
  type LaunchSiteInput,
  type LaunchSiteResult,
  type PaymentIntegrationInfo,
  type SetupGuideStep,
} from './services/site-studio.service';

// Site Editor
export {
  getSiteEditorState,
  updateSiteSeo,
  updateSiteBlocks,
  updateSiteTheme,
  updateSiteCmsConfig,
  updateSitePages,
  publishSite,
  getSiteDesigns,
  applySiteTemplate,
  uploadSiteImage,
  fetchSitePreviewHtml,
  siteEditorService,
  type SiteDesign,
  type SitePage,
  type SiteEditorState,
  type SiteSeo,
  type SiteBlock,
  type SiteBlockType,
  type SiteTheme,
  type SiteFontFamily,
  type SiteBorderRadius,
  type SiteMaxWidth,
  type CmsMode,
  type CmsConfig,
  type PublishResult,
  type SiteImageUploadResult,
} from './services/site-editor.service';

// Databases Functions
export {
  getDatabases,
  getDatabase,
  getDatabaseCredentials,
  getDatabaseTypes,
  createDatabase,
  updateDatabase,
  deleteDatabase,
  connectDatabaseToProject,
  disconnectDatabase,
  toggleExternalAccess,
  startDatabase,
  stopDatabase,
  restartDatabase,
  resetDatabasePassword,
  getDatabaseBackups,
  createDatabaseBackup,
  restoreDatabaseBackup,
  deleteDatabaseBackup,
  downloadDatabaseBackup,
  databasesService,
} from './services/databases.service';

// Types
export type {
  // Base
  ApiError,
  ApiResponse,
  PaginatedResponse,
  // Auth
  User,
  Organization,
  AuthResponse,
  LoginInput,
  RegisterInput,
  // Projects
  Project,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
  // Environment Variables
  Environment,
  EnvVar,
  CreateEnvVarInput,
  UpdateEnvVarInput,
  // Domains
  Domain,
  AddDomainInput,
  DnsSetupInfo,
  NginxSettings,
  // Deployments
  Deployment,
  DeploymentStatus,
  DeploymentTrigger,
  CreateDeploymentInput,
  // Databases
  Database,
  DatabaseType,
  DatabaseStatus,
  DatabaseCredentials,
  CreateDatabaseInput,
  UpdateDatabaseInput,
  DatabaseBackup,
  BackupType,
  BackupStatus,
  DatabaseConnection,
  ConnectDatabaseInput,
  DatabaseTypeInfo,
} from './types';

// Domain sales (registrar)
export {
  getDomainSalesConfig,
  searchDomains,
  getPurchasedDomains,
  purchaseDomain,
  createDomainPurchaseCheckout,
  confirmDomainPurchase,
  setDomainAutoRenew,
  getDomainDetails,
  listDomainDns,
  createDomainDns,
  updateDomainDns,
  deleteDomainDns,
  setDomainLock,
  setDomainNameservers,
  getDomainAuthCode,
  getTransferQuote,
  startDomainTransfer,
  listDomainEmailForwarding,
  addDomainEmailForwarding,
  deleteDomainEmailForwarding,
  publicSearchDomains,
  type DomainSearchResult,
  type PurchasedDomain,
  type PurchaseDomainInput,
  type PurchaseDomainResult,
  type DnsRecordType,
  type DomainDnsRecord,
  type DnsRecordInput,
  type DomainDetails,
  type DomainEmailForwarding,
  type TransferQuote,
} from './services/registrar-domains.service';
