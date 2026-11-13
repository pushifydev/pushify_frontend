---
title: How to deploy FastAPI with Pushify (self-hosted or managed)
description: Deploy FastAPI with Pushify step by step: a Dockerfile, env vars, Postgres and migrations, a custom domain with HTTPS, and common fixes.
date: 2026-11-13
tags: fastapi, python, docker, deployment, guides
---

This guide shows how to deploy FastAPI with Pushify, either on a server you already have or on a managed Hetzner server. When you're done, your API will run in a Docker container and deploy from a Git repository on every push. It will read its configuration from environment variables, talk to Postgres, and be served on your own domain over HTTPS. New versions go live without dropping requests.

You'll need a working FastAPI app. You'll also need either a server you can reach over SSH or a paid plan for a managed server. If you haven't used Pushify before, [Deploy your first app](/blog/deploy-first-app-pushify) covers the dashboard basics. For Django, see [the Django guide](/blog/deploy-django).

## How a FastAPI deploy works on Pushify

When a deploy fails, the cause is usually in one of these steps, so it's worth knowing them first:

- A `git push` to your production branch fires a webhook and queues a deployment.
- Pushify builds your app into a Docker image on the target server. It uses either framework detection or your own Dockerfile.
- The new container starts next to the old one. Pushify checks that it's up before sending it traffic, then switches over with a graceful Nginx reload.
- A rollback runs the same steps with the previous image.

Pushify connects to servers over plain SSH and doesn't install an agent. When you connect a server, it installs Docker, Nginx, and Certbot if they're missing. [From git push to live](/blog/how-zero-downtime-deploys-work) covers the pipeline in detail.

For Python, Pushify's generated Dockerfile runs `uvicorn main:app --host 0.0.0.0 --port <port>`. That fits an app that's a single `main.py` at the repository root. Most real projects keep the app in a package, need a specific Python version, or run migrations before the server starts. This guide uses its own Dockerfile for that reason. You can also run the same image locally before you push.

## Step 1: Prepare the app

Here's a minimal layout. These are the files that matter for deployment:

```
.
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── settings.py
├── alembic/
├── alembic.ini
├── requirements.txt
├── entrypoint.sh
├── Dockerfile
└── .dockerignore
```

### Read configuration from the environment

Don't put database URLs or API keys in your code or your image. Read them from environment variables at startup. `pydantic-settings` does this cleanly:

```python
# app/settings.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    environment: str = "production"


settings = Settings()
```

`Settings()` reads `DATABASE_URL`, `SECRET_KEY`, and `ENVIRONMENT` from the environment. Names are case-insensitive by default. If a required variable is missing, the app stops at startup with a clear validation error. The next section explains why failing at startup is what keeps a broken release from going live.

### Know what the deploy check does

After the new container starts, Pushify checks it from the server before switching traffic. The check only asks whether the container's port accepts a connection. As a fallback, it sends a plain request to `/`. Any HTTP response passes, even a `404` or a `500`. So does a connection that opens without an HTTP reply. Pushify retries every 2 seconds for up to 60 seconds. If the container exits or nothing answers in time, Pushify removes the new container and the old one keeps serving. You can't configure a different health check path for your app.

So a passing check means the process is listening. It doesn't mean the app works. To stop a broken release, make it crash before Uvicorn opens its port. In this guide, two things do that: required settings that raise an error at startup, and migrations that run before the server starts (Step 2).

### Add a health endpoint for monitoring

Pushify's deploy check doesn't call this endpoint. It's still useful for an uptime monitor or for checking by hand:

```python
# app/main.py
from fastapi import FastAPI

from app.settings import settings

app = FastAPI(
    docs_url=None if settings.environment == "production" else "/docs",
    redoc_url=None if settings.environment == "production" else "/redoc",
)


@app.get("/health")
def health():
    return {"status": "ok"}
```

By default, FastAPI serves `/docs` and `/redoc` to anyone. The `docs_url=None` and `redoc_url=None` lines turn them off in production. If your API is public, you can drop those lines.

### Pin your dependencies

```
# requirements.txt
fastapi==0.115.*
uvicorn[standard]==0.32.*
pydantic-settings==2.*
sqlalchemy==2.*
asyncpg==0.30.*
alembic==1.*
```

Pin the versions you've actually tested. A lock file from `pip-tools`, Poetry, or uv works too, as long as the Dockerfile installs from it.

## Step 2: Add a Dockerfile

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home appuser
USER appuser

