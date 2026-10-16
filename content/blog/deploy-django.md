---
title: How to deploy Django with Pushify on your own server or a managed one
description: Deploy Django with Pushify on your own VPS or a managed server: production settings, Dockerfile, env vars, Postgres, HTTPS and common fixes.
date: 2026-10-16
tags: django, python, deployments, guides, self-hosting
---

This guide shows how to deploy Django with Pushify to a server you control, from start to finish, without writing your own deploy scripts. It covers a production-ready `settings.py`, a Dockerfile, environment variables, the database, a custom domain with HTTPS, and the errors people usually hit on the first deploy. Everything here works the same on [your own VPS or a managed Hetzner server](/blog/byos-vs-managed-servers), because both use the same deploy pipeline.

If you haven't used Pushify before, [Deploy your first app](/blog/deploy-first-app-pushify) covers creating an account and connecting a server. This post assumes you've done that and sticks to what's specific to Django.

## What Pushify does on a deploy

Some of the Django advice below follows from how the pipeline works:

- A `git push` to your production branch fires a webhook and queues a deployment.
- Pushify builds your app into a Docker image on the target server. It can detect common frameworks, including Django, but a Dockerfile in your repo takes priority.
- If the build fails, the running app isn't touched.
- The new container starts next to the old one and has to pass a health check before it gets traffic. The switch happens through a graceful nginx reload.
- A rollback replays the same steps with the previous image.

[From git push to live](/blog/how-zero-downtime-deploys-work) goes through each step in detail.

This guide uses a Dockerfile instead of framework detection. Detection is fine for getting started, but a Dockerfile keeps every production decision in your repo where you can read it: the Python version, the WSGI server, when static files are collected, and when migrations run.

## Step 1: Make settings.py production-ready

Most Django deploy problems come from settings that only work on a laptop. Anything that changes between environments should come from environment variables, and the app should fail loudly if something required is missing.

Add these packages to `requirements.txt`:

```
Django>=5.0
gunicorn
psycopg[binary]
dj-database-url
whitenoise
```

Gunicorn serves the app. `psycopg` talks to PostgreSQL. `dj-database-url` turns a connection URL into Django's `DATABASES` setting. WhiteNoise serves static files from the app container.

Then update `settings.py`:

```python
import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Required at runtime. No fallback, so a missing key fails at startup
# instead of silently running with a known value.
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

DEBUG = os.environ.get("DJANGO_DEBUG") == "1"

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",")
    if h.strip()
]

CSRF_TRUSTED_ORIGINS = [
    f"https://{h}" for h in ALLOWED_HOSTS if not h.startswith(".")
]

DATABASES = {
    "default": dj_database_url.config(conn_max_age=600, conn_health_checks=True)
}

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
    },
}
```

Add WhiteNoise to `MIDDLEWARE`, right after `SecurityMiddleware`:

```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    # ... the rest of your middleware
]
```

Why these choices:

- `DEBUG` stays off unless you explicitly set `DJANGO_DEBUG=1`. A forgotten variable should never turn debug mode on in production.
- `CSRF_TRUSTED_ORIGINS` is built from your hosts. Without it, form posts over HTTPS can fail with `403 CSRF verification failed`, usually first on the admin login.
- `STORAGES` needs Django 4.2 or later. On older versions, use `STATICFILES_STORAGE`.

### Telling Django it's behind HTTPS

On Pushify, Nginx on the server handles HTTPS and passes plain HTTP to your container. Every proxy block Pushify generates sets `X-Forwarded-Proto` to the original scheme, along with `Host`, `X-Real-IP` and `X-Forwarded-For`. Tell Django to trust that header:

```python
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

Only set `SECURE_PROXY_SSL_HEADER` when the proxy in front of Django always sets that header, otherwise a client could fake a secure request. Behind Pushify's Nginx, it's always set.

You don't need `SECURE_SSL_REDIRECT = True`. Once a custom domain has a certificate, the Nginx config Pushify generates already redirects HTTP to HTTPS with a `301`. A second redirect in Django adds nothing and can cause loops if the forwarded header ever goes missing, for example behind a misconfigured CDN.

## Step 2: Add a Dockerfile

Put this at the root of your repo, next to `manage.py`. Replace `myproject` with the package that contains `wsgi.py`.

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first so this layer is reused when only code changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# collectstatic imports settings, which requires a SECRET_KEY.
# This throwaway value exists only for this command and is not stored in the image's environment.
RUN DJANGO_SECRET_KEY=collectstatic-only python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && exec gunicorn myproject.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --access-logfile -"]
```

