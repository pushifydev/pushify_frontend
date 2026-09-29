---
title: Teams & SSO
description: Roles, invitations, project access, single sign-on and API keys.
updated: 2026-09-30
---

## Roles

| Role | Can |
|---|---|
| Owner | Everything, including billing, single sign-on and deleting the organization. There is one owner. |
| Admin | Billing, members and invitations, servers and databases, and everything members can do |
| Member | Create and change projects, domains and environment variables, and deploy |
| Viewer | See projects and their status |

The owner's role cannot be changed.

## Invitations

Owners and admins invite people by email as admin, member or viewer. An invitation is valid for 7 days. Pending invitations count towards your plan's team size: 1 on Free, 2 on Hobby, 5 on Pro, 15 on Business.

## Limit access to projects

A member or viewer can be limited to chosen projects; other projects are hidden from them. Access to the database browser is set separately per member: none, read or write.

## Single sign-on

Sign in through your identity provider over OIDC — Okta, Microsoft Entra ID, Google Workspace, Auth0, Keycloak and others. SAML is not supported.

- The owner sets it up in **Settings → Single sign-on** and claims the organization's email domains.
- New people who sign in this way join as members (or admins, if you choose).
- **Require SSO** turns off password sign-in for those domains.

## API keys

Create keys in **Settings → API keys** for scripts and CI. A key starts with `pk_live_`, can expire, and can be limited to scopes:

`projects:read`, `projects:write`, `projects:delete`, `deployments:read`, `deployments:write`, `deployments:cancel`, `envvars:read`, `envvars:write`, `domains:read`, `domains:write`, `servers:read`, `servers:write`, `databases:read`, `databases:write`, `logs:read`, `metrics:read`.

Requests with a key are limited per minute by plan: 60 on Free, 120 on Hobby, 300 on Pro, 600 on Business. The [API reference](/docs/api) has the endpoints.
