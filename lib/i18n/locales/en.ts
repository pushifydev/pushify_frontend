import { toastsEn, type ToastsKeys } from './toasts';

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
    operationFailed: string;
    refresh: string;
    /** Greeting when user name is missing */
    fallbackDisplayName: string;
    themeSwitchToLight: string;
    themeSwitchToDark: string;
    toggleThemeAria: string;
    openMenu: string;
    closeMenu: string;
    menuTitle: string;
    githubAria: string;
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
    alerts: string;
    team: string;
    servers: string;
    newProject: string;
    settings: string;
    settingsDescription: string;
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
    onboardingTitle: string;
    onboardingSubtitle: string;
    onboardingDismiss: string;
    onboardingContinue: string;
    onboardingLocked: string;
    onboardingDocs: string;
    onboardingMarketplace: string;
    onboardingSiteStudio: string;
    onboardingStepServerTitle: string;
    onboardingStepServerDesc: string;
    onboardingStepProjectTitle: string;
    onboardingStepProjectDesc: string;
    onboardingStepDeployTitle: string;
    onboardingStepDeployDesc: string;
    opsPanelTitle: string;
    opsRunning: string;
    opsInProgress: string;
    opsFailed24h: string;
    opsFailedTotal: string;
    opsAllClear: string;
    opsRecentFailures: string;
    opsNoErrorMessage: string;
    opsViewAllActivity: string;
    attentionZoneTitle: string;
    infraLowBalanceTitle: string;
    usageAlertsTitle: string;
    usageAlertsDesc: string;
    usageAlertsUpgrade: string;
    usageResourceServers: string;
    usageResourceDatabases: string;
    usageResourceProjects: string;
    usageResourceDeployments: string;
    usageResourceTeamMembers: string;
    usageResourceCustomDomains: string;
    usageResourceBuildMinutes: string;
    usageResourceStorage: string;
    usageResourceBandwidth: string;
  };
  alerts: {
    title: string;
    description: string;
    tabChannels: string;
    tabHealth: string;
    tabDelivery: string;
    statChannels: string;
    statProjects: string;
    statFailed24h: string;
    statUnhealthy: string;
    issuesBanner: string;
    channelsTitle: string;
    addChannelHint: string;
    events: string;
    noChannelsTitle: string;
    noChannelsDesc: string;
    healthTitle: string;
    healthDisabled: string;
    healthPlanUpgrade: string;
    upgradePlan: string;
    notConfigured: string;
    noProjectsTitle: string;
    noProjectsDesc: string;
    deliveryTitle: string;
    noLogsTitle: string;
    noLogsDesc: string;
  };
  activityLog: {
    subtitle: string;
    filterAll: string;
    filterProjects: string;
    filterDeployments: string;
    filterEnvVars: string;
    filterDomains: string;
    filterApiKeys: string;
    emptyTitle: string;
    emptyDescription: string;
    /** "{start}–{end}" and "{total}" placeholders */
    paginationShowing: string;
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
    alertsMenu: string;
    alertsAllClear: string;
    alertsViewAll: string;
    alertsFailedDeliveries: string;
    alertsUnhealthyApps: string;
    alertsRecentFailures: string;
    alertsNoChannels: string;
    alertsSetupChannel: string;
    alertsLoading: string;
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
  legal: {
    legal: string;
    about: string;
    privacy: string;
    terms: string;
    refund: string;
    cookies: string;
  };
  landing: {
    // Navigation
    features: string;
    frameworks: string;
    pricing: string;
    openSource: string;
    // Hero
    openSourcePlatform: string;
    getStartedFree: string;
    viewOnGithub: string;
    edgeLocations: string;
    deployTime: string;
    uptimeSla: string;
    configRequired: string;
    /** Hero editorial body (below headline) */
    heroLead: string;
    heroStarGithub: string;
    heroStatMitLicensed: string;
    heroStatDeployFast: string;
    heroStatNoVendorLockIn: string;
    heroMetaPlatform: string;
    heroMetaDeploymentsLive: string;
    heroMetaDeploymentsLiveShort: string;
    /** Footer social icon labels */
    socialGithub: string;
    socialEmail: string;
    // Frameworks section
    universalCompatibility: string;
    worksWithEvery: string;
    everyFramework: string;
    zeroConfigRequired: string;
    autoDetected: string;
    zeroConfig: string;
    frameworksSupported: string;
    // Features page hero
    platform: string;
    everythingYouNeedTo: string;
    shipWithConfidence: string;
    featuresPageDescription: string;
    // Features hero blocks
    deployLabel: string;
    pushToDeployTitle: string;
    pushToDeployDesc: string;
    infrastructureLabel: string;
    serversFullyManagedTitle: string;
    serversFullyManagedDesc: string;
    dataLabel: string;
    databasesOneClickTitle: string;
    databasesOneClickDesc: string;
    cliLabel: string;
    deployFromTerminalTitle: string;
    deployFromTerminalDesc: string;
    // Mini features grid
    andEverythingElse: string;
    everyFeatureBuiltIn: string;
    customDomainsAndSsl: string;
    customDomainsAndSslDesc: string;
    teamCollaboration: string;
    teamCollaborationDesc: string;
    aiAssistant: string;
    aiAssistantDesc: string;
    activityLogs: string;
    activityLogsDesc: string;
    healthChecks: string;
    healthChecksDesc: string;
    previewDeployments: string;
    previewDeploymentsDesc: string;
    environmentVariables: string;
    environmentVariablesDesc: string;
    notifications: string;
    notificationsDesc: string;
    // Features section (legacy)
    platformFeatures: string;
    everythingYouNeed: string;
    shipFaster: string;
    featuresDescription: string;
    sslCertificates: string;
    customDomains: string;
    ddosProtection: string;
    live: string;
    unlimitedTeamMembers: string;
    // Pricing section
    pricingBadge: string;
    simpleTransparent: string;
    transparentGradient: string;
    pricingSubtitle: string;
    monthly: string;
    yearly: string;
    mostPopular: string;
    forever: string;
    month: string;
    freeForever: string;
    billedMonthly: string;
    billedAnnually: string;
    custom: string;
    contactForPricing: string;
    pricingBottomNote: string;
    billingHowItWorksBadge: string;
    billingHowItWorksTitle: string;
    billingHowItWorksSubtitle: string;
    billingPlatformTitle: string;
    billingPlatformIntro: string;
    billingPlatformItem1: string;
    billingPlatformItem2: string;
    billingPlatformItem3: string;
    billingPlatformItem4: string;
    billingPlatformItem5: string;
    billingInfraTitle: string;
    billingInfraIntro: string;
    billingInfraItem1: string;
    billingInfraItem2: string;
    billingInfraItem3: string;
    billingInfraItem4: string;
    billingInfraItem5: string;
    billingByosNote: string;
    billingPolicyTitle: string;
    billingPolicyBody: string;
    billingCtaPricing: string;
    // Plan names
    planFree: string;
    planHobby: string;
    planPro: string;
    planBusiness: string;
    planEnterprise: string;
    // Plan descriptions
    planFreeDesc: string;
    planHobbyDesc: string;
    planProDesc: string;
    planBusinessDesc: string;
    planEnterpriseDesc: string;
    // Plan button texts
    planFreeButton: string;
    planHobbyButton: string;
    planProButton: string;
    planBusinessButton: string;
    planEnterpriseButton: string;
    // Plan feature labels
    planBuildMinutes: string;
    // Plan features
    planProjects: string;
    planDeploysMonth: string;
    planTeamMembers: string;
    planCustomDomain: string;
    planCustomDomains: string;
    planStorage: string;
    planBandwidth: string;
    planCommunitySupport: string;
    planServers: string;
    planDatabases: string;
    planPreviewDeployments: string;
    planHealthChecks: string;
    planPrioritySupport: string;
    // Open Source section
    openSourceBadge: string;
    builtInTheOpen: string;
    poweredByCommunity: string;
    openSourceDescription: string;
    openSourceCloudPlatform: string;
    mitLicensed: string;
    selfHostable: string;
    communityDriven: string;
    noVendorLockIn: string;
    // CTA section
    readyToLaunch: string;
    launch: string;
    ctaDescription: string;
    deployInSeconds: string;
    startDeployingFree: string;
    starOnGithub: string;
    githubStatStar: string;
    githubStatFork: string;
    githubStatLanguage: string;
    uptime: string;
    soc2Compliant: string;
    freeForeverPlan: string;
    // Footer
    openSourceUnderMit: string;
    twitter: string;
    cli: string;
    changelog: string;
    blog: string;
    contact: string;
    product: string;
    resources: string;
    company: string;
    footerDescription: string;
    builtWithLove: string;
    forDevelopers: string;
  };
  homepage: {
    // Stats
    stats: string;
    statsTrusted: string;
    statsDeployed: string;
    statsApps: string;
    statsUptime: string;
    statsByTheNumbers: string;
    // What is Pushify
    whatIsPushifyEyebrow: string;
    whatIsPushifyTitle: string;
    whatIsPushifyP1: string;
    whatIsPushifyP2: string;
    whatIsPushifyP3: string;
    // How it works
    howItWorksEyebrow: string;
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    // Marketplace preview
    marketplaceEyebrow: string;
    marketplaceTitle: string;
    marketplaceSubtitle: string;
    marketplaceCTA: string;
    // Comparison
    comparisonEyebrow: string;
    comparisonTitle: string;
    comparisonSubtitle: string;
    colPushify: string;
    colVercel: string;
    colCoolify: string;
    rowSelfHost: string;
    rowOpenSource: string;
    rowMarketplace: string;
    rowDatabaseMgmt: string;
    rowOwnServers: string;
    rowAIAssistant: string;
    rowPricing: string;
    rowFreeTier: string;
    pricingFromVercel: string;
    pricingPushify: string;
    pricingCoolify: string;
    // FAQ
    faqEyebrow: string;
    faqTitle: string;
    faq1Q: string;
    faq1A: string;
    faq2Q: string;
    faq2A: string;
    faq3Q: string;
    faq3A: string;
    faq4Q: string;
    faq4A: string;
    faq5Q: string;
    faq5A: string;
    faq6Q: string;
    faq6A: string;
    faq7Q: string;
    faq7A: string;
    faq8Q: string;
    faq8A: string;
    faq9Q: string;
    faq9A: string;
    // Editorial rail labels
    editorialHeroLabel: string;
    editorialLedeLabel: string;
    // How it works — display headline (split for emphasis)
    howItWorksH1Before: string;
    howItWorksH1Em: string;
    howItWorksH2Before: string;
    howItWorksH2Em: string;
    howItWorksH2After: string;
    howItWorksH3: string;
    /** "{step}" → 01..03 */
    howItWorksStepLabel: string;
    // Comparison — display headline
    comparisonHeadline1: string;
    comparisonHeadline2a: string;
    comparisonHeadline2Em: string;
    comparisonHeadline2b: string;
    comparisonColumnFeature: string;
    ctaSectionEyebrow: string;
    faqHeadline1: string;
    faqHeadline2a: string;
    faqHeadlineEm: string;
    faqHeadline2b: string;
    whatIsBodyLabel: string;
    whatIsLicenseHeading: string;
    whatIsLicenseDescription: string;
    pillar1Title: string;
    pillar1Detail: string;
    pillar2Title: string;
    pillar2Detail: string;
    pillar3Title: string;
    pillar3Detail: string;
    pillar4Title: string;
    pillar4Detail: string;
    marketplaceHeadlineAppsCount: string;
    marketplaceHeadlineAppsSuffix: string;
    marketplaceHeadlineTagline: string;
    marketplaceCatalogNo: string;
    marketplaceCatalogMark: string;
    marketplaceCatalogName: string;
    marketplaceCatalogCategory: string;
    marketplaceCatalogStatus: string;
    marketplaceCatalogFooter: string;
    fullPlanComparisonTitle: string;
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
    requestFailed: string;
    requestTimeout: string;
    networkUnavailable: string;
    rateLimited: string;
    payloadTooLarge: string;
  };
  toasts: ToastsKeys;
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
    rollbackToVersion: string;
    rollbackQuickHint: string;
    rollbackConfirmTitle: string;
    rollbackConfirmDesc: string;
    rollbackToLastGood: string;
    deploymentFailedBanner: string;
    deploymentErrorTitle: string;
    failureOutOfMemory: string;
    failureDiskSpace: string;
    failurePlatformNative: string;
    failureDockerBuild: string;
    failureApplicationBuild: string;
    failureContainerStart: string;
    failureServerCapacity: string;
    failureProjectConfig: string;
    failureUnknown: string;
    failureBlamePushify: string;
    failureBlameServer: string;
    failureBlameProject: string;
    timelineQueued: string;
    timelineBuild: string;
    timelineDeploy: string;
    timelineLive: string;
    timelineFailed: string;
    viewLogs: string;
    containerLogs: string;
    historicalLogs: string;
    logsHelpTitle: string;
    logsHelpBuild: string;
    logsHelpContainer: string;
    logsHelpHistorical: string;
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
    installGithubWebhook: string;
    installGithubWebhookHint: string;
    deployQueuePosition: string;
    deployQueueWaiting: string;
    gitlabStep1: string;
    gitlabStep2: string;
    gitlabStep3: string;
    gitlabStep4: string;
    webhooksDescGitlab: string;
    webhookUrlHintGitlab: string;
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
    connectGitlab: string;
    connectGitlabDesc: string;
    gitlabIntegration: string;
    gitlabIntegrationDesc: string;
    connectGitlabBtn: string;
    checkingGitLab: string;
    changeGitlabAccount: string;
    disconnectGitlab: string;
    gitlabDisconnected: string;
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
    changeGithubAccount: string;
    disconnectGithub: string;
    githubDisconnected: string;
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
    webhookSecretOnceTitle: string;
    webhookSecretOnceDesc: string;
    webhookSetupOnceTitle: string;
    webhookSetupOnceDesc: string;
    webhookUrlLabel: string;
    webhookUrlOnceHint: string;
    webhookUrlCopy: string;
    webhookUrlCopied: string;
    webhookSecretLabel: string;
    webhookSecretOnceHint: string;
    webhookSetupFootnote: string;
    webhookSecretCopy: string;
    webhookSecretCopied: string;
    webhookSecretContinue: string;
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
    statusTimeout: string;
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
    planRequired: string;
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
    noDeploymentRunning: string;
    noDeploymentRunningDesc: string;
    waitingForMetrics: string;
    hintWaitCollect: string;
    lastStatus: string;
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
    noProjects: string;
    noProjectsDesc: string;
    noMetricsYet: string;
    noMetricsYetDesc: string;
    hintRunningDeploy: string;
    hintWaitCollect: string;
    viewProjects: string;
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
    rateLimitBanner: string;
    rateLimitBannerUnlimited: string;
    viewBilling: string;
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
    yourRole: string;
    invitationEmailMismatch: string;
    loginOrRegisterToJoin: string;
    redirectingToDashboard: string;
  };
  billing: {
    title: string;
    description: string;
    currentPlan: string;
    apiRateLimit: string;
    apiRateLimitValue: string;
    apiRateLimitUnlimited: string;
    apiRateLimitHint: string;
    usage: string;
    usageDescription: string;
    usageStorageHint: string;
    usageBandwidthHint: string;
    usageNearLimitTitle: string;
    usageAtLimitTitle: string;
    usageNearLimitDesc: string;
    usageUpgradeCta: string;
    usageBadgeNear: string;
    usageBadgeLimit: string;
    usageNotOnPlan: string;
    usageMinutesUnit: string;
    features: string;
    featuresDescription: string;
    billingEmail: string;
    billingEmailDesc: string;
    billingEmailCurrent: string;
    billingEmailNew: string;
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
    buildMinutesThisMonth: string;
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
    billingCycleMonthly: string;
    billingCycleYearly: string;
    billingCycleYearlySave: string;
    billedMonthly: string;
    billedAnnually: string;
    plansPaidSection: string;
    plansScrollHint: string;
    // Plan details
    planDetails: string;
    storageGb: string;
    bandwidthGb: string;
    buildMinutes: string;
    apiRequestsPerMinuteShort: string;
    // Payment
    paymentSuccess: string;
    planUpgraded: string;
    redirecting: string;
    goToBilling: string;
    stripeNotConfigured: string;
    comparePlansSubtitle: string;
    plansFooterLead: string;
    plansPricingNote: string;
    plansFooterNeedCustom: string;
    plansContactUs: string;
    planMostPopular: string;
    upgradeButton: string;
    downgradeButton: string;
    planPriceCustom: string;
    planFreeForeverLabel: string;
    planContactPricing: string;
    deploymentsPerMonthShort: string;
    emailUpdateFailed: string;
    personalOrganization: string;
    infraWalletTitle: string;
    infraWalletDesc: string;
    infraBalance: string;
    infraMarginNote: string;
    infraEstimatedBurn: string;
    infraRunningServers: string;
    infraTopUp: string;
    infraTopUpHint: string;
    infraTopUpRedirecting: string;
    infraTransactions: string;
    infraPerMonth: string;
    infraPerHour: string;
    infraCredits: string;
    infraTopUpSuccess: string;
    infraTopUpPending: string;
    infraTopUpCancelled: string;
    billingStatusPastDueTitle: string;
    billingStatusPastDueDesc: string;
    billingStatusSuspendedTitle: string;
    billingStatusSuspendedDesc: string;
    grandfatherBanner: string;
    usagePlanLimitNote: string;
    grandfatherBoostItem: string;
    infraLowBalanceWarning: string;
    infraRunwayDays: string;
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
    infraCustomerPrice: string;
    infraPlanBlocked: string;
    infraWalletBanner: string;
    // Status
    provisioning: string;
    running: string;
    stopped: string;
    rebooting: string;
    error: string;
    deleting: string;
    setupPending: string;
    setupInstalling: string;
    setupReady: string;
    setupFailed: string;
    // Actions
    start: string;
    stop: string;
    reboot: string;
    deleteServer: string;
    deleteConfirm: string;
    sync: string;
    syncing: string;
    viewCards: string;
    viewMap: string;
    mapNoCoords: string;
    mapNoCoordsDesc: string;
    mapNoLocationList: string;
    projectCount: string;
    databaseCount: string;
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
    detailBack: string;
    statusInfraCreditsStopped: string;
    statusInfraCreditsStoppedHint: string;
    infraBillingTitle: string;
    infraWalletBalance: string;
    infraMonthlyCost: string;
    infraStartRequires: string;
    infraInsufficientForStart: string;
    infraReadyToStart: string;
    statusBillingSuspended: string;
    openTerminal: string;
    setupBannerTitle: string;
    setupBannerDesc: string;
    setupFailedTitle: string;
    setupReadyTitle: string;
    setupReadyDesc: string;
    sshAccess: string;
    traffic: string;
    trafficIngoing: string;
    trafficOutgoing: string;
    trafficIncluded: string;
    serverType: string;
    fieldType: string;
    fieldDescription: string;
    cpuType: string;
    architecture: string;
    storageType: string;
    location: string;
    city: string;
    country: string;
    datacenter: string;
    networkZone: string;
    protection: string;
    deleteProtection: string;
    rebuildProtection: string;
    detailEnabled: string;
    detailDisabled: string;
    timestamps: string;
    lastSeen: string;
    managedBadge: string;
    createdAtLabel: string;
    updatedAtLabel: string;
    fieldOs: string;
    hubNextStepsTitle: string;
    hubStepTopUp: string;
    hubStepStart: string;
    hubStepFixSetup: string;
    hubStepWaitSetup: string;
    hubStepDeployFirst: string;
    hubStepRunningReady: string;
    hubStepTerminal: string;
    hubProjectsTitle: string;
    hubProjectsEmpty: string;
    hubNewProject: string;
    hubDatabasesTitle: string;
    hubDatabasesEmpty: string;
    hubAddDatabase: string;
    hubRunwayDays: string;
    editServer: string;
    editServerTitle: string;
    resizeButton: string;
    resizeTitle: string;
    resizeDesc: string;
    resizeNoOptions: string;
    resizeWarning: string;
    resizeConfirm: string;
    perMonthShort: string;
    sshPanelTitle: string;
    sshConnectCommand: string;
    sshDownloadKey: string;
    firewallTitle: string;
    firewallDesc: string;
    firewallPort22: string;
    firewallPort80: string;
    firewallPort443: string;
    firewallHetznerHint: string;
    snapshotsTitle: string;
    snapshotsDesc: string;
    snapshotsEmpty: string;
    snapshotCreate: string;
    snapshotRestore: string;
    snapshotRestoreTitle: string;
    snapshotRestoreWarning: string;
    snapshotRestoreConfirm: string;
    snapshotStatusAvailable: string;
    snapshotStatusCreating: string;
    snapshotProgress: string;
    snapshotSizePending: string;
    autoSnapshotTitle: string;
    autoSnapshotDesc: string;
    autoSnapshotLastRun: string;
    serverHealthTitle: string;
    healthScan: string;
    healthScanFailed: string;
    diskUsage: string;
    diskFree: string;
    orphanContainersTitle: string;
    orphanContainersDesc: string;
    noOrphanContainers: string;
    timelineTitle: string;
    timelineEmpty: string;
    timelineCreated: string;
    timelineSynced: string;
    timelineResizing: string;
    timelineInfraStopped: string;
    // BYOS
    cloudProvider: string;
    managedProviderActive: string;
    managedProvidersComingSoon: string;
    comingSoonBadge: string;
    loadingSizes: string;
    sshKeyOptionalNote: string;
    sizeExceedsPlan: string;
    managedNotAllowedOnPlan: string;
    existingServer: string;
    byosTitle: string;
    byosDescription: string;
    ipAddressLabel: string;
    ipAddressPlaceholder: string;
    ipAddressHint: string;
    authMethod: string;
    sshKey: string;
    rootPassword: string;
    sshKeyPlaceholder: string;
    rootPasswordPlaceholder: string;
    sshKeyHint: string;
    rootPasswordHint: string;
    byosInfoTitle: string;
    byosStep1: string;
    byosStep2: string;
    byosStep3: string;
    byosStep4: string;
    readyToCreate: string;
    fillRequiredFields: string;
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
    listBackupOn: string;
    listBackupOff: string;
    neverBackedUp: string;
    manageBackupsLink: string;
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
  marketplace: {
    title: string;
    description: string;
    siteStudioBanner: string;
    siteStudioBannerCta: string;
    searchPlaceholder: string;
    deploy: string;
    deployTitle: string;
    deployDescription: string;
    selectServer: string;
    configureEnvVars: string;
    reviewDeploy: string;
    deploying: string;
    deploySuccess: string;
    deployFailed: string;
    noServers: string;
    noTemplates: string;
    categoryAll: string;
    categoryCms: string;
    categoryAutomation: string;
    categoryMonitoring: string;
    categoryStorage: string;
    categoryDevtools: string;
    categoryAnalytics: string;
    categoryDatabase: string;
    requirements: string;
    minMemory: string;
    minDisk: string;
    requiresDatabase: string;
    appName: string;
    appNamePlaceholder: string;
    envVarAutoGenerated: string;
    envVarLeaveBlankToGenerate: string;
    featured: string;
    viewDetails: string;
    tabCatalog: string;
    tabInstalled: string;
    noInstallsTitle: string;
    noInstallsDesc: string;
    backToMarketplace: string;
    step: string;
    of: string;
    next: string;
    previous: string;
    confirmDeploy: string;
    optional: string;
    required: string;
    tags: string;
    documentation: string;
    website: string;
    dockerImage: string;
    version: string;
  };
  siteStudio: {
    navTitle: string;
    title: string;
    badge: string;
    marketplaceBanner: string;
    marketplaceBannerCta: string;
    paymentRegionGlobal: string;
    paymentRegionRegional: string;
    heroDescription: string;
    heroPoint1: string;
    heroPoint2: string;
    heroPoint3: string;
    comingSoonTitle: string;
    comingSoonDesc: string;
    roadmap: string;
    searchPlaceholder: string;
    launch: string;
    launchNow: string;
    launchTitle: string;
    launchSuccess: string;
    launching: string;
    featured: string;
    allTemplates: string;
    noTemplates: string;
    categoryAll: string;
    categoryEcommerce: string;
    categoryCorporate: string;
    categoryBlog: string;
    categoryPortfolio: string;
    categoryRestaurant: string;
    categoryNewsletter: string;
    categoryBooking: string;
    categorySaas: string;
    filterCategory: string;
    filterPlatform: string;
    platformsTitle: string;
    platformNote: string;
    stackWordpress: string;
    stackGhost: string;
    stackStrapi: string;
    stackDirectus: string;
    stackPocketbase: string;
    stackCalcom: string;
    backToStudio: string;
    siteName: string;
    siteNamePlaceholder: string;
    customDomain: string;
    domainPlaceholder: string;
    domainHint: string;
    selectServer: string;
    noServers: string;
    paymentIntegrations: string;
    paymentNote: string;
    afterLaunch: string;
    reviewTitle: string;
    template: string;
    estimatedTime: string;
    minutes: string;
    includedFeatures: string;
    setupGuide: string;
    step: string;
    of: string;
    next: string;
    previous: string;
    optional: string;
    devCtaTitle: string;
    devCtaDesc: string;
    devCtaLink: string;
    dashboardCtaTitle: string;
    dashboardCtaDesc: string;
    dashboardCtaButton: string;
    projectDeployBannerTitle: string;
    projectDeployBannerDesc: string;
    projectDeployInProgress: string;
    projectDeployOpenSite: string;
    projectDeploySetupCalcom: string;
    launchSuccessDetail: string;
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
    operationFailed: 'Something went wrong',
    refresh: 'Refresh',
    fallbackDisplayName: 'Developer',
    themeSwitchToLight: 'Switch to light mode',
    themeSwitchToDark: 'Switch to dark mode',
    toggleThemeAria: 'Toggle theme',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuTitle: 'Menu',
    githubAria: 'Pushify on GitHub',
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
    alerts: 'Alerts',
    team: 'Team',
    servers: 'Servers',
    newProject: 'New Project',
    settings: 'Settings',
    settingsDescription: 'Manage your account settings and preferences',
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
    onboardingTitle: 'Get your first app live',
    onboardingSubtitle: 'Three steps — works on any VPS worldwide (Hetzner, AWS, DigitalOcean, or your own server).',
    onboardingDismiss: 'Dismiss checklist',
    onboardingContinue: 'Continue',
    onboardingLocked: 'Complete the step above first',
    onboardingDocs: 'Documentation',
    onboardingMarketplace: 'One-click apps',
    onboardingSiteStudio: 'Website templates',
    onboardingStepServerTitle: 'Connect a server',
    onboardingStepServerDesc: 'Add a VPS via Hetzner or connect any Linux server with SSH.',
    onboardingStepProjectTitle: 'Create a project',
    onboardingStepProjectDesc: 'Link a GitHub repository or deploy from the marketplace.',
    onboardingStepDeployTitle: 'Deploy to production',
    onboardingStepDeployDesc: 'Trigger your first deploy — SSL and domains can be added anytime.',
    opsPanelTitle: 'Operations',
    opsRunning: 'Running',
    opsInProgress: 'In progress',
    opsFailed24h: 'Failed (24h)',
    opsFailedTotal: 'Failed (all)',
    opsAllClear: 'No critical issues — deployments and servers look healthy.',
    opsRecentFailures: 'Recent failed deploys',
    opsNoErrorMessage: 'Deployment failed — see logs',
    opsViewAllActivity: 'View all activity',
    attentionZoneTitle: 'Needs attention',
    infraLowBalanceTitle: 'Low infrastructure credits',
    usageAlertsTitle: 'Plan usage',
    usageAlertsDesc: 'You are approaching limits on your current plan. Upgrade before deploys or invites are blocked.',
    usageAlertsUpgrade: 'Upgrade plan',
    usageResourceServers: 'Servers',
    usageResourceDatabases: 'Databases',
    usageResourceProjects: 'Projects',
    usageResourceDeployments: 'Deployments this month',
    usageResourceTeamMembers: 'Team members',
    usageResourceCustomDomains: 'Custom domains',
    usageResourceBuildMinutes: 'Build minutes this month',
    usageResourceStorage: 'Storage this month',
    usageResourceBandwidth: 'Bandwidth this month',
  },
  alerts: {
    title: 'Alerts',
    description: 'Notification channels, health checks, and delivery history across all projects.',
    tabChannels: 'Channels',
    tabHealth: 'Health checks',
    tabDelivery: 'Delivery log',
    statChannels: 'Active channels',
    statProjects: 'Projects w/ alerts',
    statFailed24h: 'Failed (24h)',
    statUnhealthy: 'Unhealthy apps',
    issuesBanner: 'Some deliveries failed or health checks reported problems. Review the tabs below.',
    channelsTitle: 'Notification channels',
    addChannelHint: 'Manage per project',
    events: 'events',
    noChannelsTitle: 'No notification channels',
    noChannelsDesc: 'Add Slack, email, or webhook alerts on a project’s Notifications tab.',
    healthTitle: 'Project health monitoring',
    healthDisabled: 'Not enabled',
    healthPlanUpgrade: 'Health checks require a Hobby plan or higher.',
    upgradePlan: 'View plans',
    notConfigured: 'Not configured',
    noProjectsTitle: 'No projects yet',
    noProjectsDesc: 'Create a project to configure health endpoint monitoring.',
    deliveryTitle: 'Recent deliveries',
    noLogsTitle: 'No delivery history',
    noLogsDesc: 'Notification attempts will appear here after deploy or health events fire.',
  },
  activityLog: {
    subtitle: 'Track all changes and actions in your organization',
    filterAll: 'All',
    filterProjects: 'Projects',
    filterDeployments: 'Deployments',
    filterEnvVars: 'Env Vars',
    filterDomains: 'Domains',
    filterApiKeys: 'API Keys',
    emptyTitle: 'No activity found',
    emptyDescription: 'Activity will appear here as you make changes',
    paginationShowing: 'Showing {start}–{end} of {total}',
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
    alertsMenu: 'Alerts & notifications',
    alertsAllClear: 'No failed deliveries or unhealthy apps in the last 24 hours.',
    alertsViewAll: 'Open alerts center',
    alertsFailedDeliveries: '{count} failed deliveries (24h)',
    alertsUnhealthyApps: '{count} unhealthy apps',
    alertsRecentFailures: 'Recent failures',
    alertsNoChannels: 'No notification channels configured yet.',
    alertsSetupChannel: 'Add alerts on a project',
    alertsLoading: 'Loading alerts…',
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
  legal: {
    legal: 'Legal',
    about: 'About',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    refund: 'Refund Policy',
    cookies: 'Cookie Policy',
  },
  landing: {
    // Navigation
    features: 'Features',
    frameworks: 'Frameworks',
    pricing: 'Pricing',
    openSource: 'Open Source',
    // Hero
    openSourcePlatform: 'Open Source Cloud Platform',
    getStartedFree: 'Get Started Free',
    viewOnGithub: 'View on GitHub',
    edgeLocations: 'Any VPS · Any region',
    deployTime: 'Deploy Time',
    uptimeSla: 'Self-hosted',
    configRequired: 'Config Required',
    heroLead:
      'Open-source PaaS for teams that want Vercel-grade developer experience without the vendor lock-in. Connect a repository, choose a server (yours or ours), and ship to production with HTTPS, builds, and zero-downtime cutover — in under a minute.',
    heroStarGithub: '★ Star on GitHub',
    heroStatMitLicensed: 'MIT licensed',
    heroStatDeployFast: '< 60s deploy',
    heroStatNoVendorLockIn: '0 vendor lock-in',
    heroMetaPlatform: 'PSH-01 / OPEN SOURCE PLATFORM',
    heroMetaDeploymentsLive: 'DEPLOYMENTS LIVE',
    heroMetaDeploymentsLiveShort: 'LIVE',
    socialGithub: 'GitHub',
    socialEmail: 'Email',
    // Frameworks section
    universalCompatibility: 'Universal Compatibility',
    worksWithEvery: 'Works with',
    everyFramework: 'every framework',
    zeroConfigRequired: 'Zero configuration required. Just push your code.',
    autoDetected: 'Auto-detected',
    zeroConfig: 'Zero config',
    frameworksSupported: 'frameworks supported',
    // Features page hero
    platform: 'Platform',
    everythingYouNeedTo: 'Everything you need to',
    shipWithConfidence: 'ship with confidence',
    featuresPageDescription: 'From git push to production in seconds. Pushify handles infrastructure, SSL, monitoring, and scaling — so you can focus on building.',
    // Features hero blocks
    deployLabel: 'Deploy',
    pushToDeployTitle: 'Push to deploy. Literally.',
    pushToDeployDesc: 'Connect your GitHub repo and every push triggers an automatic build and deploy pipeline. Framework auto-detection, build caching, zero-downtime deploys, and instant rollbacks — all out of the box.',
    infrastructureLabel: 'Infrastructure',
    serversFullyManagedTitle: 'Your servers, fully managed.',
    serversFullyManagedDesc:
      'Provision Hetzner Cloud servers from the dashboard (paid plans). Usage is billed hourly from your prepaid infrastructure credits — separate from your platform subscription. BYOS servers you connect via SSH do not use this wallet.',
    dataLabel: 'Data',
    databasesOneClickTitle: 'Databases in one click.',
    databasesOneClickDesc: 'Spin up PostgreSQL, MySQL, Redis, or MongoDB with automated backups, connection pooling, and secure access. No DevOps degree required.',
    cliLabel: 'CLI',
    deployFromTerminalTitle: 'Deploy from your terminal.',
    deployFromTerminalDesc: 'The Pushify CLI gives you full control from the command line. Init, deploy, manage env vars, tail logs — everything without leaving your editor.',
    // Mini features grid
    andEverythingElse: 'And everything else',
    everyFeatureBuiltIn: 'Every feature a modern deployment platform needs, built-in from day one.',
    customDomainsAndSsl: 'Custom Domains & SSL',
    customDomainsAndSslDesc: "Add your domains with automatic Let's Encrypt certificates. Zero configuration required.",
    teamCollaboration: 'Team Collaboration',
    teamCollaborationDesc: 'Invite team members with role-based access control: owner, admin, member, viewer.',
    aiAssistant: 'AI Assistant',
    aiAssistantDesc: 'Built-in AI powered by Claude to help you debug, configure, and understand your infrastructure.',
    activityLogs: 'Activity Logs',
    activityLogsDesc: 'Full audit trail of every action. Know who deployed what, when, and why.',
    healthChecks: 'Health Checks',
    healthChecksDesc: 'Automated endpoint monitoring with configurable intervals and instant alerts on failure.',
    previewDeployments: 'Preview Deployments',
    previewDeploymentsDesc: 'Every pull request gets its own preview URL. Review changes before they hit production.',
    environmentVariables: 'Environment Variables',
    environmentVariablesDesc: 'Per-environment secrets management. Encrypted at rest, injected at build and runtime.',
    notifications: 'Notifications',
    notificationsDesc: 'Email, webhook, and Slack alerts for deploys, failures, and health check incidents.',
    // Features section (legacy)
    platformFeatures: 'Platform Features',
    everythingYouNeed: 'Everything you need to',
    shipFaster: 'ship faster',
    featuresDescription: 'Focus on building your product. We handle the infrastructure, scaling, and deployment.',
    sslCertificates: 'SSL Certificates',
    customDomains: 'Custom Domains',
    ddosProtection: 'DDoS Protection',
    live: 'Live',
    unlimitedTeamMembers: 'Unlimited team members',
    // Pricing section
    pricingBadge: 'Pricing',
    simpleTransparent: 'Simple,',
    transparentGradient: 'transparent',
    pricingSubtitle:
      'Two clear bills: a monthly platform subscription (deploy, API, team limits) and a prepaid infrastructure wallet for managed Hetzner servers (hourly while running).',
    monthly: 'Monthly',
    yearly: 'Yearly',
    mostPopular: 'Most Popular',
    forever: 'forever',
    month: 'month',
    freeForever: 'Free forever',
    billedMonthly: 'billed monthly',
    billedAnnually: 'billed annually',
    custom: 'Custom',
    contactForPricing: 'Contact us for pricing',
    pricingBottomNote:
      'All platform plans include SSL, CI/CD, and monitoring. Managed Hetzner servers are not included in plan price — they draw from prepaid infrastructure credits billed by the hour while running.',
    billingHowItWorksBadge: 'Billing',
    billingHowItWorksTitle: 'How billing works',
    billingHowItWorksSubtitle:
      'No hidden bundles. You always know which charge is for the platform and which is for cloud servers.',
    billingPlatformTitle: 'Platform subscription',
    billingPlatformIntro:
      'Billed monthly or yearly through Stripe. Covers your Pushify workspace — not Hetzner server runtime.',
    billingPlatformItem1:
      'Deploy limits, API rate limits, team members, projects, custom domains, preview deployments, and health checks depend on your plan.',
    billingPlatformItem2:
      'SSL certificates, CI/CD pipelines, GitHub integration, and dashboard access are included on every paid plan.',
    billingPlatformItem3:
      'Free plan: deploy on your own servers (BYOS via SSH). Managed Hetzner provisioning from the dashboard requires Hobby or higher.',
    billingPlatformItem4:
      'If a subscription payment fails, your account enters past due: you cannot create new servers, projects, or deployments until the card is updated (existing servers may keep running during Stripe retries).',
    billingPlatformItem5:
      'When a subscription ends or is canceled, your plan moves to Free, active projects are paused, managed servers are stopped at the provider, and new deploys are blocked until you resubscribe.',
    billingInfraTitle: 'Infrastructure credits',
    billingInfraIntro:
      'Prepaid USD wallet for managed Hetzner Cloud servers only. Billed separately from your platform plan.',
    billingInfraItem1:
      'Add credits with a one-time Stripe checkout in Dashboard → Billing. Balance is shown in USD.',
    billingInfraItem2:
      'While a managed server is running, credits decrease every hour based on server size (all-in rate shown before you create the server).',
    billingInfraItem3:
      'Before provisioning a new managed server, keep at least about one month of estimated server cost in your wallet.',
    billingInfraItem4:
      'If credits run out, managed servers are stopped automatically until you top up. Your apps and data remain; you restart the server after adding credits.',
    billingInfraItem5:
      'Server size limits (vCPU/RAM) depend on your platform plan. Enterprise may run larger instances.',
    billingByosNote:
      'Servers you add via SSH (BYOS) do not use infrastructure credits — you pay your VPS provider directly. Only dashboard-provisioned Hetzner servers use the wallet.',
    billingPolicyTitle: 'Failed payments & cancellations',
    billingPolicyBody:
      'We email the billing address on file when a platform payment fails (at most once per 24 hours). Update your card in Billing → Manage subscription. Infrastructure top-ups are separate one-time charges and are not refunded automatically when a server is stopped for low balance.',
    billingCtaPricing: 'Compare platform plans →',
    // Plan names
    planFree: 'Free',
    planHobby: 'Hobby',
    planPro: 'Pro',
    planBusiness: 'Business',
    planEnterprise: 'Enterprise',
    // Plan descriptions
    planFreeDesc: 'Personal projects on your own servers (BYOS). No managed Hetzner from the dashboard.',
    planHobbyDesc: 'For hobbyists and side projects',
    planProDesc: 'For growing teams and serious projects',
    planBusinessDesc: 'For teams that need enterprise-grade features',
    planEnterpriseDesc: 'Unlimited resources for large organizations',
    // Plan button texts
    planFreeButton: 'Get Started Free',
    planHobbyButton: 'Start Hobby',
    planProButton: 'Start Pro Trial',
    planBusinessButton: 'Get Started',
    planEnterpriseButton: 'Contact Sales',
    // Plan features
    planBuildMinutes: 'build minutes',
    planProjects: 'projects',
    planDeploysMonth: 'deploys/month',
    planTeamMembers: 'team members',
    planCustomDomain: 'custom domain',
    planCustomDomains: 'custom domains',
    planStorage: 'storage',
    planBandwidth: 'bandwidth',
    planCommunitySupport: 'Community support',
    planServers: 'servers',
    planDatabases: 'databases',
    planPreviewDeployments: 'Preview deployments',
    planHealthChecks: 'Health checks',
    planPrioritySupport: 'Priority support',
    // Open Source section
    openSourceBadge: 'Open Source',
    builtInTheOpen: 'Built in the open,',
    poweredByCommunity: 'powered by the community',
    openSourceDescription: 'Pushify is fully open-source under the MIT license. Self-host on your own infrastructure, contribute features, or fork and customize to your needs.',
    openSourceCloudPlatform: 'Open-source cloud deployment platform',
    mitLicensed: 'MIT Licensed',
    selfHostable: 'Self-hostable',
    communityDriven: 'Community driven',
    noVendorLockIn: 'No vendor lock-in',
    // CTA section
    readyToLaunch: 'Ready to',
    launch: 'launch',
    ctaDescription: 'Open-source, self-hostable, and free to get started.',
    deployInSeconds: 'Deploy in seconds on your own servers.',
    startDeployingFree: 'Start Deploying Free',
    starOnGithub: 'Star on GitHub',
    githubStatStar: 'Star',
    githubStatFork: 'Fork',
    githubStatLanguage: 'TypeScript',
    uptime: 'Self-hostable',
    soc2Compliant: 'MIT Licensed',
    freeForeverPlan: 'Free Forever Plan',
    // Footer
    openSourceUnderMit: 'Open Source under MIT',
    twitter: 'Twitter',
    cli: 'CLI',
    changelog: 'Changelog',
    blog: 'Blog',
    contact: 'Contact',
    product: 'Product',
    resources: 'Resources',
    company: 'Company',
    footerDescription: 'Open-source cloud deployment platform. Your servers, your data, your rules.',
    builtWithLove: 'Built with',
    forDevelopers: 'for developers',
  },
  homepage: {
    // Stats
    stats: 'Trusted by developers worldwide',
    statsTrusted: 'GitHub stars',
    statsDeployed: 'Deployments per month',
    statsApps: 'Marketplace apps',
    statsUptime: 'Uptime SLA',
    statsByTheNumbers: 'By the numbers',
    // What is Pushify
    whatIsPushifyEyebrow: 'What is Pushify?',
    whatIsPushifyTitle: 'Your private cloud, fully managed.',
    whatIsPushifyP1: 'Pushify is an open-source platform that lets you deploy and manage your applications on your own servers — without the DevOps headache.',
    whatIsPushifyP2: 'Connect your GitHub repository, choose a server (or bring your own), and Pushify handles framework detection, Docker builds, SSL certificates, and zero-downtime deploys for you.',
    whatIsPushifyP3: 'Self-host on your VPS, your data center, or our managed cloud. Same UI, same workflow, your servers — your rules.',
    // How it works
    howItWorksEyebrow: 'How it works',
    howItWorksTitle: 'From code to production in 3 steps',
    howItWorksSubtitle: 'No Dockerfile, no Kubernetes, no DevOps team needed.',
    step1Title: 'Connect your repo',
    step1Desc: 'Sign in with GitHub. Pick the repository you want to deploy. Pushify auto-detects the framework — Next.js, Django, Rails, Go, you name it.',
    step2Title: 'Pick a server',
    step2Desc: 'Provision a VPS via Hetzner Cloud in one click, or connect your existing server with SSH. Servers are configured automatically.',
    step3Title: 'Push to deploy',
    step3Desc: 'Every git push triggers a build, runs in an isolated Docker container, and goes live with HTTPS in under 60 seconds.',
    // Marketplace preview
    marketplaceEyebrow: 'Marketplace',
    marketplaceTitle: '24+ apps. One-click install.',
    marketplaceSubtitle: 'Self-host the tools you love. WordPress, Supabase, Cal.com, NextCloud, and more — fully configured and ready in minutes.',
    marketplaceCTA: 'Browse marketplace',
    // Comparison
    comparisonEyebrow: 'Compare',
    comparisonTitle: 'How does Pushify compare?',
    comparisonSubtitle: 'Different platforms, different trade-offs. Here is where Pushify fits in.',
    colPushify: 'Pushify',
    colVercel: 'Vercel',
    colCoolify: 'Coolify',
    rowSelfHost: 'Self-host on your servers',
    rowOpenSource: 'Open source (MIT)',
    rowMarketplace: 'One-click app marketplace',
    rowDatabaseMgmt: 'Managed databases',
    rowOwnServers: 'Bring your own servers',
    rowAIAssistant: 'Built-in AI assistant',
    rowPricing: 'Starting price',
    rowFreeTier: 'Generous free tier',
    pricingFromVercel: 'From $20/mo',
    pricingPushify: 'Free / $10+',
    pricingCoolify: 'Free (self-hosted)',
    // FAQ
    faqEyebrow: 'FAQ',
    faqTitle: 'Frequently asked questions',
    faq1Q: 'What exactly is Pushify?',
    faq1A: 'Pushify is an open-source PaaS (Platform-as-a-Service) for developers who want Vercel-like simplicity without the vendor lock-in. You connect a GitHub repo, choose a server, and Pushify handles building, deploying, scaling, SSL, and monitoring. Either use our managed cloud or self-host the entire platform on your own infrastructure.',
    faq2Q: 'How is it different from Vercel or Render?',
    faq2A: 'Vercel and Render are closed-source SaaS — your apps run on their infrastructure, you pay per usage. Pushify is open-source: you can self-host the whole platform, run apps on your own VPS, and avoid lock-in. Plans start at $0 and scale predictably.',
    faq3Q: 'How is it different from Coolify or CapRover?',
    faq3A: 'Coolify is excellent open-source self-host but lacks team collaboration, billing, and a hosted option. Pushify offers both: run it yourself for free, or use our managed service for one-click setup. We also include a 24+ app marketplace, AI assistant, and Stripe-compatible billing out of the box.',
    faq4Q: 'Is the source code really open?',
    faq4A: 'Yes. Pushify\'s frontend, backend, and CLI are MIT-licensed and public on GitHub. You can fork, audit, contribute, or run a private instance with no restrictions.',
    faq5Q: 'Can I bring my own servers?',
    faq5A: 'Absolutely. Add any Linux VPS via SSH (DigitalOcean, AWS, Hetzner, your home server) and Pushify will install Docker and Nginx, then deploy your apps there. You can also provision Hetzner Cloud servers from the dashboard with one click.',
    faq6Q: 'What payment methods do you accept?',
    faq6A:
      'Platform subscriptions and infrastructure credit top-ups use major credit and debit cards via Stripe. Payments are encrypted; we never store your full card number on our servers.',
    faq7Q: 'How are managed Hetzner servers billed?',
    faq7A:
      'They use a prepaid infrastructure credits wallet (USD), separate from your platform subscription. Credits decrease hourly while the server is running. Top up in Dashboard → Billing before creating a server, and keep roughly one month of estimated cost available. If credits run out, the server stops until you add more. BYOS servers you connect with SSH are not charged through this wallet.',
    faq8Q: 'What happens if my platform subscription payment fails?',
    faq8A:
      'Stripe retries the charge. Your organization is marked past due: you cannot create new projects, servers, databases, or deployments until you update your payment method in Billing. We send a reminder email to your billing address (at most once per day). Existing resources may continue during the retry window.',
    faq9Q: 'What happens when I cancel my platform subscription?',
    faq9A:
      'At the end of the billing period your plan becomes Free. Managed Hetzner servers are powered off, active projects are paused, and new deploys are blocked. Your data is retained so you can resubscribe and resume manually. Infrastructure credits already in your wallet remain until used; they are not automatically refunded.',
    editorialHeroLabel: 'Hero',
    editorialLedeLabel: 'Lede',
    howItWorksH1Before: 'From ',
    howItWorksH1Em: 'commit',
    howItWorksH2Before: 'to ',
    howItWorksH2Em: 'production',
    howItWorksH2After: ',',
    howItWorksH3: 'in three moves.',
    howItWorksStepLabel: 'Step / {step}',
    comparisonHeadline1: 'A spec sheet,',
    comparisonHeadline2a: 'not a ',
    comparisonHeadline2Em: 'pitch',
    comparisonHeadline2b: '.',
    comparisonColumnFeature: 'Feature',
    ctaSectionEyebrow: 'Begin',
    faqHeadline1: 'Things you',
    faqHeadline2a: 'might ',
    faqHeadlineEm: 'ask',
    faqHeadline2b: '.',
    whatIsBodyLabel: 'Body',
    whatIsLicenseHeading: 'License & Source',
    whatIsLicenseDescription:
      'Frontend, backend, and CLI — all open source. Run it on your own infrastructure or contribute upstream.',
    pillar1Title: 'Open Source',
    pillar1Detail: 'MIT-licensed. Fork it, audit it, run it.',
    pillar2Title: 'Self-Host',
    pillar2Detail: 'Your VPS, your datacenter, your rules.',
    pillar3Title: 'Managed',
    pillar3Detail: 'Or use our cloud. Same UI, no migration.',
    pillar4Title: 'Marketplace',
    pillar4Detail: '24+ apps installed in a click.',
    marketplaceHeadlineAppsCount: '24',
    marketplaceHeadlineAppsSuffix: ' apps,',
    marketplaceHeadlineTagline: 'one click each.',
    marketplaceCatalogNo: '№',
    marketplaceCatalogMark: 'Mark',
    marketplaceCatalogName: 'Name',
    marketplaceCatalogCategory: 'Category',
    marketplaceCatalogStatus: 'Status',
    marketplaceCatalogFooter: 'Catalog updated weekly. PRs welcome.',
    fullPlanComparisonTitle: 'Full plan comparison',
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
    requestFailed: 'Request failed.',
    requestTimeout: 'Request timed out.',
    networkUnavailable: 'Unable to reach the server. Check your connection and API URL.',
    rateLimited: 'Too many requests. Please wait a moment and try again.',
    payloadTooLarge: 'Request payload is too large.',
  },
  toasts: toastsEn,
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
    rollbackToVersion: 'Restore this version',
    rollbackQuickHint: 'Instant rollback (existing image, no rebuild)',
    rollbackConfirmTitle: 'Restore this deployment?',
    rollbackConfirmDesc:
      'This starts a new deploy from commit {commit} on branch {branch}. Your app will switch to this version.',
    rollbackToLastGood: 'Rollback to last working deploy',
    deploymentFailedBanner: 'This deployment failed. You can restore the last successful version.',
    deploymentErrorTitle: 'Deployment error',
    timelineQueued: 'Queued',
    timelineBuild: 'Build',
    timelineDeploy: 'Deploy',
    timelineLive: 'Live',
    timelineFailed: 'Failed',
    failureOutOfMemory: 'Out of memory — upgrade the server or reduce build size.',
    failureDiskSpace: 'Server disk is full — free space or prune Docker images.',
    failurePlatformNative: 'Platform native module issue — redeploy or contact Pushify support.',
    failureDockerBuild: 'Docker image build failed — check generated Dockerfile or use your own.',
    failureApplicationBuild: 'Your app failed to build — fix errors locally with the same build command.',
    failureContainerStart: 'Container did not start — check PORT, start command, and env vars.',
    failureServerCapacity: 'Server was busy — wait and redeploy or use a dedicated server.',
    failureProjectConfig: 'Project configuration issue — check root directory, scripts, and framework settings.',
    failureUnknown: 'Deployment failed — review logs or contact support.',
    failureBlamePushify: 'Pushify platform',
    failureBlameServer: 'Server capacity',
    failureBlameProject: 'Your project',
    viewLogs: 'View Logs',
    containerLogs: 'Container Logs',
    historicalLogs: 'History',
    logsHelpTitle: 'Log types',
    logsHelpBuild: 'View Logs — build and deploy output for this deployment run.',
    logsHelpContainer: 'Container Logs — recent output from the running app container (live snapshot).',
    logsHelpHistorical: 'History — logs saved periodically on the server (retained ~7 days).',
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
    installGithubWebhook: 'Install webhook on GitHub',
    installGithubWebhookHint: 'Requires GitHub connected (org owner) and a webhook secret',
    deployQueuePosition: 'Queue #{position}',
    deployQueueWaiting: 'In queue',
    gitlabStep1: 'Go to your project Settings → Webhooks → Add new webhook',
    gitlabStep2: 'Paste the Webhook URL above and set the Secret token to your Pushify secret',
    gitlabStep3: 'Enable "Push events" and "Merge request events"',
    gitlabStep4: 'Save the webhook',
    webhooksDescGitlab: 'Configure GitLab webhooks to deploy on push and preview on merge requests.',
    webhookUrlHintGitlab: 'Use this URL when configuring your GitLab project webhook.',
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
    connectGitlab: 'GitLab',
    connectGitlabDesc: 'Import from your GitLab account',
    gitlabIntegration: 'GitLab Integration',
    gitlabIntegrationDesc: 'Connect your GitLab account to import projects and enable automatic deployments.',
    connectGitlabBtn: 'Connect GitLab',
    checkingGitLab: 'Checking GitLab connection...',
    changeGitlabAccount: 'Change account',
    disconnectGitlab: 'Disconnect',
    gitlabDisconnected: 'GitLab disconnected',
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
    changeGithubAccount: 'Use another account',
    disconnectGithub: 'Disconnect',
    githubDisconnected: 'GitHub disconnected',
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
    webhookSecretOnceTitle: 'Save your webhook secret',
    webhookSecretOnceDesc:
      'Copy it now — it will not be shown again. Paste it in your Git provider’s webhook settings (GitHub: Repository → Settings → Webhooks) along with the webhook URL from the project page.',
    webhookSetupOnceTitle: 'Git webhook setup',
    webhookSetupOnceDesc:
      'Copy both values into your repository webhook settings (GitHub: Settings → Webhooks → Add webhook). The secret is shown only once.',
    webhookUrlLabel: '1. Webhook URL (Payload URL)',
    webhookUrlOnceHint: 'Paste this as the Payload URL in GitHub or GitLab. You can copy it again later in Project → Settings.',
    webhookUrlCopy: 'Copy URL',
    webhookUrlCopied: 'Webhook URL copied',
    webhookSecretLabel: '2. Webhook secret',
    webhookSecretOnceHint:
      'Paste this in the Secret field. This is not your project ID — it verifies that pushes are from your repo.',
    webhookSetupFootnote:
      'Project ID in the URL identifies which Pushify project to deploy. The secret is a separate password-like key.',
    webhookSecretCopy: 'Copy secret',
    webhookSecretCopied: 'Secret copied to clipboard',
    webhookSecretContinue: 'Continue to deploy',
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
    statusTimeout: 'Timeout',
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
    planRequired: 'Preview deployments require a Hobby plan or higher.',
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
    noDeploymentRunning: 'No running deployment',
    noDeploymentRunningDesc: 'Deploy your project successfully. Metrics are collected only while a deployment is in the running state.',
    waitingForMetrics: 'Collecting metrics…',
    hintWaitCollect: 'Metrics refresh every ~15 seconds after the container is running.',
    lastStatus: 'Latest deployment status',
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
    noProjects: 'No projects yet',
    noProjectsDesc: 'Create a project and deploy it to start seeing organization-wide metrics here.',
    noMetricsYet: 'No metrics collected yet',
    noMetricsYetDesc: 'You have projects, but no container metrics have been recorded yet.',
    hintRunningDeploy: 'Ensure at least one deployment status is running (not building or failed).',
    hintWaitCollect: 'After a successful deploy, wait ~15 seconds for the first data point.',
    viewProjects: 'View projects',
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
    rateLimitBanner: 'Your organization plan allows {count} API requests per minute for each API key.',
    rateLimitBannerUnlimited: 'Your organization plan has no API rate limit per key.',
    viewBilling: 'View billing',
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
    yourRole: 'Your role',
    invitationEmailMismatch:
      'This invitation was sent to {invited} but you are logged in as {current}.',
    loginOrRegisterToJoin: 'Log in or create an account to join {org}',
    redirectingToDashboard: 'Redirecting to dashboard…',
  },
  billing: {
    title: 'Billing & Usage',
    description: 'View your current plan, usage statistics, and manage billing settings.',
    currentPlan: 'Current Plan',
    apiRateLimit: 'API rate limit',
    apiRateLimitValue: '{count} requests/min per API key',
    apiRateLimitUnlimited: 'Unlimited API requests per key',
    apiRateLimitHint:
      'Limits apply per API key. Responses include X-RateLimit-Limit, Remaining, and Reset headers.',
    usage: 'Usage',
    usageDescription: 'Your current resource usage for this billing period.',
    usageStorageHint:
      'Peak this month: Docker images, containers, and volumes on your servers (via docker system df), plus deploy artifact totals when disk sync is unavailable.',
    usageBandwidthHint:
      'Container egress from live metrics, plus Hetzner managed server outgoing traffic when synced from the provider.',
    usageNearLimitTitle: 'Approaching plan limits',
    usageAtLimitTitle: 'Plan limit reached',
    usageNearLimitDesc:
      'Some resources are at or near your monthly limits. Upgrade before new deploys, invites, or resources are blocked.',
    usageUpgradeCta: 'Upgrade plan',
    usageBadgeNear: 'Near limit',
    usageBadgeLimit: 'At limit',
    usageNotOnPlan: 'Not included on your current plan',
    usageMinutesUnit: 'min',
    features: 'Plan Features',
    featuresDescription: 'Features included in your current plan.',
    billingEmail: 'Billing Email',
    billingEmailDesc: 'Invoices and billing notifications will be sent to this address.',
    billingEmailCurrent: 'Current address',
    billingEmailNew: 'New address',
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
    buildMinutesThisMonth: 'Build minutes (month)',
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
    billingCycleMonthly: 'Monthly',
    billingCycleYearly: 'Yearly',
    billingCycleYearlySave: '−20%',
    billedMonthly: 'billed monthly',
    billedAnnually: 'billed annually',
    plansPaidSection: 'Paid plans',
    plansScrollHint: 'Scroll to compare tiers',
    // Plan details
    planDetails: 'Plan Details',
    storageGb: 'Storage',
    bandwidthGb: 'Bandwidth',
    grandfatherBanner:
      'Your organization has legacy (higher) plan limits until {date}. After that, your subscribed plan limits apply.',
    usagePlanLimitNote: 'Subscribed plan: {planLimit}',
    grandfatherBoostItem: '{label}: {planLimit} → {limit}',
    infraLowBalanceWarning:
      'Infrastructure credits are low ({balance}). Add credits in Billing before managed servers stop.',
    infraRunwayDays: 'Estimated runway at current burn: about {days} days.',
    buildMinutes: 'Build minutes/month',
    apiRequestsPerMinuteShort: 'API requests (per key)',
    paymentSuccess: 'Payment Successful!',
    planUpgraded: 'Your plan has been upgraded successfully.',
    redirecting: 'Redirecting to billing in',
    goToBilling: 'Go to Billing',
    stripeNotConfigured: 'Payment system is not configured',
    comparePlansSubtitle:
      'Choose the plan that fits your deployment needs. Upgrade or downgrade anytime.',
    plansFooterLead:
      'Platform plans include SSL, GitHub integration, and deployments. Managed servers use separate prepaid infrastructure credits.',
    plansPricingNote:
      'Subscription = platform limits (projects, deploys, team). Managed Hetzner servers are billed hourly from your infrastructure wallet (provider cost + margin), not included in the monthly plan price.',
    plansFooterNeedCustom: 'Need custom limits?',
    plansContactUs: 'Contact us',
    planMostPopular: 'Most Popular',
    upgradeButton: 'Upgrade',
    downgradeButton: 'Downgrade',
    planPriceCustom: 'Custom',
    planFreeForeverLabel: 'Free forever',
    planContactPricing: 'Contact us for pricing',
    deploymentsPerMonthShort: 'Deploys / mo',
    emailUpdateFailed: 'Failed to update email',
    personalOrganization: 'Personal',
    infraWalletTitle: 'Infrastructure credits',
    infraWalletDesc:
      'Managed cloud servers (Hetzner) are billed separately from your platform plan. Prepaid credits are used while your servers are running.',
    infraBalance: 'Available balance',
    infraMarginNote: 'Prices shown are all-in rates for managed server usage.',
    infraEstimatedBurn: 'Estimated monthly burn (running servers)',
    infraRunningServers: '{count} running managed server(s)',
    infraTopUp: 'Add credits',
    infraTopUpHint: 'Secure one-time payment via Stripe. Minimum balance ≈ one month of server cost before provisioning.',
    infraTopUpRedirecting: 'Opening Stripe checkout…',
    infraTransactions: 'Recent transactions',
    infraPerMonth: '/mo',
    infraPerHour: '/hr',
    infraCredits: 'credits',
    infraTopUpSuccess: 'Infrastructure credits added to your wallet.',
    infraTopUpPending:
      'Payment received. Credits will appear once Stripe confirms the payment (refresh in a moment).',
    infraTopUpCancelled: 'Credit top-up was cancelled.',
    billingStatusPastDueTitle: 'Platform payment past due',
    billingStatusPastDueDesc:
      'Stripe could not charge your subscription. Update your payment method to create servers, projects, and deployments.',
    billingStatusSuspendedTitle: 'Platform subscription ended',
    billingStatusSuspendedDesc:
      'Your plan was downgraded and active projects were paused. Managed servers were stopped. Renew your plan to resume.',
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
    infraCustomerPrice: '≈ ${amount}/mo',
    infraPlanBlocked: 'Not available on your plan',
    infraWalletBanner: 'Add infrastructure credits in Billing before creating a managed server.',
    // Status
    provisioning: 'Provisioning',
    running: 'Running',
    stopped: 'Stopped',
    rebooting: 'Rebooting',
    error: 'Error',
    deleting: 'Deleting',
    setupPending: 'Waiting...',
    setupInstalling: 'Installing Docker, Nginx...',
    setupReady: 'Ready',
    setupFailed: 'Setup Failed',
    // Actions
    start: 'Start',
    stop: 'Stop',
    reboot: 'Reboot',
    deleteServer: 'Delete Server',
    deleteConfirm: 'Are you sure you want to delete this server? This action cannot be undone.',
    sync: 'Sync',
    syncing: 'Syncing...',
    viewCards: 'Cards',
    viewMap: 'Map',
    mapNoCoords: 'No geolocation data yet',
    mapNoCoordsDesc: 'Sync Hetzner servers to load datacenter coordinates, or use the card view.',
    mapNoLocationList: 'Servers without map coordinates',
    projectCount: '{count} projects',
    databaseCount: '{count} databases',
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
    detailBack: 'Servers',
    statusInfraCreditsStopped:
      'This server was stopped because infrastructure credits ran out.',
    statusInfraCreditsStoppedHint:
      'After topping up in Billing, press Start above (you need roughly one month of server cost in your wallet).',
    infraBillingTitle: 'Infrastructure credits',
    infraWalletBalance: 'Wallet balance',
    infraMonthlyCost: 'Est. monthly cost',
    infraStartRequires: 'Min. to start',
    infraInsufficientForStart:
      'Your wallet balance is below the minimum needed to start this server. Add credits in Billing.',
    infraReadyToStart: 'Wallet balance is sufficient. Press Start to turn the server back on.',
    statusBillingSuspended:
      'Stopped: platform subscription ended. Renew your plan in Billing to start again.',
    openTerminal: 'Terminal',
    setupBannerTitle: 'Setting up your server…',
    setupBannerDesc: 'Installing Docker, Nginx, and Certbot. This may take a few minutes.',
    setupFailedTitle: 'Setup failed',
    setupReadyTitle: 'Server ready',
    setupReadyDesc: 'Docker, Nginx, and Certbot are installed. You can deploy projects to this server.',
    sshAccess: 'SSH access',
    traffic: 'Traffic',
    trafficIngoing: 'Ingoing',
    trafficOutgoing: 'Outgoing',
    trafficIncluded: 'Included',
    serverType: 'Server type',
    fieldType: 'Type',
    fieldDescription: 'Description',
    cpuType: 'CPU type',
    architecture: 'Architecture',
    storageType: 'Storage',
    location: 'Location',
    city: 'City',
    country: 'Country',
    datacenter: 'Datacenter',
    networkZone: 'Network zone',
    protection: 'Protection',
    deleteProtection: 'Delete protection',
    rebuildProtection: 'Rebuild protection',
    detailEnabled: 'Enabled',
    detailDisabled: 'Disabled',
    timestamps: 'Timestamps',
    lastSeen: 'Last seen',
    managedBadge: 'Managed',
    createdAtLabel: 'Created',
    updatedAtLabel: 'Last updated',
    fieldOs: 'Operating system',
    hubNextStepsTitle: 'Suggested next steps',
    hubStepTopUp: 'Add infrastructure credits in Billing, then start this server.',
    hubStepStart: 'Press Start above to turn this server back on.',
    hubStepFixSetup: 'Server setup failed. Check status details or contact support.',
    hubStepWaitSetup: 'Setup is in progress (Docker, Nginx, Certbot). Refresh in a minute.',
    hubStepDeployFirst: 'Deploy your first project to this server.',
    hubStepRunningReady: 'Server is ready — open a project to deploy or redeploy.',
    hubStepTerminal: 'Open the web terminal for SSH-style access.',
    hubProjectsTitle: 'Projects on this server',
    hubProjectsEmpty: 'No projects on this server yet.',
    hubNewProject: 'New project',
    hubDatabasesTitle: 'Databases on this server',
    hubDatabasesEmpty: 'No databases on this server yet.',
    hubAddDatabase: 'Add database',
    hubRunwayDays: 'At current wallet balance, estimated runway is about {days} days for this server size.',
    editServer: 'Edit',
    editServerTitle: 'Edit server',
    resizeButton: 'Upgrade size',
    resizeTitle: 'Upgrade server size',
    resizeDesc: 'Choose a larger plan tier. The server may reboot briefly. Downgrades are not supported.',
    resizeNoOptions: 'No larger sizes are available for your plan in this region.',
    resizeWarning: 'Billing updates to the new monthly rate. Ensure your infrastructure wallet has enough balance.',
    resizeConfirm: 'Upgrade',
    perMonthShort: 'mo',
    sshPanelTitle: 'SSH access',
    sshConnectCommand: 'Connect',
    sshDownloadKey: 'Download private key',
    firewallTitle: 'Firewall checklist',
    firewallDesc: 'Pushify setup opens these ports on the server (UFW). Your cloud provider firewall must allow them too.',
    firewallPort22: 'SSH administration',
    firewallPort80: 'HTTP (redirects & ACME)',
    firewallPort443: 'HTTPS for deployed apps',
    firewallHetznerHint: 'On Hetzner Cloud, also open these ports in the server firewall in the Hetzner console if traffic does not reach your apps.',
    snapshotsTitle: 'Snapshots',
    snapshotsDesc: 'Provider snapshots for disaster recovery. Creating a snapshot may take several minutes.',
    snapshotsEmpty: 'No snapshots yet.',
    snapshotCreate: 'Create snapshot',
    snapshotRestore: 'Restore',
    snapshotRestoreTitle: 'Restore from snapshot',
    snapshotRestoreWarning:
      'This rebuilds the server disk from the snapshot. All data on the current disk will be replaced. Running containers and apps may be lost until you redeploy.',
    snapshotRestoreConfirm: 'Restore server',
    snapshotStatusAvailable: 'available',
    snapshotStatusCreating: 'Creating…',
    snapshotProgress: '{percent}% complete',
    snapshotSizePending: 'size pending',
    autoSnapshotTitle: 'Weekly automatic snapshots',
    autoSnapshotDesc:
      'Creates a snapshot every 7 days when the server is running. Oldest snapshots are removed when you exceed your plan limit.',
    autoSnapshotLastRun: 'Last automatic snapshot: {date}',
    serverHealthTitle: 'Deployment host health',
    healthScan: 'Scan now',
    healthScanFailed: 'Could not scan the server. Check SSH access.',
    diskUsage: 'Disk',
    diskFree: 'free',
    orphanContainersTitle: '{count} orphan container(s)',
    orphanContainersDesc:
      'These Pushify containers are not linked to an active project in your organization. They may still use ports and disk.',
    noOrphanContainers: 'No orphan Pushify containers ({count} tracked on this server).',
    timelineTitle: 'Recent activity',
    timelineEmpty: 'No activity yet.',
    timelineCreated: 'Server created',
    timelineSynced: 'Synced with provider',
    timelineResizing: 'Resize in progress',
    timelineInfraStopped: 'Stopped (infrastructure credits)',
    // BYOS
    cloudProvider: 'Cloud Provider',
    managedProviderActive: 'Managed servers are provisioned on Hetzner Cloud.',
    managedProvidersComingSoon: 'DigitalOcean, AWS, and Google Cloud — coming soon.',
    comingSoonBadge: 'Soon',
    loadingSizes: 'Loading sizes…',
    sshKeyOptionalNote:
      'If empty, Pushify will generate a key pair and add it to your server. Root SSH access required.',
    sizeExceedsPlan:
      'This server size exceeds your plan limit. Choose a smaller size or upgrade your plan.',
    managedNotAllowedOnPlan:
      'Managed cloud servers require a paid plan. Upgrade your platform plan or connect your own server (BYOS).',
    existingServer: 'Existing Server',
    byosTitle: 'Connect Your Server',
    byosDescription: 'Connect an existing server to Pushify for deployments.',
    ipAddressLabel: 'IP Address',
    ipAddressPlaceholder: '192.168.1.100',
    ipAddressHint: 'Public IPv4 address of your server',
    authMethod: 'Authentication',
    sshKey: 'SSH Private Key',
    rootPassword: 'Root Password',
    sshKeyPlaceholder: '-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----',
    rootPasswordPlaceholder: 'Enter root password',
    sshKeyHint: 'Paste your SSH private key for secure access',
    rootPasswordHint: 'Root password for initial connection',
    byosInfoTitle: 'What happens next',
    byosStep1: 'Pushify connects to your server via SSH',
    byosStep2: 'Installs Docker and Nginx if not present',
    byosStep3: 'Configures the server for deployments',
    byosStep4: 'Your server is ready to deploy projects',
    readyToCreate: 'Ready to create',
    fillRequiredFields: 'Fill all required fields',
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
    listBackupOn: 'Auto backup on',
    listBackupOff: 'Auto backup off',
    neverBackedUp: 'Never backed up',
    manageBackupsLink: 'Backups',
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
  marketplace: {
    title: 'Marketplace',
    description: 'Deploy popular open-source applications with one click',
    siteStudioBanner:
      'Building a business site, store, or blog? Site Studio offers guided templates with domain and SSL.',
    siteStudioBannerCta: 'Open Site Studio',
    searchPlaceholder: 'Search applications...',
    deploy: 'Deploy',
    deployTitle: 'Deploy Application',
    deployDescription: 'Configure and deploy this application to your server',
    selectServer: 'Select Server',
    configureEnvVars: 'Configure Environment',
    reviewDeploy: 'Review & Deploy',
    deploying: 'Deploying...',
    deploySuccess: 'Application deployed successfully!',
    deployFailed: 'Deployment failed',
    noServers: 'No servers available. Add a server first.',
    noTemplates: 'No applications found',
    categoryAll: 'All',
    categoryCms: 'CMS',
    categoryAutomation: 'Automation',
    categoryMonitoring: 'Monitoring',
    categoryStorage: 'Storage',
    categoryDevtools: 'Dev Tools',
    categoryAnalytics: 'Analytics',
    categoryDatabase: 'Database',
    requirements: 'Requirements',
    minMemory: 'Min Memory',
    minDisk: 'Min Disk',
    requiresDatabase: 'Requires Database',
    appName: 'Application Name',
    appNamePlaceholder: 'my-wordpress-site',
    envVarAutoGenerated: 'Auto-generated if left empty',
    envVarLeaveBlankToGenerate: 'Leave blank to auto-generate a secure value',
    featured: 'Featured',
    viewDetails: 'View Details',
    tabCatalog: 'Catalog',
    tabInstalled: 'Installed',
    noInstallsTitle: 'No marketplace apps installed',
    noInstallsDesc: 'Deploy WordPress, n8n, Uptime Kuma, and more from the catalog tab.',
    backToMarketplace: 'Back to Marketplace',
    step: 'Step',
    of: 'of',
    next: 'Next',
    previous: 'Previous',
    confirmDeploy: 'Deploy Now',
    optional: 'Optional',
    required: 'Required',
    tags: 'Tags',
    documentation: 'Documentation',
    website: 'Website',
    dockerImage: 'Docker Image',
    version: 'Version',
  },
  siteStudio: {
    navTitle: 'Site Studio',
    title: 'Launch your website in minutes',
    badge: 'Site Studio',
    marketplaceBanner:
      'Need dev tools, monitoring, or databases? The Marketplace has one-click apps like Grafana, n8n, and more.',
    marketplaceBannerCta: 'Browse Marketplace',
    paymentRegionGlobal: 'Global',
    paymentRegionRegional: 'Regional',
    heroDescription:
      'Professional templates for e-commerce, business, blogs, and more. Deploy on your own server with SSL — connect Stripe, PayPal, or regional payment plugins after launch.',
    heroPoint1: 'Live in ~10 minutes',
    heroPoint2: 'Your domain & SSL',
    heroPoint3: 'Your data, your server',
    comingSoonTitle: 'On the roadmap',
    comingSoonDesc: 'Visual drag-and-drop editor and more payment connectors built into the dashboard.',
    roadmap: 'Phase 2 · Visual editor',
    searchPlaceholder: 'Search templates…',
    launch: 'Configure',
    launchNow: 'Launch site',
    launchTitle: 'Launch your site',
    launchSuccess: 'Your site is being deployed!',
    launching: 'Launching…',
    featured: 'Popular templates',
    allTemplates: 'More templates',
    noTemplates: 'No templates match your search.',
    categoryAll: 'All',
    categoryEcommerce: 'E-Commerce',
    categoryCorporate: 'Corporate',
    categoryBlog: 'Blog',
    categoryPortfolio: 'Portfolio',
    categoryRestaurant: 'Restaurant',
    categoryNewsletter: 'Newsletter',
    categoryBooking: 'Booking',
    categorySaas: 'SaaS / MVP',
    filterCategory: 'Use case',
    filterPlatform: 'Platform',
    platformsTitle: '6 platforms · 12 templates',
    platformNote: 'Not every template uses WordPress — pick Ghost for blogs, Cal.com for appointments, Directus or PocketBase for modern stacks.',
    stackWordpress: 'WordPress',
    stackGhost: 'Ghost',
    stackStrapi: 'Strapi',
    stackDirectus: 'Directus',
    stackPocketbase: 'PocketBase',
    stackCalcom: 'Cal.com',
    backToStudio: 'Back to Site Studio',
    siteName: 'Site name',
    siteNamePlaceholder: 'My Store',
    customDomain: 'Custom domain',
    domainPlaceholder: 'shop.example.com',
    domainHint: 'Point DNS to your server after deploy. You can add domains later in project settings.',
    selectServer: 'Deploy to server',
    noServers: 'No ready servers. Add a server and wait for setup to complete.',
    paymentIntegrations: 'Payment integrations',
    paymentNote: 'Configured inside your store admin after launch (plugins). Keys never leave your server.',
    afterLaunch: 'After launch checklist',
    reviewTitle: 'Ready to launch',
    template: 'Template',
    estimatedTime: 'Est. setup',
    minutes: 'min',
    includedFeatures: "What's included",
    setupGuide: 'Setup guide',
    step: 'Step',
    of: 'of',
    next: 'Next',
    previous: 'Back',
    optional: 'optional',
    devCtaTitle: 'Building a custom app?',
    devCtaDesc: 'Deploy from GitHub with framework auto-detection.',
    devCtaLink: 'New project',
    dashboardCtaTitle: 'Launch a website without code',
    dashboardCtaDesc: 'E-commerce, corporate sites, blogs — guided templates with SSL on your own VPS worldwide.',
    dashboardCtaButton: 'Open Site Studio',
    projectDeployBannerTitle: 'Pushify is installing your site automatically',
    projectDeployBannerDesc:
      'No SSH or manual Docker steps — env vars, containers, and firewall on the server are configured for you. Watch the Deployments tab for progress; when status is running, open your site below.',
    projectDeployInProgress:
      'Deployment in progress… This usually takes 5–15 minutes (Cal.com may take a few minutes longer).',
    projectDeployOpenSite: 'Open your site',
    projectDeploySetupCalcom: 'Complete Cal.com setup',
    launchSuccessDetail:
      'Installation started. Pushify will configure everything on your server — check Deployments for progress.',
  },
};
