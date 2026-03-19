// Axios Instance & Token Management
export { api, getAccessToken, getRefreshToken, setTokens, clearTokens, API_BASE_URL } from './client';

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
  updateProjectSettings,
  projectsService,
  type WebhookInfo,
  type WebhookSecret,
  type ProjectSettings,
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
  type ChannelConfig,
  type CreateNotificationChannelInput,
  type UpdateNotificationChannelInput,
} from './services/notifications.service';

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
  billingService,
  type PlanType,
  type UsageItem,
  type UsageStats,
  type BillingFeatures,
  type BillingInfo,
  type PlanLimits,
  type PlanInfo,
  type AvailablePlans,
  type UpdateBillingEmailInput,
} from './services/billing.service';

// Servers Functions
export {
  listServers,
  getServer,
  createServer,
  deleteServer,
  startServer,
  stopServer,
  rebootServer,
  syncServer,
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
} from './services/servers.service';

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
