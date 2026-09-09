---
title: "From git push to live: how zero-downtime deploys work"
description: The anatomy of a Pushify deployment — build, parallel boot, health gate, traffic switch, drain — and why each step exists.
date: 2026-09-09
author: Aziz Kurt
tags: deployments, docker, engineering
---

Every Pushify deployment follows the same path: a push lands, an image gets built, a new container boots next to the old one, a health check decides whether it deserves traffic, and only then does the proxy switch over. This post walks through that pipeline and the failure cases each step exists to absorb.

None of this is exotic — it's textbook blue-green deployment at the single-server scale. The interesting part is the details that make it hold up in practice.

## 1. The push

A `git push` to your production branch fires a webhook (through the GitHub App, or a repo webhook). The platform enqueues a deployment job — queued rather than executed inline, so ten rapid pushes become an orderly line instead of ten concurrent builds fighting over the same CPU.

## 2. The build

The builder checks out the commit and produces a Docker image on the target server over SSH. Framework detection picks a build strategy — Next.js, Django, Rails, Go, static sites, and so on — or your Dockerfile wins if you have one.

Two things matter for build speed and stability. Dependency layers are cached, so unchanged lockfiles mean the expensive install step is a cache hit. And the build happens in an isolated container with no access to the running app — a failing build is an error message, never an outage.

## 3. Parallel boot

Here's the core trick: the new container starts **alongside** the old one, on the shared Docker network, with a temporary name. The old container keeps serving every request while the new one boots.

Named volumes are attached to the new container at the same mount points, so persistent data carries across deploys. Environment variables are injected fresh — a config change you made in the dashboard takes effect on the next deploy, not on some future rebuild.

This is the step naive deploy scripts skip. `docker stop && docker run` has a gap where nothing is serving — and if the new version crashes on boot, the gap becomes an outage with your last-known-good version already gone.

## 4. The health gate

Before any traffic moves, the platform polls the new container until it responds successfully — with a timeout. Three outcomes:

- **Healthy** → proceed to the switch.
- **Never healthy** → the new container is discarded, the deployment is marked failed, and the old container keeps serving as if nothing happened. A broken release becomes a red X in the dashboard instead of downtime.
- **Slow** → boots that take a while (migrations, cold JIT, big frameworks) are fine; the gate waits rather than guessing.

The health gate is the single most valuable line in the whole pipeline. "The container started" and "the app works" are different claims, and only the second one earns traffic.

## 5. The switch

Once healthy, the nginx upstream for your domain is rewritten to point at the new container and the config is reloaded. An nginx reload is graceful by design: existing connections finish on the old worker processes while new connections hit the new upstream. In-flight requests don't drop.

From the outside, this moment is invisible. One request is answered by the old version, the next by the new one, and nothing 502s in between.

## 6. Drain and cleanup

The old container gets a grace period to finish whatever it's doing, then it's stopped and removed. Worker processes — the background commands you've configured alongside the web process — are restarted from the new image *after* the switch, so workers and web code never run mixed versions for longer than a deploy takes.

## Rollback

Because images are immutable and the previous one is still on disk, rollback replays steps 3-6 with the old image: boot it alongside, health-check it, switch back. A rollback is just a deploy whose build step is already done — which is what makes it fast enough to reach for without thinking.

## What this buys you

The pipeline's guarantees, stated plainly:

- A failed build can't touch the running app.
- A version that won't boot can't receive traffic.
- The switch drops no in-flight requests.
- The previous version stays one click away.

You can absolutely script all of this yourself — [we wrote about what that checklist looks like](/blog/what-it-takes-to-self-host-a-paas). Pushify's job is making it the default for every app on every server you connect, on every push. The implementation is [open source](https://github.com/pushifydev/pushify_backend) if you want to see exactly how the pieces work.
