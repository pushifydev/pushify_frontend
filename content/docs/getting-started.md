---
title: Getting started
description: Connect a server, deploy from Git, or put a static site online without a server.
updated: 2026-09-30
---

## Connect your own server

Any Linux VPS you can reach as `root` over SSH on port 22 works. Setup installs packages with `apt-get` (or `yum`), so a current Ubuntu or Debian is the easiest choice.

1. In the dashboard, open **Servers → New server → Connect your own**.
2. Enter a name, the server's IPv4 address, and either the root password or an SSH private key.
3. Pushify connects and sets the server up in the background. The server page shows **Installing**, then **Ready**, and you get an email when it is done.

What setup does, and nothing more:

- adds Pushify's SSH key to `/root/.ssh/authorized_keys`;
- installs Docker if it is missing, and nginx with certbot if nginx is missing;
- creates `/opt/pushify`.

Your firewall rules and your `nginx.conf` are left alone. The [security page](/security) lists everything Pushify does on a server, and how to remove it.

Prefer not to manage a server? A paid plan can [rent one from Hetzner](/docs/servers#managed-servers) from the dashboard.

## Deploy from Git

1. **New project**, then pick a source: GitHub, GitLab, or any Git URL over HTTPS.
2. Choose the repository and branch (`main` by default) and the server.
3. Pushify detects the framework and fills in the install, build and start commands. Check them, add environment variables, and deploy.

Every push to the branch deploys again. Turn **Auto-deploy** off in the project's settings to deploy only by hand. How the build is chosen is on [Projects & builds](/docs/projects).

## Try it without a server

Upload a static site — HTML, CSS and JavaScript with an `index.html` — and it goes live at `https://<name>.pushify.dev`. This works on every plan and counts as one project.

- **New project → Upload files**, then drop a folder or a `.zip`.
- Up to 2,000 files, 25 MB each, 50 MB in total. Hidden files are skipped.
- Upload a new version from the project's **Deployments** tab. The last five versions are kept, so you can roll back.
