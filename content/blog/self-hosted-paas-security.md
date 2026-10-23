---
title: Self-hosted PaaS security: a practical checklist for your servers
description: A practical guide to self-hosted PaaS security: SSH access, firewalls, TLS, secrets, containers, updates, and backups on your own servers.
date: 2026-10-23
tags: security, self-hosting, vps, ssh, docker
---

Running your own platform means self-hosted PaaS security is your job. A platform can automate builds, certificates, and zero-downtime cutovers. It can't decide who gets SSH access to your machine, which ports your provider leaves open, or whether last year's OS patches ever got installed. This post is a practical checklist for those parts. It's written with Pushify in mind, but nearly all of it applies to any self-hosted PaaS running on a VPS.

None of this is exotic. Most incidents on small self-hosted setups come from the boring things: password SSH left on, a database port open to the internet, a secret committed to a repo, a server nobody has updated in two years. Fix those and you've covered most of the risk.

## Know which parts are yours

Start by being clear about the split. On a Pushify server, the platform handles a defined set of things:

- It connects over SSH and installs Docker, Nginx, and Certbot if they're missing. If Docker is already installed, it leaves it alone.
- It builds your app into a Docker image on the server and starts the new container next to the old one. Traffic only moves after a health check passes.
- It gets Let's Encrypt certificates for custom domains and generates Nginx config that redirects HTTP to HTTPS once a certificate is in place.
- It stores environment variable values encrypted with AES.

Everything else about the machine is yours: the SSH configuration, the firewall, OS and Docker updates, backups, and what your application code does once it's running. That's true whether you [bring your own server or use a managed Hetzner box](/blog/byos-vs-managed-servers). [What it actually takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) covers the general upkeep. This post covers the security side of it.

## Lock down SSH

SSH is the front door. Pushify talks to servers over plain SSH with no agent daemon, so SSH is also the only channel the platform uses. That keeps the attack surface small, but only if SSH itself is locked down.

### Use keys, not passwords

Pushify can connect with either a password or a private key. Use a key. Password authentication on a public IP gets brute-forced all day, and a strong password only lowers the odds.

Once your own logins and the platform's connection both use keys, turn passwords off in `/etc/ssh/sshd_config`:

```
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
```

Pushify connects as root, so don't set `PermitRootLogin no`. That would lock the platform out. `prohibit-password` is the useful middle ground: root can log in with a key and can't log in with a password.

Do this in the right order. If the server was connected with a password, check how it connects before you change anything, because turning off password authentication applies to the platform's connection too. Keep your current SSH session open, check the config with `sshd -t`, reload the service, and test a new login from a second terminal before you close the first.

### Limit who can connect

A few more steps cut down the noise and the risk:

- Run fail2ban or something like it so repeated failed logins get blocked.
- If you self-host the control plane, you know which address its SSH connections come from. You can allow port 22 only from that address and your own.
- Give each person who needs shell access their own key, and remove keys when people leave. A shared key everyone has copied is impossible to revoke cleanly.

## Close every port you don't need

A typical app server only needs three ports open to the internet:

- 22 for SSH
- 80 for HTTP, which Let's Encrypt needs for validation and which redirects everything else to HTTPS
- 443 for HTTPS

Port 80 isn't optional on Pushify. Certificates for custom domains are issued with the HTTP-01 challenge only, so Let's Encrypt has to reach the server over HTTP on port 80. If you close it, certificate issuance fails.

On Ubuntu or Debian, a basic host firewall with ufw looks like this:

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

Many providers also offer a firewall in their cloud console. Using both is fine. The provider-level one has the advantage of filtering traffic before it reaches the machine at all.

### Docker can bypass the host firewall

This one catches a lot of people. When a container publishes a port, Docker writes its own iptables rules, and that traffic can skip ufw entirely. So a database container started with `-p 5432:5432` can be reachable from the internet even though ufw says port 5432 is closed.

Don't trust the firewall config alone. Check what's actually listening:

```bash
# Every listening socket and the address it's bound to
ss -tlnp

# Every published container port
docker ps --format '{{.Names}}\t{{.Ports}}'
```

Anything bound to `0.0.0.0` or `::` that isn't SSH, Nginx, or something you meant to expose deserves a look. Then confirm from outside, from a different machine, with something like `nmap -Pn your-server-ip`. Databases, caches, and admin panels should never be reachable from the public internet. If you need to reach them, bind them to `127.0.0.1` and use an SSH tunnel.

A provider-level firewall helps here because Docker's iptables rules on the host can't touch it.

## Keep TLS on end to end

Pushify requests a certificate once a custom domain's `A` record points at the server, and the generated port-80 block redirects to HTTPS from then on. Your part is not to undo that further up the chain.

If you put Cloudflare in front of the app, use the **Full (strict)** SSL mode. **Flexible** shows a padlock in the browser while sending traffic between Cloudflare and your server unencrypted, and it causes redirect loops with an origin that already redirects to HTTPS. [Cloudflare proxy for a self-hosted app](/blog/cloudflare-proxy-self-hosted-app) goes through the setup and the order that keeps certificate issuance working.

Some people go further and allow ports 80 and 443 only from Cloudflare's IP ranges, so the origin can't be reached directly. It's a valid hardening step, but it changes who can reach port 80, so test certificate issuance and renewal properly before you rely on it.

## Keep secrets out of images and repos

Secrets leak in predictable places: committed `.env` files, values baked into Docker images, and build logs.

