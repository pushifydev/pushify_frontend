export interface TranslationKeys {
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    filter: string;
    viewAll: string;
    settings: string;
    logout: string;
    free: string;
    and: string;
    back: string;
    continue: string;
    optional: string;
    close: string;
  };
  auth: {
    welcomeBack: string;
    signInToContinue: string;
    createAccount: string;
    startDeploying: string;
    email: string;
    password: string;
    name: string;
    forgotPassword: string;
    signIn: string;
    signUp: string;
    signingIn: string;
    creatingAccount: string;
    orContinueWith: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    agreeToTerms: string;
    termsOfService: string;
    privacyPolicy: string;
    passwordRequirements: string;
    minCharacters: string;
    uppercase: string;
    lowercase: string;
    number: string;
    // 2FA
    twoFactorTitle: string;
    twoFactorDescription: string;
    verificationCode: string;
    twoFactorHint: string;
    verify: string;
    backToLogin: string;
    // Forgot Password
    forgotPasswordTitle: string;
    forgotPasswordDesc: string;
    sendResetLink: string;
    sending: string;
    resetLinkSent: string;
    resetLinkSentDesc: string;
    backToSignIn: string;
    resetPasswordTitle: string;
    resetPasswordDesc: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    resetPasswordBtn: string;
    resetting: string;
    passwordResetSuccess: string;
    passwordResetSuccessDesc: string;
    invalidResetLink: string;
    // Email Verification
    verifyingEmail: string;
    emailVerifiedTitle: string;
    emailVerifiedDesc: string;
    emailVerificationFailed: string;
    emailVerificationNoToken: string;
    resendVerification: string;
    verificationResent: string;
    goToDashboard: string;
    emailNotVerifiedBanner: string;
    emailNotVerifiedBannerDesc: string;
  };
  navigation: {
    overview: string;
    projects: string;
    activity: string;
    monitoring: string;
    team: string;
    servers: string;
    newProject: string;
    settings: string;
    helpDocs: string;
    usage: string;
    deployments: string;
  };
  dashboard: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    whatsHappening: string;
    totalProjects: string;
    activeProjects: string;
    deploymentsToday: string;
    uptime: string;
    runningContainers: string;
    avgCpu: string;
    totalMemory: string;
    networkIO: string;
    systemHealth: string;
    yourProjects: string;
    noProjectsYet: string;
    createFirstProject: string;
    recentActivity: string;
    activityWillAppear: string;
    connectRepo: string;
    connectRepoDesc: string;
    addDomain: string;
    addDomainDesc: string;
    viewLogs: string;
    viewLogsDesc: string;
  };
  projects: {
    title: string;
    subtitle: string;
    newProject: string;
    searchPlaceholder: string;
    allStatus: string;
    active: string;
    paused: string;
    inactive: string;
    noProjectsFound: string;
    noProjectsYet: string;
    adjustCriteria: string;
    createProjectDesc: string;
    createProject: string;
    visitSite: string;
    pause: string;
    resume: string;
    deleteConfirm: string;
  };
  header: {
    searchPlaceholder: string;
    aiHelp: string;
    deploy: string;
  };
  ai: {
    title: string;
    poweredBy: string;
    clearConversation: string;
    howCanIHelp: string;
    description: string;
    suggested: string;
    placeholder: string;
    stopGenerating: string;
    disclaimer: string;
    suggestDeploy: string;
    suggestServer: string;
    suggestDatabase: string;
    suggestEnv: string;
    suggestDomain: string;
    suggestHealth: string;
  };
  time: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };
  branding: {
    deployAt: string;
    speedOfThought: string;
    description: string;
    zeroConfig: string;
    zeroConfigDesc: string;
    autoHttps: string;
    autoHttpsDesc: string;
    realTimeLogs: string;
    realTimeLogsDesc: string;
    teamCollab: string;
    teamCollabDesc: string;
    documentation: string;
    github: string;
    status: string;
  };
  landing: {
    // Navigation
    features: string;
    frameworks: string;
    // Hero
    openSourcePlatform: string;
    getStartedFree: string;
    viewOnGithub: string;
    edgeLocations: string;
    deployTime: string;
    uptimeSla: string;
    configRequired: string;
    // Frameworks section
    universalCompatibility: string;
    worksWithEvery: string;
    everyFramework: string;
    zeroConfigRequired: string;
    autoDetected: string;
    zeroConfig: string;
    frameworksSupported: string;
    // Features section
    platformFeatures: string;
    everythingYouNeed: string;
    shipFaster: string;
    featuresDescription: string;
    sslCertificates: string;
    customDomains: string;
    ddosProtection: string;
    live: string;
    unlimitedTeamMembers: string;
    // CTA section
    readyToLaunch: string;
    launch: string;
    ctaDescription: string;
    deployInSeconds: string;
    startDeployingFree: string;
    starOnGithub: string;
    uptime: string;
    soc2Compliant: string;
    freeForeverPlan: string;
    // Footer
    openSourceUnderMit: string;
    twitter: string;
  };
  errors: {
    notFound: string;
    unauthorized: string;
    serverError: string;
    unknownError: string;
    pageNotFound: string;
    pageNotFoundDesc: string;
    goHome: string;
    goDashboard: string;
    somethingWentWrong: string;
    somethingWentWrongDesc: string;
    tryAgain: string;
  };
  projectDetail: {
    // Tabs
    overview: string;
    deployments: string;
    environment: string;
    domains: string;
    settings: string;
    // Header
    visit: string;
    redeploy: string;
    updated: string;
    // Overview tab
    latestDeployment: string;
    noDeploymentsYet: string;
    preview: string;
    projectInfo: string;
    framework: string;
    rootDirectory: string;
    buildCommand: string;
    unknown: string;
    // Deployments tab
    pushToTrigger: string;
    cancel: string;
    rollback: string;
    viewLogs: string;
    containerLogs: string;
    historicalLogs: string;
    // Environment tab
    envVarsDesc: string;
    addVariable: string;
    pasteEnv: string;
    pasteEnvContent: string;
    parsedVariables: string;
    addVariables: string;
    key: string;
    value: string;
    noEnvVariables: string;
    noEnvVariablesDesc: string;
    hide: string;
    reveal: string;
    deleteEnvVarConfirm: string;
    // Domains tab
    domainsDesc: string;
    addDomain: string;
    domain: string;
    primary: string;
    verified: string;
    pending: string;
    cnameInstructions: string;
    verify: string;
    setPrimary: string;
    removeDomainConfirm: string;
    noCustomDomains: string;
    noCustomDomainsDesc: string;
    // Settings tab
    general: string;
    projectName: string;
    description: string;
    // Build Settings
    buildSettings: string;
    buildSettingsDesc: string;
    gitBranch: string;
    gitBranchPlaceholder: string;
    installCommand: string;
    installCommandPlaceholder: string;
    buildCommandLabel: string;
    buildCommandPlaceholder: string;
    outputDirectory: string;
    outputDirectoryPlaceholder: string;
    startCommand: string;
    startCommandPlaceholder: string;
    port: string;
    portPlaceholder: string;
    rootDirectoryLabel: string;
    rootDirectoryPlaceholder: string;
    saveBuildSettings: string;
    saving: string;
    buildSettingsSaved: string;
    // Deployment Server
    deploymentServer: string;
    deploymentServerDesc: string;
    loadingServers: string;
    noServersAvailable: string;
    createServerLink: string;
    selectServer: string;
    noServerSelected: string;
    serverSelectionHint: string;
    saveServerSelection: string;
    serverSaved: string;
    removeServerAssignment: string;
    currentServer: string;
    projectStatus: string;
    projectStatusDesc: string;
    pauseProject: string;
    resumeProject: string;
    // Webhooks
    webhooks: string;
    webhooksDesc: string;
    webhookUrl: string;
    copyUrl: string;
    webhookUrlHint: string;
    webhookSecret: string;
    secretGenerated: string;
    secretWarning: string;
    hideSecret: string;
    secretConfigured: string;
    noSecretConfigured: string;
    regenerateSecret: string;
    generateSecret: string;
    githubSetup: string;
    githubStep1: string;
    githubStep2: string;
    githubStep3: string;
    githubStep4: string;
    // PR Status Checks
    prStatusChecks: string;
    prStatusChecksDesc: string;
    enablePrStatusChecks: string;
    prStatusContext: string;
    // Danger Zone
    dangerZone: string;
    dangerZoneDesc: string;
    deleteProject: string;
    deleteProjectConfirm: string;
  };
  newProject: {
    title: string;
    subtitle: string;
    importSource: string;
    importSourceDesc: string;
    configure: string;
    envVars: string;
    review: string;
    gitUrl: string;
    gitUrlDesc: string;
    connectGithub: string;
    connectGithubDesc: string;
    template: string;
    templateDesc: string;
    comingSoon: string;
    repositoryUrl: string;
    branch: string;
    githubIntegration: string;
    githubIntegrationDesc: string;
    useGitUrl: string;
    configureProject: string;
    configureProjectDesc: string;
    projectName: string;
    projectNameHint: string;
    description: string;
    descriptionPlaceholder: string;
    framework: string;
    buildSettings: string;
    rootDirectory: string;
    installCommand: string;
    buildCommand: string;
    outputDirectory: string;
    startCommand: string;
    port: string;
    envVariables: string;
    envVariablesDesc: string;
    addEnvVariable: string;
    noEnvVariables: string;
    envVariablesLater: string;
    secret: string;
    reviewDeploy: string;
    reviewDeployDesc: string;
    noDescription: string;
    repository: string;
    buildConfig: string;
    autoDeploy: string;
    autoDeployDesc: string;
    creating: string;
    createAndDeploy: string;
    // GitHub connection
    connected: string;
    checkingGitHub: string;
    connecting: string;
    connectGithubBtn: string;
    connectedAs: string;
    searchRepos: string;
    loadingRepos: string;
    noReposFound: string;
    noRepos: string;
    loadingBranches: string;
    detectingFramework: string;
    detectedFramework: string;
    noFrameworkDetected: string;
    loadMore: string;
    loadingMore: string;
    // Deployment Server
    deploymentServer: string;
    deploymentServerDesc: string;
    loadingServers: string;
    noServersAvailable: string;
    createServerLink: string;
    noServerSelected: string;
    serverSelectionHint: string;
  };
  notifications: {
    title: string;
    description: string;
    addChannel: string;
    editChannel: string;
    deleteChannel: string;
    noChannels: string;
    noChannelsDesc: string;
    // Channel types
    slack: string;
    email: string;
    webhook: string;
    // Form fields
    channelName: string;
    channelNamePlaceholder: string;
    channelType: string;
    slackWebhookUrl: string;
    slackWebhookUrlPlaceholder: string;
    emailAddresses: string;
    emailAddressesPlaceholder: string;
    webhookUrl: string;
    webhookUrlPlaceholder: string;
    webhookSecret: string;
    webhookSecretPlaceholder: string;
    // Events
    events: string;
    eventsDesc: string;
    deploymentStarted: string;
    deploymentSuccess: string;
    deploymentFailed: string;
    healthUnhealthy: string;
    healthRecovered: string;
    // Actions
    testChannel: string;
    testing: string;
    testSuccess: string;
    testFailed: string;
    viewLogs: string;
    // Status
    active: string;
    inactive: string;
  };
  healthChecks: {
    title: string;
    description: string;
    enable: string;
    disable: string;
    enabled: string;
    disabled: string;
    // Config fields
    endpoint: string;
    endpointPlaceholder: string;
    interval: string;
    intervalDesc: string;
    timeout: string;
    timeoutDesc: string;
    unhealthyThreshold: string;
    unhealthyThresholdDesc: string;
    autoRestart: string;
    autoRestartDesc: string;
    // Status
    healthy: string;
    unhealthy: string;
    unknown: string;
    // Logs
    recentLogs: string;
    noLogs: string;
    noLogsDesc: string;
    responseTime: string;
    statusCode: string;
    consecutiveFailures: string;
    actionTaken: string;
    restarted: string;
    notified: string;
    noAction: string;
    seconds: string;
  };
  previews: {
    title: string;
    description: string;
    enable: string;
    disable: string;
    enabled: string;
    disabled: string;
    // Status
    pending: string;
    building: string;
    running: string;
    stopped: string;
    failed: string;
    // List
    activePreviews: string;
    noPreviews: string;
    noPreviewsDesc: string;
    previewUrl: string;
    prNumber: string;
    branch: string;
    baseBranch: string;
    closed: string;
    viewOnGithub: string;
  };
  metrics: {
    title: string;
    description: string;
    // Current stats
    currentStats: string;
    cpu: string;
    memory: string;
    network: string;
    containerStatus: string;
    // 24h stats
    stats24h: string;
    avgCpu: string;
    maxCpu: string;
    avgMemory: string;
    maxMemory: string;
    networkIn: string;
    networkOut: string;
    dataPoints: string;
    // Chart
    cpuUsage: string;
    memoryUsage: string;
    networkIO: string;
    last1Hour: string;
    last6Hours: string;
    last24Hours: string;
    // Status
    running: string;
    stopped: string;
    noData: string;
    noDataDesc: string;
    lastUpdated: string;
    refreshing: string;
  };
  monitoring: {
    title: string;
    description: string;
    overview: string;
    cpuUsage: string;
    memoryUsage: string;
    networkIO: string;
    runningContainers: string;
    totalCpu: string;
    totalMemory: string;
    avgCpu: string;
    avgMemory: string;
    projectResources: string;
    project: string;
    cpu: string;
    memory: string;
    network: string;
    status: string;
    running: string;
    stopped: string;
    noData: string;
    noDataDesc: string;
    autoRefresh: string;
    last1Hour: string;
    last6Hours: string;
    last24Hours: string;
    allProjects: string;
    systemHealth: string;
    healthy: string;
    degraded: string;
    unhealthy: string;
    viewProject: string;
    totalNetworkIn: string;
    totalNetworkOut: string;
    memoryOf: string;
  };
  apiKeys: {
    title: string;
    description: string;
    createKey: string;
    keyName: string;
    keyNamePlaceholder: string;
    scopes: string;
    scopesDesc: string;
    allPermissions: string;
    expiresAt: string;
    noExpiration: string;
    secretKey: string;
    secretKeyWarning: string;
    copyKey: string;
    keyCopied: string;
    prefix: string;
    lastUsed: string;
    never: string;
    createdAt: string;
    expiresIn: string;
    expired: string;
    revoke: string;
    revokeConfirm: string;
    noKeys: string;
    noKeysDesc: string;
    creating: string;
    revoking: string;
    // Scope labels
    scopeProjectsRead: string;
    scopeProjectsWrite: string;
    scopeDeploymentsRead: string;
    scopeDeploymentsWrite: string;
    scopeEnvvarsRead: string;
    scopeEnvvarsWrite: string;
    scopeLogsRead: string;
    scopeMetricsRead: string;
  };
  security: {
    title: string;
    description: string;
    twoFactor: string;
    twoFactorDesc: string;
    enabled: string;
    disabled: string;
    enable: string;
    disable: string;
    setup: string;
    setupTitle: string;
    setupDesc: string;
    scanQrCode: string;
    scanQrCodeDesc: string;
    enterCode: string;
    enterCodeDesc: string;
    backupCodes: string;
    backupCodesDesc: string;
    backupCodesWarning: string;
    copyBackupCodes: string;
    confirmEnable: string;
    disableTitle: string;
    disableDesc: string;
    disableWarning: string;
    enterPassword: string;
    confirmDisable: string;
    regenerateBackupCodes: string;
    regenerateTitle: string;
    regenerateDesc: string;
    regenerateWarning: string;
    confirmRegenerate: string;
    enabling: string;
    disabling: string;
    regenerating: string;
    success: string;
    enabledSuccess: string;
    disabledSuccess: string;
    regeneratedSuccess: string;
  };
  profile: {
    title: string;
    description: string;
    personalInfo: string;
    personalInfoDesc: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailHint: string;
    avatarUrl: string;
    avatarUrlPlaceholder: string;
    avatarHint: string;
    saveChanges: string;
    saving: string;
    saved: string;
    changePassword: string;
    changePasswordDesc: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    passwordMismatch: string;
    passwordRequirements: string;
    updating: string;
    passwordChanged: string;
  };
  appearance: {
    title: string;
    description: string;
    theme: string;
    themeDesc: string;
    light: string;
    dark: string;
    system: string;
    language: string;
    languageDesc: string;
    english: string;
    turkish: string;
    saved: string;
  };
  sessions: {
    title: string;
    description: string;
    currentSession: string;
    otherSessions: string;
    noOtherSessions: string;
    noOtherSessionsDesc: string;
    device: string;
    location: string;
    lastActive: string;
    signedIn: string;
    thisDevice: string;
    terminate: string;
    terminateOthers: string;
    terminateConfirm: string;
    terminateOthersConfirm: string;
    terminating: string;
    terminated: string;
    allOthersTerminated: string;
  };
  notificationPrefs: {
    title: string;
    description: string;
    emailNotifications: string;
    emailNotificationsDesc: string;
    deploymentAlerts: string;
    deploymentAlertsDesc: string;
    securityAlerts: string;
    securityAlertsDesc: string;
    weeklyDigest: string;
    weeklyDigestDesc: string;
    productUpdates: string;
    productUpdatesDesc: string;
    saved: string;
  };
  team: {
    title: string;
    description: string;
    members: string;
    inviteMember: string;
    invite: string;
    inviting: string;
    emailAddress: string;
    emailPlaceholder: string;
    role: string;
    selectRole: string;
    owner: string;
    admin: string;
    member: string;
    viewer: string;
    ownerDesc: string;
    adminDesc: string;
    memberDesc: string;
    viewerDesc: string;
    changeRole: string;
    removeMember: string;
    removeConfirm: string;
    removing: string;
    noMembers: string;
    joined: string;
    you: string;
    orgSettings: string;
    orgSettingsDesc: string;
    orgName: string;
    orgNamePlaceholder: string;
    orgSlug: string;
    orgSlugPlaceholder: string;
    orgSlugHint: string;
    saving: string;
    saved: string;
    // Invitations
    pendingInvitations: string;
    inviteByEmail: string;
    inviteNote: string;
    inviteNotePlaceholder: string;
    sendInvitation: string;
    sendingInvitation: string;
    invitationSent: string;
    noPendingInvitations: string;
    invitedBy: string;
    expiresOn: string;
    revokeInvitation: string;
    revoking: string;
    invitationRevoked: string;
    // Accept invitation page
    acceptInvitationTitle: string;
    acceptInvitationDesc: string;
    joinOrg: string;
    joining: string;
    invitationAccepted: string;
    invitationExpired: string;
    invitationInvalid: string;
    loginToAccept: string;
    registerToAccept: string;
  };
  billing: {
    title: string;
    description: string;
    currentPlan: string;
    usage: string;
    usageDescription: string;
    features: string;
    featuresDescription: string;
    billingEmail: string;
    billingEmailDesc: string;
    billingEmailPlaceholder: string;
    updateEmail: string;
    updating: string;
    emailUpdated: string;
    // Plan names
    free: string;
    hobby: string;
    pro: string;
    business: string;
    enterprise: string;
    // Usage items
    servers: string;
    databases: string;
    projects: string;
    deploymentsThisMonth: string;
    teamMembers: string;
    customDomains: string;
    // Limits
    unlimited: string;
    of: string;
    used: string;
    // Features
    previewDeployments: string;
    healthChecks: string;
    prioritySupport: string;
    included: string;
    notIncluded: string;
    // Upgrade
    upgradePlan: string;
    comparePlans: string;
    currentPlanBadge: string;
    perMonth: string;
    // Plan details
    planDetails: string;
    storageGb: string;
    bandwidthGb: string;
    buildMinutes: string;
  };
  servers: {
    title: string;
    description: string;
    newServer: string;
    createServer: string;
    creating: string;
    noServers: string;
    noServersDesc: string;
    // Server details
    serverName: string;
    serverNamePlaceholder: string;
    serverDescription: string;
    serverDescriptionPlaceholder: string;
    provider: string;
    selectProvider: string;
    region: string;
    selectRegion: string;
    size: string;
    selectSize: string;
    image: string;
    selectImage: string;
    // Sizes
    sizeXs: string;
    sizeSm: string;
    sizeMd: string;
    sizeLg: string;
    sizeXl: string;
    // Status
    provisioning: string;
    running: string;
    stopped: string;
    rebooting: string;
    error: string;
    deleting: string;
    // Actions
    start: string;
    stop: string;
    reboot: string;
    deleteServer: string;
    deleteConfirm: string;
    sync: string;
    syncing: string;
    // Specs
    vcpus: string;
    memory: string;
    disk: string;
    ipAddress: string;
    privateIp: string;
    // Providers
    hetzner: string;
    digitalocean: string;
    aws: string;
    gcp: string;
    selfHosted: string;
    // Messages
    started: string;
    stoppedMsg: string;
    rebooted: string;
    deleted: string;
    created: string;
    notFound: string;
    // Detail page
    overview: string;
    network: string;
  };
  databases: {
    title: string;
    description: string;
    newDatabase: string;
    createTitle: string;
    createSubtitle: string;
    noDatabases: string;
    noDatabasesDesc: string;
    createFirst: string;
    noServersWarning: string;
    noServersWarningDesc: string;
    addServer: string;
    // Form
    type: string;
    name: string;
    namePlaceholder: string;
    nameRequired: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    server: string;
    serverRequired: string;
    creating: string;
    create: string;
    // Card
    host: string;
    port: string;
    database: string;
    databaseName: string;
    storage: string;
    username: string;
    password: string;
    connectionString: string;
    showCredentials: string;
    hideCredentials: string;
    delete: string;
    deleteConfirm: string;
    // Status
    provisioning: string;
    running: string;
    stopped: string;
    error: string;
    deleting: string;
    deleted: string;
    notFound: string;
    // Detail page
    connectionDetails: string;
    networkAccess: string;
    info: string;
    backups: string;
    dangerZone: string;
    deleteDatabase: string;
    deleteConfirmation: string;
    copied: string;
    // Actions
    start: string;
    stop: string;
    restart: string;
    started: string;
    restarted: string;
    // External access
    externalAccessOn: string;
    externalAccessOff: string;
    externalAccessOnDesc: string;
    externalAccessOffDesc: string;
    externalAccessEnabled: string;
    externalAccessDisabled: string;
    externalAccessWarning: string;
    enable: string;
    disable: string;
    // Backups
    autoBackup: string;
    retentionDays: string;
    lastBackup: string;
    backupHistory: string;
    createBackup: string;
    noBackups: string;
    noBackupsDesc: string;
    backupDate: string;
    backupType: string;
    backupStatus: string;
    backupSize: string;
    actions: string;
    automatic: string;
    manual: string;
    backup_creating: string;
    backup_completed: string;
    backup_failed: string;
    backup_restoring: string;
    backup_restored: string;
    restore: string;
    download: string;
    backupStarted: string;
    restoreStarted: string;
    backupDeleted: string;
    restoreConfirmTitle: string;
    restoreConfirmMessage: string;
    deleteBackupConfirm: string;
    // Info
    created: string;
    updated: string;
    // Password reset
    resetPassword: string;
    resetPasswordConfirm: string;
    resettingPassword: string;
    passwordResetSuccess: string;
    newCredentials: string;
  };
}