CMD ["sh", "entrypoint.sh"]
```

A few notes:

- `PYTHONUNBUFFERED=1` sends output straight to stdout, so logs show up in `docker logs` right away.
- `requirements.txt` is copied before the rest of the code. Docker can then reuse the dependency layer when only your code changes. Builds run on your server, so this shortens deploys.
- The app runs as a non-root user.
- There's no `EXPOSE` line, because Pushify doesn't read it. The port comes from `PORT`, as explained below.

The entrypoint runs migrations and then starts Uvicorn:

```sh
#!/bin/sh
set -e

alembic upgrade head

exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-2}"
```

### Listen on $PORT

Pushify decides which container port gets traffic. It takes the port from your project settings, or from `port` in a `pushify.yaml`, which wins over the dashboard value. If neither is set, the port is `3000`. Pushify passes that value into the container as `PORT`, so `${PORT:-8000}` always matches the port Pushify routes to. The `8000` fallback only applies when you run the image yourself.

Don't hardcode `--port 8000`. Unless you've set the project port to 8000, traffic goes to 3000, nothing answers there, and the deploy never goes live.

`--host 0.0.0.0` is required. Uvicorn binds to `127.0.0.1` by default. Inside a container, that means nothing outside it can connect, including Nginx and the deploy check. `exec` replaces the shell with Uvicorn. Stop signals then go straight to the server, so in-flight requests can finish when the old container shuts down.

Each Uvicorn worker is a separate process with its own memory. On a small VPS, start with two and add more only if you have CPU and memory to spare.

Keep local clutter out of the build:

```
# .dockerignore
.git
.venv
__pycache__
*.pyc
.env
.pytest_cache
```

The `.env` line matters most. Without it, your local secrets end up in the image.

## Step 3: Test the image locally

Build and run the same image the server will build:

```bash
docker build -t my-fastapi .
docker run --rm -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://user:pass@host.docker.internal:5432/mydb" \
  -e SECRET_KEY="dev-only" \
  my-fastapi
```

In another terminal:

```bash
curl -i http://localhost:8000/health
```

If you get `200` with `{"status":"ok"}`, the image is ready. On Linux, the container may need `--add-host=host.docker.internal:host-gateway` to reach a database on your machine. To test the port handling Pushify uses, add `-e PORT=3000 -p 3000:3000` and curl port 3000.

## Step 4: Pick a server

The deploy pipeline is the same with either option:

- **Bring your own server.** Connect any VPS Pushify can reach over SSH as root, with a password or a private key. Pushify installs Docker, Nginx, and Certbot if they're missing. The free tier of the hosted version lets you connect one of your own servers.
- **Managed Hetzner server.** Provisioned through Pushify, so you don't need your own cloud account. Managed servers come with the paid plans, which start at $15/month. Each server has a fixed hourly rate, paid from prepaid credits.

[BYOS vs managed](/blog/byos-vs-managed-servers) walks through the tradeoffs. You can also run the whole platform yourself. Pushify is [open source under the MIT license](/blog/pushify-is-now-open-source), and this guide works the same way on a self-hosted control plane.

## Step 5: Connect the repository

In the dashboard, create a project, connect your Git repository, choose the server, and set the production branch. Make sure the project builds from your repository's Dockerfile and not the generated one.

From then on, every push to the production branch queues a deployment. Paid plans can also deploy each pull request, as described in [PR preview deployments](/blog/pr-preview-deployments). Preview environments need their own database and secrets. [Secrets for preview environments](/blog/preview-environment-secrets) explains how to set them up.

## Step 6: Set environment variables

Add the variables your `Settings` class expects to the project's environment variables:

```
DATABASE_URL=postgresql+asyncpg://app:REPLACE_ME@db.example.com:5432/app
SECRET_KEY=generate-a-long-random-value
ENVIRONMENT=production
WEB_CONCURRENCY=2
```

You don't need to set `PORT`. To change the port, set it in the project settings and Pushify will pass it into the container.

To generate a secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

A container reads its environment when it starts. A running container won't see a changed variable until a new deploy replaces it. For more than a handful of secrets, see [Environment variables and secrets management](/blog/environment-variables-secrets-management).

## Step 7: Database and migrations

### Where Postgres lives

Your app only needs a `DATABASE_URL` it can reach. That could be a hosted Postgres service or a Postgres server you run yourself. If you run Postgres in Docker on your own machine, its data lives in a Docker volume, and backing it up is your job. [Backing up Docker volumes with alerts](/blog/docker-volume-backup-alerts) shows one way to do it.

Watch the URL scheme. Async SQLAlchemy with asyncpg needs `postgresql+asyncpg://`, and a sync driver like psycopg uses `postgresql+psycopg://`. A plain `postgresql://` URL with an async engine is a common cause of startup errors. With the async driver, generate Alembic's environment with `alembic init -t async alembic`, and have `env.py` read the URL from your settings.

