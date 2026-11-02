---
title: How to deploy and manage one-click apps from the Pushify marketplace
description: Deploy one-click apps from the Pushify marketplace and keep them healthy: servers, domains and HTTPS, environment variables, backups, and updates.
date: 2026-11-02
tags: marketplace, one-click-apps, self-hosting, docker, guides
---

The Pushify marketplace lets you deploy one-click apps. These are packaged versions of existing software, so you don't have to put together the image, the configuration, and the database container yourself. The deploy is quick. Most of the work comes later: keeping the app's data safe, keeping its credentials private, making sure only the right people can reach its ports, and controlling which version it runs. This guide covers the deploy and that ongoing work. It also points out where marketplace apps behave differently from projects you deploy from a repository.

To deploy your own code from a repository, start with [Deploy your first app on Pushify](/blog/deploy-first-app-pushify). That's the main workflow on Pushify. The marketplace is for software you want to run, not build.

## What a one-click app is, and what it isn't

A one-click app is software that someone has already packaged for deployment. A template defines the image, the default configuration, and any supporting containers, so you don't have to read a project's install docs and write a compose file from scratch.

The click doesn't change who runs the software. Once you deploy an app, it runs on your server. It has its own release cycle, its own security advisories, and its own idea of where it keeps data. A one-click install makes setup shorter, but you still own and run the app. The rest of this guide follows from that.

## Before you deploy: pick the server

A marketplace app runs on a server that's already connected to your organization, just like any other project on Pushify. You have the same two options:

- **Bring your own server.** Any VPS Pushify can reach over SSH. Pushify connects as root with a password or a private key, checks for Docker, Nginx, and Certbot, and installs whichever ones are missing. If Docker is already installed, Pushify leaves that install alone.
- **A managed Hetzner server.** Pushify provisions it for you on the paid plans, at a fixed hourly rate you see before you create it.

[BYOS vs managed](/blog/byos-vs-managed-servers) covers that choice in detail. For marketplace apps, ask one more question: what else will share the machine? One-click apps often end up running next to your own apps, and some off-the-shelf software uses far more memory or disk than its description suggests. Before you add one to an existing server, check how much room is left:

```bash
free -h
df -h
docker stats --no-stream
```

If the server is already short on memory, a new app can push it into swap or get processes killed by the kernel's out-of-memory killer. That can take your other apps down too. When that's a risk, a separate small server is often the cheaper fix.

## What happens when you deploy

Deploying a marketplace app creates a normal Pushify project on the server you picked. The deployment worker connects to that server over SSH, the same way it does for repo-based deploys. After that, there are two kinds of template:

- **Single-container apps.** Pushify runs `docker pull` and then starts the app with `docker run --restart unless-stopped`. If the template needs a database, Pushify also starts a separate Postgres or MySQL container next to it.
- **Multi-container apps.** Larger apps such as Supabase, Appwrite, and Cal.com come with a Docker Compose file. Pushify runs `docker compose pull` and then `docker compose up -d`, with the stack named `pushify-<slug>`.

When the deploy finishes, the dashboard takes you to the new project's page. You can also get there from the Installed Apps panel. Because it's a regular project, it has the same tabs as your other projects.

It's worth knowing which kind of app you have, because the two kinds handle domains and data differently, as the sections below explain. To check from the server:

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
docker compose ls
```

Multi-container apps appear in `docker compose ls` as `pushify-<slug>`. If a container keeps showing `Restarting`, a setting is usually missing or wrong, and `docker logs <container>` normally tells you which one.

Before the app is reachable from the internet, find out two things:

1. **Default credentials.** Many packaged apps ship with a default admin user or password, or create one the first time they start. Know which applies to yours.
2. **What actually needs a public address.** A web interface usually does. A database used only by the app it was installed with usually doesn't.

## Managing the app after it's live

### Domains and HTTPS

How you set up domains depends on the kind of app.

**Single-container apps** handle domains the same way repo-based projects do. After the deploy, add the domain through the project's normal domain settings. Pushify writes the Nginx config and requests a Certbot certificate using the same logic it uses for repo deploys. Until you add a domain, an app on your own server is served at `http://<server-ip>:<port>`. Point a DNS record at the server, add the domain to the project, and send people to that instead of a raw port.

**Multi-container apps** don't get an Nginx site or a certificate from Pushify. The app is served at `http://<server-ip>:<port>` on a port between 5000 and 5999, and Pushify opens that port in the server's firewall. All traffic to it, including logins to the app's admin dashboard, is plain HTTP. Decide early who needs to reach it. If the answer is only you and your team, restrict the port to trusted addresses with your provider's firewall, or reach it over an SSH tunnel or a private network as described in [Admin panel security and network isolation](/blog/admin-panel-security-network-isolation).

If you put a single-container app's domain behind Cloudflare's proxy, [Putting a self-hosted app behind Cloudflare](/blog/cloudflare-proxy-self-hosted-app) covers the settings that tend to trip people up.

### Environment variables and credentials

Change any default credentials first, before anything else. A packaged app with a well-known default password and a public login page is easy to find and easy to break into.

The app's configuration lives on the project's **Environment** tab, the same tab your repo-based projects use. Marketplace projects have no special restrictions there. You can edit a value inline, delete or add variables, paste a `.env` file to add many at once, and clone variables between environments. Some apps add help text. For example, Supabase projects show a note on that tab about turning on Google or GitHub login with variables such as `GOOGLE_ENABLED`, `GOOGLE_CLIENT_ID`, and `GOOGLE_SECRET`.

After you change variables, **redeploy** the project so the app picks up the new values. You don't need to SSH in and edit files by hand. Before you redeploy, read the updates section below, because a redeploy can also change the app's version.

