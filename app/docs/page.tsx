'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Key,
  Folder,
  Rocket,
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
import { LandingNavbar } from '@/components/landing';
import { DOCS_API_BASE_URL } from '@/lib/api/public-url';
import { useDocsContent } from '@/hooks/useDocsContent';
import type { DocsContent, DocsSectionId } from '@/lib/i18n/docs';

const API_BASE = DOCS_API_BASE_URL;

const sectionIcons: Record<DocsSectionId, typeof BookOpen> = {
  intro: BookOpen,
  auth: Key,
  projects: Folder,
  deployments: Rocket,
  envvars: Variable,
  domains: Globe,
  servers: Server,
  databases: Database,
  webhooks: Webhook,
  errors: Shield,
};

const exploreSections: DocsSectionId[] = ['projects', 'deployments', 'servers', 'databases'];
const exploreIcons = [Folder, Rocket, Server, Database];

const introFeatureIcons = [
  { icon: Terminal, iconClass: 'text-[var(--lp-ink)]', bgClass: 'bg-[var(--hover-overlay-lg)]' },
  { icon: Shield, iconClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-500/10' },
  { icon: Rocket, iconClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-500/10' },
];

const statusCodeColors: Record<string, string> = {
  '200': 'text-emerald-600 dark:text-emerald-400',
  '201': 'text-emerald-600 dark:text-emerald-400',
  '400': 'text-amber-600 dark:text-amber-400',
  '401': 'text-red-600 dark:text-red-400',
  '403': 'text-red-600 dark:text-red-400',
  '404': 'text-red-600 dark:text-red-400',
  '429': 'text-orange-600 dark:text-orange-400',
  '500': 'text-red-600 dark:text-red-400',
};

type ParamDef = { type: string; required?: boolean };

function buildParams(
  defs: Record<string, ParamDef>,
  descriptions?: Record<string, string>,
) {
  return Object.entries(defs).map(([name, { type, required }]) => ({
    name,
    type,
    ...(required ? { required: true } : {}),
    desc: descriptions?.[name] ?? '',
  }));
}

const PROJECT_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  name: { type: 'string', required: true },
  gitRepoUrl: { type: 'string', required: true },
  gitBranch: { type: 'string' },
  buildCommand: { type: 'string' },
  startCommand: { type: 'string' },
  port: { type: 'number' },
};

const DEPLOYMENT_LIST_PARAM_DEFS: Record<string, ParamDef> = {
  limit: { type: 'number' },
  offset: { type: 'number' },
};

const DEPLOYMENT_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  branch: { type: 'string' },
  commitHash: { type: 'string' },
  commitMessage: { type: 'string' },
};

const DEPLOYMENT_LOGS_PARAM_DEFS: Record<string, ParamDef> = {
  type: { type: 'string', required: true },
};

const ENVVAR_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  key: { type: 'string', required: true },
  value: { type: 'string', required: true },
  isSecret: { type: 'boolean' },
};

const ENVVAR_BULK_PARAM_DEFS: Record<string, ParamDef> = {
  variables: { type: 'array', required: true },
};

const DOMAIN_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  domain: { type: 'string', required: true },
};

const SERVER_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  name: { type: 'string', required: true },
  provider: { type: 'string', required: true },
  region: { type: 'string', required: true },
  size: { type: 'string', required: true },
};

const DATABASE_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  name: { type: 'string', required: true },
  type: { type: 'string', required: true },
  serverId: { type: 'string', required: true },
  description: { type: 'string' },
};

const DATABASE_CONNECT_PARAM_DEFS: Record<string, ParamDef> = {
  projectId: { type: 'string', required: true },
  envPrefix: { type: 'string' },
};

type SectionProps = { c: DocsContent; apiBase: string };

