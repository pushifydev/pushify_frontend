---
title: How to deploy Next.js with Pushify, on your own server or a managed one
description: Deploy Next.js to your own VPS or a managed Hetzner server with Pushify: build settings, env vars, database, domain, HTTPS, and common fixes.
date: 2026-10-07
tags: nextjs, deployments, docker, self-hosting, guides
---

This guide shows how to deploy Next.js with Pushify, starting from an empty server and ending with a live app on your own domain with HTTPS. It covers both server options: a VPS you already have (bring your own server, or BYOS) and a managed Hetzner server provisioned through Pushify. The steps are the same for both. You connect the repo, pick the server, set your environment variables, and push.

We'll also cover the parts that usually cause trouble when Next.js runs in a container: build-time vs runtime variables, standalone output, ports, databases and migrations, and the errors you're most likely to see on a first deploy.

## What you need

- A Next.js app in a Git repository.
- A Pushify account, either on the hosted version at [pushify.dev](https://pushify.dev) or on your own [self-hosted install](/blog/pushify-is-now-open-source).
- A server. The free tier lets you connect one of your own servers. Managed Hetzner servers come with the paid plans, which start at $15/month.
- A domain name, if you don't want to stay on an auto-generated `*.pushify.dev` subdomain.

If you're not sure which kind of server to use, [BYOS vs managed](/blog/byos-vs-managed-servers) goes through the trade-offs. The deploy pipeline is the same for both.

## Step 1: Connect a server

### Bring your own server

Pushify connects to your server over SSH as root, using a password or a private key. You don't need to install anything first. When you connect the server, Pushify checks for Docker, Nginx, and Certbot and installs whichever ones are missing. If Docker is already installed, Pushify leaves that install alone. There's no agent daemon on the machine.

One thing to know for Next.js: the build runs on the target server. `next build` can use a lot of memory, so on a very small VPS the build may fail when the machine runs out. A bigger server or a swap file usually fixes that.

### Managed Hetzner server

On a paid plan you can create a managed server from the dashboard. It has a fixed hourly rate paid from prepaid credits, and the dashboard shows the monthly estimate before you create it. You don't need a Hetzner account, and you don't set anything up on the machine.

## Step 2: Choose how the app is built

Pushify builds your app into a Docker image on the server, in one of two ways:

1. **Framework detection.** If your `package.json` has a `next` dependency, Pushify treats the repo as a Next.js app. You don't need a Dockerfile.
2. **Your own Dockerfile.** If the repo has a Dockerfile, it takes priority over detection.

### Option A: let Pushify detect Next.js

For a Next.js repo, detection uses `npm run build` to build and `npm start` to start, with `.next` as the output directory. Dependencies are installed with npm. You can override the build and start commands in the dashboard or in a `pushify.yaml` file in the repo.

You don't need `output: 'standalone'`, but it's worth turning on. Pushify reads your `next.config` and builds a different final image depending on that setting:

- **With standalone output**, the image gets `.next/standalone` and `.next/static` and runs `node server.js`. The image is much smaller.
- **Without it**, the image gets `.next`, `node_modules`, `public`, and `package.json` and runs `npm start`.

In both cases the container is started with `HOSTNAME=0.0.0.0` and `PORT` set, so the Next.js server listens where Nginx expects it.

One catch: with standalone output the container always runs `node server.js`, so a custom start command only applies when standalone is off. If you need to run something before the server starts, such as migrations, see the database section below.

Turning on standalone output looks like this:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
```

### Option B: bring your own Dockerfile

Use your own Dockerfile if detection doesn't fit your setup: a monorepo, pnpm or Yarn, a custom server, or extra system packages. Here's one for standalone output:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public, build-time values only. Never declare a secret here.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

The lines that matter most:

- `HOSTNAME=0.0.0.0` makes the standalone server listen on all interfaces. If it listens only on localhost inside the container, nothing outside can reach it.
- The standalone bundle doesn't include `public` or `.next/static`. If you don't copy them yourself, pages load without CSS, JavaScript chunks, or images.
- `ENV PORT=3000` is only a fallback for running the image locally. On a deploy, Pushify passes the real port to the container.
- The `ARG` line is the only way a dashboard variable reaches the build. Step 4 explains why.

If you use pnpm or Yarn, change the lockfile and install command in the `deps` stage. Add a `.dockerignore` so local files don't end up in the image:

```
.git
node_modules
.next
.env
.env.*
!.env.example
```

### Which port the app listens on

The default container port is 3000. You can change it per project, and `pushify.yaml` can override it too. If you set a `PORT` environment variable on the project, it takes priority. If you don't, Pushify sets `PORT` to the container port. Next.js reads `PORT`, so normally you don't have to do anything.

Pushify doesn't read the port from an `EXPOSE` line in your Dockerfile. If your app listens on a port other than 3000, change it in the project settings or set `PORT`. Changing `EXPOSE` won't do it.

## Step 3: Connect the repository and create the project

In the dashboard, create a project, connect your Git repository, choose the production branch, and select the server from step 1.

After that, every `git push` to the production branch fires a webhook and queues a deployment. You don't need a CI job to trigger deploys.

## Step 4: Set environment variables

Next.js has two kinds of environment variables, and they reach the app at different times.

- **`NEXT_PUBLIC_` variables** are inlined into the client bundle during `next build`. They end up in JavaScript that every visitor downloads, so they're public, and they have to be available at build time.
- **Everything else** is read by server code (route handlers, server components, server actions) while the app runs. These should arrive at runtime, and all of your secrets belong here.

You set variables per project in the dashboard. During a deploy:

- **At build time**, Pushify passes every variable to `docker build` as a `--build-arg`. Docker only gives a build arg to a Dockerfile that declares it with `ARG`, so the build sees only the variables your Dockerfile declares.
- **At runtime**, the same variables are injected into the container when it starts.

That leads to one rule for your own Dockerfile: **declare an `ARG` for each `NEXT_PUBLIC_` variable, and never for a secret.** A secret declared as `ARG` is used by the build and can end up in the image's metadata or layers.

A typical set of variables:

```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_URL=https://example.com
AUTH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
```

Only the first two need an `ARG` line. The other two are read with `process.env` on the server when the app starts.

Variable values are encrypted at rest, and changes take effect on the next deploy. A changed `NEXT_PUBLIC_` value only reaches the browser after a rebuild, because it's compiled into the JavaScript. A redeploy runs that rebuild.

[Environment variables and secrets in deployed apps](/blog/environment-variables-secrets-management) covers this in more depth, including validating variables at boot so a missing one fails the deploy instead of a request at 2 a.m.

## Step 5: Add a database

Most Next.js apps need a database. Pushify can run one for you, or you can bring your own.

### A Pushify database

Pushify can run PostgreSQL (version 16 by default) as a container on a server you choose. MySQL, Redis, and MongoDB are also supported. The database joins Pushify's Docker network and is published only on `127.0.0.1` unless you turn on external access.

When you connect the database to your project, Pushify injects its connection URL into the app's environment at deploy time as `DATABASE_URL`, or under another name if you choose one. A read-only connection is also available.

- **Same server:** the URL uses the internal address, in the form `postgresql://user:pass@pushify-db-<name>:5432/<db>`. Traffic stays on the server, and the database doesn't need to be reachable from outside.
- **Different servers:** Pushify uses the public URL, which only works if external access is on. External access publishes the port on all interfaces, so restrict it with a firewall to the hosts that need it.

If you set a variable with the same name yourself, your value wins. That's useful when you want a different database, and it's also a common reason an app connects to the wrong one.

### Other options

- **A hosted database** from a provider you already use. Put its URL in `DATABASE_URL` in the project's variables.
- **The marketplace PostgreSQL app.** There's a one-click PostgreSQL template, but it isn't connected to your project automatically. You set `DATABASE_URL` yourself.

Wherever the database runs, use a strong password, don't expose its port if your app is the only client, and set up backups before you have data you'd hate to lose.

### Running migrations

If you use Prisma, Drizzle, or another migration tool, migrations have to run before new code depends on the new schema. A simple approach is to run them when the container starts.

With your own Dockerfile and standalone output, copy the `prisma` folder and the Prisma CLI into the run stage, then change the start command:

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

With framework detection, this only works when standalone output is off, because the standalone runner always runs `node server.js`. With standalone off, set the start command in the dashboard or `pushify.yaml` to something like this, assuming the Prisma CLI is in your dependencies:

```bash
npx prisma migrate deploy && npm start
```

Zero-downtime deploys add one more thing to plan for. The new container starts **alongside** the old one, and the old one keeps serving until the new one passes its health check. So for a short window, old code runs against the new schema. Write migrations the previous version can handle: add a column before any code uses it, and drop old columns in a later deploy. [From git push to live](/blog/how-zero-downtime-deploys-work) explains the cutover in detail.

## Step 6: Add your domain and HTTPS

Pushify puts Nginx in front of your app and uses Certbot for TLS certificates. Both are installed on the server when you connect it.

1. With your DNS provider, add an **A record** pointing the domain to the server's IPv4 address.
2. Check that it resolves with `dig +short example.com`. The output should be your server's IP.
3. Add the domain to the project in Pushify, then verify it.

During verification, Pushify looks up the domain's A record and checks that it matches the server. If it doesn't, you'll see an error like:

```
DNS not configured. Please add an A record pointing example.com to <server IP>
```

Once DNS matches, Pushify rewrites the Nginx config for the domain and requests a Let's Encrypt certificate through Certbot automatically. The www or apex counterpart goes on the same certificate. Adding the domain doesn't request the certificate by itself; verification does, so run it after DNS has propagated. Deploys also request any certificates that are missing.

When HTTPS works, change `NEXT_PUBLIC_SITE_URL` and any auth callback URLs to the `https://` address, then redeploy.

## Step 7: Push and watch the deploy

Push to your production branch:

```bash
git push origin main
```

After the push:

1. The webhook queues a deployment.
2. The image is built on the server, from your Dockerfile or from framework detection.
3. The new container starts next to the old one.
4. It has to pass a health check before it gets any traffic.
5. Traffic switches over through a graceful Nginx reload.

If the build fails, the running app isn't affected. If something goes wrong after a deploy, a rollback replays the same steps with the previous image.

## Common problems and fixes

### Pages load without styles or scripts

With `output: 'standalone'` in your own Dockerfile, you have to copy `.next/static` and `public` into the final image yourself. Check the `COPY` lines in the run stage.

### The deploy never becomes healthy

An app that can't be reached never passes the health check, so it never goes live. Common causes:

- The server listens only on localhost. In your own Dockerfile, set `HOSTNAME=0.0.0.0`.
- The app listens on a different port from the project's port. Set the port in the project settings or with `PORT`, not with `EXPOSE`.
- The app crashes on boot because a runtime variable is missing. On a BYOS server you can SSH in and use `docker ps -a` and `docker logs` to find the first error.

The old version keeps serving meanwhile, so you can fix the problem and push again without an outage.

### A `NEXT_PUBLIC_` value is undefined in the browser

The value wasn't available when `next build` ran. In your own Dockerfile, add an `ARG` line for it in the build stage, before `npm run build`, then redeploy.

### A secret shows up in the client bundle

If a secret has the `NEXT_PUBLIC_` prefix, it was sent to every visitor. Treat it as leaked: rotate it, rename the variable without the prefix, and read it only in server code.

### The build is killed partway through

`next build` runs on the target server, and a small machine can run out of memory. Add swap or move to a bigger server.

### The app connects to the wrong database

A `DATABASE_URL` you set yourself takes priority over the one Pushify injects for a connected database. Remove your variable if you meant to use the connected one.

## Where to go next

- [PR preview deployments](/blog/pr-preview-deployments) give every pull request its own running copy of the app. They come with the paid plans, and each preview environment gets its own resolved variables.
- [From git push to live](/blog/how-zero-downtime-deploys-work) walks through the deploy pipeline step by step.
- [What it actually takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) covers the server upkeep that comes with BYOS.

If any step here didn't match what you saw, [open an issue](https://github.com/pushifydev/pushify_backend/issues). We're a small team, and feedback like that is how this guide gets better.
