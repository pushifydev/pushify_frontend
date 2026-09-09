---
title: What it actually takes to self-host a PaaS
description: TLS, builds, zero-downtime restarts, backups, logs — a checklist of the unglamorous work between "it runs on my VPS" and "I'd put production traffic on this."
date: 2026-09-09
author: Aziz Kurt
tags: self-hosting, devops, vps
---

"Just get a VPS and run Docker" is the standard advice for leaving Heroku or Vercel, and it's not wrong — a $5 server really can run most side projects and plenty of production apps. What the advice skips is everything between `docker run` and a setup you'd trust with real users.

This is the honest checklist. We know it well because Pushify is essentially this checklist turned into software — but every item below applies whether you use a platform or wire it yourself.

## TLS and the reverse proxy

The entry point of your server is a reverse proxy — nginx, Caddy, or Traefik — that terminates HTTPS and routes hostnames to containers.

The DIY version is well-trodden: install nginx, write a server block per app, run certbot, and let a systemd timer renew certificates. The failure modes are quiet ones: a renewal that stops working and expires two months later, a missing `proxy_set_header` that breaks WebSockets, an HTTP-to-HTTPS redirect that only got applied to one of your four apps.

Whatever route you choose, the requirement is the same: certificate issuance and renewal must be automatic and monitored, and proxy config must be generated, not hand-edited — hand-edited config drifts.

## Builds that don't take down the app

Building on the server you serve from is the pragmatic default — no registry to run, no image transfer. The catch is that builds are the most resource-hungry thing your server does. A Next.js production build can eat every core and gigabyte it finds, and if that's the same machine serving traffic, your users feel it.

Reasonable mitigations, in increasing order of effort: build with CPU and memory limits, build at deploy time but bail out early when the working tree hasn't changed, cache dependency layers aggressively (a warm `node_modules` layer is the difference between a 40-second and a 6-minute build), or move builds to a different machine entirely.

## Zero-downtime restarts

`docker stop && docker run` means downtime on every deploy — seconds if the app boots fast, minutes if it doesn't, an outage if the new version crashes on boot.

The standard fix is blue-green at the container level: start the new container **alongside** the old one, wait until it actually responds to a health check, switch the proxy upstream, then drain and remove the old container. If the new version never becomes healthy, you never switch, and the incident becomes a log line instead of an outage. We wrote up how Pushify implements this in [From git push to live](/blog/how-zero-downtime-deploys-work).

The corollary: you need a health endpoint, and the switch must be gated on it. "The container started" is not "the app works."

## Crash recovery

Containers need `--restart unless-stopped` or they stay dead after a crash or a host reboot. Beyond that, something should be *watching* — an HTTP check hitting each app on an interval, alerting you when responses stop. A dead app at 2 AM that nobody notices until 9 AM is the classic self-hosting failure.

## Secrets and configuration

Environment variables in a `.env` file on the server work, but think through: who else can read that file, how do you rotate a leaked value across five apps, and does your deploy process rebuild with the *new* values or keep baking in the old ones? Secrets management is 20% storage and 80% process.

## Databases and the backup you've never restored

Running Postgres in a container on the same VPS is fine — genuinely. What separates fine from reckless is the backup situation: scheduled dumps, stored *off* the server (object storage is pennies), and **restore-tested**. A backup you've never restored is a hope, not a backup. Set a calendar reminder and actually do the restore once.

## Logs you can search when it matters

`docker logs` disappears when the container does — which is exactly when you need it, because the deploy that replaced the container is the prime suspect. Ship logs somewhere durable, even if that's just files with rotation. What you want at 2 AM is "search the last 7 days for this request ID," and stdout can't give you that.

## Upgrades — the part everyone skips

The OS needs security patches, Docker needs updating, the proxy needs updating, and your base images accumulate CVEs. Unattended-upgrades for the OS gets you far. But have an answer for the rest, because a two-year-old Docker daemon on an internet-facing box is how incidents start.

## When DIY is the right call

If you have one or two apps, enjoy this kind of work, and downtime costs you nothing but pride — wire it yourself, honestly. You'll understand your stack completely, and that knowledge compounds.

The calculus changes when apps multiply, when other people depend on the uptime, or when your time has a market rate. Every item above is a moving part you now operate. That's the actual product of a PaaS — not "runs my container," but "keeps all of the above true without me thinking about it."

Pushify's bet is that you shouldn't have to choose between owning your servers and having those guarantees. The [platform is open source](/blog/pushify-is-now-open-source), talks to your VPS over plain SSH, and does everything above out of the box. If you'd rather build it yourself — the repos are also a decent reference for how the pieces fit together.
