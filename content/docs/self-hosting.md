---
title: Self-hosting
description: Run the whole platform — dashboard, API, worker, Postgres and Redis — on your own machine.
updated: 2026-09-30
---

Pushify is MIT licensed. The same software that runs pushify.dev installs with one command.

## Requirements

- A Linux server with 2 GB RAM (4 GB recommended), or macOS to try it out.
- Docker Engine 24+ with the Compose v2 plugin.
- `git`, `curl` and `openssl`.
- `rclone`, only if you want backups off the machine.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/pushifydev/pushify_backend/master/selfhost/install.sh | bash
```

When it finishes, open `http://<your-server>:3000` and create your account. The installer clones the dashboard and the API, generates the secrets (`JWT_SECRET`, `ENCRYPTION_KEY`, the database password) and starts the stack: dashboard on port 3000, API on 4000, a worker, Postgres 16 and Redis 7.

## How deploys work

Apps deploy to servers you attach over SSH, the same as on pushify.dev. The control plane does not deploy onto the machine it runs on.

## Configuration

Everything is set in `.env`. The settings that turn features on:

| Setting | Turns on |
|---|---|
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Email (verification, alerts, invitations) |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_APP_*` | GitHub sign-in and repository access |
| `HETZNER_API_TOKEN` | Managed servers. Your own servers work without it |
| `ANTHROPIC_API_KEY` | The dashboard assistant |
| `DB_BACKUP_RCLONE_REMOTE` | Database backups copied off the server |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Paid plans and the prepaid balance |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` | Automatic subdomains for apps and previews |
| `REGISTRAR_PROVIDER`, `NAMECOM_USERNAME`, `NAMECOM_TOKEN` | Buying domains |
| `ABUSE_DETECTION_ENABLED` | Acceptable Use checks of deploys and traffic, with a review queue in the admin panel. Off by default: what your users may run is your policy. `ABUSE_AUTO_SUSPEND` (also off) lets a strong finding suspend a project on its own. Rules: `config/abuse-rules.yaml` |

The dashboard's API address is built into it, so rebuild the frontend after changing `PUSHIFY_API_URL`. Behind your own HTTPS proxy, set `PUSHIFY_FRONTEND_URL`, `PUSHIFY_API_URL` and `TRUSTED_PROXY_HOPS=1`.

## Backups of the control plane

`scripts/backup-control-plane.sh` dumps the platform's own database. Run it nightly from cron; it keeps 14 days locally and, with `BACKUP_RCLONE_REMOTE`, copies each dump off the machine. `BACKUP_HEARTBEAT_URL` is pinged on success and on failure, so a backup that stops running gets noticed.

Keep `.env` safe as well: secrets in the database are encrypted with its `ENCRYPTION_KEY`, and a restore without it cannot read them.

## Updating

Run the installer again, or pull both repositories and rebuild:

```bash
git -C pushify_backend pull && git -C pushify_frontend pull && docker compose up -d --build
```

Migrations run on start. The full guide is [SELF_HOSTING.md](https://github.com/pushifydev/pushify_backend/blob/master/docs/SELF_HOSTING.md).