- **Never commit secrets.** Add `.env` and similar files to `.gitignore` and `.dockerignore`. If one has already been committed, rotate the secret. Deleting the file doesn't remove it from git history.
- **Don't bake secrets into images.** Values passed as build arguments or copied into a layer can be read back by anyone with access to the image, for example with `docker history`. Read secrets from the environment at runtime.
- **Keep build output clean.** Don't print config at startup or during builds. Logs are copied around and kept far longer than anyone expects.
- **Use separate credentials per environment.** Production and preview deployments shouldn't share a database password. If a preview gets compromised, production shouldn't go with it. [PR preview deployments](/blog/pr-preview-deployments) covers how previews fit into the workflow.

Pushify stores environment variable values encrypted with AES, which protects them at rest in the platform. It doesn't protect a value your app logs or a value someone pastes into a chat. [Environment variables and secrets management](/blog/environment-variables-secrets-management) covers the day-to-day practice. If you've outgrown a single env screen, [self-hosted secrets management with Doppler, Infisical, or Vault](/blog/self-hosted-secrets-management-doppler-infisical-vault) compares the dedicated options.

## Harden what runs inside the containers

Containers are an isolation boundary, not a strong one. A few habits make a compromised app much less useful to an attacker.

- **Run as a non-root user.** Add a `USER` line to your Dockerfile so the process inside the container isn't root. On Pushify, a Dockerfile in your repo takes priority over framework detection, so you have full control over this.
- **Never mount the Docker socket into an app container.** Access to `/var/run/docker.sock` is effectively root on the host. Only tools that truly need it should have it.
- **Keep base images small and current.** Slim or distroless images contain fewer packages, which means fewer vulnerabilities to patch. Rebuild regularly so you pick up base image fixes, even when your code hasn't changed.
- **Pin and audit dependencies.** Use a lockfile, and run your ecosystem's audit tool (`npm audit`, `pip-audit`, `bundle audit`, and so on) in CI.
- **Don't run debug mode in production.** Django's `DEBUG = True` or a framework's dev server will hand stack traces and config details to anyone who triggers an error. The [Django](/blog/deploy-django) and [Next.js](/blog/deploy-nextjs) guides cover production settings for those stacks.

## Patch the OS and Docker

Unpatched servers are the slow-burning risk. Nothing breaks for months, and then a known vulnerability on a public IP gets found.

On Debian and Ubuntu, turn on automatic security updates:

```bash
apt-get install unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

Two caveats are worth knowing:

- Kernel updates only take effect after a reboot. Check for `/var/run/reboot-required` and schedule reboots in a quiet window.
- Docker installed with the official convenience script comes from Docker's own package repository. The default unattended-upgrades config only applies security updates from the distribution, so Docker packages usually won't upgrade on their own. Upgrade them deliberately, on a schedule, since restarting the Docker daemon can restart your containers.

Put a recurring reminder in a calendar. "I'll do it when I remember" is how a server ends up years behind.

## Protect the control plane

If you [self-host Pushify itself](/blog/pushify-is-now-open-source), the control plane deserves more care than any single app server. It has to hold the credentials it uses to reach every server you've connected, which makes it the most valuable target in your setup.

- Run it on its own machine, or at least not alongside untrusted workloads.
- Serve the dashboard over HTTPS only.
- Restrict who can reach it. A VPN or an IP allowlist in front of the dashboard is a reasonable default for small teams.
- Keep it updated. It's installed with Docker Compose, so updates mean pulling new images and recreating containers. Do it on a schedule, like OS patches.
- Back up its data and keep the backups somewhere other than the control plane host.

The same thinking applies to accounts on the hosted version and to your git provider. A git push to your production branch triggers a deploy, so anyone who can push to that branch can ship code to production. Use branch protection, require reviews for production branches, and turn on two-factor authentication for everyone with write access.

## Back up, and test the restore

Security includes getting back to a working state after something goes wrong, whether that's an attacker, a bad migration, or a deleted volume.

- Back up databases and Docker volumes to storage outside the server, ideally with a different provider or account.
- Encrypt backups, and keep the key somewhere other than the backups.
- Alert when a backup fails or doesn't run. A backup job that silently stopped three months ago is a common way to find out you have no backups.
- Restore a backup to a scratch server every so often. Until you've restored one, you don't know it works.

[Docker volume backups with alerts](/blog/docker-volume-backup-alerts) walks through a setup that covers the first three points.

## A pre-launch checklist

Before a new server takes production traffic, run through this:

1. SSH uses keys only, `PermitRootLogin` is `prohibit-password`, and fail2ban is running.
2. Only ports 22, 80, and 443 are reachable from outside, confirmed with a scan from another machine.
3. `ss -tlnp` and `docker ps` show no databases or admin tools bound to public addresses.
4. HTTPS works, and if Cloudflare is in front, the SSL mode is **Full (strict)**.
5. No secrets in the repo, the image layers, or the logs. Production and preview credentials are separate.
6. Containers run as a non-root user and nothing mounts the Docker socket without a good reason.
7. Automatic security updates are on, and there's a schedule for reboots and Docker upgrades.
8. Production branches are protected and everyone with write access uses two-factor authentication.
9. Backups run off-server, alert on failure, and at least one restore has been tested.

None of these take long on their own. Together they cover the mistakes behind most compromises of small self-hosted servers. If you're setting up your first server, [deploy your first app with Pushify](/blog/deploy-first-app-pushify) and then work through this list before you point real traffic at it.