Add a `.dockerignore` so local files stay out of the image:

```
.git
.venv
__pycache__/
*.pyc
db.sqlite3
staticfiles/
.env
```

The `.env` line matters most. Secrets belong in the platform's environment variables, not in a file baked into the image.

### Which port the app listens on

Pushify picks the container port in this order: the project's `PORT` environment variable, then the project's port setting, then `3000`. The port setting also defaults to `3000`. If `PORT` isn't set, Pushify injects it with the port it chose. This works the same for Dockerfile builds and detected ones.

Django apps usually listen on `8000`, so set `PORT=8000` in the project's environment variables, or set the project's port to `8000`. The `CMD` above binds Gunicorn to `$PORT`, so the app and the platform agree either way. If they disagree, the new container never passes its health check.

### Why static files are collected at build time

`collectstatic` doesn't touch the database, and its output depends only on your code. Running it at build time means every container started from the image is identical, and a rollback brings back the matching static files along with the code. WhiteNoise serves them with compression and long-lived cache headers, so you don't need a separate static file server.

### Why migrations run at startup, and what that implies

Migrations need the real database, which only exists at runtime, so the example runs `migrate` right before Gunicorn starts. It's the simplest setup that works, but it interacts with zero-downtime deploys in three ways:

- **The old version keeps serving while the new one starts.** For a short time, old code runs against the new schema. Keep migrations backward-compatible: add a nullable column in one deploy and use it in the next, and drop a column only after no deployed code reads it.
- **A migration can succeed even if the deploy doesn't.** If the new container fails its health check, traffic stays on the old version, but the schema has already changed. Rolling back the code doesn't roll back the database.
- **Long migrations count against the health check.** Gunicorn doesn't open its port until `migrate` finishes, and the health check gives the new container up to 60 seconds to start accepting connections. Run heavy migrations separately, or split them into smaller steps.

`--workers 3` is a reasonable start for a small VPS. A common rule of thumb is two to four workers per CPU core. Adjust once you see real memory use.

## Step 3: Connect the repo and set environment variables

Create a project in Pushify, connect your repository, pick the server, and choose the production branch. Before the first deploy, add these environment variables:

- `DJANGO_SECRET_KEY`: a long random string, generated with the command below.
- `DJANGO_ALLOWED_HOSTS`: comma-separated hostnames, for example `example.com,www.example.com`.
- `DATABASE_URL`: the PostgreSQL connection string. Step 4 covers what to put here.
- `PORT`: `8000`, to match Gunicorn.
- `DJANGO_DEBUG`: leave unset in production.

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Pushify encrypts environment variable values at rest. For rotation and where external secret managers fit, see [Environment variables and secrets management](/blog/environment-variables-secrets-management).

The Dockerfile above never needs a real secret during the build, so it doesn't matter whether a variable is available at build time or only at runtime. That's on purpose: no secrets end up in image layers.

## Step 4: Set up the database

Run Django on PostgreSQL or another server database in production. Don't put SQLite inside the container: its filesystem is replaced on every deploy, so the database file would be lost on the next push.

### A Pushify-managed PostgreSQL database on the same server

Pushify can create managed databases. PostgreSQL 16 is the default, and MySQL, MongoDB and Redis are also available. They run as Docker containers named `pushify-db-<name>` on a Docker network called `pushify`. When an app deploys to a server that has these containers, it joins the same network and reaches the database by container name on the default port:

```
postgresql://user:password@pushify-db-<name>:5432/<db>
```

If you link the database to the project, Pushify injects this URL into the app's environment automatically. `dj_database_url.config()` reads `DATABASE_URL` by default. If the injected variable has a different name, pass it with `dj_database_url.config(env="THAT_NAME", conn_max_age=600, conn_health_checks=True)`, or copy the URL into `DATABASE_URL` yourself.

A database on the same machine as the app is cheap and works well for small projects, as long as you take backups seriously.

### A database somewhere else

You can also use a hosted Postgres service or a database on another server, with `DATABASE_URL` pointing at its public address. A Pushify-managed database on a different server is only reachable that way if external access is enabled for it. Check an external database from your own machine before the first deploy:

```bash
psql "postgres://app:password@db-host:5432/app" -c "select 1"
```

The `pushify-db-<name>` hostname only resolves inside the `pushify` network, so this check won't work from your laptop for a same-server database. If that database is unreachable, `migrate` fails and the error shows up in the container logs.

### Creating a superuser

Run `createsuperuser` inside the running app container, so it uses the production settings and database. If you have SSH access to the server:

```bash
docker ps    # find your app's container
docker exec -it <container> python manage.py createsuperuser
```

