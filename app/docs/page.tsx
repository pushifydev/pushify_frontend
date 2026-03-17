'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Key,
  Folder,
  Rocket,
  ExternalLink,
  Shield,
  Terminal,
  BookOpen,
  Globe,
  Server,
  Database,
  Variable,
  Webhook,
  Menu,
  X,
  Search,
  ArrowRight,
  Gauge,
} from 'lucide-react';
import { CodeBlock, EndpointCard, SectionHeading, Callout } from './components';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pushify.dev/api/v1';

type Section =
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

const navGroups = [
  {
    label: 'Getting Started',
    items: [
      { id: 'intro' as Section, label: 'Introduction', icon: BookOpen },
      { id: 'auth' as Section, label: 'Authentication', icon: Key },
    ],
  },
  {
    label: 'API Reference',
    items: [
      { id: 'projects' as Section, label: 'Projects', icon: Folder },
      { id: 'deployments' as Section, label: 'Deployments', icon: Rocket },
      { id: 'envvars' as Section, label: 'Environment Variables', icon: Variable },
      { id: 'domains' as Section, label: 'Domains', icon: Globe },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { id: 'servers' as Section, label: 'Servers', icon: Server },
      { id: 'databases' as Section, label: 'Databases', icon: Database },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { id: 'webhooks' as Section, label: 'Webhooks & CI/CD', icon: Webhook },
    ],
  },
  {
    label: 'Reference',
    items: [
      { id: 'errors' as Section, label: 'Error Handling', icon: Shield },
    ],
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<Section>('intro');
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');

  const navigate = (section: Section) => {
    setActiveSection(section);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredGroups = search
    ? navGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((i) =>
            i.label.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((g) => g.items.length > 0)
    : navGroups;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav(true)}
              className="lg:hidden p-1.5 -ml-1.5 rounded-md hover:bg-white/5"
            >
              <Menu className="w-5 h-5 text-white/60" />
            </button>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#0a0a0f]" />
              </div>
              <span className="text-base font-bold text-white">Pushify</span>
              <span className="text-sm text-white/30 hidden sm:inline">/ Docs</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-[#0a0a0f] text-sm font-medium hover:bg-cyan-400 transition-colors"
            >
              Get API Key
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Mobile Nav Overlay */}
        {mobileNav && (
          <div
            className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            onClick={() => setMobileNav(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-4rem)] w-72 lg:w-64 bg-[#0a0a0f] lg:bg-transparent border-r border-white/[0.06] lg:border-0 z-50 lg:z-0 transition-transform lg:translate-x-0 shrink-0 ${
            mobileNav ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full p-4 lg:py-8 lg:pr-6 lg:pl-4 overflow-y-auto">
            {/* Mobile close */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="text-sm font-semibold text-white/60">Navigation</span>
              <button
                onClick={() => setMobileNav(false)}
                className="p-1 rounded-md hover:bg-white/5"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-cyan-500/30 transition-colors"
              />
            </div>

            {/* Nav groups */}
            <nav className="space-y-5 flex-1">
              {filteredGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-2 px-3">
                    {group.label}
                  </h3>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-sm ${
                            isActive
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'text-white/45 hover:text-white/70 hover:bg-white/[0.03]'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="font-medium truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Version */}
            <div className="pt-4 border-t border-white/[0.06] mt-4">
              <div className="flex items-center gap-2 px-3 text-xs text-white/25">
                <Gauge className="w-3.5 h-3.5" />
                <span>API v1.0</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
          {activeSection === 'intro' && <IntroSection onNavigate={navigate} />}
          {activeSection === 'auth' && <AuthSection />}
          {activeSection === 'projects' && <ProjectsSection />}
          {activeSection === 'deployments' && <DeploymentsSection />}
          {activeSection === 'envvars' && <EnvVarsSection />}
          {activeSection === 'domains' && <DomainsSection />}
          {activeSection === 'servers' && <ServersSection />}
          {activeSection === 'databases' && <DatabasesSection />}
          {activeSection === 'webhooks' && <WebhooksSection />}
          {activeSection === 'errors' && <ErrorsSection />}
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   SECTIONS
   ============================================================ */

function IntroSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  return (
    <div className="space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
          <Zap className="w-3 h-3" /> REST API
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Pushify API Documentation</h1>
        <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
          Deploy, manage, and monitor your applications programmatically.
          Perfect for CI/CD pipelines, automation scripts, and custom integrations.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Terminal,
            title: 'RESTful API',
            desc: 'Simple REST endpoints with JSON responses',
            color: 'text-cyan-400 bg-cyan-500/10',
          },
          {
            icon: Shield,
            title: 'Secure',
            desc: 'Scope-based API key permissions',
            color: 'text-purple-400 bg-purple-500/10',
          },
          {
            icon: Rocket,
            title: 'CI/CD Ready',
            desc: 'Webhook triggers and deploy API',
            color: 'text-amber-400 bg-amber-500/10',
          },
        ].map((f) => (
          <div key={f.title} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className={`w-9 h-9 rounded-lg ${f.color} flex items-center justify-center mb-3`}>
              <f.icon className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-xs text-white/40">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Base URL */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-2">Base URL</h3>
        <CodeBlock code={API_BASE} />
      </div>

      {/* Quick Start */}
      <div>
        <h2 className="text-xl font-bold text-white mb-5">Quick Start</h2>
        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Create an API Key',
              desc: (
                <>
                  Go to{' '}
                  <Link href="/dashboard/settings" className="text-cyan-400 hover:underline">
                    Settings &rarr; API Keys
                  </Link>{' '}
                  and create a key with the required scopes.
                </>
              ),
            },
            {
              step: '2',
              title: 'Make a Request',
              desc: 'Use your API key in the Authorization header to authenticate.',
            },
            {
              step: '3',
              title: 'Automate',
              desc: 'Integrate with GitHub Actions, GitLab CI, or any CI/CD tool.',
            },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-[#0a0a0f] font-bold text-xs shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-0.5">{s.title}</h4>
                <p className="text-sm text-white/40">{typeof s.desc === 'string' ? s.desc : s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Explore</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { section: 'projects' as Section, label: 'Projects API', desc: 'Manage your projects', icon: Folder },
            { section: 'deployments' as Section, label: 'Deployments API', desc: 'Trigger and manage deploys', icon: Rocket },
            { section: 'servers' as Section, label: 'Servers API', desc: 'Manage infrastructure', icon: Server },
            { section: 'databases' as Section, label: 'Databases API', desc: 'Manage databases & backups', icon: Database },
          ].map((link) => (
            <button
              key={link.section}
              onClick={() => onNavigate(link.section)}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors text-left group"
            >
              <link.icon className="w-5 h-5 text-white/30 group-hover:text-cyan-400 transition-colors" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white">{link.label}</h4>
                <p className="text-xs text-white/35">{link.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthSection() {
  return (
    <div className="space-y-8">
      <SectionHeading
        title="Authentication"
        description="All API requests require an API key. Include it in the Authorization header as a Bearer token."
      />

      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-2">Header Format</h3>
        <CodeBlock code="Authorization: Bearer pk_live_YOUR_API_KEY" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-2">Example Request</h3>
        <CodeBlock
          code={`curl -X GET "${API_BASE}/projects" \\
  -H "Authorization: Bearer pk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
          language="bash"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Available Scopes</h2>
        <p className="text-sm text-white/40 mb-4">
          Limit API key access by selecting specific scopes when creating a key.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { scope: 'projects:read', desc: 'List and view projects' },
            { scope: 'projects:write', desc: 'Create, update, delete projects' },
            { scope: 'deployments:read', desc: 'View deployments and logs' },
            { scope: 'deployments:write', desc: 'Trigger, cancel, rollback deploys' },
            { scope: 'envvars:read', desc: 'View environment variables' },
            { scope: 'envvars:write', desc: 'Manage environment variables' },
            { scope: 'servers:read', desc: 'View servers' },
            { scope: 'servers:write', desc: 'Manage servers' },
            { scope: 'databases:read', desc: 'View databases' },
            { scope: 'databases:write', desc: 'Manage databases' },
            { scope: 'domains:read', desc: 'View domains' },
            { scope: 'domains:write', desc: 'Manage domains' },
          ].map((item) => (
            <div
              key={item.scope}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]"
            >
              <code className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono shrink-0">
                {item.scope}
              </code>
              <span className="text-white/40 text-xs">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <Callout type="warning" title="Security">
        Never expose API keys in client-side code or public repositories. Store them in environment variables.
      </Callout>
    </div>
  );
}

function ProjectsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Projects"
        description="Manage your projects programmatically. Create, update, configure, and delete projects."
      />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects"
          description="List all projects in your organization."
          scope="projects:read"
          request={`curl "${API_BASE}/projects" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "proj_abc123",
      "name": "My App",
      "slug": "my-app",
      "status": "active",
      "gitRepoUrl": "https://github.com/user/my-app",
      "gitBranch": "main",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`}
        />

        <EndpointCard
          method="GET"
          path="/projects/:projectId"
          description="Get detailed information about a specific project including build config and domains."
          scope="projects:read"
          request={`curl "${API_BASE}/projects/proj_abc123" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": {
    "id": "proj_abc123",
    "name": "My App",
    "slug": "my-app",
    "status": "active",
    "gitRepoUrl": "https://github.com/user/my-app",
    "gitBranch": "main",
    "buildCommand": "npm run build",
    "startCommand": "npm start",
    "port": 3000,
    "autoDeploy": true,
    "domains": [
      { "id": "dom_1", "domain": "my-app.pushify.dev", "isPrimary": true }
    ]
  }
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects"
          description="Create a new project with Git repository configuration."
          scope="projects:write"
          params={[
            { name: 'name', type: 'string', required: true, desc: 'Project name' },
            { name: 'gitRepoUrl', type: 'string', required: true, desc: 'Git repository URL' },
            { name: 'gitBranch', type: 'string', desc: 'Branch to deploy (default: main)' },
            { name: 'buildCommand', type: 'string', desc: 'Build command (e.g. npm run build)' },
            { name: 'startCommand', type: 'string', desc: 'Start command (e.g. npm start)' },
            { name: 'port', type: 'number', desc: 'Application port (default: 3000)' },
          ]}
          request={`curl -X POST "${API_BASE}/projects" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My New App",
    "gitRepoUrl": "https://github.com/user/app",
    "gitBranch": "main",
    "buildCommand": "npm run build",
    "startCommand": "npm start",
    "port": 3000
  }'`}
          response={`{
  "data": { "id": "proj_new123", "name": "My New App", ... },
  "message": "Project created successfully"
}`}
        />

        <EndpointCard
          method="PATCH"
          path="/projects/:projectId"
          description="Update project configuration. Only include fields you want to change."
          scope="projects:write"
          request={`curl -X PATCH "${API_BASE}/projects/proj_abc123" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "buildCommand": "npm run build:prod" }'`}
          response={`{
  "data": { "id": "proj_abc123", "buildCommand": "npm run build:prod", ... },
  "message": "Project updated successfully"
}`}
        />

        <EndpointCard
          method="DELETE"
          path="/projects/:projectId"
          description="Delete a project and all associated resources."
          scope="projects:write"
          request={`curl -X DELETE "${API_BASE}/projects/proj_abc123" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Project deleted successfully" }`}
        />
      </div>
    </div>
  );
}

function DeploymentsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Deployments"
        description="Trigger and manage deployments. Monitor build progress, view logs, and rollback when needed."
      />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects/:projectId/deployments"
          description="List all deployments for a project, ordered by newest first."
          scope="deployments:read"
          params={[
            { name: 'limit', type: 'number', desc: 'Results per page (default: 20)' },
            { name: 'offset', type: 'number', desc: 'Pagination offset' },
          ]}
          request={`curl "${API_BASE}/projects/proj_abc123/deployments?limit=10" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "dep_xyz789",
      "status": "running",
      "trigger": "manual",
      "commitHash": "abc123",
      "commitMessage": "Update homepage",
      "branch": "main",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/deployments"
          description="Trigger a new deployment for a project."
          scope="deployments:write"
          params={[
            { name: 'branch', type: 'string', desc: 'Branch to deploy' },
            { name: 'commitHash', type: 'string', desc: 'Specific commit to deploy' },
            { name: 'commitMessage', type: 'string', desc: 'Commit message for reference' },
          ]}
          request={`curl -X POST "${API_BASE}/projects/proj_abc123/deployments" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "branch": "main" }'`}
          response={`{
  "data": { "id": "dep_new001", "status": "pending", "trigger": "manual", ... },
  "message": "Deployment created successfully"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/deployments/:deploymentId/cancel"
          description="Cancel a pending or building deployment."
          scope="deployments:write"
          request={`curl -X POST "${API_BASE}/projects/proj_abc123/deployments/dep_xyz789/cancel" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "dep_xyz789", "status": "cancelled", ... },
  "message": "Deployment cancelled"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/deployments/:deploymentId/redeploy"
          description="Create a new deployment with the same configuration as a previous one."
          scope="deployments:write"
          request={`curl -X POST "${API_BASE}/projects/proj_abc123/deployments/dep_xyz789/redeploy" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "dep_new002", "status": "pending", "trigger": "redeploy", ... },
  "message": "Redeploy started"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/deployments/:deploymentId/rollback"
          description="Rollback to a previous successful deployment."
          scope="deployments:write"
          request={`curl -X POST "${API_BASE}/projects/proj_abc123/deployments/dep_xyz789/rollback" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "dep_new003", "status": "pending", "trigger": "rollback", ... },
  "message": "Rollback started"
}`}
        />

        <EndpointCard
          method="GET"
          path="/projects/:projectId/deployments/:deploymentId/logs"
          description="Get build or runtime logs for a deployment."
          scope="deployments:read"
          params={[
            { name: 'type', type: 'string', required: true, desc: '"build" or "deploy"' },
          ]}
          request={`curl "${API_BASE}/projects/proj_abc123/deployments/dep_xyz789/logs?type=build" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": {
    "logs": "Step 1/5: Cloning repository...\\nStep 2/5: Installing dependencies...",
    "status": "running"
  }
}`}
        />
      </div>
    </div>
  );
}

function EnvVarsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Environment Variables"
        description="Manage environment variables for your projects. Changes take effect on next deployment."
      />

      <Callout type="info" title="Sensitive Values">
        Environment variable values are encrypted at rest and masked in API responses.
        Only the first and last characters are visible.
      </Callout>

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects/:projectId/env"
          description="List all environment variables for a project. Values are masked for security."
          scope="envvars:read"
          request={`curl "${API_BASE}/projects/proj_abc123/env" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "env_001",
      "key": "DATABASE_URL",
      "value": "p****l",
      "isSecret": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/env"
          description="Create a new environment variable."
          scope="envvars:write"
          params={[
            { name: 'key', type: 'string', required: true, desc: 'Variable name (e.g. DATABASE_URL)' },
            { name: 'value', type: 'string', required: true, desc: 'Variable value' },
            { name: 'isSecret', type: 'boolean', desc: 'Mark as secret (default: true)' },
          ]}
          request={`curl -X POST "${API_BASE}/projects/proj_abc123/env" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "key": "API_SECRET", "value": "s3cret", "isSecret": true }'`}
          response={`{
  "data": { "id": "env_002", "key": "API_SECRET", "value": "s****t", ... },
  "message": "Environment variable created"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/env/bulk"
          description="Create or update multiple environment variables at once. Useful for syncing .env files."
          scope="envvars:write"
          params={[
            { name: 'variables', type: 'array', required: true, desc: 'Array of { key, value, isSecret } objects' },
          ]}
          request={`curl -X POST "${API_BASE}/projects/proj_abc123/env/bulk" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "variables": [
      { "key": "NODE_ENV", "value": "production" },
      { "key": "DB_HOST", "value": "localhost", "isSecret": true }
    ]
  }'`}
          response={`{
  "data": { "created": 1, "updated": 1 },
  "message": "Environment variables updated"
}`}
        />

        <EndpointCard
          method="PATCH"
          path="/projects/:projectId/env/:envVarId"
          description="Update an existing environment variable's key or value."
          scope="envvars:write"
          request={`curl -X PATCH "${API_BASE}/projects/proj_abc123/env/env_001" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "value": "new_value" }'`}
          response={`{
  "data": { "id": "env_001", "key": "DATABASE_URL", ... },
  "message": "Environment variable updated"
}`}
        />

        <EndpointCard
          method="DELETE"
          path="/projects/:projectId/env/:envVarId"
          description="Delete an environment variable."
          scope="envvars:write"
          request={`curl -X DELETE "${API_BASE}/projects/proj_abc123/env/env_001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Environment variable deleted" }`}
        />
      </div>
    </div>
  );
}

function DomainsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Domains"
        description="Add custom domains to your projects. Manage DNS settings, SSL certificates, and Nginx configuration."
      />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects/:projectId/domains"
          description="List all domains configured for a project."
          scope="domains:read"
          request={`curl "${API_BASE}/projects/proj_abc123/domains" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "dom_001",
      "domain": "myapp.com",
      "isPrimary": true,
      "verified": true,
      "sslStatus": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "dom_002",
      "domain": "www.myapp.com",
      "isPrimary": false,
      "verified": true,
      "sslStatus": "active"
    }
  ]
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/domains"
          description="Add a custom domain to a project. Returns DNS records to configure."
          scope="domains:write"
          params={[
            { name: 'domain', type: 'string', required: true, desc: 'Domain name (e.g. myapp.com)' },
          ]}
          request={`curl -X POST "${API_BASE}/projects/proj_abc123/domains" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "domain": "myapp.com" }'`}
          response={`{
  "data": {
    "id": "dom_003",
    "domain": "myapp.com",
    "verified": false,
    "dnsRecords": [
      { "type": "A", "name": "@", "value": "1.2.3.4" },
      { "type": "CNAME", "name": "www", "value": "myapp.pushify.dev" }
    ]
  },
  "message": "Domain added. Configure DNS records to verify."
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/domains/:domainId/verify"
          description="Verify domain DNS configuration and provision SSL certificate."
          scope="domains:write"
          request={`curl -X POST "${API_BASE}/projects/proj_abc123/domains/dom_003/verify" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "dom_003", "verified": true, "sslStatus": "provisioning" },
  "message": "Domain verified successfully"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/domains/:domainId/primary"
          description="Set a domain as the primary domain for the project."
          scope="domains:write"
          request={`curl -X POST "${API_BASE}/projects/proj_abc123/domains/dom_003/primary" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "dom_003", "isPrimary": true },
  "message": "Primary domain updated"
}`}
        />

        <EndpointCard
          method="DELETE"
          path="/projects/:projectId/domains/:domainId"
          description="Remove a domain from the project."
          scope="domains:write"
          request={`curl -X DELETE "${API_BASE}/projects/proj_abc123/domains/dom_003" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Domain removed" }`}
        />
      </div>
    </div>
  );
}

function ServersSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Servers"
        description="Provision and manage servers. Create cloud servers, control their state, and monitor status."
      />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/servers"
          description="List all servers in your organization."
          scope="servers:read"
          request={`curl "${API_BASE}/servers" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "srv_001",
      "name": "production-1",
      "provider": "hetzner",
      "region": "eu-central",
      "ipv4": "1.2.3.4",
      "status": "running",
      "setupStatus": "completed",
      "specs": { "vcpu": 2, "memory": 4096, "disk": 40 },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`}
        />

        <EndpointCard
          method="POST"
          path="/servers"
          description="Create and provision a new server."
          scope="servers:write"
          params={[
            { name: 'name', type: 'string', required: true, desc: 'Server name' },
            { name: 'provider', type: 'string', required: true, desc: 'Cloud provider (hetzner, digitalocean)' },
            { name: 'region', type: 'string', required: true, desc: 'Region identifier' },
            { name: 'size', type: 'string', required: true, desc: 'Server size/type' },
          ]}
          request={`curl -X POST "${API_BASE}/servers" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "production-2",
    "provider": "hetzner",
    "region": "eu-central",
    "size": "cx21"
  }'`}
          response={`{
  "data": { "id": "srv_002", "name": "production-2", "status": "provisioning", ... },
  "message": "Server is being provisioned"
}`}
        />

        <EndpointCard
          method="GET"
          path="/servers/:serverId"
          description="Get detailed server information including specs and status."
          scope="servers:read"
          request={`curl "${API_BASE}/servers/srv_001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": {
    "id": "srv_001",
    "name": "production-1",
    "provider": "hetzner",
    "region": "eu-central",
    "ipv4": "1.2.3.4",
    "status": "running",
    "setupStatus": "completed",
    "specs": { "vcpu": 2, "memory": 4096, "disk": 40 }
  }
}`}
        />

        <EndpointCard
          method="POST"
          path="/servers/:serverId/start"
          description="Start a stopped server."
          scope="servers:write"
          request={`curl -X POST "${API_BASE}/servers/srv_001/start" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server is starting" }`}
        />

        <EndpointCard
          method="POST"
          path="/servers/:serverId/stop"
          description="Stop a running server. All containers on the server will be stopped."
          scope="servers:write"
          request={`curl -X POST "${API_BASE}/servers/srv_001/stop" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server is stopping" }`}
        />

        <EndpointCard
          method="POST"
          path="/servers/:serverId/reboot"
          description="Reboot a server. Brief downtime expected during restart."
          scope="servers:write"
          request={`curl -X POST "${API_BASE}/servers/srv_001/reboot" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server is rebooting" }`}
        />

        <EndpointCard
          method="DELETE"
          path="/servers/:serverId"
          description="Delete a server. This is permanent and will destroy all data on the server."
          scope="servers:write"
          request={`curl -X DELETE "${API_BASE}/servers/srv_001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server deleted" }`}
        />
      </div>
    </div>
  );
}

function DatabasesSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Databases"
        description="Create and manage databases on your servers. Supports PostgreSQL, MySQL, Redis, and MongoDB."
      />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/databases"
          description="List all databases in your organization."
          scope="databases:read"
          request={`curl "${API_BASE}/databases" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "db_001",
      "name": "main-postgres",
      "type": "postgresql",
      "version": "16",
      "status": "running",
      "host": "1.2.3.4",
      "port": 5432,
      "databaseName": "app_db",
      "server": { "id": "srv_001", "name": "production-1" }
    }
  ]
}`}
        />

        <EndpointCard
          method="POST"
          path="/databases"
          description="Create a new database on a server."
          scope="databases:write"
          params={[
            { name: 'name', type: 'string', required: true, desc: 'Database name' },
            { name: 'type', type: 'string', required: true, desc: 'postgresql, mysql, redis, mongodb' },
            { name: 'serverId', type: 'string', required: true, desc: 'Server to create database on' },
            { name: 'description', type: 'string', desc: 'Optional description' },
          ]}
          request={`curl -X POST "${API_BASE}/databases" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-database",
    "type": "postgresql",
    "serverId": "srv_001"
  }'`}
          response={`{
  "data": { "id": "db_002", "name": "my-database", "status": "provisioning", ... },
  "message": "Database is being created"
}`}
        />

        <EndpointCard
          method="GET"
          path="/databases/:id/credentials"
          description="Get database connection credentials including host, port, username, password, and connection string."
          scope="databases:read"
          request={`curl "${API_BASE}/databases/db_001/credentials" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": {
    "host": "1.2.3.4",
    "port": 5432,
    "username": "app_user",
    "password": "generated_password",
    "databaseName": "app_db",
    "connectionString": "postgresql://app_user:generated_password@1.2.3.4:5432/app_db"
  }
}`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/connect"
          description="Connect a database to a project. This injects connection credentials as environment variables."
          scope="databases:write"
          params={[
            { name: 'projectId', type: 'string', required: true, desc: 'Project to connect to' },
            { name: 'envPrefix', type: 'string', desc: 'Environment variable prefix (default: DATABASE)' },
          ]}
          request={`curl -X POST "${API_BASE}/databases/db_001/connect" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "projectId": "proj_abc123", "envPrefix": "DATABASE" }'`}
          response={`{
  "data": { "connectionId": "conn_001" },
  "message": "Database connected to project"
}`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/start"
          description="Start a stopped database."
          scope="databases:write"
          request={`curl -X POST "${API_BASE}/databases/db_001/start" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Database is starting" }`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/stop"
          description="Stop a running database."
          scope="databases:write"
          request={`curl -X POST "${API_BASE}/databases/db_001/stop" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Database is stopping" }`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/backups"
          description="Create a manual backup of the database."
          scope="databases:write"
          request={`curl -X POST "${API_BASE}/databases/db_001/backups" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "bak_001", "status": "creating", "type": "manual", ... },
  "message": "Backup started"
}`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/backups/:backupId/restore"
          description="Restore a database from a backup. Warning: this overwrites the current database."
          scope="databases:write"
          request={`curl -X POST "${API_BASE}/databases/db_001/backups/bak_001/restore" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "bak_001", "status": "restoring", ... },
  "message": "Restore started"
}`}
        />

        <EndpointCard
          method="DELETE"
          path="/databases/:id"
          description="Delete a database and all its data permanently."
          scope="databases:write"
          request={`curl -X DELETE "${API_BASE}/databases/db_001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Database deleted" }`}
        />
      </div>
    </div>
  );
}

function WebhooksSection() {
  return (
    <div className="space-y-8">
      <SectionHeading
        title="Webhooks & CI/CD"
        description="Automatically deploy when you push to GitHub. Pushify listens for webhook events and triggers deployments."
      />

      <div>
        <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Connect GitHub', desc: 'Link your GitHub account in project settings.' },
            { step: '2', title: 'Push to Branch', desc: 'Push code to the configured branch (e.g. main).' },
            { step: '3', title: 'Auto Deploy', desc: 'Pushify receives the webhook and starts a deployment automatically.' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-[#0a0a0f] font-bold text-xs shrink-0">
                {s.step}
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">{s.title}</h4>
                <p className="text-xs text-white/40 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Manual Webhook URL</h2>
        <p className="text-sm text-white/40 mb-3">
          Each project has a unique webhook URL for manual integration with other Git providers.
        </p>
        <CodeBlock
          code={`POST ${API_BASE}/webhooks/github/:projectId

Headers:
  X-Hub-Signature-256: sha256=<HMAC signature>
  Content-Type: application/json

Body:
{
  "ref": "refs/heads/main",
  "head_commit": {
    "id": "abc123",
    "message": "Deploy new feature"
  }
}`}
          language="text"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">GitHub Actions Example</h2>
        <p className="text-sm text-white/40 mb-3">
          Trigger deployments directly from GitHub Actions using the Deployments API.
        </p>
        <CodeBlock
          code={`# .github/workflows/deploy.yml
name: Deploy to Pushify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger deployment
        run: |
          curl -X POST "${API_BASE}/projects/\${{ secrets.PROJECT_ID }}/deployments" \\
            -H "Authorization: Bearer \${{ secrets.PUSHIFY_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{
              "branch": "main",
              "commitHash": "\${{ github.sha }}",
              "commitMessage": "\${{ github.event.head_commit.message }}"
            }'`}
          language="yaml"
        />
      </div>

      <Callout type="info" title="Webhook Secret">
        Webhook payloads are signed with HMAC-SHA256. Retrieve your webhook secret via the
        project settings or the <code className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-400 text-xs">GET /projects/:id/webhook</code> endpoint.
      </Callout>
    </div>
  );
}

function ErrorsSection() {
  return (
    <div className="space-y-8">
      <SectionHeading
        title="Error Handling"
        description="The API uses standard HTTP status codes and returns detailed error messages in JSON format."
      />

      <div>
        <h2 className="text-xl font-bold text-white mb-4">HTTP Status Codes</h2>
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Code</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { code: '200', desc: 'Success', color: 'text-emerald-400' },
                { code: '201', desc: 'Created - Resource created successfully', color: 'text-emerald-400' },
                { code: '400', desc: 'Bad Request - Invalid parameters', color: 'text-amber-400' },
                { code: '401', desc: 'Unauthorized - Invalid or missing API key', color: 'text-red-400' },
                { code: '403', desc: 'Forbidden - Insufficient permissions / scope', color: 'text-red-400' },
                { code: '404', desc: 'Not Found - Resource does not exist', color: 'text-red-400' },
                { code: '429', desc: 'Too Many Requests - Rate limit exceeded', color: 'text-orange-400' },
                { code: '500', desc: 'Internal Server Error', color: 'text-red-400' },
              ].map((item) => (
                <tr key={item.code} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold text-sm ${item.color}`}>{item.code}</span>
                  </td>
                  <td className="px-4 py-3 text-white/50">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-3">Error Response Format</h2>
        <CodeBlock
          code={`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired API key"
  }
}`}
          language="json"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Common Error Codes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { code: 'UNAUTHORIZED', desc: 'API key is missing, invalid, or expired' },
            { code: 'INSUFFICIENT_SCOPE', desc: 'API key lacks required permissions' },
            { code: 'NOT_FOUND', desc: 'Requested resource was not found' },
            { code: 'VALIDATION_ERROR', desc: 'Request body or parameters are invalid' },
            { code: 'RATE_LIMITED', desc: 'Too many requests, slow down' },
            { code: 'CONFLICT', desc: 'Resource already exists or state conflict' },
          ].map((item) => (
            <div
              key={item.code}
              className="flex items-start gap-3 px-3.5 py-3 rounded-lg bg-white/[0.02] border border-white/[0.06]"
            >
              <code className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-xs font-mono shrink-0">
                {item.code}
              </code>
              <span className="text-white/40 text-xs leading-relaxed">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-3">Rate Limits</h2>
        <p className="text-sm text-white/40 mb-4">
          API requests are rate-limited per API key. Limits vary by plan.
        </p>
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Plan</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs">Rate Limit</th>
              </tr>
            </thead>
            <tbody>
              {[
                { plan: 'Free', limit: '60 requests/min' },
                { plan: 'Hobby', limit: '120 requests/min' },
                { plan: 'Pro', limit: '300 requests/min' },
                { plan: 'Business', limit: '600 requests/min' },
              ].map((item) => (
                <tr key={item.plan} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3 text-white/70 font-medium">{item.plan}</td>
                  <td className="px-4 py-3 text-white/50 font-mono text-xs">{item.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-white/30 mt-3">
          Rate limit headers are included in every response:{' '}
          <code className="text-cyan-400/50">X-RateLimit-Limit</code>,{' '}
          <code className="text-cyan-400/50">X-RateLimit-Remaining</code>,{' '}
          <code className="text-cyan-400/50">X-RateLimit-Reset</code>
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-3">Error Handling Example</h2>
        <CodeBlock
          code={`async function apiRequest(endpoint, options = {}) {
  const response = await fetch('${API_BASE}' + endpoint, {
    ...options,
    headers: {
      'Authorization': 'Bearer ' + process.env.PUSHIFY_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}`}
          language="javascript"
        />
      </div>
    </div>
  );
}
