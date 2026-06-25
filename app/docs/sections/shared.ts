import type { DocsContent, DocsSectionId } from '@/lib/i18n/docs';

export type ParamDef = { type: string; required?: boolean };

export type SectionProps = { c: DocsContent; apiBase: string };

export function buildParams(
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

export const PROJECT_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  name: { type: 'string', required: true },
  gitRepoUrl: { type: 'string' },
  gitBranch: { type: 'string' },
  buildCommand: { type: 'string' },
  startCommand: { type: 'string' },
  port: { type: 'number' },
};

export const DEPLOYMENT_LIST_PARAM_DEFS: Record<string, ParamDef> = {
  limit: { type: 'number' },
  offset: { type: 'number' },
};

export const DEPLOYMENT_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  branch: { type: 'string' },
  commitHash: { type: 'string' },
  commitMessage: { type: 'string' },
};

export const DEPLOYMENT_LOGS_PARAM_DEFS: Record<string, ParamDef> = {
  type: { type: 'string' },
};

export const ENVVAR_LIST_PARAM_DEFS: Record<string, ParamDef> = {
  environment: { type: 'string' },
};

export const ENVVAR_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  key: { type: 'string', required: true },
  value: { type: 'string', required: true },
  isSecret: { type: 'boolean' },
  environment: { type: 'string' },
};

export const ENVVAR_BULK_PARAM_DEFS: Record<string, ParamDef> = {
  variables: { type: 'array', required: true },
};

export const DOMAIN_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  domain: { type: 'string', required: true },
};

export const SERVER_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  name: { type: 'string', required: true },
  provider: { type: 'string', required: true },
  region: { type: 'string', required: true },
  size: { type: 'string', required: true },
};

export const DATABASE_CREATE_PARAM_DEFS: Record<string, ParamDef> = {
  name: { type: 'string', required: true },
  type: { type: 'string', required: true },
  serverId: { type: 'string', required: true },
  description: { type: 'string' },
};

export const DATABASE_CONNECT_PARAM_DEFS: Record<string, ParamDef> = {
  projectId: { type: 'string', required: true },
  envPrefix: { type: 'string' },
};

export const VALID_SECTIONS: DocsSectionId[] = [
  'intro',
  'auth',
  'projects',
  'deployments',
  'envvars',
  'domains',
  'servers',
  'databases',
  'webhooks',
  'errors',
];