### User uploads

Files users upload into the container's `MEDIA_ROOT` are gone after the next deploy. For anything beyond a demo, store uploads in object storage. [django-storages](https://django-storages.readthedocs.io/) supports S3-compatible services through the `default` entry in `STORAGES`.

## Step 5: Push, then add a domain and HTTPS

Commit the settings, `requirements.txt`, the Dockerfile and `.dockerignore`, then push:

```bash
git add .
git commit -m "Production settings and Dockerfile"
git push origin main
```

The build logs show `pip install`, then `collectstatic`, then the container starting. Once the health check passes, traffic moves to the new container.

To use your own domain:

1. Create an `A` record pointing to the server's public IPv4 address. If you want both `www` and the apex domain, create both.
2. Add the custom domain to the project in Pushify.
3. Add the same hostnames to `DJANGO_ALLOWED_HOSTS` and deploy again.

Pushify gets a Let's Encrypt certificate with Certbot using the HTTP-01 challenge, so port 80 must be reachable from the internet. Before requesting a certificate, Pushify checks that the domain's `A` record resolves to the server. If it doesn't yet, SSL is skipped for that domain and the logs say so. Fix the record, wait for it to propagate, and try again.

If you use Cloudflare, keep the record on DNS only (grey cloud) until the certificate is issued, then switch to Full (strict). [Cloudflare proxy for a self-hosted app](/blog/cloudflare-proxy-self-hosted-app) explains why.

## Common errors and fixes

### 400 Bad Request on every page

This is almost always `ALLOWED_HOSTS`. Django rejects any request whose `Host` header isn't in the list, and with `DEBUG` off it shows only a bare 400. Check that `DJANGO_ALLOWED_HOSTS` contains the exact hostname, with no `https://` prefix or trailing slash, and that you redeployed after changing it.

A deploy can go live and still return 400s. The default health check only confirms that the new container accepts connections on its port. It doesn't send a `Host` header, so `ALLOWED_HOSTS` doesn't affect it.

### The new version never goes live

If the build succeeds but traffic never switches, the new container is failing the health check. The check retries every 2 seconds for up to 60 seconds, and the container has to keep running throughout. Look in the container logs for a traceback. Common causes:

- `DJANGO_SECRET_KEY` is missing, which raises a `KeyError` at startup by design.
- The database is unreachable, so `migrate` fails and Gunicorn never starts.
- A migration takes longer than the check allows.
- Gunicorn is bound to `127.0.0.1` instead of `0.0.0.0`.
- Gunicorn listens on a different port than the one Pushify routes to. Set `PORT=8000`, or bind to `$PORT` as above.

### 403 CSRF verification failed on login

Make sure your HTTPS origin is in `CSRF_TRUSTED_ORIGINS`. The settings above build it from `DJANGO_ALLOWED_HOSTS`, so adding the domain there fixes both. Also check that `SECURE_PROXY_SSL_HEADER` is set.

### Unstyled admin and 404s for /static/

Check that `collectstatic` ran in the build logs, that `STATIC_ROOT` is set, and that `WhiteNoiseMiddleware` sits directly after `SecurityMiddleware`. `ValueError: Missing staticfiles manifest entry` means a template references a file that doesn't exist in any static directory.

### ERR_TOO_MANY_REDIRECTS

Two redirects are fighting. Usually it's `SECURE_SSL_REDIRECT = True` with a forwarded-proto header lost somewhere in front of the server, or Cloudflare in Flexible mode. Remove `SECURE_SSL_REDIRECT`, since Nginx already redirects, and see the Cloudflare guide if you use its proxy.

### Uploaded files disappear after a deploy

They were written to the container's filesystem. Move uploads to object storage, as described in Step 4.

## Checklist

- `DEBUG` off by default, `SECRET_KEY` from the environment with no fallback.
- `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` built from one variable.
- `SECURE_PROXY_SSL_HEADER` set, no `SECURE_SSL_REDIRECT`.
- WhiteNoise in place and `collectstatic` run at build time.
- Gunicorn bound to `0.0.0.0` on `$PORT`, with `PORT=8000` on the project.
- PostgreSQL through `DATABASE_URL`, migrations backward-compatible and short.
- No SQLite and no user uploads on the container filesystem.
- An `A` record pointing at the server and port 80 open before you add the domain.

With this in place, every push to your production branch builds a new image, starts it next to the running one, and switches traffic only once it's healthy. If something here doesn't match what you see when you deploy your Django app, [open an issue](https://github.com/pushifydev/pushify_backend/issues) and we'll fix the guide or the platform.
