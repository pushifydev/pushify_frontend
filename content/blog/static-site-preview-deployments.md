---
title: Static site preview deployments on your own server: a practical setup
description: Set up static site preview deployments on your own server: one URL per pull request using wildcard DNS, nginx, a TLS cert, and automatic cleanup.
date: 2026-10-09
tags: static-sites, preview-deployments, nginx, self-hosting, guides
---

Static site preview deployments give every pull request its own URL, so reviewers can click through the real site instead of reading a diff of Markdown and CSS. Hosted platforms have made this normal. If your site runs on your own server, you can still have it. Static sites are actually the easiest case, because a preview is just a folder of files served under its own hostname.

This guide builds the setup from plain parts: a wildcard DNS record, one nginx server block, a wildcard TLS certificate, and a CI workflow that uploads each build and deletes it when the pull request closes. At the end we cover where Pushify fits if you'd rather not maintain this yourself.

## Why static sites are the easy case

Preview environments for full applications get complicated fast. Each preview needs a database, seed data, secrets, and a running process that uses memory whether anyone looks at it or not. Static sites skip all of that:

- **No runtime.** A preview is a directory of HTML, CSS, and JavaScript. Nginx serves it, and an idle preview costs some disk space and nothing else.
- **No shared state.** Previews can't write to each other's data, because there isn't any data.
- **Cheap cleanup.** Removing a preview means deleting a directory.

So the whole design comes down to three questions: how each pull request gets a hostname, how the files get onto the server, and how they get removed.

## The layout

Here's the plan for the rest of this post:

- Production stays where it is, for example `example.com`.
- Previews live under a dedicated subdomain: `pr-42.preview.example.com` serves the build for pull request 42.
- On the server, each preview is a directory: `/var/www/previews/pr-42`.
- CI builds the site on every push to a pull request, syncs the output to that directory, and deletes it when the pull request is closed or merged.

Keeping previews under their own subdomain (`preview.example.com`) instead of directly under `example.com` keeps them visibly separate from production and lets one wildcard certificate cover all of them.

## Step 1: Wildcard DNS

Create one DNS record that points every preview hostname at your server:

```
*.preview.example.com.   A   203.0.113.10
```

Add an `AAAA` record too if the server has IPv6. You never touch DNS again after this. New pull requests get working hostnames automatically, because the wildcard already matches them.

## Step 2: A wildcard TLS certificate

A certificate for `pr-42.preview.example.com` won't cover `pr-43`, and requesting a new one for every pull request is slow and runs into Let's Encrypt rate limits. A single wildcard certificate for `*.preview.example.com` covers every preview.

Let's Encrypt only issues wildcard certificates through the DNS-01 challenge. That means certbot has to create a TXT record at your DNS provider, so you need the certbot DNS plugin for that provider. With Cloudflare, for example:

```bash
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/.secrets/cloudflare.ini \
  -d '*.preview.example.com'
```

The credentials file holds an API token limited to editing DNS for that zone. Keep it readable by root only (`chmod 600`). Because the plugin can update DNS on its own, renewals work without you doing anything. Avoid `--manual` here: it works once, but every renewal then needs you to add a TXT record by hand.

## Step 3: One nginx server block for every preview

Nginx can capture part of the hostname in a regex and use it in the document root. That means one server block serves every preview, and you never edit nginx config per pull request:

```nginx
server {
    listen 80;
    server_name *.preview.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ~^pr-(?<pr>[0-9]+)\.preview\.example\.com$;

    ssl_certificate     /etc/letsencrypt/live/preview.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/preview.example.com/privkey.pem;

    root /var/www/previews/pr-$pr;
    index index.html;

    # Previews should never show up in search results.
    add_header X-Robots-Tag "noindex, nofollow" always;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }
}
```

A few details:

- The regex only accepts digits, so a hostname can't be crafted to point the root at some other path on disk.
- Check the certificate path certbot printed when it issued the certificate. The directory name under `/etc/letsencrypt/live/` is usually the first domain without the `*.` but it can vary.
- `try_files $uri $uri/ $uri.html` suits most static site generators. If your site is a single-page app with client-side routing, make the fallback `/index.html` instead of `=404`.
- If a pull request has no preview yet, the directory doesn't exist and visitors get a 404, which is fine.

The `X-Robots-Tag` header matters more than it looks. A preview is a full copy of your site on a different hostname. If a search engine finds one through a link in a public issue, you end up with duplicate content in the index. The header keeps previews out of it.

After editing, run `nginx -t` and then `systemctl reload nginx`.

## Step 4: A deploy user with limited access

CI needs SSH access to upload files, but it doesn't need root. Create a dedicated user that owns only the previews directory:

```bash
useradd --create-home --shell /bin/bash deploy
mkdir -p /var/www/previews
chown deploy:deploy /var/www/previews
```

Generate a key pair just for previews, put the public key in `/home/deploy/.ssh/authorized_keys`, and store the private key as a CI secret. Store the server's host key as a secret as well (the output of `ssh-keyscan` run once, from a machine you trust), so CI checks it instead of blindly accepting whatever answers.

If that key ever leaks, the worst someone can do is change or delete preview directories. Production stays out of reach.

## Step 5: The CI workflow

