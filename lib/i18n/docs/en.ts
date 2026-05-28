import type { DocsContent } from './types';

export const docsEn: DocsContent = {
  shell: {
    title: 'API Documentation',
    searchPlaceholder: 'Search...',
    navigation: 'Navigation',
    dashboard: 'Dashboard',
    getApiKey: 'Get API Key',
    apiVersion: 'API v1.0',
  },
  labels: {
    parameters: 'Parameters',
    paramName: 'Name',
    paramType: 'Type',
    paramDesc: 'Description',
    request: 'Request',
    response: 'Response',
    copyCode: 'Copy code',
    baseUrl: 'Base URL',
    headerFormat: 'Header Format',
    exampleRequest: 'Example Request',
    availableScopes: 'Available Scopes',
    scopesIntro: 'Limit API key access by selecting specific scopes when creating a key.',
    explore: 'Explore',
    quickStart: 'Quick Start',
    code: 'Code',
    description: 'Description',
    plan: 'Plan',
    rateLimit: 'Rate Limit',
  },
  navGroups: [
    {
      label: 'Getting Started',
      items: [
        { id: 'intro', label: 'Introduction' },
        { id: 'auth', label: 'Authentication' },
      ],
    },
    {
      label: 'API Reference',
      items: [
        { id: 'projects', label: 'Projects' },
        { id: 'deployments', label: 'Deployments' },
        { id: 'envvars', label: 'Environment Variables' },
        { id: 'domains', label: 'Domains' },
      ],
    },
    {
      label: 'Infrastructure',
      items: [
        { id: 'servers', label: 'Servers' },
        { id: 'databases', label: 'Databases' },
      ],
    },
    {
      label: 'Integrations',
      items: [
        { id: 'webhooks', label: 'Webhooks & CI/CD' },
      ],
    },
    {
      label: 'Reference',
      items: [
        { id: 'errors', label: 'Error Handling' },
      ],
    },
  ],
  intro: {
    badge: 'REST API',
    title: 'Pushify API Documentation',
    lead: 'Deploy, manage, and monitor your applications programmatically. Perfect for CI/CD pipelines, automation scripts, and custom integrations.',
    idNote:
      'Resource IDs in paths and responses are UUIDs (e.g. 550e8400-e29b-41d4-a716-446655440000). Use the id returned by list or create endpoints — placeholder values like proj_abc123 are not valid.',
    features: [
      { title: 'RESTful API', desc: 'Simple REST endpoints with JSON responses' },
      { title: 'Secure', desc: 'Scope-based API key permissions' },
      { title: 'CI/CD Ready', desc: 'Webhook triggers and deploy API' },
    ],
    steps: [
      {
        title: 'Create an API Key',
        desc: '',
        descBefore: 'Go to ',
        linkText: 'Settings → API Keys',
        descAfter: ' and create a key with the required scopes.',
      },
      {
        title: 'Make a Request',
        desc: 'Use your API key in the Authorization header to authenticate.',
      },
      {
        title: 'Automate',
        desc: 'Integrate with GitHub Actions, GitLab CI, or any CI/CD tool.',
      },
    ],
    exploreLinks: [
      { label: 'Projects API', desc: 'Manage your projects' },
      { label: 'Deployments API', desc: 'Trigger and manage deploys' },
      { label: 'Servers API', desc: 'Manage infrastructure' },
      { label: 'Databases API', desc: 'Manage databases & backups' },
    ],
  },
  auth: {
    title: 'Authentication',
    description: 'All API requests require an API key. Include it in the Authorization header as a Bearer token.',
    securityTitle: 'Security',
    securityText: 'Never expose API keys in client-side code or public repositories. Store them in environment variables.',
    sessionOnlyTitle: 'Dashboard session only',
    sessionOnlyText:
      'Some routes require a logged-in dashboard session (JWT), not an API key — for example GET /servers/:id/ssh-key and POST /servers/:id/terminal. API keys return 403 on these endpoints.',
    scopes: [
      { scope: 'projects:read', desc: 'List and view projects' },
      { scope: 'projects:write', desc: 'Create, update, delete projects' },
      { scope: 'deployments:read', desc: 'View deployments and logs' },
      { scope: 'deployments:write', desc: 'Trigger, redeploy, rollback deploys' },
      { scope: 'deployments:cancel', desc: 'Cancel pending or running deployments' },
      { scope: 'logs:read', desc: 'Read deployment build and deploy logs' },
      { scope: 'envvars:read', desc: 'View environment variables' },
      { scope: 'envvars:write', desc: 'Manage environment variables' },
      { scope: 'servers:read', desc: 'View servers' },
      { scope: 'servers:write', desc: 'Manage servers' },
      { scope: 'databases:read', desc: 'View databases' },
      { scope: 'databases:write', desc: 'Manage databases' },
      { scope: 'domains:read', desc: 'View domains' },
      { scope: 'domains:write', desc: 'Manage domains' },
    ],
  },
  projects: {
    title: 'Projects',
    description: 'Manage your projects programmatically. Create, update, configure, and delete projects.',
    endpoints: {
      list: {
        description: 'List all projects in your organization.',
      },
      get: {
        description: 'Get detailed information about a specific project including build config and domains.',
      },
      create: {
        description: 'Create a new project. Git repository fields are optional if you deploy without Git.',
        params: {
          name: 'Project name',
          gitRepoUrl: 'Git repository URL (optional)',
          gitBranch: 'Branch to deploy (default: main)',
          buildCommand: 'Build command (e.g. npm run build)',
          startCommand: 'Start command (e.g. npm start)',
          port: 'Application port (default: 3000)',
        },
        responseMsg: 'Project created successfully',
      },
      update: {
        description: 'Update project configuration. Only include fields you want to change.',
        responseMsg: 'Project updated successfully',
      },
      remove: {
        description: 'Delete a project and all associated resources.',
        responseMsg: 'Project deleted successfully',
      },
      webhook: {
        description: 'Get the GitHub webhook URL and whether a signing secret is configured for this project.',
        responseMsg: 'Webhook info retrieved',
      },
    },
  },
  deployments: {
    title: 'Deployments',
    description: 'Trigger and manage deployments. Monitor build progress, view logs, and rollback when needed.',
    endpoints: {
      list: {
        description: 'List all deployments for a project, ordered by newest first.',
        params: {
          limit: 'Results per page (default: 20)',
          offset: 'Pagination offset',
        },
      },
      create: {
        description: 'Trigger a new deployment for a project.',
        params: {
          branch: 'Branch to deploy',
          commitHash: 'Specific commit to deploy',
          commitMessage: 'Commit message for reference',
        },
        responseMsg: 'Deployment created successfully',
      },
      cancel: {
        description: 'Cancel a pending or building deployment. Requires deployments:write or deployments:cancel scope.',
        responseMsg: 'Deployment cancelled',
      },
      redeploy: {
        description: 'Create a new deployment with the same configuration as a previous one.',
        responseMsg: 'Redeploy started',
      },
      rollback: {
        description: 'Rollback to a previous successful deployment.',
        responseMsg: 'Rollback started',
      },
      logs: {
        description: 'Get build or runtime logs for a deployment. Requires deployments:read or logs:read scope.',
        params: {
          type: 'Log stream: "build" or "deploy" (optional, defaults to build)',
        },
      },
    },
  },
  envvars: {
    title: 'Environment Variables',
    description: 'Manage environment variables for your projects. Changes take effect on next deployment.',
    sensitiveTitle: 'Sensitive Values',
    sensitiveText: 'Environment variable values are encrypted at rest and masked in API responses. Only the first and last characters are visible.',
    endpoints: {
      list: {
        description: 'List all environment variables for a project. Values are masked for security.',
        params: {
          environment: 'Filter by environment: production or preview (optional)',
        },
      },
      create: {
        description: 'Create a new environment variable.',
        params: {
          key: 'Variable name (e.g. DATABASE_URL)',
          value: 'Variable value',
          isSecret: 'Mark as secret (default: true)',
          environment: 'Target environment: production or preview (optional, default: production)',
        },
        responseMsg: 'Environment variable created',
      },
      bulk: {
        description: 'Create or update multiple environment variables at once. Useful for syncing .env files.',
        params: {
          variables: 'Array of { key, value, isSecret } objects',
        },
        responseMsg: 'Environment variables updated',
      },
      update: {
        description: "Update an existing environment variable's key or value.",
        responseMsg: 'Environment variable updated',
      },
      remove: {
        description: 'Delete an environment variable.',
        responseMsg: 'Environment variable deleted',
      },
    },
  },
  domains: {
    title: 'Domains',
    description: 'Add custom domains to your projects. Manage DNS settings, SSL certificates, and Nginx configuration.',
    endpoints: {
      list: {
        description: 'List all domains configured for a project.',
      },
      create: {
        description: 'Add a custom domain to a project. Returns DNS records to configure.',
        params: {
          domain: 'Domain name (e.g. myapp.com)',
        },
        responseMsg: 'Domain added. Configure DNS records to verify.',
      },
      verify: {
        description: 'Verify domain DNS configuration and provision SSL certificate.',
        responseMsg: 'Domain verified successfully',
      },
      primary: {
        description: 'Set a domain as the primary domain for the project.',
        responseMsg: 'Primary domain updated',
      },
      remove: {
        description: 'Remove a domain from the project.',
        responseMsg: 'Domain removed',
      },
    },
  },
  servers: {
    title: 'Servers',
    description: 'Provision and manage servers. Create cloud servers, control their state, and monitor status.',
    sessionOnlyTitle: 'Not available via API key',
    sessionOnlyText:
      'SSH private keys (GET /servers/:id/ssh-key) and the browser web terminal (POST /servers/:id/terminal) are only available through the dashboard with an active session.',
    endpoints: {
      list: {
        description: 'List all servers in your organization.',
      },
      create: {
        description: 'Create and provision a new server.',
        params: {
          name: 'Server name',
          provider: 'Cloud provider (hetzner, digitalocean)',
          region: 'Region identifier',
          size: 'Server size/type',
        },
        responseMsg: 'Server is being provisioned',
      },
      get: {
        description: 'Get detailed server information including specs and status.',
      },
      start: {
        description: 'Start a stopped server.',
        responseMsg: 'Server is starting',
      },
      stop: {
        description: 'Stop a running server. All containers on the server will be stopped.',
        responseMsg: 'Server is stopping',
      },
      reboot: {
        description: 'Reboot a server. Brief downtime expected during restart.',
        responseMsg: 'Server is rebooting',
      },
      remove: {
        description: 'Delete a server. This is permanent and will destroy all data on the server.',
        responseMsg: 'Server deleted',
      },
    },
  },
  databases: {
    title: 'Databases',
    description: 'Create and manage databases on your servers. Supports PostgreSQL, MySQL, Redis, and MongoDB.',
    endpoints: {
      list: {
        description: 'List all databases in your organization.',
      },
      create: {
        description: 'Create a new database on a server.',
        params: {
          name: 'Database name',
          type: 'postgresql, mysql, redis, mongodb',
          serverId: 'Server to create database on',
          description: 'Optional description',
        },
        responseMsg: 'Database is being created',
      },
      credentials: {
        description: 'Get database connection credentials including host, port, username, password, and connection string.',
      },
      connect: {
        description: 'Connect a database to a project. This injects connection credentials as environment variables.',
        params: {
          projectId: 'Project to connect to',
          envPrefix: 'Environment variable prefix (default: DATABASE)',
        },
        responseMsg: 'Database connected to project',
      },
      start: {
        description: 'Start a stopped database.',
        responseMsg: 'Database is starting',
      },
      stop: {
        description: 'Stop a running database.',
        responseMsg: 'Database is stopping',
      },
      backup: {
        description: 'Create a manual backup of the database.',
        responseMsg: 'Backup started',
      },
      restore: {
        description: 'Restore a database from a backup. Warning: this overwrites the current database.',
        responseMsg: 'Restore started',
      },
      remove: {
        description: 'Delete a database and all its data permanently.',
        responseMsg: 'Database deleted',
      },
    },
  },
  webhooks: {
    title: 'Webhooks & CI/CD',
    description: 'Automatically deploy when you push to GitHub. Pushify listens for webhook events and triggers deployments.',
    howItWorks: 'How It Works',
    steps: [
      { title: 'Connect GitHub', desc: 'Link your GitHub account in project settings.' },
      { title: 'Push to Branch', desc: 'Push code to the configured branch (e.g. main).' },
      { title: 'Auto Deploy', desc: 'Pushify receives the webhook and starts a deployment automatically.' },
    ],
    manualTitle: 'Manual Webhook URL',
    manualDesc: 'Each project has a unique webhook URL for manual integration with other Git providers.',
    githubTitle: 'GitHub Actions Example',
    githubDesc: 'Trigger deployments directly from GitHub Actions using the Deployments API.',
    secretTitle: 'Webhook Secret',
    secretText:
      'Webhook payloads are signed with HMAC-SHA256. Retrieve your webhook secret via the project settings or the GET /projects/:id/webhook endpoint.',
  },
  errors: {
    title: 'Error Handling',
    description: 'The API uses standard HTTP status codes and returns detailed error messages in JSON format.',
    httpStatusTitle: 'HTTP Status Codes',
    statusRows: [
      { code: '200', desc: 'Success' },
      { code: '201', desc: 'Created - Resource created successfully' },
      { code: '400', desc: 'Bad Request - Invalid parameters' },
      { code: '401', desc: 'Unauthorized - Invalid or missing API key' },
      { code: '403', desc: 'Forbidden - Insufficient permissions / scope' },
      { code: '404', desc: 'Not Found - Resource does not exist' },
      { code: '429', desc: 'Too Many Requests - Rate limit exceeded' },
      { code: '500', desc: 'Internal Server Error' },
    ],
    responseFormatTitle: 'Error Response Format',
    commonCodesTitle: 'Common Error Codes',
    errorCodes: [
      { code: 'UNAUTHORIZED', desc: 'API key is missing, invalid, or expired' },
      { code: 'INSUFFICIENT_SCOPE', desc: 'API key lacks required permissions' },
      { code: 'NOT_FOUND', desc: 'Requested resource was not found' },
      { code: 'VALIDATION_ERROR', desc: 'Request body or parameters are invalid' },
      { code: 'RATE_LIMITED', desc: 'Too many requests, slow down' },
      { code: 'CONFLICT', desc: 'Resource already exists or state conflict' },
    ],
    rateLimitsTitle: 'Rate Limits',
    rateLimitsIntro: 'API requests are rate-limited per API key. Limits vary by plan.',
    rateLimitRows: [
      { plan: 'Free', limit: '60 requests/min' },
      { plan: 'Hobby', limit: '120 requests/min' },
      { plan: 'Pro', limit: '300 requests/min' },
      { plan: 'Business', limit: '600 requests/min' },
      { plan: 'Enterprise', limit: 'Unlimited' },
    ],
    rateLimitFooter:
      'Rate limit headers are included in every response: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
    exampleTitle: 'Error Handling Example',
  },
};
