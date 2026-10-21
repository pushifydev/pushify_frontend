---
title: Migrating applications to Pushify: a step-by-step guide
description: A step-by-step guide to migrating applications to Pushify: take inventory, connect a server, move env vars, and cut over DNS safely.
date: 2026-10-21
tags: migration, deployments, self-hosting, dns, guides
---

Most people don't start on Pushify with a new project. They start with an app that's already running somewhere: a VPS with a deploy script, a hosted PaaS, or a server someone set up by hand years ago. This guide covers migrating applications to Pushify in the order that keeps risk low. You take stock of what the app actually needs, bring it up on the new setup next to the old one, and switch traffic over only once you've seen it work.

You don't have to take the old app down early. The old deployment keeps serving until the last step, and it stays around for a while afterwards in case you need to go back.

## What changes and what doesn't

Your app's code mostly stays the same. What changes is how it gets built, started, and put behind HTTPS.

On Pushify, a `git push` to your production branch fires a webhook and queues a deployment. The app is built into a Docker image on the target server, using either framework detection or your own Dockerfile. The new container starts next to the old one and has to pass a health check before it gets any traffic. The switch happens through a graceful nginx reload, and a rollback replays the same steps with the previous image. [From git push to live](/blog/how-zero-downtime-deploys-work) walks through each step.

For a migration, three things follow from that:

- Your app has to run in a container. If it already does, you're most of the way there.
- On each deploy, the old and new versions run side by side for a short time.
- Anything the app writes to its own filesystem inside the container won't carry over to the next deploy, because every deploy starts a fresh container from a new image.

## Step 1: Take inventory of the current app

Before you touch Pushify, write down everything the current setup does for the app. Deploy scripts and hosted platforms do a lot of quiet work, and migrations usually break on whatever nobody wrote down.

Go through this list:

- **How it's built.** Build commands, runtime version, system packages, and any build steps that live in a script instead of the repo.
- **How it starts.** The exact start command and the port it listens on.
- **Environment variables.** Every one of them, including the ones set on the server and never added to a config file.
- **Data.** Databases, caches, and any files the app writes to disk, such as uploads.
- **Domains.** Every hostname that points at the app, including `www` and the apex, and who manages DNS for them.
- **Other processes.** Background workers, scheduled jobs, and anything else that runs next to the web process.

This guide focuses on the web process. Keep the rest of the list next to you anyway, because you'll need a plan for each item before you shut the old setup down.

## Step 2: Decide where the app will run

You can connect a server you already have, or provision a managed Hetzner server through Pushify. [BYOS vs managed](/blog/byos-vs-managed-servers) covers the tradeoffs in detail. The short version:

