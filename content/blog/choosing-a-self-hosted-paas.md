---
title: How to choose between self-hosted PaaS platforms
description: A practical framework for comparing self-hosted PaaS tools like Coolify, Dokploy, and Pushify, plus tests to run before you commit.
date: 2026-10-05
tags: self-hosting, paas, deployments, coolify, infrastructure
---

If you want a Heroku- or Vercel-style workflow on servers you control, you have real options now. Coolify and Dokploy are well-known open-source projects in this space. Pushify is another one, and we build it. All of them aim at the same basic experience: connect a repo, point it at a server, and get an app running behind HTTPS without writing your own deploy scripts.

Feature pages for these tools look a lot alike, so comparing them by checkbox doesn't tell you much. This post gives you a different approach. It covers the questions that actually separate one platform from another, and a few tests you can run in an afternoon before you move anything important.

We have an obvious bias, so here's how we've handled it. Where we describe Pushify, we stick to how it works. Where we talk about other platforms, we stay general and point you to their own docs. Testing them yourself beats trusting any vendor's comparison page, ours included.

## Start with what you're replacing

Before you compare platforms, write down what you have now and what's bothering you about it. The answer changes which questions matter most.

- **Hand-written deploy scripts on a VPS.** You probably want reliability first: no downtime on deploy, safe rollbacks, and certificates that renew on their own. [What it actually takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) lists what a script has to handle before it matches a platform.
- **A hosted PaaS that's getting expensive or restrictive.** You probably care most about cost predictability, how much control you get over the server, and how close the developer experience stays to what your team already uses.
- **Nothing yet.** You probably care most about how fast you get to a first deploy and how little infrastructure you have to learn along the way.

Keep that list nearby. It's what you'll weigh every answer against.

## The questions that separate platforms

### Where does the control plane run?

Every PaaS has a control plane: the dashboard, the API, and the thing that queues and runs deployments. It can run in one of two places.

- **On your own hardware.** You install it, upgrade it, and back it up. You get full ownership, and you also get one more service to keep healthy.
- **Hosted by the vendor.** Someone else runs the dashboard, and your apps still run on your servers.

Some projects offer both. Pushify does: the whole platform is [open source under the MIT license](/blog/pushify-is-now-open-source) and installs on your own hardware with a single script built on Docker Compose, and there's also a hosted version at [pushify.dev](https://pushify.dev). Having both is useful because you aren't locked into either one. You can start on the hosted version and move later, or the other way round.

Whichever platform you look at, ask what happens to your running apps if the control plane goes down. Ideally they keep serving traffic and you only lose the ability to deploy until it comes back.

### Where do the servers come from?

This question is separate from the control plane one, and it's easy to mix them up.

- **Bring your own server.** You rent a VPS from whichever provider you like and connect it. You get provider choice, control over data location, and the option to use machines you already pay for.
- **Managed servers.** The platform provisions the machine for you, so you never open a cloud account.

On Pushify you can do either. You can connect any server reachable over SSH, or provision a managed Hetzner server on the paid plans, which start at $15/month and charge a fixed hourly rate from prepaid credits. We compared the two in detail in [BYOS vs managed](/blog/byos-vs-managed-servers). Having a managed option is one of the main ways Pushify differs from other self-hosted tools. If you'd rather not deal with a cloud provider at all, check whether each platform you're considering offers one, and on what terms.

### How does the platform talk to your servers?

Some tools install an agent on every server. Others connect over SSH and run commands directly. Both approaches work. They differ in what you have to maintain.

Pushify uses plain SSH and no agent daemon. When you connect a server, it checks for Docker, Nginx, and Certbot and installs any that are missing. If Docker is already there, Pushify leaves that install alone. A fresh VPS needs nothing beyond SSH access.

For any platform, find out what it installs on the server, what it expects to own there, and whether it's safe to run other workloads next to it. If you plan to reuse a server that already does other jobs, this question matters a lot.

### What happens during a deploy, especially a bad one?

This is the most important question on the list, and marketing pages rarely answer it clearly. Every platform can deploy a working app. What you need to know is how it handles a broken one.

Ask these:

- Does the new version start alongside the old one, or is the old one stopped first?
- Is there a health check that has to pass before traffic moves?
- If the new version never becomes healthy, does the old one keep serving?
- Are in-flight requests dropped during the switch?
- How fast is a rollback, and does it rebuild or reuse the previous image?

On Pushify, the new container boots next to the old one and must pass a health check before it gets any traffic. The switch happens through a graceful nginx reload, and a rollback replays the same steps with the previous image. [From git push to live](/blog/how-zero-downtime-deploys-work) goes through each step and explains why it's there. Whatever platform you pick, make sure you understand its version of this sequence. Don't assume it's there.

