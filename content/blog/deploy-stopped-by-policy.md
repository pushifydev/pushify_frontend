---
title: Deploy stopped by policy on Pushify: what it means and what to do next
description: A deploy stopped by policy on Pushify means the project was suspended under the Acceptable Use Policy. What triggers it and how to appeal.
date: 2026-11-12
tags: deployments, security, acceptable-use, guides
---

You pushed a commit and a deploy started. It ended with **stopped by policy** and the new version never went live. This isn't a build error, and editing your build config won't fix it. On Pushify, a policy stop means the project was suspended under the Acceptable Use Policy. This guide covers what that means, what the check looks at, what happens to your running app, and what to do if you think the stop is a mistake.

## A policy stop is not a build failure

The two can look alike in the dashboard, but they're different events.

- **A build failure** means the build couldn't finish. A dependency failed to install, the compiler hit an error, or a build command exited with a non-zero code. You fix the project and push again.
- **A policy stop** means the deploy was halted before anything was built, because the repository matched the Acceptable Use Policy's rules against running proxy, VPN and tunnel services on the hosted service. The project is suspended at the same time.

Only one policy can stop a deploy, and that's the Acceptable Use Policy. The clause involved is §2.1, which covers proxy and VPN services. Nothing else in the pipeline reports itself as a policy stop. A lockfile problem, an outdated dependency or a missing runtime version shows up as a normal build failure.

## Where the check runs in the pipeline

Here's the usual flow. A `git push` to your production branch fires a webhook and queues a deployment. The app is built into a Docker image on the target server, either through framework detection or from your own Dockerfile. The new container starts next to the old one, and it has to pass a health check before it gets any traffic. Then a graceful nginx reload switches traffic over. [From git push to live](/blog/how-zero-downtime-deploys-work) goes through each step in detail.

The policy check runs early, right after the repository is cloned. It scans the whole checked-out repository before buildpack detection, before any build and before any container starts. If the project deploys a ready-made image instead of a repository, the check looks at the image reference. When this check stops a deploy, the new version is never built, so it can't go live even briefly.

Two later checks can also matter:

- After a deploy succeeds, the build log is scanned. This scan never fails the deploy that just finished, but it can lead to the project being suspended afterwards.
- A separate background scan of the started image also exists. It never fails a deploy.

Nothing checks the deploy at the moment traffic switches over.

## What happens to the version that's already running

This part surprises people, so here it is up front: **the previous version stops too.**

A deploy is stopped by policy only as part of suspending the project. Suspending the project stops its containers on the server, sets the project status to paused, and emails the owner. The new build never starts, and in the normal case the old container doesn't keep serving traffic either.

If a project you care about shows a policy stop, check your email first. That message matters more than the deploy log.

## What the deploy output tells you, and what it doesn't

The deploy log shows the same lines for every policy stop:

```
[Pushify] failureCategory=policy_blocked
💡 This project is suspended under the Acceptable Use Policy. The email sent to the owner says why and how to appeal.
❌ Deployment failed: This deploy was stopped and the project suspended under the Pushify Acceptable Use Policy (§2.1). See your email for details and how to appeal.
```

The log doesn't name the rule that matched, the file or the line. It's the same text every time. The detail goes to the project owner's email instead. The suspension email gives the reason, lists what matched, and explains how to appeal.

If you're on a team and you aren't the project owner, ask the owner for that email before you start guessing.

## What the rules look for

The rules are about what a project is, not how it's built. They look for signs that the repository runs or distributes proxy, VPN or tunnel infrastructure. Broadly, they fall into these groups:

- **Proxy and VPN cores.** Software such as Xray, V2Ray, sing-box, Hysteria, Trojan, Shadowsocks and MTProxy.
- **Tunnels and relays.** Tunnel tools and Tor relays.
- **Proxy configuration and distribution.** Proxy protocol configs, shareable proxy connection URIs, and panels for selling or handing out proxy access.
- **Supporting tooling.** Open proxy servers, SOCKS server libraries, network scanners, IP and SNI scanners, and tunnel routing setups.

Some signals are weak and only count as supporting evidence, like using WebSockets or using the word "proxy" in your code. A project isn't stopped on weak signals alone. A stop needs a match against specific proxy or tunnel software or configuration, plus enough supporting evidence. An ordinary web app with a reverse proxy config or a WebSocket endpoint isn't what these rules are for.

The policy applies to the hosted service. That means projects on managed servers, or projects served from a Pushify-provided domain.

## Building from a Dockerfile doesn't change the result

If you got here wondering whether switching from a buildpack build to your own Dockerfile would help, it won't. The check runs on every repository deploy before buildpack detection, so it treats Dockerfile builds and framework-detected builds the same way. Dockerfiles, Containerfiles and docker-compose files are part of what it reads.

That's intentional. The check is about what the project does, so changing how the image gets built doesn't change the answer.

## If you think the stop is a mistake

Matches can happen in legitimate projects. A few examples:

- A security or networking tool kept in the same repository as the app, such as a scanner used for internal testing.
- Vendored libraries or test fixtures that include SOCKS server code or proxy configuration the app never runs.
- Documentation or example files with sample proxy connection strings.

The whole repository is scanned, not just the files that end up in the image. So code that sits in the repo but never runs can still count. Keeping unrelated tooling in its own repository is good practice anyway, but don't try to rename or rearrange files to get past the check. The project is already suspended, and the way back is a review.

There's no project or owner setting that turns off or overrides an individual rule. You have two options:

1. **Request a review of the stopped deploy.** If an admin approves it, the rules the review covered are cleared for that project, and later deploy scans leave those rules out.
2. **Appeal by email.** The suspension email explains how.

In either case, explain what the matched code is and why it's in the repository. A short, specific explanation is easier to review than a general "this is a false positive."

## If the project really is a proxy or VPN service

Then the stop is working as intended. The Acceptable Use Policy doesn't allow running that kind of service on the hosted service, and no build or config change will get it through. Pushify is open source, and the platform itself is [MIT-licensed](/blog/pushify-is-now-open-source). The hosted service still has terms about what runs on it.

## A short checklist

- Read the deploy log for `failureCategory=policy_blocked`. If it isn't there, you're dealing with a normal build failure.
- Check the owner's email. It has the reason and the appeal steps.
- Assume the previous version is stopped too, and plan for that.
- Don't move to a Dockerfile to work around the check. It's scanned the same way.
- If the match is a mistake, request a review or appeal by email, and explain what the matched code is.

For more on how Pushify thinks about security on servers you run, see [Securing a self-hosted PaaS](/blog/self-hosted-paas-security).
