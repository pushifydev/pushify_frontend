---
title: Environment variables and secrets in deployed apps: a practical guide
description: How to handle config and secrets in deployed apps: build time vs runtime, keeping keys out of Docker images, validating at boot, and rotating safely.
date: 2026-09-28
tags: environment-variables, secrets, docker, security, deployments
---

Almost every app needs values it shouldn't hardcode: a database URL, an API key, a signing secret, a feature flag. Environment variables are the usual way to pass them in, and for good reason. They keep config out of the code, they work in every language, and every deployment tool supports them.

They also cause some of the most common production mistakes. A secret ends up in a Docker image layer, a `.env` file gets committed, a missing variable crashes the app at 2 a.m., or a key rotation turns into an outage.

This post covers the habits that prevent those problems, and how they fit the way Pushify deploys apps.

## Config and secrets are not the same thing

Both are usually environment variables, but they carry different risks.

- **Config** is anything that changes between environments but wouldn't hurt you if it leaked: `NODE_ENV`, a log level, a public base URL, a feature flag.
- **Secrets** are values that grant access to something: database passwords, API tokens, OAuth client secrets, session signing keys, webhook signing secrets.

The distinction matters because secrets need more care. They shouldn't be written into build artifacts, printed in logs, or shared across environments. Config can be handled more loosely. A good first step for any project is to list its variables and mark which ones are secrets. Most apps have fewer than they think, and those few are the ones to be strict about.

## Build time vs runtime

Most real leaks happen here.

When an app runs in a container, there are two points where a value can enter:

1. **At build time**, while the Docker image is being built. Anything passed with `ARG` or set with `ENV` in a Dockerfile can end up recorded in the image.
2. **At runtime**, when the container starts. Values injected here exist only in the running process's environment and aren't part of the image.

Secrets belong at runtime. Here's the pattern to avoid:

```dockerfile
# Don't do this
FROM node:20-alpine
ENV STRIPE_SECRET_KEY=sk_live_...
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["node", "server.js"]
```

The key is now part of the image metadata. Anyone who can pull the image, or run `docker history` or `docker inspect` on it, can read it. Passing it as a build argument instead of hardcoding it doesn't fully fix this, because build arguments used in a `RUN` step can also show up in the image history.

The better version leaves secrets out of the Dockerfile completely:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["node", "server.js"]
```

The app then reads `process.env.STRIPE_SECRET_KEY` when it starts, and the value is provided to the container at runtime.

### When a value really is needed at build time

Some frameworks inline certain variables into the client bundle during the build. Next.js does this with anything prefixed `NEXT_PUBLIC_`. Those values end up in JavaScript that every visitor downloads, so they are public by definition. That's fine for a public analytics ID or an API base URL. It is never fine for a secret. If a secret carries a public prefix, treat it as already leaked and rotate it.

To make a build-time value available in your own Dockerfile, declare it with `ARG`. Declared build args are visible as environment variables to the `RUN` steps that follow:

```dockerfile
FROM node:20-alpine
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["node", "server.js"]
```

Declare only the public values you need this way. Every `ARG` is a value that may be recorded in the image.

If a build step really does need a secret, for example to install a package from a private registry, Docker BuildKit has secret mounts (`RUN --mount=type=secret,...`). They make the value available to a single step without writing it into a layer. For most web apps you won't need this. Keeping secrets out of the build is simpler.

## Keep secrets out of the repository

This advice is old, and people still get caught by it.

- Add `.env` and its variants to `.gitignore` before you create the file, not afterwards.
- Commit a `.env.example` that has every variable name and no real values. It documents what the app needs.
- Add `.env` to `.dockerignore` too. A `COPY . .` in your Dockerfile will copy a local `.env` into the image if nothing stops it.

A minimal `.dockerignore`:

```
.git
node_modules
.env
.env.*
!.env.example
```

If a secret has ever been committed, deleting the file doesn't help. It's still in the git history, and possibly in forks and clones. Rotate the secret first, then decide whether rewriting history is worth the trouble.

## How this works on Pushify

On Pushify, you set environment variables for a project in the dashboard, and they're resolved for the environment being deployed, including preview deployments. As described in [From git push to live](/blog/how-zero-downtime-deploys-work), every new container gets its variables injected fresh. So a change you make in the dashboard takes effect on the **next deploy**, and you don't have to rebuild anything by hand.

It helps to know exactly where those values go during a deploy:

- **At build time**, Pushify passes every variable to `docker build` as a `--build-arg`. Docker only hands a build arg to a Dockerfile that declares it with `ARG`, so a variable your Dockerfile doesn't declare isn't used by the build. This is what makes the `NEXT_PUBLIC_` pattern above work: declare the arg, and the value from the dashboard reaches the build.
- **At runtime**, the same variables are injected into the container when it starts. This is where your app should read its secrets.

The practical rule follows from that: in your own Dockerfile, **never declare an `ARG` for a secret**. If you do, the value is used during the build and can end up in the image's metadata or layers, exactly like the build-arg case above. Declare `ARG` only for public, build-time values, and let secrets arrive at runtime.

A few more properties of the platform matter for secrets:

- **Values are encrypted at rest.** Variable values are encrypted with AES-256-GCM before they're saved to the control plane's database, with a random IV for each value and an authentication tag. They're decrypted when you read them back and at deploy time. The encryption key comes from the control plane's own `ENCRYPTION_KEY` environment variable.
- **Names are not encrypted.** Only the values are. Variable names are stored as plain text, so keep anything sensitive out of the name itself. `STRIPE_SECRET_KEY` is fine as a name; a name that embeds a customer or account identifier is not.
- **The build is isolated.** Your image is built in an isolated container on the target server, with no access to the running app. If the build fails, you get an error message and the running app is untouched.
- **No agent on your servers.** Pushify reaches your servers over plain SSH. There's no extra daemon on the machine that holds or forwards your configuration.

If you'd rather not have a hosted service hold your secrets at all, you can [self-host the control plane](/blog/pushify-is-now-open-source). In that case the database storing your encrypted variables runs on your own hardware, and the encryption key is set in your own install. Because the platform is MIT-licensed, you can also [read the code](https://github.com/pushifydev/pushify_backend) and see exactly how variables are stored, encrypted, and passed to deploys.

## Fail fast on missing config

A missing or malformed variable should stop the app at boot. It shouldn't surface as a confusing error on the first request that happens to need it. Validate everything once, at startup:

```js
// config.js
const required = ["DATABASE_URL", "SESSION_SECRET", "STRIPE_SECRET_KEY"];