export default function DocsPage() {
  const { content: c } = useDocsContent();
  const [activeSection, setActiveSection] = useState<DocsSectionId>('intro');
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');

  const navigate = (section: DocsSectionId) => {
    setActiveSection(section);
    setMobileNav(false);
    requestAnimationFrame(() => {
      document.getElementById('docs-main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const filteredGroups = search
    ? c.navGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((i) =>
            i.label.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((g) => g.items.length > 0)
    : c.navGroups;

  return (
    <div className="lp-page docs-page min-h-screen">
      <LandingNavbar />

      <div className="pt-14 md:pt-16">
      <header
        className="sticky top-14 md:top-16 z-40 border-b backdrop-blur-xl"
        style={{ borderColor: 'var(--lp-border)', background: 'color-mix(in srgb, var(--bg-primary) 92%, transparent)' }}
      >
        <div className="lp-container flex items-center justify-between gap-4 h-12">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNav(true)}
              className="lg:hidden p-1.5 -ml-1.5 rounded-md hover:opacity-70"
              style={{ color: 'var(--lp-muted)' }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium" style={{ color: 'var(--lp-muted)' }}>
              {c.shell.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm hidden sm:block hover:opacity-80 transition-opacity"
              style={{ color: 'var(--lp-muted)' }}
            >
              {c.shell.dashboard}
            </Link>
            <Link href="/dashboard/settings" className="lp-cta text-sm py-2 px-4 h-auto min-h-0">
              {c.shell.getApiKey}
            </Link>
          </div>
        </div>
      </header>

      <div className="lp-container max-w-7xl flex">
        {mobileNav && (
          <div
            className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            onClick={() => setMobileNav(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-14 md:top-28 left-0 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] lg:h-[calc(100vh-7rem)] w-72 lg:w-64 border-r lg:border-0 z-50 lg:z-0 transition-transform lg:translate-x-0 shrink-0 ${
            mobileNav ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--lp-border)' }}
        >
          <div className="flex flex-col h-full p-4 lg:py-8 lg:pr-6 lg:pl-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="text-sm font-semibold docs-h3 mb-0">{c.shell.navigation}</span>
              <button
                type="button"
                onClick={() => setMobileNav(false)}
                className="p-1 rounded-md hover:bg-[var(--hover-overlay-md)]"
                style={{ color: 'var(--lp-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-5">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: 'var(--lp-muted)' }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={c.shell.searchPlaceholder}
                className="docs-sidebar-input"
              />
            </div>

            <nav className="space-y-5 flex-1">
              {filteredGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="docs-nav-group-label">{group.label}</h3>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = sectionIcons[item.id];
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigate(item.id)}
                          className={isActive ? 'docs-nav-item docs-nav-item-active' : 'docs-nav-item'}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--lp-border)' }}>
              <div className="flex items-center gap-2 px-3 docs-muted-sm">
                <Gauge className="w-3.5 h-3.5" />
                <span>{c.shell.apiVersion}</span>
              </div>
            </div>
          </div>
        </aside>

        <main
          id="docs-main"
          className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 scroll-mt-[6.5rem] md:scroll-mt-28"
        >
          {activeSection === 'intro' && <IntroSection c={c} apiBase={API_BASE} onNavigate={navigate} />}
          {activeSection === 'auth' && <AuthSection c={c} apiBase={API_BASE} />}
          {activeSection === 'projects' && <ProjectsSection c={c} apiBase={API_BASE} />}
          {activeSection === 'deployments' && <DeploymentsSection c={c} apiBase={API_BASE} />}
          {activeSection === 'envvars' && <EnvVarsSection c={c} apiBase={API_BASE} />}
          {activeSection === 'domains' && <DomainsSection c={c} apiBase={API_BASE} />}
          {activeSection === 'servers' && <ServersSection c={c} apiBase={API_BASE} />}
          {activeSection === 'databases' && <DatabasesSection c={c} apiBase={API_BASE} />}
          {activeSection === 'webhooks' && <WebhooksSection c={c} apiBase={API_BASE} />}
          {activeSection === 'errors' && <ErrorsSection c={c} apiBase={API_BASE} />}
        </main>
      </div>
      </div>
    </div>
  );
}

function IntroSection({
  c,
  apiBase,
  onNavigate,
}: SectionProps & { onNavigate: (s: DocsSectionId) => void }) {
  const step0 = c.intro.steps[0];

  return (
    <div className="space-y-10">
      <div>
        <div className="docs-badge mb-4">
          <Zap className="w-3 h-3" /> {c.intro.badge}
        </div>
        <h1 className="docs-h1">{c.intro.title}</h1>
        <p className="text-lg docs-lead leading-relaxed max-w-2xl">
          {c.intro.lead}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {c.intro.features.map((f, i) => {
          const meta = introFeatureIcons[i];
          const Icon = meta.icon;
          return (
            <div key={f.title} className="p-5 docs-card">
              <div className={`w-9 h-9 rounded-lg ${meta.bgClass} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${meta.iconClass}`} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--lp-ink)' }}>{f.title}</h3>
              <p className="text-xs docs-muted-sm">{f.desc}</p>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-sm font-semibold docs-h3 mb-2">{c.labels.baseUrl}</h3>
        <CodeBlock code={apiBase} />
      </div>

      <div>
        <h2 className="docs-h2 mb-5">{c.labels.quickStart}</h2>
        <div className="space-y-4">
          {c.intro.steps.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="docs-step-num shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <h4 className="text-sm font-medium" style={{ color: 'var(--lp-ink)' }}>{s.title}</h4>
                <p className="text-sm docs-muted-sm">
                  {i === 0 && step0.linkText ? (
                    <>
                      {step0.descBefore}
                      <Link href="/dashboard/settings" className="docs-link">
                        {step0.linkText}
                      </Link>
                      {step0.descAfter}
                    </>
                  ) : (
                    s.desc
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="docs-h2">{c.labels.explore}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {c.intro.exploreLinks.map((link, i) => {
            const Icon = exploreIcons[i];
            return (
              <button
                key={exploreSections[i]}
                type="button"
                onClick={() => onNavigate(exploreSections[i])}
                className="docs-card-interactive w-full group"
              >
                <Icon className="w-5 h-5 shrink-0 transition-opacity group-hover:opacity-80" style={{ color: 'var(--lp-muted)' }} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--lp-ink)' }}>{link.label}</h4>
                  <p className="text-xs docs-muted-sm">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 transition-opacity group-hover:opacity-80" style={{ color: 'var(--lp-muted)' }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AuthSection({ c, apiBase }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionHeading title={c.auth.title} description={c.auth.description} />

      <div>
        <h3 className="text-sm font-semibold docs-h3 mb-2">{c.labels.headerFormat}</h3>
        <CodeBlock code="Authorization: Bearer pk_live_YOUR_API_KEY" />
      </div>

      <div>
        <h3 className="text-sm font-semibold docs-h3 mb-2">{c.labels.exampleRequest}</h3>
        <CodeBlock
          code={`curl -X GET "${apiBase}/projects" \\
  -H "Authorization: Bearer pk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
          language="bash"
        />
      </div>

      <div>
        <h2 className="docs-h2">{c.labels.availableScopes}</h2>
        <p className="text-sm docs-muted-sm mb-4">
          {c.labels.scopesIntro}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {c.auth.scopes.map((item) => (
            <div
              key={item.scope}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg docs-card-sm"
            >
              <code className="docs-inline-code shrink-0">
                {item.scope}
              </code>
              <span className="docs-muted-sm text-xs">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <Callout type="warning" title={c.auth.securityTitle}>
        {c.auth.securityText}
      </Callout>
    </div>
  );
}

function ProjectsSection({ c, apiBase }: SectionProps) {
  const ep = c.projects.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.projects.title} description={c.projects.description} />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects"
          description={ep.list.description}
          scope="projects:read"
          labels={c.labels}
          request={`curl "${apiBase}/projects" \\
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
          description={ep.get.description}
          scope="projects:read"
          labels={c.labels}
          request={`curl "${apiBase}/projects/proj_abc123" \\
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
          description={ep.create.description}
          scope="projects:write"
          labels={c.labels}
          params={buildParams(PROJECT_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/projects" \\
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
          description={ep.update.description}
          scope="projects:write"
          labels={c.labels}
          request={`curl -X PATCH "${apiBase}/projects/proj_abc123" \\
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
          description={ep.remove.description}
          scope="projects:write"
          labels={c.labels}
          request={`curl -X DELETE "${apiBase}/projects/proj_abc123" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Project deleted successfully" }`}
        />
      </div>
    </div>
  );
}

function DeploymentsSection({ c, apiBase }: SectionProps) {
  const ep = c.deployments.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.deployments.title} description={c.deployments.description} />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects/:projectId/deployments"
          description={ep.list.description}
          scope="deployments:read"
          labels={c.labels}
          params={buildParams(DEPLOYMENT_LIST_PARAM_DEFS, ep.list.params)}
          request={`curl "${apiBase}/projects/proj_abc123/deployments?limit=10" \\
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
          description={ep.create.description}
          scope="deployments:write"
          labels={c.labels}
          params={buildParams(DEPLOYMENT_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/projects/proj_abc123/deployments" \\
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
          description={ep.cancel.description}
          scope="deployments:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/projects/proj_abc123/deployments/dep_xyz789/cancel" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "dep_xyz789", "status": "cancelled", ... },
  "message": "Deployment cancelled"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/deployments/:deploymentId/redeploy"
          description={ep.redeploy.description}
          scope="deployments:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/projects/proj_abc123/deployments/dep_xyz789/redeploy" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "dep_new002", "status": "pending", "trigger": "redeploy", ... },
  "message": "Redeploy started"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/deployments/:deploymentId/rollback"
          description={ep.rollback.description}
          scope="deployments:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/projects/proj_abc123/deployments/dep_xyz789/rollback" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "dep_new003", "status": "pending", "trigger": "rollback", ... },
  "message": "Rollback started"
}`}
        />

        <EndpointCard
          method="GET"
          path="/projects/:projectId/deployments/:deploymentId/logs"
          description={ep.logs.description}
          scope="deployments:read"
          labels={c.labels}
          params={buildParams(DEPLOYMENT_LOGS_PARAM_DEFS, ep.logs.params)}
          request={`curl "${apiBase}/projects/proj_abc123/deployments/dep_xyz789/logs?type=build" \\
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

function EnvVarsSection({ c, apiBase }: SectionProps) {
  const ep = c.envvars.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.envvars.title} description={c.envvars.description} />

      <Callout type="info" title={c.envvars.sensitiveTitle}>
        {c.envvars.sensitiveText}
      </Callout>

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects/:projectId/env"
          description={ep.list.description}
          scope="envvars:read"
          labels={c.labels}
          request={`curl "${apiBase}/projects/proj_abc123/env" \\
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
          description={ep.create.description}
          scope="envvars:write"
          labels={c.labels}
          params={buildParams(ENVVAR_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/projects/proj_abc123/env" \\
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
          description={ep.bulk.description}
          scope="envvars:write"
          labels={c.labels}
          params={buildParams(ENVVAR_BULK_PARAM_DEFS, ep.bulk.params)}
          request={`curl -X POST "${apiBase}/projects/proj_abc123/env/bulk" \\
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
          description={ep.update.description}
          scope="envvars:write"
          labels={c.labels}
          request={`curl -X PATCH "${apiBase}/projects/proj_abc123/env/env_001" \\
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
          description={ep.remove.description}
          scope="envvars:write"
          labels={c.labels}
          request={`curl -X DELETE "${apiBase}/projects/proj_abc123/env/env_001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Environment variable deleted" }`}
        />
      </div>
    </div>
  );
}

function DomainsSection({ c, apiBase }: SectionProps) {
  const ep = c.domains.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.domains.title} description={c.domains.description} />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects/:projectId/domains"
          description={ep.list.description}
          scope="domains:read"
          labels={c.labels}
          request={`curl "${apiBase}/projects/proj_abc123/domains" \\
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
          description={ep.create.description}
          scope="domains:write"
          labels={c.labels}
          params={buildParams(DOMAIN_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/projects/proj_abc123/domains" \\
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
          description={ep.verify.description}
          scope="domains:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/projects/proj_abc123/domains/dom_003/verify" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "dom_003", "verified": true, "sslStatus": "provisioning" },
  "message": "Domain verified successfully"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/domains/:domainId/primary"
          description={ep.primary.description}
          scope="domains:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/projects/proj_abc123/domains/dom_003/primary" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "dom_003", "isPrimary": true },
  "message": "Primary domain updated"
}`}
        />

        <EndpointCard
          method="DELETE"
          path="/projects/:projectId/domains/:domainId"
          description={ep.remove.description}
          scope="domains:write"
          labels={c.labels}
          request={`curl -X DELETE "${apiBase}/projects/proj_abc123/domains/dom_003" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Domain removed" }`}
        />
      </div>
    </div>
  );
}

function ServersSection({ c, apiBase }: SectionProps) {
  const ep = c.servers.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.servers.title} description={c.servers.description} />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/servers"
          description={ep.list.description}
          scope="servers:read"
          labels={c.labels}
          request={`curl "${apiBase}/servers" \\
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
          description={ep.create.description}
          scope="servers:write"
          labels={c.labels}
          params={buildParams(SERVER_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/servers" \\
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
          description={ep.get.description}
          scope="servers:read"
          labels={c.labels}
          request={`curl "${apiBase}/servers/srv_001" \\
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
          description={ep.start.description}
          scope="servers:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/servers/srv_001/start" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server is starting" }`}
        />

        <EndpointCard
          method="POST"
          path="/servers/:serverId/stop"
          description={ep.stop.description}
          scope="servers:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/servers/srv_001/stop" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server is stopping" }`}
        />

        <EndpointCard
          method="POST"
          path="/servers/:serverId/reboot"
          description={ep.reboot.description}
          scope="servers:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/servers/srv_001/reboot" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server is rebooting" }`}
        />

        <EndpointCard
          method="DELETE"
          path="/servers/:serverId"
          description={ep.remove.description}
          scope="servers:write"
          labels={c.labels}
          request={`curl -X DELETE "${apiBase}/servers/srv_001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server deleted" }`}
        />
      </div>
    </div>
  );
}

function DatabasesSection({ c, apiBase }: SectionProps) {
  const ep = c.databases.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.databases.title} description={c.databases.description} />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/databases"
          description={ep.list.description}
          scope="databases:read"
          labels={c.labels}
          request={`curl "${apiBase}/databases" \\
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
          description={ep.create.description}
          scope="databases:write"
          labels={c.labels}
          params={buildParams(DATABASE_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/databases" \\
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
          description={ep.credentials.description}
          scope="databases:read"
          labels={c.labels}
          request={`curl "${apiBase}/databases/db_001/credentials" \\
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
          description={ep.connect.description}
          scope="databases:write"
          labels={c.labels}
          params={buildParams(DATABASE_CONNECT_PARAM_DEFS, ep.connect.params)}
          request={`curl -X POST "${apiBase}/databases/db_001/connect" \\
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
          description={ep.start.description}
          scope="databases:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/databases/db_001/start" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Database is starting" }`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/stop"
          description={ep.stop.description}
          scope="databases:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/databases/db_001/stop" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Database is stopping" }`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/backups"
          description={ep.backup.description}
          scope="databases:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/databases/db_001/backups" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "bak_001", "status": "creating", "type": "manual", ... },
  "message": "Backup started"
}`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/backups/:backupId/restore"
          description={ep.restore.description}
          scope="databases:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/databases/db_001/backups/bak_001/restore" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "bak_001", "status": "restoring", ... },
  "message": "Restore started"
}`}
        />

        <EndpointCard
          method="DELETE"
          path="/databases/:id"
          description={ep.remove.description}
          scope="databases:write"
          labels={c.labels}
          request={`curl -X DELETE "${apiBase}/databases/db_001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Database deleted" }`}
        />
      </div>
    </div>
  );
}

function WebhooksSection({ c, apiBase }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionHeading title={c.webhooks.title} description={c.webhooks.description} />

      <div>
        <h2 className="docs-h2">{c.webhooks.howItWorks}</h2>
        <div className="space-y-3">
          {c.webhooks.steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3 docs-card-sm">
              <div className="docs-step-num shrink-0">
                {i + 1}
              </div>
              <div>
                <h4 className="text-sm font-medium" style={{ color: 'var(--lp-ink)' }}>{s.title}</h4>
                <p className="text-xs docs-muted-sm mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="docs-h2">{c.webhooks.manualTitle}</h2>
        <p className="text-sm docs-muted-sm mb-3">
          {c.webhooks.manualDesc}
        </p>
        <CodeBlock
          code={`POST ${apiBase}/webhooks/github/:projectId

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
        <h2 className="docs-h2">{c.webhooks.githubTitle}</h2>
        <p className="text-sm docs-muted-sm mb-3">
          {c.webhooks.githubDesc}
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
          curl -X POST "${apiBase}/projects/\${{ secrets.PROJECT_ID }}/deployments" \\
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

      <Callout type="info" title={c.webhooks.secretTitle}>
        {c.webhooks.secretText.split('GET /projects/:id/webhook').map((part, i, arr) =>
          i < arr.length - 1 ? (
            <span key={i}>
              {part}
              <code className="docs-inline-code">GET /projects/:id/webhook</code>
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </Callout>
    </div>
  );
}

function ErrorsSection({ c, apiBase }: SectionProps) {
  return (
    <div className="space-y-8">
      <SectionHeading title={c.errors.title} description={c.errors.description} />

      <div>
        <h2 className="docs-h2">{c.errors.httpStatusTitle}</h2>
        <div className="docs-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3 docs-muted-sm font-medium text-xs">{c.labels.code}</th>
                <th className="text-left px-4 py-3 docs-muted-sm font-medium text-xs">{c.labels.description}</th>
              </tr>
            </thead>
            <tbody>
              {c.errors.statusRows.map((item) => (
                <tr key={item.code} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold text-sm ${statusCodeColors[item.code]}`}>{item.code}</span>
                  </td>
                  <td className="px-4 py-3 docs-muted">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="docs-h2 mb-3">{c.errors.responseFormatTitle}</h2>
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
        <h2 className="docs-h2">{c.errors.commonCodesTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {c.errors.errorCodes.map((item) => (
            <div
              key={item.code}
              className="flex items-start gap-3 px-3.5 py-3 rounded-lg docs-card-sm"
            >
              <code className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono shrink-0">
                {item.code}
              </code>
              <span className="docs-muted-sm text-xs leading-relaxed">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="docs-h2 mb-3">{c.errors.rateLimitsTitle}</h2>
        <p className="text-sm docs-muted-sm mb-4">
          {c.errors.rateLimitsIntro}
        </p>
        <div className="docs-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3 docs-muted-sm font-medium text-xs">{c.labels.plan}</th>
                <th className="text-left px-4 py-3 docs-muted-sm font-medium text-xs">{c.labels.rateLimit}</th>
              </tr>
            </thead>
            <tbody>
              {c.errors.rateLimitRows.map((item) => (
                <tr key={item.plan} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--lp-ink)' }}>{item.plan}</td>
                  <td className="px-4 py-3 docs-muted font-mono text-xs">{item.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs docs-muted-sm mt-3">
          {c.errors.rateLimitFooter}
        </p>
      </div>

      <div>
        <h2 className="docs-h2 mb-3">{c.errors.exampleTitle}</h2>
        <CodeBlock
          code={`async function apiRequest(endpoint, options = {}) {
  const response = await fetch('${apiBase}' + endpoint, {
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
