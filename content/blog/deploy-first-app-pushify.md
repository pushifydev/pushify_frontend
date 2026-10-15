---
title: Deploy your first app with Pushify: connect a repo, pick a server, go live with HTTPS
description: A step-by-step guide to your first Pushify deploy: connect a repo, choose your own server or a managed one, and serve it over HTTPS.
date: 2026-10-15
tags: getting-started, deployments, self-hosting, https, guides
---

You've signed up for Pushify and confirmed your email. Now you have an empty dashboard and an app in a Git repository that you want online. This guide covers everything in between: connect the repo, pick a server, deploy, and put the app behind HTTPS on your own domain.

It's written for a first deploy. If something doesn't work, the last section lists the most common problems and how to fix them.

## What you need before you start

- **An app in a Git repository.** It has to be something Pushify can build: either a framework it detects, or a repo with a Dockerfile.
- **A server, or a plan that includes one.** Either a VPS you can reach over SSH, or a paid plan if you'd rather use a managed Hetzner server. Step 2 explains how to choose.
- **A domain, if you want your own.** You don't need one for the first deploy, but you'll need one for HTTPS on your own name at the end.

That's everything. You don't need to prepare the server, write a CI pipeline, or install a deploy agent.

## Step 1: Create a project and connect your repo

Create a project from the dashboard and connect the Git repository you want to deploy.

Once the repo is connected, Pushify watches your production branch. A `git push` to that branch fires a webhook and queues a new deployment, so later deploys don't need any clicks.

### How your app gets built

Pushify builds your app into a Docker image in one of two ways:

- **Framework detection.** If there's no Dockerfile, Pushify detects the stack and builds it for you. Detection covers common stacks, including Next.js, Django, Rails, Go, and static sites.
- **Your own Dockerfile.** If the repo has a Dockerfile, Pushify uses it instead of detection. Use this when you need system packages, a custom build step, or a runtime that detection doesn't handle.

For a first deploy, detection is usually fine. You can add a Dockerfile later without changing anything else in the project. [Deploying Next.js](/blog/deploy-nextjs) walks through an example for one framework.

### Which port your app should listen on

Pushify needs to know which port your container serves on. It decides in this order:

1. A `PORT` environment variable you set yourself.
2. The port configured on the project.
3. If neither is set, `3000`.

If you haven't set `PORT`, Pushify sets it to the port it picked and passes it to the container. So the simplest setup is an app that reads its port from the environment:

```js
const port = process.env.PORT || 3000;
app.listen(port);
```

Most frameworks and app servers already read `PORT`. If yours uses a hardcoded port, either change it to read `PORT` or set the project's port to match.

One exception: for Docker Compose deploys, `PORT` (and similar variables such as `APP_PORT` and `HTTP_PORT`) is set to the public host port, not the container port.

### Environment variables

If your app needs configuration such as a database URL or an API key, add it to the project's environment variables before the first deploy. Values are encrypted at rest. For how to separate build-time and runtime values, and how to keep secrets out of your repo, see [Environment variables and secrets management](/blog/environment-variables-secrets-management).

## Step 2: Pick a server

Every project runs on a server, and you can choose from two kinds.

### Option A: Bring your own server (BYOS)

Use this if you already have a VPS at Hetzner, DigitalOcean, OVH, Linode, or another provider, or if you want to try Pushify without paying. The free tier of the hosted version lets you connect one of your own servers.

To connect it, give Pushify SSH access as root with a password or a private key. Pushify then checks the server:

- If Docker is missing, Pushify installs it with the official convenience script and starts the service. If Docker is already installed, Pushify leaves it alone.
- It does the same for Nginx and Certbot, using `apt-get`, or `yum` on distributions that don't have apt.

A fresh VPS needs nothing beyond SSH access. Pushify talks to the server over plain SSH, so there's no agent daemon to install or keep updated.

Check one thing on the provider side: ports 80 and 443 have to be open to the internet. Nginx serves your app on them, and Let's Encrypt uses port 80 to issue your certificate in step 4. If your provider has a cloud firewall, allow both ports before you deploy.

### Option B: A managed Hetzner server

Use this if you don't have a server and don't want to open a cloud account. Pushify provisions managed servers for you. They come with the paid plans, which start at $15/month. Each server has a fixed hourly rate paid from prepaid credits, and the dashboard shows the monthly estimate before you create it.

Because provisioning is done for you, you skip the provider account, creating the machine, and setting up SSH.

### Which one?

