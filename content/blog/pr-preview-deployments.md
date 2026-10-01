---
title: PR previews with Pushify: deploy every pull request automatically
description: How Pushify builds a preview for every pull request, cleans it up on merge, and how to keep previews away from production secrets and data.
date: 2026-10-01
tags: preview-deployments, pull-requests, deployments, code-review, environment-variables
---

Code review catches a lot, but some problems only show up once the change is running. A layout breaks at one screen width. A migration works locally and fails on real data. A new page loads, but its button posts to the wrong endpoint. You won't see any of that by reading the diff.

Preview deployments solve this by giving each pull request its own running copy of the app. Reviewers open a link and don't have to check out the branch. People who don't read code, like designers, product, and support, can look at the change before it ships.

This post explains how previews work on Pushify, from the moment a PR opens until it's merged. It also covers the habits that keep a preview from affecting production.

## What a preview deployment is

A preview deployment is a deploy of a pull request's code, separate from production. Production keeps running your production branch. The preview runs the PR's code at its own address, so you can compare the two side by side.

### Turning previews on

Previews are off by default. You turn them on per project in the project settings. Preview deployments also come with the paid plans. On the free tier with your own server, production deploys work, but previews need a paid plan. The [BYOS vs managed](/blog/byos-vs-managed-servers) post explains how plans and server types differ.

Every preview run goes through the same checks as other deploys: the organization's billing check and its plan limits. Those limits are whether preview deployments are allowed, the deployment quota, and the build-minutes quota. Each preview build counts toward those quotas, so keep that in mind on busy repositories.

### What triggers a preview

A production deploy starts when a `git push` to your production branch fires a webhook and queues a deployment. Previews use the same mechanism, driven by pull request events:

- **On GitHub**, the `pull_request` actions `opened`, `synchronize` (new commits pushed to the PR), and `reopened` create or update the preview.
- **On GitLab**, merge requests work the same way, with the `open`, `update`, and `reopen` actions.

When a PR already has a preview and you push new commits, Pushify creates a new deployment for the latest commit and sets the preview back to pending until it's live again. Reviewers always see the most recent version of the branch.

Once the preview is running, Pushify posts a **Preview Deployment Ready** comment on the pull request or merge request. Reviewers don't have to go looking for the link.

### The preview URL

Each preview gets an address built from the PR number and the project slug:

```
https://pr-<prNumber>-<projectSlug>.<PREVIEW_BASE_URL>
```

So PR 42 on a project with the slug `myapp` gets `pr-42-myapp.<base>`, separate from your production domain.

If you self-host the control plane, two details are worth knowing:

- `PREVIEW_BASE_URL` is a control plane setting. If it isn't set, Pushify falls back to `http://localhost/preview/<projectSlug>/pr-<prNumber>`, which won't be useful for anyone but you.
- On a server deploy, Pushify only sets up the virtual host for that address when the server has the wildcard certificate for the base domain. Without the certificate, the preview is served at `http://<server-ip>:<port>`, and that becomes the stored preview URL. It still works, but it's plain HTTP on a raw port, so set up the wildcard certificate before you share preview links widely.

## Why previews are worth turning on

- **Reviews look at the actual result.** An approval means more when the reviewer has clicked through the change.
- **Non-developers can review.** Anyone on the team can open a link in a PR, and no local setup is needed.
- **Build-only problems show up early.** A preview goes through a real build, so a missing dependency or a broken asset build appears on the PR and not when you merge to main.
- **Fewer "works on my machine" arguments.** Everyone looks at the same running copy.

## The lifecycle of a preview

A preview should exist as long as its pull request does, and no longer. On Pushify that happens automatically:

1. A pull request is opened, and a preview is built from its latest commit.
2. New commits update the preview, so reviewers always see the latest version.
3. When the pull request is closed or merged, the preview is torn down.

On GitHub, the `pull_request` `closed` action covers both closed and merged PRs and triggers cleanup. On GitLab, the merge request `close` and `merge` actions do the same.

On a server deploy, cleanup runs a teardown script over SSH. It removes the preview's container, image, and virtual host, releases the port, deletes the auto-subdomain DNS record, and closes the firewall port. On a local deploy, it stops and removes the container and deletes the nginx virtual host. In both cases the preview is marked closed and the PR comment changes to **Preview Deployment Closed**.

Automatic cleanup matters more than it seems. A preview left running uses memory and disk, and an old preview of an unreleased feature stays reachable for anyone who has the link. With cleanup tied to the PR, a preview lasts exactly as long as the review.

## Configure previews like a separate environment

The most common preview mistake is treating a preview as a copy of production. It isn't one. It runs code nobody has approved yet, and the link often gets shared further than you expect. Set it up as its own environment.

### Environment variables: previews inherit production

This part needs care. On Pushify, every environment variable has an `environment` field: production, staging, development, or preview. The deploy types get different sets:

- **Production deploys** get only the `production` variables.
- **Preview deploys** start from the `production` variables and then apply the `preview` variables on top. A preview value replaces the production value with the same key.
- **`development` variables** are never injected.

The convenience is real: a preview works without setting anything up again. The flip side is that **any production variable you don't override is present in every preview**. That includes your database URL, your payment keys, and your session signing secret, which would all be live in code nobody has reviewed yet.

So for each production secret, add a `preview` variable with the same key and a safe value. The API also has an endpoint for cloning variables from one environment to another, which is a quick way to get the full key list into `preview` before you replace the values.

Rules for what those values should be:

- **Use test or sandbox keys.** Payment providers, email services, and most third-party APIs have test modes. Previews should use them.
- **Never share signing secrets with production.** If a preview and production use the same session signing key, a session cookie created on one can be valid on the other.
- **Remember the build-time rule.** Pushify passes variables to `docker build` as build args, and a Dockerfile only uses the ones it declares with `ARG`. Don't declare an `ARG` for a secret, in previews or anywhere else. Our [guide to environment variables and secrets](/blog/environment-variables-secrets-management) explains why.

As with every deploy, variables are injected fresh into the new container. A change in the dashboard takes effect on the next deploy. For a preview, that's the next push to the PR.

### Databases

Never point a preview at your production database. A PR with a broken migration, or a bug in a delete query, would run against real data before anyone approved it. Because previews inherit production variables, this is also the default unless you override the database URL. Do that first.

Practical options, from simplest to most work:

- **One shared staging database for all previews.** Easy to set up. The downside is that two PRs with conflicting migrations can collide.
- **A seeded database per preview.** Each preview starts from a known dataset. It's cleaner, but it needs a seed script and uses more resources.
- **No database at all.** For frontend-only changes against a stable API, pointing the preview at a staging API is often enough.

Whichever you choose, make the seed or reset step safe to run more than once. Every push to the PR rebuilds the preview.

### Side effects

A preview is a full running app, so it can do everything your app does. Check for:

- **Outgoing email and SMS.** Use a test inbox service, or turn sending off with a flag.
- **Payments.** Test-mode keys only.
- **Queues and background jobs.** If a preview can reach the production queue through an inherited variable, its code can pick up real jobs while it's still unreleased.
- **Scheduled tasks.** A nightly job that bills customers shouldn't also run in five previews.

A single preview variable such as `APP_ENV=preview` makes these checks easy to write. For example, send real email only when `APP_ENV` is `production`.

### Search engines and access

Previews shouldn't be indexed. When the app knows it's running as a preview, serve a `noindex` header or a restrictive `robots.txt`, so a half-finished page doesn't show up in search results next to your real site. If the change is sensitive, put basic authentication in front of it in the app, or keep the link inside the team.

## A practical review workflow

This workflow works well for small teams:

1. Open the pull request as usual.
2. Wait for the **Preview Deployment Ready** comment. If the build fails, fix that first. A failed build on a preview costs little. A failed build on main costs more.
3. Under the preview comment, write what to check, for example: "the new settings page, especially on mobile."
4. Reviewers read the diff and click through the preview.
5. Merge. The preview is cleaned up, and the production branch deploys through the normal pipeline, with the [health check and zero-downtime switch](/blog/how-zero-downtime-deploys-work) that every production deploy goes through.

Step 3 is the one people skip. A link with no context gets a quick look and an approval. A link that says "check these two flows" gets a real review.

## Keep an eye on server resources

Every open pull request with a preview adds another running container to a server. On a large machine that hardly matters. On a small VPS that already runs production, five open PRs can mean five more copies of the app using memory.

Cleanup happens when a PR closes, so the main lever is how many PRs stay open:

- Close or merge stale pull requests. That's what removes their previews.
- Keep preview environments light: test-mode services, small datasets, nothing extra running.
- After you turn previews on, watch memory usage on the server, and decide whether production and previews should share a machine.
- Keep in mind that every push to an open PR is another build, which counts toward your deployment and build-minutes quotas.

If you're unsure how much capacity a server needs, the reasoning in [What it takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) applies here too: plan for everything that actually runs on the machine, not just production.

## The short version

- Turn on preview deployments in the project settings (they're off by default and come with the paid plans). Pushify then builds a preview for every pull request on GitHub or merge request on GitLab, and updates it on each push.
- Each preview gets its own URL, `pr-<number>-<slug>.<base>`, and the link is posted as a comment on the PR.
- When the PR is closed or merged, the preview is torn down: container, image, virtual host, port, DNS record, and firewall rule.
- Previews inherit production variables, and preview values override them. Override every secret, the database URL, and anything that causes real side effects.

Pushify is [open source](https://github.com/pushifydev/pushify_backend), so you can read the code to see exactly how previews are created and cleaned up. If something about previews doesn't fit your workflow, [open an issue](https://github.com/pushifydev/pushify_backend/issues). We're a small team, so that feedback shapes the roadmap quickly.