Treat database passwords, API keys, and SMTP credentials like any other secret. Don't paste them into notes or chat messages. [Managing environment variables and secrets](/blog/environment-variables-secrets-management) covers the habits that matter here, like keeping separate values per environment and rotating credentials after someone leaves the team.

### Data and backups

This is where off-the-shelf apps catch people out. Everything a one-click app stores lives on the server it runs on, and where exactly depends on the kind of app:

- **Single-container apps** use bind mounts, not named volumes. Each mounted path maps to a directory under `data/` inside the project's directory on the server. A bundled database is kept in `data/db` in the same place.
- **Multi-container apps** use named Docker volumes declared in their compose files, such as `supabase-db`, `supabase-storage`, `appwrite-uploads`, `appwrite-mariadb`, and `calcom-db`, scoped to the compose project.

To see exactly which host directory or volume each container uses:

```bash
docker volume ls
docker inspect --format '{{.Name}}: {{range .Mounts}}{{.Type}} {{.Source}} -> {{.Destination}}; {{end}}' $(docker ps -q)
```

Bind mounts show up with type `bind` and a host path. Named volumes show up with type `volume`.

Back up those directories and volumes on a schedule, keep a copy off the server, and set up an alert for failed backups. [Backing up Docker volumes with alerts](/blog/docker-volume-backup-alerts) shows one way to do it. The same approach works for a bind-mounted directory, since it's an ordinary path on the host. Then restore a backup somewhere else at least once. Until you've done that, you don't really know your backups work.

For databases, copying files while the database is running can give you an inconsistent backup. Use the database's own dump tool inside its container, or stop the container briefly while you copy.

### Know which ports are open

Before you open any ports deliberately, take stock of what's already exposed. A single-container app without a domain is served on a port of its own. A multi-container app has its 5000-5999 port opened in the firewall. Check what the server is actually listening on:

```bash
sudo ss -tlnp
```

Anything bound to `0.0.0.0` or `[::]` that isn't SSH, HTTP, HTTPS, or a port you've decided an app needs should be investigated. Ports published by Docker get around ufw, because Docker writes its own iptables rules, and those are evaluated first. A firewall at your provider is the reliable backstop. [Admin panel security and network isolation](/blog/admin-panel-security-network-isolation) explains the problem and the fixes in detail. That post is about the Pushify control plane, but the same approach works for any admin screen a one-click app adds.

### Updates

There's no version picker for marketplace apps. You can't choose which release to install or upgrade to. Here's how versions work:

- The image comes from the app's template, which is part of Pushify's code.
- Each redeploy rebuilds the app's configuration from the current template, not from a copy saved when you installed it. Each deploy also pulls images again.
- Templates that use a floating tag can pick up a newer image when you redeploy. Several use `:latest` (n8n, Gitea, and Vaultwarden, for example). Others float within a major version, such as `ghost:5-alpine` and `redis:7-alpine`.
- Templates with a pinned tag, such as Meilisearch, Hasura, Typesense, WordPress, and the Supabase service images, stay on that version until Pushify updates the template.

In practice, this means a redeploy you do for an unrelated reason, like changing an environment variable, can also upgrade an app that tracks `:latest`. Plan around that:

- **Back up before every redeploy, not only before upgrades.** A new version may change its data format when it starts. If that goes wrong, a recent backup is the only clean way back.
- **Check which image you're actually running.** `docker ps` shows the image and tag for each container. For a floating tag, compare the app's own version page or logs before and after a redeploy.
- **Watch the project's releases.** Most projects publish release notes or security advisories. Subscribe to them for every app you run, and read them before you redeploy an app that tracks `:latest`, especially for databases, which can need a migration step between major versions.

The host underneath also needs patching. [Automatic security updates on a self-hosted server](/blog/automatic-security-updates-self-hosted-server) explains what to patch automatically and what to schedule yourself, including Docker, which stops running containers when it's upgraded. Single-container marketplace apps are started with `--restart unless-stopped`, so they come back up when the daemon restarts.

## One-click app or your own repo?

The marketplace and repo-based deploys solve different problems. Some rules of thumb:

- **Use a one-click app** for off-the-shelf software you configure but don't change, when the packaged defaults are close to what you want.
- **Deploy from a repo** when you change the code, need a custom build or your own Dockerfile, want to control exactly which version runs, or want [preview deployments for pull requests](/blog/pr-preview-deployments).
- **Moving something you already run elsewhere?** Read [Migrating applications to Pushify](/blog/migrating-applications-to-pushify) before you reinstall it from scratch. Your existing data has to come along too.

The two work fine side by side. A common setup is your own app deployed from its repo, plus one or two marketplace apps it depends on, all on the same server.

## The short version

- A one-click app installs quickly, but you still run it, so its data, credentials, and upgrades are your responsibility.
- Every marketplace app runs as a normal Pushify project on a server connected to your organization, either as a single container or as a Docker Compose stack named `pushify-<slug>`.
- Single-container apps get Nginx and HTTPS when you add a domain through the project's domain settings. Multi-container apps are served over plain HTTP on a port in the 5000-5999 range, so restrict who can reach it.
- Change default credentials right away. Edit settings on the Environment tab, then redeploy.
- Back up the bind-mounted `data/` directory or the named volumes, keep a copy off the server, and test a restore.
- A redeploy uses the current template and pulls images again, so apps on floating tags can be upgraded. Take a backup first.

If you run into something rough in the marketplace, or there's software you'd like to see packaged, [open an issue](https://github.com/pushifydev/pushify_backend/issues). We're a small team, so that feedback shapes the roadmap quickly.