If you already have a VPS, or you just want to try things out, start with BYOS on the free tier. If you're starting from nothing and want the fewest steps, go managed. Both use the same deploy pipeline, so you can switch later. [BYOS vs managed](/blog/byos-vs-managed-servers) compares them in more detail.

## Step 3: Deploy

With a repo and a server connected, start the first deployment. Here's what happens:

1. Pushify connects to the server over SSH and builds the Docker image there, using detection or your Dockerfile.
2. The new container starts.
3. The container has to pass a health check before it gets any traffic.
4. Nginx switches traffic to it with a graceful reload.

If the build fails, nothing that was already running is affected. On the first deploy nothing is running yet, so a failed build just means you fix the error and deploy again.

### Where your app is reachable before you add a domain

This depends on the server:

- **On your own server (BYOS)**, you don't get an automatic subdomain. Until you add a custom domain, the app is served over plain HTTP at `http://<server-ip>:<port>`. That's fine for checking that the deploy worked. If it doesn't load, make sure your provider's firewall allows that port. For HTTPS, go on to step 4.
- **On Pushify's managed shared host**, a project without a domain gets a free subdomain in the form `<slug>.pushify.dev`, served over HTTPS with Pushify's wildcard certificate.

### Every deploy after this one

From now on, a `git push` to your production branch is the deploy. Each later deploy also starts the new container next to the old one, and the old one keeps serving traffic until the new one passes its health check. If the new version never becomes healthy, your users keep getting the old one. A rollback runs the same steps with the previous image. [From git push to live](/blog/how-zero-downtime-deploys-work) goes through each step.

## Step 4: Add your domain and go live with HTTPS

Using your own domain takes two steps: create a DNS record, then add the domain to the project.

1. At your DNS provider, create an `A` record that points your domain to the server's public IPv4 address. If you want both `www` and the apex domain, create both records.
2. In Pushify, add the custom domain to the project.

Pushify then gets a free Let's Encrypt certificate with Certbot and configures Nginx to use it. Once the certificate is in place, plain HTTP requests get a `301` redirect to `https://`, both for the domain and for its `www` or apex alias.

### Why DNS has to be right first

Before it requests a certificate, Pushify checks that the domain's `A` record resolves to the server's public IPv4 address. If it doesn't, Pushify skips SSL for that domain and logs a line like this:

```
your-domain.com does not point to this server yet (A record → <ip>) — SSL skipped
```

The usual cause is that DNS hasn't propagated yet or the record points at the wrong IP. You can check what your domain resolves to from your own machine:

```bash
dig +short your-domain.com
```

Wait until that command returns your server's IP before you expect a certificate.

### If you use Cloudflare

Keep the record set to **DNS only** (grey cloud) until HTTPS works on the server. Pushify validates certificates over HTTP on port 80. A proxied record resolves to Cloudflare's IPs instead of your server's, so the DNS check above fails. Once the certificate is issued, you can turn on the proxy with the SSL mode set to **Full (strict)**. [Cloudflare proxy for a self-hosted app](/blog/cloudflare-proxy-self-hosted-app) covers the setup and the redirect loop that **Flexible** mode causes.

## When the first deploy doesn't work

These are the most common problems:

- **The server won't connect.** Check that you can SSH in as root yourself with the same credentials, and that the provider's firewall allows SSH from outside.
- **The build fails.** Read the build output from the top, not the bottom, because the first error is usually the real one. If detection picked the wrong stack or missed a build step, add a Dockerfile.
- **The build succeeds but the deploy never goes live.** The container didn't pass the health check. Usually the app crashed on startup, often because an environment variable is missing, or it isn't listening on `PORT`. Check that the app reads `process.env.PORT` (or its framework's equivalent), or that the project's port matches the port your app uses.
- **The site loads over HTTP but not HTTPS.** Look for the `SSL skipped` line in the logs, and check the `A` record and the Cloudflare proxy setting. On your own server, HTTPS requires a custom domain.
- **The browser says ERR_TOO_MANY_REDIRECTS.** You're behind Cloudflare in **Flexible** mode. Switch to **Full (strict)**.

## Where to go next

Once your first app is live, these posts cover what usually comes next:

- [PR preview deployments](/blog/pr-preview-deployments): a separate URL for every pull request, on the paid plans.
- [Backup alerts for Docker volumes](/blog/docker-volume-backup-alerts): for apps that store data on the server.
- [A minimal VPS deployment with Pushify](/blog/minimal-vps-deployment-pushify): how to get the most out of a small server.

If a step in this guide didn't match what you saw in the dashboard, [open an issue](https://github.com/pushifydev/pushify_backend/issues). We're a small team, and we act fastest on feedback about first deploys.