const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  stripeKey: process.env.STRIPE_SECRET_KEY,
};
```

The error message lists variable names and never values. That's deliberate.

On Pushify, this pairs well with the health gate. A new container has to pass a health check before it gets any traffic. If it exits because a variable is missing, it never becomes healthy. The deployment is marked failed and the previous version keeps serving. A typo in a variable name shows up as a failed deploy in the dashboard, not as downtime.

## Don't print secrets

Logs get copied, shipped, searched, and pasted into issues. Keep secrets out of them:

- Never log the whole environment (`console.log(process.env)` or the equivalent) to debug something.
- Be careful with error handlers that serialize the request or config objects. They often contain headers and tokens.
- If you log a connection string to confirm which database you're using, strip the password first, or log only the host.

The same goes for build output. A `RUN echo $SOME_ARG` in a Dockerfile prints the value into the build log. Don't do it with anything you wouldn't publish.

A useful rule: if a log line would be embarrassing in a public GitHub issue, it shouldn't exist.

## Separate environments, separate secrets

Production, staging, and preview deployments should not share credentials. If a preview build of a pull request can reach the production database, a buggy migration in a branch is a production incident waiting to happen.

In practice:

- Give each environment its own database credentials and its own third-party API keys. Many providers offer test-mode keys for exactly this.
- Give credentials only the permissions they need. A read-only reporting job doesn't need a key that can write.
- Treat preview deployments as less trusted than production, because they run code that hasn't been reviewed yet.

## Rotating a secret without downtime

Sooner or later you'll rotate a key. Maybe someone left the team, maybe it leaked, maybe it's just policy. The safe order of operations works on any platform:

1. **Create the new credential** alongside the old one. Most providers allow two active API keys at once, and databases allow two users or passwords.
2. **Update the variable** to the new value.
3. **Redeploy.** On Pushify, the new value takes effect on the next deploy. The new container boots next to the old one and has to pass the health check before traffic moves. If the new key is wrong and your app checks it at boot, the deploy fails and the old container keeps running with the old key, which still works.
4. **Confirm the new version is healthy** and working correctly.
5. **Revoke the old credential.**

The failure mode to avoid is doing step 5 first. If you revoke the old key before the new one is in place, the running app breaks right away, and so does any rollback to the previous version.

Signing secrets, such as session keys, need extra care. Changing them invalidates everything signed with the old value, which usually logs everyone out. Some frameworks accept a list of keys, where the first signs and all of them verify, so you can rotate gradually. Check whether yours does before you rotate.

## The short version

- Split your variables into config and secrets, and be strict about the secrets.
- Secrets go in at runtime, never into the Dockerfile or the image.
- On Pushify, every variable is offered to the build as a build arg, but only the ones you declare with `ARG` are used. Never declare one for a secret.
- Anything with a public build-time prefix ends up in the browser. Never put a secret there.
- Keep `.env` out of both git and the Docker build context. Commit a `.env.example` instead.
- Validate required variables at boot and exit if something is missing, so a bad config fails the deploy instead of the app.
- Don't log secrets, and don't share them between production and previews.
- Rotate by adding the new credential, deploying, checking, and then revoking the old one.

None of this is specific to one platform, and most of it takes minutes to set up. If something about how Pushify handles variables gets in your way, [open an issue](https://github.com/pushifydev/pushify_backend/issues). We're a small team, so feedback reaches the roadmap quickly.
