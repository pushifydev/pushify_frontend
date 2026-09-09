---
title: Pushify is now open source
description: The full platform — API server, dashboard, and CLI — is now MIT-licensed and on GitHub. Here's what's in the repos, how to self-host it, and why we opened it up.
date: 2026-09-09
author: Aziz Kurt
tags: announcement, open source, self-hosting
---

Today the entire Pushify platform is open source under the MIT license. The API server, the dashboard, and the CLI are all on [GitHub](https://github.com/pushifydev) — the same code that runs [pushify.dev](https://pushify.dev).

## What Pushify is

Pushify is a deployment platform for people who want to run applications on **their own servers** without doing DevOps by hand. You connect a GitHub repository, point Pushify at a VPS — one you already have, or one provisioned through the platform — and every `git push` builds your app in Docker and puts it live behind HTTPS with a zero-downtime cutover.

Around that core there's a lot of platform: managed PostgreSQL, MySQL, Redis, and MongoDB with scheduled backups and a web studio; PR preview deployments; cron jobs; persistent volumes; worker processes; log search; health checks; a marketplace of one-click apps like Grafana, n8n, and WordPress; and a CLI.

## What's in the repos

- [pushify_backend](https://github.com/pushifydev/pushify_backend) — the API server. Hono + Drizzle ORM on PostgreSQL, BullMQ on Redis for job queues. Everything that touches your servers goes over SSH — there's no agent daemon to install or keep updated on your machines.
- [pushify_frontend](https://github.com/pushifydev/pushify_frontend) — the dashboard and this website. Next.js 15, TailwindCSS v4.
- [pushify_cli](https://github.com/pushifydev/pushify_cli) — the CLI, published on npm as `pushify-cli`. Device-flow login, then `pushify deploy` from any project directory.

## Self-host it in one command

The whole control plane — dashboard, API, worker, PostgreSQL, Redis — runs on your own hardware with one command:

```bash
curl -fsSL https://raw.githubusercontent.com/pushifydev/pushify_backend/master/selfhost/install.sh | bash
```

It's Docker Compose under the hood, and the [self-hosting guide](https://github.com/pushifydev/pushify_backend/blob/master/docs/SELF_HOSTING.md) covers configuration, upgrades, and how the pieces fit together. The control plane deploys applications to servers you attach over SSH — which can be the same machine or any other VPS.

## Why open source

Three honest reasons.

First, trust. A platform that holds SSH access to your servers should be inspectable. "Read the code" is a better answer than "trust us" — for security researchers, for teams with compliance requirements, and for anyone who's been burned by a platform pivoting or shutting down.

Second, no lock-in has to mean no lock-in. If Pushify the company disappeared tomorrow, your deployment platform shouldn't. Self-hosting the control plane makes that promise real instead of rhetorical.

Third, the products in this space that we respect — the ones with real communities — are open. We'd rather compete on execution than on secrecy.

## The hosted version

If you don't want to run the control plane yourself, the hosted version at [pushify.dev](https://pushify.dev) is the same code with the ops handled for you. The free tier lets you **connect one of your own servers** — so you can deploy real apps without paying anything. Paid plans start at $15/month and add managed Hetzner servers at flat monthly prices, more projects, and previews.

## What's next

Pushify is in beta and built by a very small team, which means feedback moves the roadmap quickly. If you try it — hosted or self-hosted — and something breaks or feels wrong, [open an issue](https://github.com/pushifydev/pushify_backend/issues). If you read the code and see something you'd do differently, we genuinely want the pull request.

And if the project is useful to you, a star on [GitHub](https://github.com/pushifydev/pushify_backend) helps more than you'd think.
