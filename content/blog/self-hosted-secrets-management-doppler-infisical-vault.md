---
title: Self-hosted secrets management for deployments: Doppler, Infisical, Vault
description: A practical guide to self-hosted secrets management in deployment: using Doppler, Infisical, or Vault with Coolify, Dokploy, and Pushify.
date: 2026-10-07
tags: secrets, environment-variables, self-hosting, deployments, security
---

If your team already keeps secrets in Doppler, Infisical, or HashiCorp Vault, moving to a self-hosted PaaS raises a practical question: how do those secrets reach your containers? Self-hosted secrets management in a deployment setup comes down to a few patterns, and they work much the same whether you run Coolify, Dokploy, or Pushify. This post covers those patterns, their tradeoffs, and the details that matter on each platform.

If you haven't read it yet, [Environment variables and secrets in deployed apps](/blog/environment-variables-secrets-management) covers the basics this post builds on: config vs secrets, build time vs runtime, and keeping keys out of Docker images.

## Why use an external secrets manager at all

Every self-hosted PaaS has a screen for environment variables. For a small project that's often enough. A dedicated secrets manager starts to pay off when:

- **The same secret is used in several places.** One database password shared by an app, a worker, and a CI job is easier to rotate from one place.
- **You need access control and an audit trail.** You want to know who can read production secrets, and who changed one last Tuesday.
- **You run more than one platform.** Some services on a PaaS, some in CI, some on a developer's laptop. A secrets manager gives them all one source.
- **Rotation is routine, not an emergency.** Some managers can generate or rotate credentials for you.

The three tools in this post differ in where they run. Doppler is a hosted service. Infisical is open source and can be self-hosted or used as a hosted service. Vault can be self-hosted, and HashiCorp also offers a managed version. If you picked a self-hosted PaaS to keep things on your own infrastructure, that may push you toward a self-hosted Infisical or Vault. The patterns below work the same either way.

## The two patterns

There are two basic ways to get secrets from a manager into a running container.

1. **Sync into the platform.** The secrets manager stays the source of truth, and values are copied into the platform's environment variables. Your app reads plain environment variables and knows nothing about the manager.
2. **Fetch at runtime.** The platform holds a single bootstrap credential. When the container starts, it uses that credential to pull the real secrets from the manager.

Most teams end up with one of these, sometimes both. Here's how each works and what it costs you.

## Pattern 1: sync secrets into the platform

In this pattern the manager pushes values to the platform, or a script pulls them from the manager and writes them to the platform. Your Dockerfile and app code stay unchanged.

### How it works

Some secrets managers ship sync integrations for specific targets. If yours has one for your platform, use it. If not, a small script in CI does the same job: read secrets with the manager's CLI, then write them to the platform through its API or CLI.

Reading is the easy half. Each CLI can print secrets in a format a script can work with. For example, Doppler's CLI can download secrets as a `.env`-style file:

```bash
doppler secrets download --no-file --format env --project my-app --config prd
```

The writing half depends on the platform. Check whether it has an API or CLI command for setting environment variables, and how it handles bulk updates.

### Writing to Pushify

On Pushify, the write side goes through the REST API. A project's variables live under `/api/v1/projects/{projectId}/env`, with endpoints to list, create, read, update, and delete them. For a sync script, the useful one is `POST /api/v1/projects/{projectId}/env/bulk`:

- It creates or updates up to 100 variables in a single request, for one environment. If you don't specify an environment, it uses production.
- It matches existing variables by key and reports each one as **created**, **updated**, or **unchanged**, so your script can log exactly what the sync did.
- Keys must match `^[A-Z][A-Z0-9_]*$`: uppercase letters, digits, and underscores, starting with a letter. If your secrets manager allows other names, normalize them in the script or rename them at the source.

For authentication, a sync script doesn't need a user session. It can use a Pushify API key (they start with `pk_live_`). Reading variables needs the `envvars:read` scope and writing needs `envvars:write`, so you can give the CI job a key that only does what the sync requires.

