---
title: Teams & SSO
description: Roles, invitations, project access, single sign-on and API keys.
updated: 2026-09-30
---

## Roles

| What | Owner | Admin | Member | Viewer |
|---|:-:|:-:|:-:|:-:|
| See projects, deployments, domains, server status, metrics and logs | ✓ | ✓ | ✓ | ✓ |
| See environment variable names | ✓ | ✓ | ✓ | ✓ |
| See environment variable values (secrets stay masked) | ✓ | ✓ | ✓ | — |
| Create projects and change their settings | ✓ | ✓ | ✓ | — |
| Deploy, roll back, cancel and promote | ✓ | ✓ | ✓ | — |
| Manage environment variables, domains, workers, volumes, scheduled tasks, notifications and health checks | ✓ | ✓ | ✓ | — |
| Delete projects | ✓ | ✓ | — | — |
| Add, resize, start, stop and delete servers; snapshots | ✓ | ✓ | — | — |
| Server SSH key, web terminal and container shell | ✓ | ✓ | — | — |
| Create and delete databases; connection details; take, download and restore backups | ✓ | ✓ | — | — |
| Browse database data | ✓ | ✓ | if granted | if granted |
| Buy and transfer domains, edit their DNS, get transfer codes | ✓ | ✓ | — | — |
| Invite and remove people, set project and data access | ✓ | ✓ | — | — |
| Activity log | ✓ | ✓ | — | — |
| Change the plan, top up the balance, see invoices | ✓ | ✓ | — | — |
| Billing email, single sign-on, delete the organization | ✓ | — | — | — |

There is one owner, and the owner's role cannot be changed. Logs are visible to every role; secrets in build and app output are masked.

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

Create keys in **Settings → API keys** for scripts and CI. A key acts with the role of the person who created it, and stops working when they leave the organization. It starts with `pk_live_`, can expire, and can be limited to scopes:

`projects:read`, `projects:write`, `projects:delete`, `deployments:read`, `deployments:write`, `deployments:cancel`, `envvars:read`, `envvars:write`, `domains:read`, `domains:write`, `servers:read`, `servers:write`, `databases:read`, `databases:write`, `logs:read`, `metrics:read`.

Keys are managed from the dashboard only: a key cannot create keys, and cannot manage people, single sign-on or registry credentials. Requests with a key are limited per minute by plan: 60 on Free, 120 on Hobby, 300 on Pro, 600 on Business. The [API reference](/docs/api) has the endpoints.
