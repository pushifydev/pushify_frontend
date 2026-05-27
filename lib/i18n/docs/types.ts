export type DocsSectionId =
  | 'intro'
  | 'auth'
  | 'projects'
  | 'deployments'
  | 'envvars'
  | 'domains'
  | 'servers'
  | 'databases'
  | 'webhooks'
  | 'errors';

export interface DocsNavGroup {
  label: string;
  items: { id: DocsSectionId; label: string }[];
}

export interface DocsScopeItem {
  scope: string;
  desc: string;
}

export interface DocsEndpointCopy {
  description: string;
  params?: Record<string, string>;
  responseMsg?: string;
}

export interface DocsContent {
  shell: {
    title: string;
    searchPlaceholder: string;
    navigation: string;
    dashboard: string;
    getApiKey: string;
    apiVersion: string;
  };
  labels: {
    parameters: string;
    paramName: string;
    paramType: string;
    paramDesc: string;
    request: string;
    response: string;
    copyCode: string;
    baseUrl: string;
    headerFormat: string;
    exampleRequest: string;
    availableScopes: string;
    scopesIntro: string;
    explore: string;
    quickStart: string;
    code: string;
    description: string;
    plan: string;
    rateLimit: string;
  };
  navGroups: DocsNavGroup[];
  intro: {
    badge: string;
    title: string;
    lead: string;
    features: { title: string; desc: string }[];
    steps: { title: string; desc: string; linkText?: string; descBefore?: string; descAfter?: string }[];
    exploreLinks: { label: string; desc: string }[];
  };
  auth: {
    title: string;
    description: string;
    securityTitle: string;
    securityText: string;
    scopes: DocsScopeItem[];
  };
  projects: {
    title: string;
    description: string;
    endpoints: {
      list: DocsEndpointCopy;
      get: DocsEndpointCopy;
      create: DocsEndpointCopy;
      update: DocsEndpointCopy;
      remove: DocsEndpointCopy;
    };
  };
  deployments: {
    title: string;
    description: string;
    endpoints: {
      list: DocsEndpointCopy;
      create: DocsEndpointCopy;
      cancel: DocsEndpointCopy;
      redeploy: DocsEndpointCopy;
      rollback: DocsEndpointCopy;
      logs: DocsEndpointCopy;
    };
  };
  envvars: {
    title: string;
    description: string;
    sensitiveTitle: string;
    sensitiveText: string;
    endpoints: {
      list: DocsEndpointCopy;
      create: DocsEndpointCopy;
      bulk: DocsEndpointCopy;
      update: DocsEndpointCopy;
      remove: DocsEndpointCopy;
    };
  };
  domains: {
    title: string;
    description: string;
    endpoints: {
      list: DocsEndpointCopy;
      create: DocsEndpointCopy;
      verify: DocsEndpointCopy;
      primary: DocsEndpointCopy;
      remove: DocsEndpointCopy;
    };
  };
  servers: {
    title: string;
    description: string;
    endpoints: {
      list: DocsEndpointCopy;
      create: DocsEndpointCopy;
      get: DocsEndpointCopy;
      start: DocsEndpointCopy;
      stop: DocsEndpointCopy;
      reboot: DocsEndpointCopy;
      remove: DocsEndpointCopy;
    };
  };
  databases: {
    title: string;
    description: string;
    endpoints: {
      list: DocsEndpointCopy;
      create: DocsEndpointCopy;
      credentials: DocsEndpointCopy;
      connect: DocsEndpointCopy;
      start: DocsEndpointCopy;
      stop: DocsEndpointCopy;
      backup: DocsEndpointCopy;
      restore: DocsEndpointCopy;
      remove: DocsEndpointCopy;
    };
  };
  webhooks: {
    title: string;
    description: string;
    howItWorks: string;
    steps: { title: string; desc: string }[];
    manualTitle: string;
    manualDesc: string;
    githubTitle: string;
    githubDesc: string;
    secretTitle: string;
    secretText: string;
  };
  errors: {
    title: string;
    description: string;
    httpStatusTitle: string;
    statusRows: { code: string; desc: string }[];
    responseFormatTitle: string;
    commonCodesTitle: string;
    errorCodes: { code: string; desc: string }[];
    rateLimitsTitle: string;
    rateLimitsIntro: string;
    rateLimitRows: { plan: string; limit: string }[];
    rateLimitFooter: string;
    exampleTitle: string;
  };
}