One detail that makes round-trips safe: if a script reads variables back and writes a masked secret value unchanged, Pushify keeps the real stored value instead of overwriting it with the mask.

### What you get

- **Nothing changes in the app.** It reads environment variables, the same as before.
- **No runtime dependency on the manager.** If your secrets manager is unreachable, containers still start, because the values already live on the platform.
- **The platform's own protections apply.** On Pushify, for example, variable values are encrypted with AES-256-GCM before they're stored in the control plane's database, with a random IV per value and an authentication tag.

### What you give up

- **Two copies of every secret.** The manager and the platform both hold the value. Your platform's storage and access control now matter as much as the manager's.
- **Drift.** If someone edits a value in the platform dashboard directly, the manager no longer has the real value. Make the manager the only place people edit secrets, and treat the platform copy as read-only output.
- **Rotation has an extra step.** A change in the manager only reaches the app after the sync runs and the app is redeployed. On Pushify, every new container gets its variables injected fresh, so a synced change takes effect on the **next deploy**.

## Pattern 2: fetch secrets at runtime

In this pattern the platform holds one credential: a Doppler service token, an Infisical machine identity, or a Vault token or AppRole credentials. The container uses it at startup to fetch everything else.

### Wrapping the start command

Doppler and Infisical both have a `run` command that fetches secrets and starts your process with them as environment variables. With the Doppler CLI installed in the image, the start command becomes:

```dockerfile
FROM node:20-alpine
WORKDIR /app
# Install the Doppler CLI here, following Doppler's install docs
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["doppler", "run", "--", "node", "server.js"]
```

The Doppler CLI reads a service token from the `DOPPLER_TOKEN` environment variable, so that's the one value you set on the platform. A service token is scoped to a single project and config, so it only unlocks the secrets for that environment.

Infisical works the same way with `infisical run -- node server.js`, authenticated with a machine identity. If you self-host Infisical, point the CLI at your own instance instead of the hosted one. Check Infisical's docs for the exact flags your CLI version expects.

With Vault, the common options are reading secrets with an SDK in your app at boot, running Vault Agent alongside the app, or a small entrypoint script that reads secrets with the `vault` CLI and then starts your process. All of them need a credential, and AppRole is the usual choice for apps. Vault's docs cover which option fits your version and setup.

### Reading secrets in the app

You can also skip the wrapper and fetch secrets in code at startup. Each of these tools has SDKs or an HTTP API. The shape is the same in any language:

```js
// server.js
const secrets = await loadSecrets(); // calls your secrets manager with the bootstrap token
const db = connect(secrets.DATABASE_URL);
```

This gives you more control over retries and error messages, at the cost of tying your code to a specific manager.

### The build-time trap

This pattern has one sharp edge on every platform: the bootstrap token is itself a secret, and it must not end up in the image.

On Pushify this is worth spelling out. During a deploy, every project variable is passed to `docker build` as a `--build-arg`, and the same variables are injected into the container at runtime. Docker only hands a build arg to a Dockerfile that declares it with `ARG`. So the rule is simple: **never declare `ARG DOPPLER_TOKEN`** (or the Infisical or Vault equivalent). Leave it undeclared, and the token only exists in the running container's environment.

If you see `doppler run` or `infisical run` in a `RUN` step of your Dockerfile, that's a sign secrets are being pulled at build time. Move that call to the `CMD` or entrypoint.

### What you get

- **One copy of each secret.** The platform holds only the bootstrap credential. The real values never sit in the platform's database.
- **Access control stays in the manager.** Revoke the token and every container using it loses access on its next start.
- **Rotation without touching the platform.** Change a value in the manager, then redeploy or restart. The next container fetches the new value.

### What you give up

- **The manager becomes a startup dependency.** If it's down or unreachable from your server, new containers can't get their secrets. Running containers aren't affected, because they already have their values.
- **A bigger image and a slightly slower start.** You're shipping a CLI or SDK and making a network call on boot.
- **The token is still a secret.** It deserves the same handling as anything else: scoped to one environment, never logged, rotated when people leave.

