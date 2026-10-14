---
title: Minimal VPS deployment: getting started with Pushify on a $5 server
description: A minimal VPS deployment with Pushify: prepare a $5 server, connect it over SSH, deploy from git, and keep a small box healthy.
date: 2026-10-14
tags: self-hosting, vps, getting-started, deployments, guides
---

The cheapest tier at most VPS providers costs around $5 a month and gets you a small Linux machine with a public IP. For a side project, an internal tool, or an API that doesn't see much traffic, that's often all you need. This guide walks through a minimal VPS deployment with Pushify, from a fresh server to an app running behind HTTPS, and covers the things that matter more on a small machine than on a big one.

The short version: you don't have to prepare much. Pushify connects over SSH, installs what it needs, and builds and runs your app on the server. The part worth thinking about is resources. A small box has little memory and disk, and both builds and zero-downtime deploys use more of each than you might expect.

## What you need

- A VPS from any provider you can reach over SSH. A Debian- or Ubuntu-based image is the simplest choice, since Pushify installs packages with `apt-get` (it falls back to `yum` on distributions without apt).
- Root SSH access, with either a password or a private key.
- A Git repository with the app you want to deploy.
- A Pushify account. The free tier of the hosted version at [pushify.dev](https://pushify.dev) lets you connect one of your own servers, so a first deploy on a $5 box costs only the box. If you'd rather run the control plane yourself, Pushify is [open source under the MIT license](/blog/pushify-is-now-open-source).
- Optionally, a domain name, if you want the app on your own hostname with a certificate.

If you don't want to rent a server at all, managed Hetzner servers are available on the paid plans. [BYOS vs managed](/blog/byos-vs-managed-servers) compares the two. This guide sticks to bringing your own.

## Step 1: Create the server

When you create the VPS at your provider, a few choices make the rest easier:

1. **Pick a recent LTS image**, such as a current Ubuntu or Debian release.
2. **Add an SSH key at creation time** if the provider allows it. Key-based login is safer than a root password and saves you a step later.
3. **Check the provider's firewall.** Many providers have a network firewall that sits outside the server. Allow inbound SSH (port 22), HTTP (port 80), and HTTPS (port 443). Port 80 matters even if you only plan to serve HTTPS, because Let's Encrypt validates domains over HTTP. More on that below.

If you don't have a key yet, generate one locally:

```bash
ssh-keygen -t ed25519 -C "pushify-deploy"
```

Then confirm you can log in before going any further:

```bash
ssh root@your-server-ip
```

If that works, so will Pushify, because it uses the same plain SSH connection.

## Step 2: Add swap before your first build

This is the one piece of preparation worth doing by hand on a small server.

Pushify builds your app into a Docker image on the target server itself. Installing dependencies and compiling a frontend can use a lot of memory for a short time, and on a machine with 1 GB or less, a build can get killed by the kernel's out-of-memory killer. JavaScript framework builds are a common example.

Swap gives the machine room to absorb those spikes. It's slower than RAM, but a slow build is better than a failed one. On most Linux distributions:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Check it took effect:

```bash
free -h
```

A failed build doesn't touch the app that's already running on Pushify, so running out of memory mid-build won't take your site down. It just means the new version never ships. Swap makes that a lot less likely.

## Step 3: Connect the server to Pushify

In Pushify, add a new server with its IP address and root credentials, either the password or the private key. Here's what happens next:

- Pushify runs `docker --version`. If Docker isn't installed, it installs it with the official convenience script (`curl -fsSL https://get.docker.com | sh`), then enables and starts the service.
- It checks for Nginx and Certbot the same way and installs them if they're missing.
- If Docker is already installed, Pushify leaves that install alone.

There's no agent daemon to install or keep updated. Pushify does everything over SSH, so the only things running on your server are Docker, Nginx, and your apps. That's a good fit for a small machine, where every background process takes memory you'd rather give to the app.

## Step 4: Create a project and deploy

Connect your repository, pick the server you just added, and choose the production branch. From then on, deploys work like this:

1. A `git push` to the production branch fires a webhook and queues a deployment.
2. The app is built into a Docker image on the server. Pushify detects common stacks such as Next.js, Django, Rails, Go, and static sites. If your repo has a Dockerfile, that takes priority.
3. The new container starts alongside the old one and has to pass a health check before it gets any traffic.
4. Traffic switches over with a graceful nginx reload, so in-flight requests aren't dropped.

If something goes wrong after a release, a rollback replays the same steps with the previous image. [From git push to live](/blog/how-zero-downtime-deploys-work) goes through each step in detail.

If your app needs configuration such as a database URL or API keys, add environment variables to the project before the first deploy. [Environment variables and secrets](/blog/environment-variables-secrets-management) covers how they're handled.

## Step 5: Add a domain and HTTPS

To serve the app on your own hostname, add the custom domain to the project and create an `A` record at your DNS provider pointing to the server's public IPv4 address.

Two details matter here:

- Before it requests a certificate, Pushify checks that the domain's `A` record resolves to the server's public IPv4 address. If it doesn't, Pushify skips SSL for that domain and logs a message saying so. If you've just created the record, give DNS a few minutes and try again.
- Certificates come from Let's Encrypt using the HTTP-01 challenge, so port 80 has to be open to the internet. This is why the firewall step above includes port 80.

If you want to put Cloudflare in front of the app, get HTTPS working on the origin first with the record set to DNS only, then turn on the proxy. [Cloudflare proxy for a self-hosted app](/blog/cloudflare-proxy-self-hosted-app) walks through the order and the SSL mode to pick.

## Living within a small server

Once the first deploy works, a $5 VPS can run quietly for a long time. A few habits help.

### Leave room for two containers

A zero-downtime deploy means the old and new versions of your app run at the same time until the health check passes and traffic switches over. For a short time, your app uses about twice its normal memory. If your app sits at 400 MB on a 1 GB server, the deploy is when you'll find out. Keep an eye on normal memory use with `free -h` or `docker stats`, and remember to count the deploy overlap when you decide whether a machine is big enough.

### Keep images small

Images are built and stored on the server, so their size costs you disk space and build time. If you write your own Dockerfile:

- Use a multi-stage build so compilers and dev dependencies stay out of the final image.
- Start from a slim base image where your stack allows it.
- Add a `.dockerignore` so `node_modules`, build output, and local files don't get sent into the build context.

### Watch disk space

Small VPS plans often have limited disk, and Docker images and build cache pile up over many deploys. Check now and then:

```bash
df -h
docker system df
```

Be careful with aggressive cleanup. Rollbacks reuse the previous image, so a blanket prune that removes unused images can leave you with nothing to roll back to. Removing build cache is a safer place to start when you need space.

### Keep the OS patched

Pushify installs the software it needs to deploy, but the machine is still yours to look after. On Debian and Ubuntu, unattended-upgrades handles security patches with very little effort:

```bash
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

Since Pushify connects as root, use key-based login and turn off root password login in `/etc/ssh/sshd_config`:

```
PermitRootLogin prohibit-password
PasswordAuthentication no
```

Make sure the key Pushify uses works before you restart the SSH service, or you'll lock it out along with yourself. [What it actually takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) covers the rest of the upkeep in more detail.

## When to move up

A small server stops being enough in a few predictable ways: builds take too long even with swap, memory runs out during the deploy overlap, or you want to run more apps than fit next to each other. None of these require changing how you deploy. Connect a bigger server, point the project at it, and the pipeline stays the same.

## The short version

- Create a VPS with a recent LTS image, add an SSH key, and open ports 22, 80, and 443.
- Add swap before the first build, because builds run on the server.
- Connect the server to Pushify over SSH. Docker, Nginx, and Certbot get installed if they're missing.
- Push to your production branch to deploy. Add an `A` record pointing at the server for HTTPS.
- Leave memory headroom for the deploy overlap, keep images small, and don't prune away your rollback image.

If something about getting started on a small server felt rough, [open an issue](https://github.com/pushifydev/pushify_backend/issues). We're a small team, so that feedback shapes the roadmap quickly.