### How are builds done?

Most platforms support at least two paths: detecting the framework automatically, or using your own Dockerfile. Check:

- Is the framework you use detected, and is the result something you'd be happy to ship?
- Can a Dockerfile in the repo override the detection?
- Where does the build run, and what does a failed build do to the running app?
- Are dependency layers cached between builds?

On Pushify, framework detection covers common stacks such as Next.js, Django, Rails, Go, and static sites. A Dockerfile in your repo takes priority. The build runs on the target server, and a failed build doesn't touch the running app.

### How are secrets handled?

Every platform has a screen for environment variables. The differences are in the details:

- Are values encrypted at rest?
- Which values are passed to the build, and which are only injected at runtime?
- Do changes take effect on the next deploy, or do they need a manual step?

On Pushify, variable values are encrypted with AES-256-GCM before they're stored. Every variable goes to `docker build` as a build arg, which Docker only uses if your Dockerfile declares it, and the same variables are injected into the container at runtime. The details and the pitfalls are in [Environment variables and secrets in deployed apps](/blog/environment-variables-secrets-management). Whichever platform you choose, learn where your secrets end up during a build. Most real leaks happen there.

### What does the team workflow look like?

When there's one developer, almost any tool works. Once a team shares the platform, the differences start to show:

- **Preview deployments.** Does every pull request get its own URL so reviewers can click through a change? See [PR preview deployments](/blog/pr-preview-deployments) for how they work on Pushify, where they come with the paid plans.
- **Team access.** Can several people work in the same projects without sharing one login?
- **Deploy triggers.** Does a push to the production branch deploy on its own, through a GitHub App or a webhook?

Team features are one of the areas Pushify focuses on. For any platform, test this with at least two real accounts, not just a feature list.

### Extras: one-click apps and services

Most platforms offer some way to run databases and common open-source tools next to your apps. Pushify has a marketplace of one-click apps for this. These features are handy, but they rarely decide anything. Choose based on how the platform deploys your own code. Use the app catalog to break a tie.

### Licensing and exit

Since the point of self-hosting is ownership, check how easy it is to leave:

- Is the platform open source, and under which license? Read the license yourself instead of relying on a summary.
- If the company behind it disappeared, could you keep running it?
- Are your apps ordinary Docker containers that would run without the platform?

Pushify's answer is the MIT license and standard Docker images. Check each candidate on the same three points.

## Run these tests before you commit

Most of the questions above can be answered in an afternoon on a cheap VPS. Install or sign up for each candidate, deploy the same small app, and then try to break it:

1. **Deploy a version that fails on boot.** For example, make the app exit when a required variable is missing. The old version should keep serving, and the dashboard should show a clear failure.
2. **Deploy while sending traffic.** Run a simple loop of requests against the app during a deploy and count the errors.
3. **Roll back.** Time it, and check that it reuses the previous image and doesn't rebuild.
4. **Change a secret.** Change a variable, redeploy, and confirm the new value is in use. Then check that the secret isn't in the image history with `docker history`.
5. **Restart the server.** Make sure the apps and the proxy come back on their own.
6. **Upgrade the platform.** If you self-host the control plane, follow the documented upgrade steps once. An upgrade you can't do comfortably is one you'll keep putting off.

The results will tell you more than any comparison table. They'll also give you a feel for each tool's error messages and docs, which you'll be relying on later at a bad moment.

## Rules of thumb

- **If your top priority is a large community and a long track record,** look closely at the most established projects. Coolify in particular has been around for a while and has a big user base.
- **If you don't want to manage a cloud provider account,** prefer a platform that can provision servers for you. On Pushify that's the managed Hetzner option.
- **If you have data-location or provider requirements,** prefer bring-your-own-server, and check that the control plane can also run where your rules require.
- **If you want to try something without committing,** start on a free tier or a throwaway VPS. Pushify's hosted free tier lets you connect one of your own servers.
- **Whatever you pick,** choose the platform whose failure behavior you've actually seen and understood.

## The short version

Self-hosted PaaS tools look alike from a distance. They differ in where the control plane runs, where the servers come from, how they reach those servers, and above all what they do when a deploy goes wrong. Write down what you're replacing, ask the questions above, and spend an afternoon breaking a test app on each candidate.

If you include Pushify in that comparison and something feels rough, [open an issue](https://github.com/pushifydev/pushify_backend/issues). We're a small team, and that kind of feedback shapes what we build next.