The startup dependency is where the platform's deploy behavior matters. On Pushify, a new container boots next to the old one and has to pass a health check before it receives traffic. If the new container can't reach your secrets manager and fails to start properly, the health check fails and the old container keeps serving. [From git push to live](/blog/how-zero-downtime-deploys-work) walks through that sequence. Whatever platform you use, make sure a failed secret fetch makes your app exit or fail its health check, rather than starting with empty values.

## Coolify, Dokploy, and Pushify compared

Both patterns are platform-agnostic. Coolify, Dokploy, and Pushify all run your app as Docker containers and all let you set environment variables, so a bootstrap token plus `doppler run` works on any of them. The differences are in the details, and they're worth checking before you commit.

Questions to ask of each platform:

- **Is there a native integration** with your secrets manager, or do you sync or fetch yourself?
- **Can a script set environment variables** through an API or CLI? Pattern 1 depends on it.
- **Which variables reach the build?** Some platforms let you mark individual variables as build-time. Others pass everything and leave it to your Dockerfile. Either way, you need to know so the bootstrap token stays out of the image.
- **Are values encrypted at rest**, and where does the encryption key live?
- **What happens when a new container fails to start?** Does the old one keep serving?

For Coolify and Dokploy, their own documentation is the right source for these answers. Both projects move quickly, and we'd rather point you there than describe a version of their feature set that's already out of date. For a broader comparison framework, see [How to choose between self-hosted PaaS platforms](/blog/choosing-a-self-hosted-paas).

For Pushify, here's what we can say:

- Environment variables are set per project and resolved for the environment being deployed, including preview deployments.
- A REST API lets scripts list, create, update, and delete variables, and a bulk endpoint creates or updates up to 100 at a time. API keys with `envvars:read` and `envvars:write` scopes let a CI job sync without a user login.
- Every variable is passed as a `--build-arg` and injected at runtime. Only variables your Dockerfile declares with `ARG` are used by the build.
- Values are encrypted with AES-256-GCM at rest. The key comes from the control plane's `ENCRYPTION_KEY` environment variable. Variable names are stored in plain text, so keep anything sensitive out of names.
- Changes take effect on the next deploy.

If you self-host the Pushify control plane, that `ENCRYPTION_KEY` is one of the most important values you own. Store it in your secrets manager too, and back it up separately from the database. Without it, stored variable values can't be decrypted.

## Which pattern to pick

Some rules of thumb:

1. **You want the simplest setup and your app already reads environment variables.** Sync into the platform. Make the manager the only place people edit, and redeploy after changes.
2. **You don't want secret values stored in the platform at all.** Fetch at runtime with a scoped bootstrap token. Accept the startup dependency and make failures loud.
3. **You self-host your secrets manager on the same infrastructure.** Runtime fetch is a good fit, but make sure the manager is reachable from every deploy server and more available than the apps that depend on it.
4. **You're not sure yet.** Start with sync. Moving to runtime fetch later only changes your start command and leaves one token on the platform.

## The short version

- Two patterns cover almost every setup: sync values into the platform, or store one bootstrap token and fetch at runtime.
- Sync keeps your app simple and avoids a runtime dependency. Runtime fetch keeps a single copy of each secret and moves access control to the manager.
- On Pushify, sync goes through the REST API's bulk endpoint with a scoped API key, and keys must be uppercase with digits and underscores.
- In both cases, secrets belong at runtime. On Pushify, that means never declaring an `ARG` for a secret or a bootstrap token.
- Check each platform's answers to the same questions: integrations, API access to variables, build-time behavior, encryption at rest, and failed-deploy behavior.

If your secrets setup runs into something this post doesn't cover, [open an issue](https://github.com/pushifydev/pushify_backend/issues). We're a small team, and that kind of feedback shapes what we build next.
