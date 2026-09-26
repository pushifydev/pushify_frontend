---
title: BYOS vs managed: choosing the right server for your Pushify deployment
description: Bring your own server or let Pushify provision a managed Hetzner box? What stays the same, what changes, and how to pick.
date: 2026-09-26
tags: self-hosting, vps, hetzner, infrastructure
---

When you create a project on Pushify, one of the first decisions is where it runs. There are two answers: **bring your own server** (BYOS), meaning a VPS you already have from any provider, or a **managed Hetzner server** provisioned through the platform.

This post covers what that choice changes, what it doesn't, and a few practical rules for picking one. The short version: the deploy pipeline is the same either way. What differs is who picks the provider, how you pay for the machine, and how much of the setup you do yourself.

## What stays the same

Start here, because it covers most of the platform.

Pushify talks to servers over plain SSH. There's no agent daemon to install or keep updated on your machines. Once a server is connected, deploys work like this:

- A `git push` to your production branch fires a webhook and queues a deployment.
- Your app is built into a Docker image on the target server, using framework detection or your own Dockerfile.
- The new container boots alongside the old one. It has to pass a health check before it gets any traffic, and the switch happens through a graceful nginx reload.
- Rollback replays the same steps with the previous image.

We walk through that pipeline step by step in [From git push to live](/blog/how-zero-downtime-deploys-work). None of it depends on who rented the machine.

## Bring your own server

BYOS means you point Pushify at a VPS you control. That could be a box at Hetzner, DigitalOcean, OVH, or Linode, or any other machine Pushify can reach over SSH.

### What happens when you connect it

Setup is short. Pushify connects to the server over SSH as root, using either a password or a private key. Then it checks what's already installed:

- It runs `docker --version`. If Docker isn't there, Pushify installs it with the official convenience script (`curl -fsSL https://get.docker.com | sh`), then enables and starts the service.
- It does the same for Nginx and Certbot. It uses `apt-get` and falls back to `yum` on distributions that don't have apt.
- If Docker is already installed, Pushify leaves that install alone and doesn't replace it.

So a fresh VPS doesn't need any preparation beyond SSH access. A server that already runs Docker for other things keeps its existing setup.

### Why people choose BYOS

- **You already have servers.** If you're paying for a VPS that sits half idle, using it costs nothing extra.
- **Provider choice.** Your data stays with the provider, in the region, and under the contract you picked. For some teams that's a compliance requirement, not just a preference.
- **It's free to start.** The free tier of the hosted version at [pushify.dev](https://pushify.dev) lets you connect one of your own servers, so you can deploy real apps without paying anything.
- **Full access.** It's your machine. You can SSH in, look around, and run other things next to your Pushify apps.

### What you take on

Pushify installs the software it needs to deploy. The machine itself is still yours to look after. That means the provider account, billing, firewall rules on the provider side, and the general upkeep that [What it actually takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) covers under upgrades: OS security patches and a Docker daemon that doesn't fall years behind.

It's a smaller job than it sounds, especially with unattended-upgrades turned on for the OS. But it's real work, and you own it.

## Managed Hetzner servers

A managed server is provisioned through Pushify, so you don't rent it yourself. Managed Hetzner servers come with the paid plans, which start at $15/month. They're offered at flat monthly prices, and the paid plans also add more projects and preview deployments.

### Why people choose managed

- **No provider setup.** You don't have to open a cloud account, create a server, and wire it up before your first deploy.
- **Predictable cost.** The server has a flat monthly price, so you know what it costs before you start.
- **Fewer steps to the first deploy.** Provisioning is done for you, so the path from new account to live app is shorter.

### What you give up

The managed option is Hetzner. If you have a hard requirement about which provider hosts your data, or you want a region or contract the managed option doesn't cover, BYOS is built for exactly that.

## Plan and server type are separate questions

It's easy to mix up two different choices. Where your server comes from is one. Which plan you're on is another. Some features, like preview deployments, come with the paid plans. So when you're comparing options, check what the plan includes as well as where the machine lives.

## How to choose

Some rules of thumb that hold up in practice:

1. **You already have a VPS.** Start with BYOS. It's free on the hosted version, and Pushify installs Docker, Nginx, and Certbot for you if they're missing, so you'll find out quickly whether the workflow suits you.
2. **You're starting from scratch and don't want to manage a cloud account.** Go managed. Less setup and a flat monthly price are what it's for.
3. **You have a compliance or data-location requirement.** Go BYOS, with the provider and region your requirement specifies.
4. **You want to try Pushify without committing to anything.** Go BYOS on the free tier. The deploy pipeline you'll see is the same one managed servers use.

## If you don't want the hosted control plane at all

There's a third option one level up: self-host Pushify itself. The whole platform (API server, dashboard, and CLI) is [open source under the MIT license](/blog/pushify-is-now-open-source), and the control plane runs on your own hardware with a single install script built on Docker Compose. In that setup every server is your own, and so is the platform.

Most people don't need to go that far. But it does mean the ownership BYOS gives you can extend all the way up: if Pushify the company disappeared, your deployment platform wouldn't.

## The short version

- The deploy pipeline, the zero-downtime cutover, and the SSH-only, agentless model are the same on both.
- BYOS gives you provider choice, full access, and a free starting point. Pushify handles the Docker, Nginx, and Certbot setup, and the rest of the machine is your responsibility.
- Managed gives you a server without a provider account to set up, at a flat monthly price on the paid plans.

Pick the option that matches the servers you have today. If something about either path feels rough, [open an issue](https://github.com/pushifydev/pushify_backend/issues). We're a small team, so that feedback shapes the roadmap quickly.