Here's a GitHub Actions workflow that builds on every push to a pull request and cleans up when it closes. It assumes a Node-based generator that writes to `dist/`. Change the build steps for your own tool.

```yaml
name: Preview

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

concurrency:
  group: preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  deploy:
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Upload preview
        env:
          SSH_KEY: ${{ secrets.PREVIEW_SSH_KEY }}
          KNOWN_HOSTS: ${{ secrets.PREVIEW_KNOWN_HOSTS }}
          PR: ${{ github.event.pull_request.number }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          echo "$KNOWN_HOSTS" > ~/.ssh/known_hosts
          rsync -az --delete dist/ deploy@203.0.113.10:/var/www/previews/pr-$PR/
          echo "Preview: https://pr-$PR.preview.example.com"

  cleanup:
    if: github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - name: Remove preview
        env:
          SSH_KEY: ${{ secrets.PREVIEW_SSH_KEY }}
          KNOWN_HOSTS: ${{ secrets.PREVIEW_KNOWN_HOSTS }}
          PR: ${{ github.event.pull_request.number }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          echo "$KNOWN_HOSTS" > ~/.ssh/known_hosts
          ssh deploy@203.0.113.10 "rm -rf /var/www/previews/pr-$PR"
```

What each part does:

- **`concurrency`** cancels an older run when you push again quickly, so two uploads for the same pull request can't overlap.
- **`rsync --delete`** removes files that no longer exist in the build. Without it, a page you deleted in the pull request would still be served from the preview.
- **The `closed` event** fires on both merge and close, so one cleanup job handles both.

If you want the URL posted on the pull request instead of buried in the logs, give the job `pull-requests: write` permission and add a step that runs `gh pr comment` with the link.

### Uploads that swap in all at once

`rsync` writes files one at a time, so for a few seconds during an upload a preview can mix old and new files. For previews that's usually fine. If it bothers you, upload to `pr-42.tmp` and then swap directories in one step on the server, or point a `pr-42` symlink at a fresh directory for each build. The same idea for running apps is covered in [From git push to live](/blog/how-zero-downtime-deploys-work).

## Things that trip people up

### Absolute URLs baked in at build time

Many static site generators write the site's base URL into the output: canonical tags, RSS feeds, sitemaps, sometimes every internal link. If the build uses the production URL, links in the preview send reviewers back to production without them noticing.

Pass the preview URL to the build. In Hugo that's `hugo --baseURL https://pr-42.preview.example.com/`. Most other generators have an equivalent setting or environment variable. If yours doesn't, make sure internal links are relative.

### Pull requests from forks

On GitHub, workflows triggered by `pull_request` from a fork don't get your repository secrets, so the upload step fails for outside contributors. That's a deliberate safety measure. The tempting workaround, `pull_request_target`, runs with your secrets, and if the workflow then checks out and builds the fork's code, that code runs with access to your deploy key. For public repositories it's usually better to skip previews for forks, or build them only after a maintainer has reviewed the change.

### Previews that never get cleaned up

If CI misses a `closed` event, or the workflow was added after some pull requests were already open, directories pile up. A nightly cron job on the server catches the leftovers:

```bash
find /var/www/previews -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +
```

That removes any preview that hasn't been updated in 30 days. A stale preview for a pull request that's still open simply comes back on its next push.

### Private content

Anyone who guesses `pr-42.preview.example.com` can open it. For an open-source docs site, that's fine. For unreleased marketing pages, add HTTP basic auth to the preview server block (`auth_basic` and an `htpasswd` file), or allow only your office or VPN IP ranges.

## Where Pushify fits

Everything above is a reasonable amount of work for one site, and it keeps working once it's set up. It gets less pleasant once you have several sites, or once some previews need a running app instead of plain files.

Pushify handles static sites through the same pipeline as any other app. Framework detection covers static sites along with stacks like Next.js, Django, Rails, and Go, and a Dockerfile in your repo takes priority if you want full control over the build. The build runs on your target server over plain SSH with no agent daemon, and a failed build doesn't touch what's already running. The server can be your own VPS or a managed Hetzner server. [BYOS vs managed](/blog/byos-vs-managed-servers) compares the two.

Preview deployments come with the paid plans, which start at $15/month. The free tier lets you connect one of your own servers for regular deploys. How Pushify's previews work is covered in [Pull request preview deployments](/blog/pr-preview-deployments). If you're still comparing platforms, [How to choose between self-hosted PaaS platforms](/blog/choosing-a-self-hosted-paas) lists the questions worth asking each of them.

## The short version

- Point a wildcard DNS record such as `*.preview.example.com` at your server.
- Get one wildcard certificate through the DNS-01 challenge, using your DNS provider's certbot plugin so it renews on its own.
- Use one nginx server block that maps `pr-N` in the hostname to `/var/www/previews/pr-N`, and send `X-Robots-Tag: noindex`.
- Let CI upload with a limited deploy user, build with the preview's base URL, and delete the directory when the pull request closes.
- Add a cron sweep for leftovers, and basic auth if previews shouldn't be public.

If you build this and hit a case we didn't cover, or you want something like it in Pushify, [open an issue](https://github.com/pushifydev/pushify_backend/issues).
