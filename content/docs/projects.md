---
title: Projects & builds
description: How Pushify builds your app, and the other ways to run it — Dockerfile, Compose, a prebuilt image or static files.
updated: 2026-09-30
---

## How the build is chosen

If the root directory has a `Dockerfile`, Pushify builds it. Otherwise it detects the stack and uses a buildpack:

| Language | Frameworks detected |
|---|---|
| Node.js | Next.js, Nuxt, React, Vue, Svelte, Astro, Remix, Express, Fastify, Hono, Koa |
| Python | Django, Flask, FastAPI |
| Go | Gin, Fiber, Echo, Chi |
| PHP | Laravel, Symfony |
| Ruby | Rails, Sinatra |
| Rust | Actix, Axum, Rocket |
| Java | Spring, Maven, Gradle |
| Static | HTML sites |

A plain project in any of these languages works too. Set a different Dockerfile path, or pin the framework, in the project's settings or in [`pushify.yaml`](/pushify-yaml).

## Settings

- **Install, build and start commands:** one line each.
- **Root directory:** for a monorepo, the folder the app lives in.
- **Port:** the port your app listens on (default 3000).

## Other ways to run an app

- **Docker Compose:** point the project at a `compose.yaml` (or `docker-compose.yml`) and choose the service that receives traffic. On Pushify's shared hosting, privileged containers and host mounts are not allowed.
- **Prebuilt image:** deploy an image such as `ghcr.io/acme/api:1.4`, without a repository. Each deploy pulls it again. Set it in the project's settings.
- **Private registries:** add credentials once per registry in the organization settings; Pushify signs in only for the duration of a deploy.
- **Static sites:** from Git, or by [uploading files](/docs/getting-started#try-it-without-a-server).

## Zero-downtime deploys and rollbacks

Every deploy starts the new container next to the old one, waits up to 60 seconds for it to answer on its port, switches traffic in nginx, and only then stops the old one. A deploy that never answers does not replace the running version.

From the **Deployments** tab you can redeploy, cancel, or roll back to an earlier deployment; a rollback reuses that deployment's image and switches over the same way.

## Workers, scheduled tasks and volumes

- **Workers:** up to 5 extra processes per project (a queue consumer, for example), running from the same build.
- **Scheduled tasks:** up to 10 cron jobs per project, each with a timeout between 10 and 600 seconds.
- **Volumes:** up to 5 persistent directories per project.

These do not apply to Compose projects, which define their own services.

## pushify.yaml

A `pushify.yaml` in the repository sets the build, start and port, and declares cron jobs, workers and volumes, so they live with the code. When it is present it overrides the dashboard settings. The fields are on the [pushify.yaml page](/pushify-yaml).
