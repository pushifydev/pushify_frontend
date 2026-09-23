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
        { id: 'buildSources', label: 'Private images & compose' },
      ],
    },
    {
      label: 'Integrations',
      items: [
        { id: 'webhooks', label: 'Webhooks & CI/CD' },
        { id: 'sso', label: 'Single sign-on' },
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
    infraNoteTitle: 'Managed server billing',
    infraNote:
      'Pushify has two charges: (1) platform subscription — deploy/API/team limits; (2) infrastructure credits — prepaid USD wallet debited hourly while managed Hetzner servers run. BYOS (SSH) servers do not use the wallet. Top up and view balance in Dashboard → Billing. If credits run out, managed servers stop until you add more. Failed platform payments block new resources until your card is updated.',
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
          provider: 'Cloud provider (hetzner)',
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
  buildSources: {
    title: 'Private images and compose stacks',
    description:
      'A project can build a repository, run a ready image, or bring up a whole compose stack. The credentials each one needs — and the scopes registries actually require — are here.',
    registriesTitle: 'Private registries',
    registriesText:
      "Settings → Private registries stores one login per registry for the whole organization. It is used for two things: a Dockerfile whose FROM is a private base image, and projects that deploy a ready image. The token is write-only — it is sent once and never shown again, only replaced.",
    registries: [
      {
        name: 'GitHub Container Registry',
        host: 'ghcr.io',
        steps: [
          'GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic).',
          'Generate a token with the read:packages scope. That one scope is enough to pull; repo and write:packages are not needed.',
          'Username is your GitHub username; password is the token.',
        ],
      },
      {
        name: 'Docker Hub',
        host: 'docker.io',
        steps: [
          'Docker Hub → Account Settings → Personal access tokens → Generate.',
          'Give it Read-only access.',
          'Username is your Docker Hub username; password is the token, not your account password.',
        ],
      },
      {
        name: 'GitLab Container Registry',
        host: 'registry.gitlab.com',
        steps: [
          'GitLab project → Settings → Repository → Deploy tokens.',
          'Create one with the read_registry scope.',
          'Use the token username and token value exactly as GitLab shows them.',
        ],
      },
    ],
    registryScopeTitle: 'Read-only is enough',
    registryScopeText:
      'Pushify only ever pulls. A token that can also write is a token that can be used to replace your images if the credentials ever leak, so give it read access and nothing more.',
    imageTitle: 'Deploying a ready image',
    imageText:
      'Project settings → Docker image: fill in a reference and the project deploys that image instead of building the repository. Every deploy pulls the reference again, so moving a tag and redeploying ships the new image.',
    imageExample: 'ghcr.io/acme/api:1.4',
    imageNotes: [
      'The image keeps everything it already declares — its CMD, ENV and exposed port are used as they are.',
      'It gets the same treatment as a built app: blue-green switch, replicas, staging, volumes, domains and HTTPS.',
      'The repository settings below the field stop applying, and the dashboard says so.',
      'A private image needs a registry credential for its host — see above.',
      'This needs a server; the no-server fallback cannot pull images.',
    ],
    composeTitle: 'Deploying a compose stack',
    composeText:
      "Project settings → Docker Compose file: give the path of a compose file in your repository and the project is deployed as a stack from your checkout, so build: contexts and the config files beside it work as they do locally. It is off by default and never picked up on its own — most repositories carry a compose file meant for local development, and deploying that would be a surprise.",
    composeExample: `services:
  web:
    build: ./web
    ports:
      - "8080:3000"
    environment:
      API: http://api:4000
  api:
    build: ./api`,
    composeNotes: [
      'Services reach each other by name on the stack network, exactly as they do locally.',
      'When more than one service publishes a port, name the one to serve in the settings — otherwise the deploy is refused rather than guessing.',
      'The project\'s environment variables are available to the stack, and a committed .env is read first.',
      'Pushify\'s Workers and Scheduled tasks drive a single container and do not apply — declare those as services in the compose file. The deploy log says so rather than ignoring them.',
      'A redeploy takes the stack down and brings it up, so unlike a built app it is not zero-downtime.',
    ],
    composePortsTitle: 'Ports are decided for you',
    composePortsText:
      'Only the served service is published, on the port nginx proxies. Every other service\'s ports: entry is dropped — a file mapping 5432:5432 for its database would otherwise put that database on the internet. Inside the stack nothing changes.',
  },
  sso: {
    title: 'Single sign-on (OIDC)',
    description:
      "Let your team sign in through your own identity provider. The parts that are easy to get wrong are all on the provider's side, so this walks through what to enter there.",
    beforeTitle: 'Before you start',
    beforeText:
      "You need to be the organization's owner. Open Settings → Single sign-on: it shows the redirect URI your provider must send people back to. Copy it now — every provider asks for it first.",
    redirectExample: 'https://api.pushify.dev/api/v1/sso/callback',
    redirectWarningTitle: 'The redirect URI has to match exactly',
    redirectWarning:
      "Character for character, including https and any trailing path. A mismatch is the single most common failure, and it surfaces at the very end of sign-in as an error from the provider rather than from Pushify — so it looks like their problem, not a setting.",
    issuerLabel: 'Issuer to enter in Pushify',
    providers: [
      {
        name: 'Okta',
        steps: [
          'In the Okta admin console, go to Applications → Create App Integration.',
          'Choose OIDC – OpenID Connect, then Web Application.',
          'Under Sign-in redirect URIs, paste the redirect URI from Pushify.',
          'Under Assignments, pick who may use it — only these people will be able to sign in.',
          'Save, then copy the Client ID and Client secret from the General tab.',
        ],
        issuer: 'https://YOUR-TENANT.okta.com',
      },
      {
        name: 'Microsoft Entra ID (Azure AD)',
        steps: [
          'In the Azure portal, open Microsoft Entra ID → App registrations → New registration.',
          'For Redirect URI choose Web and paste the one from Pushify.',
          'After registering, note the Application (client) ID and the Directory (tenant) ID.',
          'Go to Certificates & secrets → New client secret and copy the secret Value (not the ID — the Value is only shown once).',
          'Under Token configuration, add the optional claim email, and tick the box to turn on the Microsoft Graph email permission if it offers.',
        ],
        issuer: 'https://login.microsoftonline.com/YOUR-TENANT-ID/v2.0',
      },
      {
        name: 'Google Workspace',
        steps: [
          'In Google Cloud Console, pick the project for your organization and open APIs & Services → Credentials.',
          'Create Credentials → OAuth client ID → Web application.',
          'Under Authorised redirect URIs, paste the one from Pushify.',
          'Copy the Client ID and Client secret.',
          'On the OAuth consent screen, set User type to Internal so only your Workspace accounts can use it.',
        ],
        issuer: 'https://accounts.google.com',
      },
    ],
    finishTitle: 'Finish in Pushify',
    finishSteps: [
      'Settings → Single sign-on: enter the issuer, client ID and client secret.',
      'Add the email domains your organization owns — only addresses in these sign in through the provider. Public providers such as gmail.com are refused, because anyone can have one.',
      'Pick the role a new member gets the first time your provider sends them.',
      'Save. Pushify contacts the provider before storing anything, so a wrong issuer is refused here rather than by the first person who tries to sign in.',
      'Sign out and enter an address in one of those domains on the login page — the password field is replaced with a single button.',
    ],
    enforceTitle: 'Requiring SSO',
    enforceText:
      'With "Require single sign-on" on, passwords, GitHub and Google all stop working for those domains. That is the point of it: disabling someone in your identity provider is then enough to lock them out of Pushify. Two-factor authentication still applies on top — SSO says who someone is, it does not waive a second factor you asked for.',
    lockoutTitle: 'Test it before you require it',
    lockoutText:
      'Sign in through the provider once while passwords still work. If the connection is wrong and you have already turned on Require single sign-on, the owner account is locked out too — recovering that needs access to the server.',
    troubleTitle: 'When it does not work',
    troubles: [
      {
        problem: 'The provider says the redirect URI does not match',
        fix: 'Copy it again from Settings → Single sign-on. It is derived from your API address, so it changes if that does.',
      },
      {
        problem: '"is not verified with the identity provider"',
        fix: "The provider sent an address it has not verified. In Entra, add the email optional claim; in Okta, check the user has a verified primary email.",
      },
      {
        problem: '"is not in a domain this connection signs in"',
        fix: 'The address is real but its domain is not on your list. Add it, or have the person use their work address. Sub-domains do not count: @eu.acme.com is not @acme.com.',
      },
      {
        problem: 'The sign-in could not be verified',
        fix: "The token failed signature or claim checks. Usually the client secret is wrong or expired — Entra secrets expire, often after six months.",
      },
      {
        problem: 'Everyone is locked out',
        fix: 'On the server, delete the row from sso_connections for your organization; password login works again immediately.',
      },
    ],
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