- **Bring your own server** works with any VPS Pushify can reach over SSH. The free tier of the hosted version at [pushify.dev](https://pushify.dev) lets you connect one of your own servers.
- **Managed Hetzner servers** come with the paid plans, which start at $15/month. Each server has a fixed hourly rate paid from prepaid credits, and you see the monthly estimate before you create it.

For a migration, we suggest a **fresh server**, even if you go with BYOS. It's tempting to connect the box that already runs the old app. But if the two setups live on separate machines, the old one stays exactly as it was until you switch DNS. If something goes wrong, going back just means pointing DNS at the old server again.

## Step 3: Connect the server

Pushify connects to the server over SSH as root, using a password or a private key. There's no agent daemon to install. When you connect a server, Pushify checks what's already there:

- It runs `docker --version`. If Docker is missing, Pushify installs it with the official convenience script (`curl -fsSL https://get.docker.com | sh`), then enables and starts the service.
- It does the same for Nginx and Certbot, using `apt-get` and falling back to `yum` on distributions without apt.
- If Docker is already installed, Pushify leaves that install as it is.

A fresh VPS doesn't need any preparation beyond SSH access. If you do reuse an existing server, you can still SSH in and run other things next to your Pushify apps. Just make sure you know what else on that machine depends on Docker and Nginx.

## Step 4: Plan your data before the first deploy

Sort out data before you deploy, because it decides how the cutover works.

### Databases

You have two main options:

- **Leave the database where it is** and point the new deployment at it. This is the simplest cutover, because the old and new app share the same data and you can move traffic whenever you like. It only works if the new server can reach the database over the network. Check that the connection is encrypted or stays on a private network.
- **Move the database too.** Use your database's own dump and restore tools. Unless you set up replication, you'll need a short window where writes stop on the old side, the data gets copied, and the new side takes over. Plan that window and tell your users about it.

If you're moving both the app and the database, do them one at a time. Move the app first while it still points at the old database, confirm it works, and then move the data. Each step is easier to debug on its own.

### Files on disk

If the current app saves uploads or other files to local disk, you'll need to fix that as part of the migration. Containers get replaced on every deploy, so files written inside one don't survive. Move those files to object storage or another external store before you switch over. If you keep data in Docker volumes, make sure they're backed up. We covered one approach in [backing up Docker volumes with alerts](/blog/docker-volume-backup-alerts).

### Schema migrations

The old and new versions run side by side for a moment on each deploy, so both have to work with the same database schema. Make schema changes backward compatible: add a column in one deploy, start using it in the next, and remove old columns only after nothing reads them. This applies to every deploy after the migration, not just the first one.

## Step 5: Get the build working

Connect your repository to a new project and choose the server from Step 3. Then decide how the app gets built.

- **Framework detection** covers common stacks such as Next.js, Django, Rails, Go, and static sites. If your app follows the usual layout for its framework, this might be all you need. There are framework guides for [Next.js](/blog/deploy-nextjs) and [Django](/blog/deploy-django).
- **Your own Dockerfile** takes priority over detection whenever it's in the repo. For a migration this is often the most predictable route. You can copy every build step from the old deploy script into one file you control, and it runs the same way on your laptop.

Whichever path you pick, build the image locally once before pushing. If it doesn't build on your machine, it won't build on the server either.

### The port

The app has to listen on the port Pushify routes to. Pushify chooses the container port in this order: a `PORT` environment variable if you set one, otherwise the project's port setting, which defaults to 3000. If you don't set `PORT` yourself, Pushify injects it into the container with the chosen value, so an app that reads `PORT` from the environment just works. Many apps coming from a hosted PaaS already do this.

Pushify doesn't read the `EXPOSE` line in your Dockerfile, so an `EXPOSE 8000` on its own won't change anything. If your app hardcodes a port, either set the project's port to match it or set `PORT` to that number.

### The health check

Before traffic moves, Pushify checks the new container every 2 seconds for up to 60 seconds. The container has to still be running, and its port has to accept connections. That's the whole check. It doesn't request a dedicated health path, and any HTTP response counts as a pass, including a 500. Nginx switches to the new container only after the check passes. If the container exits or the 60 seconds run out, the new container is removed, the deploy fails, and traffic stays on the old one.

Two things follow for a migration:

- The app has to start listening within that window without manual steps. If it runs a long warm-up or a migration before it binds the port, keep that well under 60 seconds or move it out of the start command.
- A passing check means the process is up and listening. It doesn't mean the app works. That's why the next steps test the app on a temporary hostname before real traffic reaches it.

A failed build doesn't touch an app that's already running. While you work through build errors on the new server, nothing serves traffic from it yet, and the old setup isn't affected at all.

## Step 6: Move environment variables

Copy every variable from your inventory into the project's environment settings. Pushify stores variable values encrypted. Go through the list one item at a time instead of pasting a whole file, because a migration is a good moment to drop values nothing uses anymore.

Look out for values tied to the old environment, such as:

- Database hosts and connection strings, if the database is moving or the network path changes.
- Callback and redirect URLs for OAuth or payment providers that hardcode a hostname.
- Allowed-host or CORS settings that list the old server's address.

For more on organizing secrets, see [environment variables and secrets management](/blog/environment-variables-secrets-management).

## Step 7: Deploy and test on a temporary hostname

Don't use the production domain for the first deploy. Create a test hostname instead, such as `new.example.com`. Point its `A` record at the new server's public IPv4 address and add it to the project as a custom domain.

Pushify gets Let's Encrypt certificates with Certbot using the HTTP-01 challenge. Before it requests a certificate, it checks that the domain's `A` record resolves to the server's public IPv4 address. If it doesn't, Pushify skips SSL for that domain and logs a line like this:

```
your-domain.com does not point to this server yet (A record → <ip>) — SSL skipped
```

The domain is still served over plain HTTP in that case. Pushify doesn't retry in the background, but you don't need to delete and re-add the domain either. Once the record resolves to the server, click **Verify** on the domain, which checks the `A` record again and requests the certificate. Any later production deploy does the same.

If your DNS is on Cloudflare, keep the test record on **DNS only** (grey cloud) for now. A proxied record resolves to Cloudflare's IPs and fails that check. [Cloudflare proxy for a self-hosted app](/blog/cloudflare-proxy-self-hosted-app) explains the full setup.

Once `https://new.example.com` loads, test it like you'd test a release:

- Click through the main flows, especially login, anything that writes data, and anything that calls a third-party service.
- Push a small change and watch it deploy, so you know the whole pipeline works and not only the first deploy.
- Try a rollback once, while it doesn't matter.

## Step 8: Cut over DNS

When the test hostname works, plan the switch for the production domain.

1. **Lower the TTL** on the production records a day or so ahead, to something like 300 seconds. Resolvers then pick up the change quickly, and switching back is quick too.
2. **Finish any data move** from Step 4 if you're moving the database in the same window.
3. **Point the production `A` record** at the new server. If the domain has a `www` or apex counterpart, update that too. Pushify runs the same DNS check on the counterpart before adding it to the certificate.
4. **Add the production domain** to the project once the record resolves to the new server. If you added it earlier and SSL was skipped, click **Verify** now.
5. **Check HTTPS** on every hostname.

There's a short gap to plan for. The certificate is only requested once DNS points at the new server, so some visitors may reach it before the certificate exists, and HTTPS won't work for them until it does. A low TTL and adding or verifying the domain right after the record changes keep that gap short.

If production traffic goes through the Cloudflare proxy, switch the record to grey before cutover, wait for the certificate, set the SSL mode to **Full (strict)**, and then turn the proxy back on. Once a custom domain has a certificate, Pushify's port-80 block redirects to HTTPS, so **Flexible** mode will cause a redirect loop.

## Step 9: Keep the old setup for a while

Don't shut down the old server the day you switch. Leave it running, but untouched, for a week or so:

- If something breaks that the test hostname didn't catch, pointing DNS back is a quick and well-understood fix.
- Some resolvers and clients hold on to old records longer than the TTL says, so a little traffic may still arrive at the old server for a while.
- Go back to the inventory from Step 1 and make sure every worker, scheduled job, and file location has a new home before you turn the old server off.

After the new setup has handled real traffic for a while, raise the TTL again, take a final backup of the old server, and shut it down.

## After the move

Once you're on Pushify, the day-to-day workflow is `git push`, and a bad deploy rolls back to the previous image. A few things are worth setting up next:

- [PR preview deployments](/blog/pr-preview-deployments) on the paid plans, so changes get tested before they reach the production branch.
- A look at [what it takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) if you're running your own servers, for the upkeep that's still yours, like OS patches.
- The [open source repo](/blog/pushify-is-now-open-source), if you'd rather run the control plane on your own hardware too.

If any part of the migration was rougher than it should have been, [open an issue](https://github.com/pushifydev/pushify_backend/issues). Migrations show where a platform's assumptions don't match real apps, and that's the feedback we most want to hear.