### Migrations during a zero-downtime deploy

The entrypoint runs `alembic upgrade head` before Uvicorn starts, so the migration also works as your database check. If `DATABASE_URL` is wrong or the migration fails, `set -e` stops the entrypoint and the container exits. Uvicorn never opens its port, and traffic stays on the old version.

There are two consequences to plan for:

- **The old version keeps serving while the migration runs.** The old and new containers run side by side until the cutover, so the old code has to keep working against the new schema. Make schema changes in backward-compatible steps. For example, add a nullable column in one deploy and start using it in the next. Drop old columns only once nothing reads them.
- **Rollback doesn't undo migrations.** A rollback redeploys the previous image, and the database keeps the newer schema. If your migrations are backward-compatible, that's safe, because the previous code still works with the newer schema.

## Step 8: Custom domain and HTTPS

1. Add the domain, for example `api.example.com`, in the project's Domains tab.
2. Create an `A` record for that hostname pointing to the server's public IP.
3. Check that it resolves: `dig +short api.example.com`
4. Press Verify in the Domains tab.

Once the record resolves to your server, Pushify requests a Let's Encrypt certificate through Certbot and Nginx and serves the app over HTTPS. The certificate is requested when you verify, not when you add the domain, which is why DNS comes first.

Renewal is automatic as long as the domain points to the server and port 80 is reachable. If renewal stops working, Pushify emails a warning 14 days before the certificate expires and again 3 days before. Pressing Verify again re-runs the Nginx and SSL setup and retries a failed certificate request.

If the domain is behind Cloudflare's proxy, read [Putting a self-hosted app behind Cloudflare](/blog/cloudflare-proxy-self-hosted-app) first. The SSL mode you pick there affects certificates and redirects.

## Common problems

### The deploy never goes live

The new container exited or didn't answer within 60 seconds, so traffic stayed on the old one. These are the usual causes:

- Uvicorn is bound to `127.0.0.1` instead of `0.0.0.0`.
- Uvicorn listens on a hardcoded port instead of `$PORT`.
- A required environment variable is missing, so `Settings()` raised an error at startup.
- A migration failed, or the database wasn't reachable.
- Startup work took more than 60 seconds before Uvicorn opened its port.

On your own server, the container's output tells you which one:

```bash
docker ps -a
docker logs <container-name>
```

### The deploy went live but the app is broken

The deploy check accepts any HTTP response, so a release that returns `500` on every request still passes. Catch request-time errors before you push. Run the image locally, run your tests, and make anything that has to be configured fail at startup. If a bad release does go out, roll back to the previous image.

### No certificate after adding the domain

Check that the `A` record resolves to the server and that port 80 is open, including in your provider's firewall. Then press Verify again.

### Redirects and generated URLs use http instead of https

Nginx terminates TLS and forwards plain HTTP to your container. Uvicorn only trusts `X-Forwarded-Proto` from addresses listed in `--forwarded-allow-ips`, which defaults to `127.0.0.1`. Requests from Nginx arrive through Docker's networking from another address, so Uvicorn ignores the header. You'll notice this when FastAPI's trailing-slash redirect sends clients to `http://`, or when `request.url_for` builds `http://` links.

Set `FORWARDED_ALLOW_IPS` to the address Nginx connects from. Use `*` only if the container's port can't be reached from outside the server, because otherwise anyone who can reach that port could spoof the header.

### Background tasks disappear

FastAPI's `BackgroundTasks` run inside the web process, so a deploy that replaces the container stops any work still running. Use them for small jobs like sending an email after a request. For work that has to finish, use a separate worker or a scheduled task. [Scheduled tasks and background jobs](/blog/scheduled-tasks-background-jobs-self-hosted) covers the options.

## Checklist

Before your first push:

1. Uvicorn binds to `0.0.0.0` and listens on `$PORT`.
2. Missing settings and failed migrations make the container exit before Uvicorn starts.
3. Every setting comes from an environment variable, and `.env` is in `.dockerignore`.
4. `docker build` and `docker run` work locally.
5. Migrations are backward-compatible with the version that's live.
6. DNS for your domain points to the server before you press Verify.

If something here doesn't match what you see, [open an issue](https://github.com/pushifydev/pushify_backend/issues). Reports like that are how guides like this one get better.