export const en: TranslationKeys = {
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    viewAll: 'View all',
    settings: 'Settings',
    logout: 'Logout',
    free: 'Free',
    and: 'and',
    back: 'Back',
    continue: 'Continue',
    optional: 'Optional',
    close: 'Close',
  },
  auth: {
    welcomeBack: 'Welcome back',
    signInToContinue: 'Sign in to continue deploying',
    createAccount: 'Create account',
    startDeploying: 'Start deploying in seconds',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign in',
    signUp: 'Sign up',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    orContinueWith: 'or continue with',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    agreeToTerms: 'By creating an account, you agree to our',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    passwordRequirements: 'Password requirements',
    minCharacters: '8+ characters',
    uppercase: 'Uppercase',
    lowercase: 'Lowercase',
    number: 'Number',
    // 2FA
    twoFactorTitle: 'Two-Factor Authentication',
    twoFactorDescription: 'Enter the 6-digit code from your authenticator app',
    verificationCode: 'Verification Code',
    twoFactorHint: 'Enter the code from your authenticator app or use a backup code',
    verify: 'Verify',
    backToLogin: 'Back to login',
    // Forgot Password
    forgotPasswordTitle: 'Forgot your password?',
    forgotPasswordDesc: 'Enter your email and we\'ll send you a link to reset your password.',
    sendResetLink: 'Send reset link',
    sending: 'Sending...',
    resetLinkSent: 'Check your email',
    resetLinkSentDesc: 'We\'ve sent a password reset link to your email address. The link will expire in 1 hour.',
    backToSignIn: 'Back to sign in',
    resetPasswordTitle: 'Reset your password',
    resetPasswordDesc: 'Enter your new password below.',
    newPasswordLabel: 'New Password',
    confirmPasswordLabel: 'Confirm Password',
    resetPasswordBtn: 'Reset password',
    resetting: 'Resetting...',
    passwordResetSuccess: 'Password reset successful',
    passwordResetSuccessDesc: 'Your password has been reset. You can now sign in with your new password.',
    invalidResetLink: 'This reset link is invalid or has expired. Please request a new one.',
    verifyingEmail: 'Verifying your email...',
    emailVerifiedTitle: 'Email verified!',
    emailVerifiedDesc: 'Your email has been verified successfully. You can now access all features.',
    emailVerificationFailed: 'Verification failed',
    emailVerificationNoToken: 'No verification token found. Please use the link from your email.',
    resendVerification: 'Resend email',
    verificationResent: 'Verification email sent!',
    goToDashboard: 'Go to Dashboard',
    emailNotVerifiedBanner: 'Please verify your email address.',
    emailNotVerifiedBannerDesc: 'Check your inbox for a verification link, or click Resend to get a new one.',
  },
  navigation: {
    overview: 'Overview',
    projects: 'Projects',
    activity: 'Activity',
    monitoring: 'Monitoring',
    team: 'Team',
    servers: 'Servers',
    newProject: 'New Project',
    settings: 'Settings',
    helpDocs: 'Help & Docs',
    usage: 'Usage',
    deployments: 'Deployments',
  },
  dashboard: {
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    whatsHappening: "Here's what's happening with your deployments",
    totalProjects: 'Total Projects',
    activeProjects: 'Active Projects',
    deploymentsToday: 'Deployments Today',
    uptime: 'Uptime',
    runningContainers: 'Running Containers',
    avgCpu: 'Avg CPU',
    totalMemory: 'Total Memory',
    networkIO: 'Network I/O',
    systemHealth: 'System Health',
    yourProjects: 'Your Projects',
    noProjectsYet: 'No projects yet',
    createFirstProject: 'Create your first project to get started',
    recentActivity: 'Recent Activity',
    activityWillAppear: 'Activity will appear here',
    connectRepo: 'Connect Repository',
    connectRepoDesc: 'Import a project from GitHub or GitLab',
    addDomain: 'Add Custom Domain',
    addDomainDesc: 'Point your domain to your project',
    viewLogs: 'View Logs',
    viewLogsDesc: 'Monitor your application in real-time',
  },
  projects: {
    title: 'Projects',
    subtitle: 'Manage and deploy your applications',
    newProject: 'New Project',
    searchPlaceholder: 'Search projects...',
    allStatus: 'All Status',
    active: 'Active',
    paused: 'Paused',
    inactive: 'Inactive',
    noProjectsFound: 'No projects found',
    noProjectsYet: 'No projects yet',
    adjustCriteria: 'Try adjusting your search or filter criteria',
    createProjectDesc: 'Create your first project to start deploying your applications',
    createProject: 'Create Project',
    visitSite: 'Visit Site',
    pause: 'Pause',
    resume: 'Resume',
    deleteConfirm: 'Are you sure you want to delete this project? This action cannot be undone.',
  },
  header: {
    searchPlaceholder: 'Search projects, deployments...',
    aiHelp: 'AI Help',
    deploy: 'Deploy',
  },
  ai: {
    title: 'AI Assistant',
    poweredBy: 'Powered by Claude',
    clearConversation: 'Clear conversation',
    howCanIHelp: 'How can I help?',
    description: 'Ask me anything about deploying apps, managing servers, databases, and more.',
    suggested: 'Suggested',
    placeholder: 'Ask anything about Pushify...',
    stopGenerating: 'Stop generating',
    disclaimer: 'AI can make mistakes. Verify important information.',
    suggestDeploy: 'How do I deploy my first app?',
    suggestServer: 'How to create a server?',
    suggestDatabase: 'How to set up a database?',
    suggestEnv: 'How do environment variables work?',
    suggestDomain: 'How to add a custom domain with SSL?',
    suggestHealth: 'How to set up health checks?',
  },
  time: {
    justNow: 'just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
  },
  branding: {
    deployAt: 'Deploy at the',
    speedOfThought: 'speed of thought',
    description: 'Push your code. We handle the rest. Infrastructure, scaling, and deployment — all automated.',
    zeroConfig: 'Zero-config deployments',
    zeroConfigDesc: 'Push code, deploy instantly. Framework detection is automatic.',
    autoHttps: 'Automatic HTTPS & domains',
    autoHttpsDesc: 'Free SSL, custom domains, and enterprise-grade security.',
    realTimeLogs: 'Real-time logs & metrics',
    realTimeLogsDesc: 'Live logs, metrics, and performance monitoring.',
    teamCollab: 'Team collaboration built-in',
    teamCollabDesc: 'Team workspaces with granular role-based access.',
    documentation: 'Documentation',
    github: 'GitHub',
    status: 'Status',
  },
  landing: {
    // Navigation
    features: 'Features',
    frameworks: 'Frameworks',
    // Hero
    openSourcePlatform: 'Open Source Cloud Platform',
    getStartedFree: 'Get Started Free',
    viewOnGithub: 'View on GitHub',
    edgeLocations: 'Edge Locations',
    deployTime: 'Deploy Time',
    uptimeSla: 'Uptime SLA',
    configRequired: 'Config Required',
    // Frameworks section
    universalCompatibility: 'Universal Compatibility',
    worksWithEvery: 'Works with',
    everyFramework: 'every framework',
    zeroConfigRequired: 'Zero configuration required. Just push your code.',
    autoDetected: 'Auto-detected',
    zeroConfig: 'Zero config',
    frameworksSupported: 'frameworks supported',
    // Features section
    platformFeatures: 'Platform Features',
    everythingYouNeed: 'Everything you need to',
    shipFaster: 'ship faster',
    featuresDescription: 'Focus on building your product. We handle the infrastructure, scaling, and deployment.',
    sslCertificates: 'SSL Certificates',
    customDomains: 'Custom Domains',
    ddosProtection: 'DDoS Protection',
    live: 'Live',
    unlimitedTeamMembers: 'Unlimited team members',
    // CTA section
    readyToLaunch: 'Ready to',
    launch: 'launch',
    ctaDescription: 'Join thousands of developers shipping faster with Pushify.',
    deployInSeconds: 'Deploy in seconds, scale globally.',
    startDeployingFree: 'Start Deploying Free',
    starOnGithub: 'Star on GitHub',
    uptime: '99.99% Uptime',
    soc2Compliant: 'SOC 2 Compliant',
    freeForeverPlan: 'Free Forever Plan',
    // Footer
    openSourceUnderMit: 'Open Source under MIT',
    twitter: 'Twitter',
  },
  errors: {
    notFound: 'Not found',
    unauthorized: 'Unauthorized',
    serverError: 'Server error',
    unknownError: 'Unknown error',
    pageNotFound: 'Page not found',
    pageNotFoundDesc: 'The page you\'re looking for doesn\'t exist or has been moved.',
    goHome: 'Go Home',
    goDashboard: 'Dashboard',
    somethingWentWrong: 'Something went wrong',
    somethingWentWrongDesc: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    tryAgain: 'Try again',
  },
  projectDetail: {
    // Tabs
    overview: 'Overview',
    deployments: 'Deployments',
    environment: 'Environment',
    domains: 'Domains',
    settings: 'Settings',
    // Header
    visit: 'Visit',
    redeploy: 'Redeploy',
    updated: 'Updated',
    // Overview tab
    latestDeployment: 'Latest Deployment',
    noDeploymentsYet: 'No deployments yet',
    preview: 'Preview',
    projectInfo: 'Project Info',
    framework: 'Framework',
    rootDirectory: 'Root Directory',
    buildCommand: 'Build Command',
    unknown: 'Unknown',
    // Deployments tab
    pushToTrigger: 'Push to your repository to trigger a deployment',
    cancel: 'Cancel',
    rollback: 'Rollback',
    viewLogs: 'View Logs',
    containerLogs: 'Container Logs',
    historicalLogs: 'History',
    // Environment tab
    envVarsDesc: 'Environment variables are encrypted and available during build and runtime.',
    addVariable: 'Add Variable',
    pasteEnv: 'Paste .env',
    pasteEnvContent: 'Paste your .env file content',
    parsedVariables: 'Parsed variables',
    addVariables: 'Add Variables',
    key: 'Key',
    value: 'Value',
    noEnvVariables: 'No environment variables',
    noEnvVariablesDesc: 'Add environment variables to configure your application',
    hide: 'Hide',
    reveal: 'Reveal',
    deleteEnvVarConfirm: 'Delete this environment variable?',
    // Domains tab
    domainsDesc: 'Add custom domains to your project. DNS verification is required for new domains.',
    addDomain: 'Add Domain',
    domain: 'Domain',
    primary: 'Primary',
    verified: 'Verified',
    pending: 'Pending',
    cnameInstructions: 'Add a CNAME record pointing to cname.pushify.dev',
    verify: 'Verify',
    setPrimary: 'Set Primary',
    removeDomainConfirm: 'Remove this domain?',
    noCustomDomains: 'No custom domains',
    noCustomDomainsDesc: 'Add a custom domain to make your project accessible',
    // Settings tab
    general: 'General',
    projectName: 'Project Name',
    description: 'Description',
    // Build Settings
    buildSettings: 'Build Settings',
    buildSettingsDesc: 'Configure how your project is built and deployed.',
    gitBranch: 'Branch',
    gitBranchPlaceholder: 'main',
    installCommand: 'Install Command',
    installCommandPlaceholder: 'npm install',
    buildCommandLabel: 'Build Command',
    buildCommandPlaceholder: 'npm run build',
    outputDirectory: 'Output Directory',
    outputDirectoryPlaceholder: 'dist',
    startCommand: 'Start Command',
    startCommandPlaceholder: 'npm start',
    port: 'Port',
    portPlaceholder: '3000',
    rootDirectoryLabel: 'Root Directory',
    rootDirectoryPlaceholder: './',
    saveBuildSettings: 'Save Build Settings',
    saving: 'Saving...',
    buildSettingsSaved: 'Build settings saved successfully',
    // Deployment Server
    deploymentServer: 'Deployment Server',
    deploymentServerDesc: 'Select the server where this project will be deployed. Deployments will run on the selected server.',
    loadingServers: 'Loading servers...',
    noServersAvailable: 'No servers available for deployment',
    createServerLink: 'Create a server to enable deployments',
    selectServer: 'Select Server',
    noServerSelected: 'No server selected (local deployment)',
    serverSelectionHint: 'Only servers with completed setup are shown',
    saveServerSelection: 'Save Server Selection',
    serverSaved: 'Server selection saved',
    removeServerAssignment: 'Remove Server Assignment',
    currentServer: 'Current server',
    projectStatus: 'Project Status',
    projectStatusDesc: 'Pausing your project will stop all deployments and take your application offline.',
    pauseProject: 'Pause Project',
    resumeProject: 'Resume Project',
    // Webhooks
    webhooks: 'Webhooks',
    webhooksDesc: 'Configure GitHub webhooks to automatically deploy when you push to your repository.',
    webhookUrl: 'Webhook URL',
    copyUrl: 'Copy URL',
    webhookUrlHint: 'Use this URL when configuring your GitHub webhook.',
    webhookSecret: 'Webhook Secret',
    secretGenerated: 'Secret generated! Copy it now - it won\'t be shown again.',
    secretWarning: 'Keep this secret secure. It\'s used to verify webhook requests.',
    hideSecret: 'Hide Secret',
    secretConfigured: 'Secret configured',
    noSecretConfigured: 'No secret configured',
    regenerateSecret: 'Regenerate Secret',
    generateSecret: 'Generate Secret',
    githubSetup: 'GitHub Setup Instructions',
    githubStep1: 'Go to your repository Settings → Webhooks → Add webhook',
    githubStep2: 'Paste the Webhook URL above into the "Payload URL" field',
    githubStep3: 'Set Content type to "application/json"',
    githubStep4: 'Add the secret (if generated) and select "Just the push event"',
    // PR Status Checks
    prStatusChecks: 'PR Status Checks',
    prStatusChecksDesc: 'Show deployment status on GitHub commits and pull requests.',
    enablePrStatusChecks: 'Enable PR Status Checks',
    prStatusContext: 'Status context: Pushify/deployment',
    // Danger Zone
    dangerZone: 'Danger Zone',
    dangerZoneDesc: 'Deleting this project will permanently remove all deployments, environment variables, and domains. This action cannot be undone.',
    deleteProject: 'Delete Project',
    deleteProjectConfirm: 'Are you sure you want to delete this project? This action cannot be undone.',
  },
  newProject: {
    title: 'New Project',
    subtitle: 'Deploy your application in minutes',
    importSource: 'Import Source',
    importSourceDesc: 'Choose how to import your project',
    configure: 'Configure',
    envVars: 'Environment',
    review: 'Review',
    gitUrl: 'Git URL',
    gitUrlDesc: 'Import from any Git repository',
    connectGithub: 'Connect GitHub',
    connectGithubDesc: 'Import from your GitHub account',
    template: 'Start from Template',
    templateDesc: 'Use a pre-configured template',
    comingSoon: 'Coming Soon',
    repositoryUrl: 'Repository URL',
    branch: 'Branch',
    githubIntegration: 'GitHub Integration',
    githubIntegrationDesc: 'Connect your GitHub account to import repositories and enable automatic deployments.',
    useGitUrl: 'For now, you can use the Git URL option to import your repository.',
    configureProject: 'Configure Project',
    configureProjectDesc: 'Set up your project settings and build configuration',
    projectName: 'Project Name',
    projectNameHint: 'Lowercase letters, numbers, and hyphens only',
    description: 'Description',
    descriptionPlaceholder: 'A brief description of your project',
    framework: 'Framework',
    buildSettings: 'Build Settings',
    rootDirectory: 'Root Directory',
    installCommand: 'Install Command',
    buildCommand: 'Build Command',
    outputDirectory: 'Output Directory',
    startCommand: 'Start Command',
    port: 'Port',
    envVariables: 'Environment Variables',
    envVariablesDesc: 'Add environment variables for your application',
    addEnvVariable: 'Add Variable',
    noEnvVariables: 'No environment variables added',
    envVariablesLater: 'You can add them later in project settings',
    secret: 'Secret',
    reviewDeploy: 'Review & Deploy',
    reviewDeployDesc: 'Review your configuration and deploy your project',
    noDescription: 'No description',
    repository: 'Repository',
    buildConfig: 'Build Configuration',
    autoDeploy: 'Auto Deploy',
    autoDeployDesc: 'Automatically deploy when you push to the selected branch',
    creating: 'Creating...',
    createAndDeploy: 'Create & Deploy',
    // GitHub connection
    connected: 'Connected',
    checkingGitHub: 'Checking GitHub connection...',
    connecting: 'Connecting...',
    connectGithubBtn: 'Connect to GitHub',
    connectedAs: 'Connected as',
    searchRepos: 'Search repositories...',
    loadingRepos: 'Loading repositories...',
    noReposFound: 'No repositories found',
    noRepos: 'No repositories available',
    loadingBranches: 'Loading branches...',
    detectingFramework: 'Detecting framework...',
    detectedFramework: 'Detected framework',
    noFrameworkDetected: 'Could not detect framework automatically',
    loadMore: 'Load more repositories',
    loadingMore: 'Loading...',
    // Deployment Server
    deploymentServer: 'Deployment Server',
    deploymentServerDesc: 'Select the server where this project will be deployed. This is optional - you can also configure it later.',
    loadingServers: 'Loading servers...',
    noServersAvailable: 'No servers available for deployment.',
    createServerLink: 'Create a server to enable deployments',
    noServerSelected: 'No server selected (configure later)',
    serverSelectionHint: 'Only servers with completed setup are shown',
  },
  notifications: {
    title: 'Notifications',
    description: 'Configure notification channels to receive deployment alerts via Slack, Email, or Webhooks.',
    addChannel: 'Add Channel',
    editChannel: 'Edit Channel',
    deleteChannel: 'Delete Channel',
    noChannels: 'No notification channels',
    noChannelsDesc: 'Add a notification channel to receive alerts when deployments start, succeed, or fail.',
    // Channel types
    slack: 'Slack',
    email: 'Email',
    webhook: 'Webhook',
    // Form fields
    channelName: 'Channel Name',
    channelNamePlaceholder: 'e.g., Production Alerts',
    channelType: 'Channel Type',
    slackWebhookUrl: 'Slack Webhook URL',
    slackWebhookUrlPlaceholder: 'https://hooks.slack.com/services/...',
    emailAddresses: 'Email Addresses',
    emailAddressesPlaceholder: 'email@example.com, another@example.com',
    webhookUrl: 'Webhook URL',
    webhookUrlPlaceholder: 'https://api.example.com/webhook',
    webhookSecret: 'Webhook Secret (optional)',
    webhookSecretPlaceholder: 'Secret for HMAC signature verification',
    // Events
    events: 'Events',
    eventsDesc: 'Select which events should trigger notifications.',
    deploymentStarted: 'Deployment Started',
    deploymentSuccess: 'Deployment Successful',
    deploymentFailed: 'Deployment Failed',
    healthUnhealthy: 'Health Check Failed',
    healthRecovered: 'Health Recovered',
    // Actions
    testChannel: 'Test Channel',
    testing: 'Testing...',
    testSuccess: 'Test notification sent successfully!',
    testFailed: 'Failed to send test notification',
    viewLogs: 'View Logs',
    // Status
    active: 'Active',
    inactive: 'Inactive',
  },
  healthChecks: {
    title: 'Health Checks',
    description: 'Monitor your application health and automatically restart containers when they become unhealthy.',
    enable: 'Enable Health Checks',
    disable: 'Disable Health Checks',
    enabled: 'Health checks are enabled',
    disabled: 'Health checks are disabled',
    // Config fields
    endpoint: 'Health Endpoint',
    endpointPlaceholder: '/health',
    interval: 'Check Interval',
    intervalDesc: 'How often to check the health endpoint',
    timeout: 'Timeout',
    timeoutDesc: 'Maximum time to wait for a response',
    unhealthyThreshold: 'Unhealthy Threshold',
    unhealthyThresholdDesc: 'Number of consecutive failures before marking as unhealthy',
    autoRestart: 'Auto Restart',
    autoRestartDesc: 'Automatically restart the container when unhealthy threshold is reached',
    // Status
    healthy: 'Healthy',
    unhealthy: 'Unhealthy',
    unknown: 'Unknown',
    // Logs
    recentLogs: 'Recent Health Checks',
    noLogs: 'No health check logs',
    noLogsDesc: 'Health check results will appear here once monitoring begins.',
    responseTime: 'Response Time',
    statusCode: 'Status Code',
    consecutiveFailures: 'Consecutive Failures',
    actionTaken: 'Action Taken',
    restarted: 'Restarted',
    notified: 'Notified',
    noAction: 'None',
    seconds: 'seconds',
  },
  previews: {
    title: 'Preview Deployments',
    description: 'Automatically deploy pull request branches for testing before merging.',
    enable: 'Enable Preview Deployments',
    disable: 'Disable Preview Deployments',
    enabled: 'Preview deployments are enabled',
    disabled: 'Preview deployments are disabled',
    // Status
    pending: 'Pending',
    building: 'Building',
    running: 'Running',
    stopped: 'Stopped',
    failed: 'Failed',
    // List
    activePreviews: 'Active Previews',
    noPreviews: 'No preview deployments',
    noPreviewsDesc: 'Preview deployments will appear here when you open pull requests.',
    previewUrl: 'Preview URL',
    prNumber: 'PR',
    branch: 'Branch',
    baseBranch: 'Base',
    closed: 'Closed',
    viewOnGithub: 'View on GitHub',
  },
  metrics: {
    title: 'Container Metrics',
    description: 'Monitor CPU, memory, and network usage of your running containers.',
    // Current stats
    currentStats: 'Current Stats',
    cpu: 'CPU',
    memory: 'Memory',
    network: 'Network',
    containerStatus: 'Container Status',
    // 24h stats
    stats24h: '24 Hour Statistics',
    avgCpu: 'Avg CPU',
    maxCpu: 'Max CPU',
    avgMemory: 'Avg Memory',
    maxMemory: 'Max Memory',
    networkIn: 'Network In',
    networkOut: 'Network Out',
    dataPoints: 'Data Points',
    // Chart
    cpuUsage: 'CPU Usage',
    memoryUsage: 'Memory Usage',
    networkIO: 'Network I/O',
    last1Hour: 'Last 1 Hour',
    last6Hours: 'Last 6 Hours',
    last24Hours: 'Last 24 Hours',
    // Status
    running: 'Running',
    stopped: 'Stopped',
    noData: 'No Metrics Data',
    noDataDesc: 'Metrics will appear once your container is running and collecting data.',
    lastUpdated: 'Last updated',
    refreshing: 'Refreshing...',
  },
  monitoring: {
    title: 'Monitoring',
    description: 'Real-time resource monitoring across all projects',
    overview: 'Overview',
    cpuUsage: 'CPU Usage',
    memoryUsage: 'Memory Usage',
    networkIO: 'Network I/O',
    runningContainers: 'Running Containers',
    totalCpu: 'Total CPU',
    totalMemory: 'Total Memory',
    avgCpu: 'Avg CPU',
    avgMemory: 'Avg Memory',
    projectResources: 'Project Resources',
    project: 'Project',
    cpu: 'CPU',
    memory: 'Memory',
    network: 'Network',
    status: 'Status',
    running: 'Running',
    stopped: 'Stopped',
    noData: 'No Monitoring Data',
    noDataDesc: 'Metrics will appear once your containers are running and collecting data.',
    autoRefresh: 'Auto-refresh',
    last1Hour: '1H',
    last6Hours: '6H',
    last24Hours: '24H',
    allProjects: 'All Projects',
    systemHealth: 'System Health',
    healthy: 'All Systems Operational',
    degraded: 'Degraded Performance',
    unhealthy: 'System Issues Detected',
    viewProject: 'View Project',
    totalNetworkIn: 'Total In',
    totalNetworkOut: 'Total Out',
    memoryOf: 'of',
  },
  apiKeys: {
    title: 'API Keys',
    description: 'Create API keys to access your projects programmatically from CI/CD pipelines or CLI tools.',
    createKey: 'Create API Key',
    keyName: 'Key Name',
    keyNamePlaceholder: 'e.g., CI/CD Pipeline, Development',
    scopes: 'Permissions',
    scopesDesc: 'Select which actions this API key can perform',
    allPermissions: 'All Permissions',
    expiresAt: 'Expiration',
    noExpiration: 'No expiration',
    secretKey: 'Secret Key',
    secretKeyWarning: 'Make sure to copy your API key now. You won\'t be able to see it again!',
    copyKey: 'Copy Key',
    keyCopied: 'Copied!',
    prefix: 'Key ID',
    lastUsed: 'Last Used',
    never: 'Never',
    createdAt: 'Created',
    expiresIn: 'Expires',
    expired: 'Expired',
    revoke: 'Revoke',
    revokeConfirm: 'Are you sure you want to revoke this API key? This action cannot be undone.',
    noKeys: 'No API Keys',
    noKeysDesc: 'Create an API key to get started with programmatic access.',
    creating: 'Creating...',
    revoking: 'Revoking...',
    // Scope labels
    scopeProjectsRead: 'Read projects',
    scopeProjectsWrite: 'Create/update projects',
    scopeDeploymentsRead: 'Read deployments',
    scopeDeploymentsWrite: 'Trigger deployments',
    scopeEnvvarsRead: 'Read environment variables',
    scopeEnvvarsWrite: 'Manage environment variables',
    scopeLogsRead: 'Read logs',
    scopeMetricsRead: 'Read metrics',
  },
  security: {
    title: 'Security',
    description: 'Manage your account security settings including two-factor authentication.',
    twoFactor: 'Two-Factor Authentication',
    twoFactorDesc: 'Add an extra layer of security to your account by requiring a verification code in addition to your password.',
    enabled: 'Enabled',
    disabled: 'Disabled',
    enable: 'Enable 2FA',
    disable: 'Disable 2FA',
    setup: 'Set Up',
    setupTitle: 'Set Up Two-Factor Authentication',
    setupDesc: 'Follow the steps below to enable two-factor authentication on your account.',
    scanQrCode: 'Scan QR Code',
    scanQrCodeDesc: 'Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code.',
    enterCode: 'Enter Verification Code',
    enterCodeDesc: 'Enter the 6-digit code from your authenticator app to verify setup.',
    backupCodes: 'Backup Codes',
    backupCodesDesc: 'Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.',
    backupCodesWarning: 'Each backup code can only be used once. Store them securely!',
    copyBackupCodes: 'Copy Backup Codes',
    confirmEnable: 'Enable Two-Factor Authentication',
    disableTitle: 'Disable Two-Factor Authentication',
    disableDesc: 'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
    disableWarning: 'Your account will only be protected by your password after disabling 2FA.',
    enterPassword: 'Enter your password to confirm',
    confirmDisable: 'Disable 2FA',
    regenerateBackupCodes: 'Regenerate Backup Codes',
    regenerateTitle: 'Regenerate Backup Codes',
    regenerateDesc: 'Generate new backup codes. This will invalidate all your existing backup codes.',
    regenerateWarning: 'Make sure to save your new backup codes. Your old codes will no longer work.',
    confirmRegenerate: 'Regenerate Codes',
    enabling: 'Enabling...',
    disabling: 'Disabling...',
    regenerating: 'Regenerating...',
    success: 'Success',
    enabledSuccess: 'Two-factor authentication has been enabled successfully.',
    disabledSuccess: 'Two-factor authentication has been disabled.',
    regeneratedSuccess: 'New backup codes have been generated.',
  },
  profile: {
    title: 'Profile',
    description: 'Manage your personal information and account settings.',
    personalInfo: 'Personal Information',
    personalInfoDesc: 'Update your personal details and how others see you on the platform.',
    name: 'Display Name',
    namePlaceholder: 'Enter your name',
    email: 'Email Address',
    emailHint: 'Your email address cannot be changed.',
    avatarUrl: 'Avatar URL',
    avatarUrlPlaceholder: 'https://example.com/avatar.jpg',
    avatarHint: 'Enter a URL to an image to use as your avatar.',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saved: 'Changes saved!',
    changePassword: 'Change Password',
    changePasswordDesc: 'Update your password to keep your account secure.',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordMismatch: 'Passwords do not match',
    passwordRequirements: 'Password must be at least 8 characters',
    updating: 'Updating...',
    passwordChanged: 'Password changed successfully!',
  },
  appearance: {
    title: 'Appearance',
    description: 'Customize how the application looks and feels.',
    theme: 'Theme',
    themeDesc: 'Select your preferred color theme for the interface.',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    languageDesc: 'Choose your preferred language for the interface.',
    english: 'English',
    turkish: 'Türkçe',
    saved: 'Preferences saved!',
  },
  sessions: {
    title: 'Sessions',
    description: 'Manage your active sessions across devices.',
    currentSession: 'Current Session',
    otherSessions: 'Other Sessions',
    noOtherSessions: 'No other sessions',
    noOtherSessionsDesc: 'You are only signed in on this device.',
    device: 'Device',
    location: 'Location',
    lastActive: 'Last active',
    signedIn: 'Signed in',
    thisDevice: 'This device',
    terminate: 'Sign out',
    terminateOthers: 'Sign out all other sessions',
    terminateConfirm: 'Are you sure you want to sign out this session?',
    terminateOthersConfirm: 'Are you sure you want to sign out all other sessions? This will sign you out from all devices except this one.',
    terminating: 'Signing out...',
    terminated: 'Session signed out successfully',
    allOthersTerminated: 'All other sessions have been signed out',
  },
  notificationPrefs: {
    title: 'Notifications',
    description: 'Configure how and when you receive notifications.',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive important updates and alerts via email.',
    deploymentAlerts: 'Deployment Alerts',
    deploymentAlertsDesc: 'Get notified when deployments succeed or fail.',
    securityAlerts: 'Security Alerts',
    securityAlertsDesc: 'Receive alerts about security-related events like new sign-ins.',
    weeklyDigest: 'Weekly Digest',
    weeklyDigestDesc: 'Receive a weekly summary of your project activity.',
    productUpdates: 'Product Updates',
    productUpdatesDesc: 'Stay informed about new features and improvements.',
    saved: 'Notification preferences saved!',
  },
  team: {
    title: 'Team',
    description: 'Manage your team members and organization settings.',
    members: 'Members',
    inviteMember: 'Invite Member',
    invite: 'Invite',
    inviting: 'Inviting...',
    emailAddress: 'Email Address',
    emailPlaceholder: 'colleague@example.com',
    role: 'Role',
    selectRole: 'Select a role',
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    viewer: 'Viewer',
    ownerDesc: 'Full access, can manage billing and delete the organization',
    adminDesc: 'Can manage members, projects, and settings',
    memberDesc: 'Can create and manage projects',
    viewerDesc: 'Read-only access to projects and deployments',
    changeRole: 'Change Role',
    removeMember: 'Remove Member',
    removeConfirm: 'Are you sure you want to remove this member from the organization?',
    removing: 'Removing...',
    noMembers: 'No members found',
    joined: 'Joined',
    you: 'You',
    orgSettings: 'Organization Settings',
    orgSettingsDesc: 'Update your organization name and URL slug.',
    orgName: 'Organization Name',
    orgNamePlaceholder: 'My Organization',
    orgSlug: 'URL Slug',
    orgSlugPlaceholder: 'my-organization',
    orgSlugHint: 'Used in URLs. Lowercase letters, numbers, and hyphens only.',
    saving: 'Saving...',
    saved: 'Organization settings saved!',
    // Invitations
    pendingInvitations: 'Pending Invitations',
    inviteByEmail: 'Invite by email',
    inviteNote: 'Note (optional)',
    inviteNotePlaceholder: 'Add a personal message...',
    sendInvitation: 'Send Invitation',
    sendingInvitation: 'Sending...',
    invitationSent: 'Invitation sent successfully',
    noPendingInvitations: 'No pending invitations',
    invitedBy: 'Invited by',
    expiresOn: 'Expires',
    revokeInvitation: 'Revoke',
    revoking: 'Revoking...',
    invitationRevoked: 'Invitation revoked',
    // Accept invitation page
    acceptInvitationTitle: 'You\'ve been invited',
    acceptInvitationDesc: 'to join as',
    joinOrg: 'Accept & Join',
    joining: 'Joining...',
    invitationAccepted: 'You have joined the organization successfully',
    invitationExpired: 'This invitation has expired or been revoked',
    invitationInvalid: 'This invitation link is invalid',
    loginToAccept: 'Log in to accept',
    registerToAccept: 'Create an account to accept',
  },
  billing: {
    title: 'Billing & Usage',
    description: 'View your current plan, usage statistics, and manage billing settings.',
    currentPlan: 'Current Plan',
    usage: 'Usage',
    usageDescription: 'Your current resource usage for this billing period.',
    features: 'Plan Features',
    featuresDescription: 'Features included in your current plan.',
    billingEmail: 'Billing Email',
    billingEmailDesc: 'Invoices and billing notifications will be sent to this address.',
    billingEmailPlaceholder: 'billing@example.com',
    updateEmail: 'Update Email',
    updating: 'Updating...',
    emailUpdated: 'Billing email updated successfully!',
    // Plan names
    free: 'Free',
    hobby: 'Hobby',
    pro: 'Pro',
    business: 'Business',
    enterprise: 'Enterprise',
    // Usage items
    servers: 'Servers',
    databases: 'Databases',
    projects: 'Projects',
    deploymentsThisMonth: 'Deployments this month',
    teamMembers: 'Team members',
    customDomains: 'Custom domains',
    // Limits
    unlimited: 'Unlimited',
    of: 'of',
    used: 'used',
    // Features
    previewDeployments: 'Preview Deployments',
    healthChecks: 'Health Checks',
    prioritySupport: 'Priority Support',
    included: 'Included',
    notIncluded: 'Not included',
    // Upgrade
    upgradePlan: 'Upgrade Plan',
    comparePlans: 'Compare Plans',
    currentPlanBadge: 'Current',
    perMonth: '/month',
    // Plan details
    planDetails: 'Plan Details',
    storageGb: 'Storage',
    bandwidthGb: 'Bandwidth',
    buildMinutes: 'Build minutes/month',
  },
  servers: {
    title: 'Servers',
    description: 'Manage your cloud servers and infrastructure.',
    newServer: 'New Server',
    createServer: 'Create Server',
    creating: 'Creating...',
    noServers: 'No servers yet',
    noServersDesc: 'Create a server to deploy your applications on your own infrastructure.',
    // Server details
    serverName: 'Server Name',
    serverNamePlaceholder: 'my-server',
    serverDescription: 'Description',
    serverDescriptionPlaceholder: 'Production server',
    provider: 'Provider',
    selectProvider: 'Select a provider',
    region: 'Region',
    selectRegion: 'Select a region',
    size: 'Size',
    selectSize: 'Select a size',
    image: 'Image',
    selectImage: 'Select an image',
    // Sizes
    sizeXs: 'Extra Small',
    sizeSm: 'Small',
    sizeMd: 'Medium',
    sizeLg: 'Large',
    sizeXl: 'Extra Large',
    // Status
    provisioning: 'Provisioning',
    running: 'Running',
    stopped: 'Stopped',
    rebooting: 'Rebooting',
    error: 'Error',
    deleting: 'Deleting',
    // Actions
    start: 'Start',
    stop: 'Stop',
    reboot: 'Reboot',
    deleteServer: 'Delete Server',
    deleteConfirm: 'Are you sure you want to delete this server? This action cannot be undone.',
    sync: 'Sync',
    syncing: 'Syncing...',
    // Specs
    vcpus: 'vCPUs',
    memory: 'Memory',
    disk: 'Disk',
    ipAddress: 'IP Address',
    privateIp: 'Private IP',
    // Providers
    hetzner: 'Hetzner Cloud',
    digitalocean: 'DigitalOcean',
    aws: 'Amazon Web Services',
    gcp: 'Google Cloud Platform',
    selfHosted: 'Self Hosted',
    // Messages
    started: 'Server started successfully',
    stoppedMsg: 'Server stopped successfully',
    rebooted: 'Server reboot initiated',
    deleted: 'Server deleted successfully',
    created: 'Server created successfully',
    notFound: 'Server not found',
    // Detail page
    overview: 'Overview',
    network: 'Network',
  },
  databases: {
    title: 'Databases',
    description: 'Manage your database instances',
    newDatabase: 'New Database',
    createTitle: 'Create Database',
    createSubtitle: 'Deploy a managed database on your server',
    noDatabases: 'No databases yet',
    noDatabasesDesc: 'Create a managed database to store your application data.',
    createFirst: 'Create your first database',
    noServersWarning: 'No servers available',
    noServersWarningDesc: 'You need at least one running server to create a database.',
    addServer: 'Add Server',
    // Form
    type: 'Database Type',
    name: 'Name',
    namePlaceholder: 'my-database',
    nameRequired: 'Database name is required',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Production database for...',
    server: 'Server',
    serverRequired: 'Please select a server',
    creating: 'Creating...',
    create: 'Create Database',
    // Card
    host: 'Host',
    port: 'Port',
    database: 'Database',
    databaseName: 'Database Name',
    storage: 'Storage',
    username: 'Username',
    password: 'Password',
    connectionString: 'Connection String',
    showCredentials: 'Show Credentials',
    hideCredentials: 'Hide Credentials',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this database? This action cannot be undone.',
    // Status
    provisioning: 'Provisioning',
    running: 'Running',
    stopped: 'Stopped',
    error: 'Error',
    deleting: 'Deleting',
    deleted: 'Database deleted successfully',
    notFound: 'Database not found',
    // Detail page
    connectionDetails: 'Connection Details',
    networkAccess: 'Network Access',
    info: 'Information',
    backups: 'Backups',
    dangerZone: 'Danger Zone',
    deleteDatabase: 'Delete Database',
    deleteConfirmation: 'This will permanently delete the database and all its data. This action cannot be undone.',
    copied: 'Copied to clipboard',
    // Actions
    start: 'Start',
    stop: 'Stop',
    restart: 'Restart',
    started: 'Database started successfully',
    restarted: 'Database restarted successfully',
    // External access
    externalAccessOn: 'External Access Enabled',
    externalAccessOff: 'Local Access Only',
    externalAccessOnDesc: 'Database is accessible from any IP address',
    externalAccessOffDesc: 'Database is only accessible from the server',
    externalAccessEnabled: 'External access enabled',
    externalAccessDisabled: 'External access disabled',
    externalAccessWarning: 'Warning: Enabling external access exposes your database to the internet. Make sure to use strong credentials.',
    enable: 'Enable',
    disable: 'Disable',
    // Backups
    autoBackup: 'Automatic Backups',
    retentionDays: 'Retention: {days} days',
    lastBackup: 'Last backup',
    backupHistory: 'Backup History',
    createBackup: 'Create Backup',
    noBackups: 'No backups yet',
    noBackupsDesc: 'Create a manual backup or enable automatic backups.',
    backupDate: 'Date',
    backupType: 'Type',
    backupStatus: 'Status',
    backupSize: 'Size',
    actions: 'Actions',
    automatic: 'Automatic',
    manual: 'Manual',
    backup_creating: 'Creating',
    backup_completed: 'Completed',
    backup_failed: 'Failed',
    backup_restoring: 'Restoring',
    backup_restored: 'Restored',
    restore: 'Restore',
    download: 'Download',
    backupStarted: 'Backup started',
    restoreStarted: 'Restore started',
    backupDeleted: 'Backup deleted',
    restoreConfirmTitle: 'Restore Database',
    restoreConfirmMessage: 'This will overwrite all current data with the backup. This action cannot be undone. Are you sure?',
    deleteBackupConfirm: 'Are you sure you want to delete this backup?',
    // Info
    created: 'Created',
    updated: 'Updated',
    // Password reset
    resetPassword: 'Reset Password',
    resetPasswordConfirm: 'Are you sure you want to reset the database password? This will generate a new password and update your connection string.',
    resettingPassword: 'Resetting password...',
    passwordResetSuccess: 'Password reset successfully. New credentials are shown below.',
    newCredentials: 'New Credentials',
  },
};
