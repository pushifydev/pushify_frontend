---
title: Automatic security updates on a self-hosted server, without breaking your apps
description: How to set up automatic security updates on a self-hosted server: what to patch unattended, what to hold back, and how to handle Docker and reboots.
date: 2026-10-24
tags: self-hosting, security, linux, docker, guides
---

Automatic security updates on a self-hosted server are one of the cheapest security wins you can get, and also one of the easiest to put off. The worry makes sense. A package upgrade at 4 a.m. restarts something, and your app stays down until you wake up. Skipping updates doesn't fix that. What does is deciding which updates run unattended, which ones wait for a planned window, and how you find out what happened.

This guide shows how to make that split on a typical Docker-based deployment server: Debian or Ubuntu with `unattended-upgrades`, Docker Engine, Nginx, and Certbot. It's written for servers you run yourself. That could be a VPS you've connected to Pushify as [your own server](/blog/byos-vs-managed-servers), or the host for a self-hosted Pushify control plane. Most of it works on any VPS.

## Who patches what

When you connect a server, Pushify uses plain SSH and doesn't install an agent. It checks for Docker, Nginx, and Certbot and installs whichever ones are missing. Docker comes from the official convenience script. Nginx and Certbot come from `apt-get`, or from `yum` on distributions without apt. If Docker was already installed, Pushify leaves it alone. After that, the machine is yours to maintain. OS security patches and keeping Docker reasonably current are your job, as [What it actually takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) explains in its section on upgrades.

The details matter because those three components reach your server through different channels, and an automatic update tool handles each channel differently:

- **Nginx and Certbot** come from your distribution's package archive, so distribution security updates cover them.
- **Docker installed by the convenience script** comes from Docker's own apt repository, not your distribution's security pocket. Default unattended-upgrades settings don't touch it.
- **Docker that was installed before you connected the server** could be either Docker's `docker-ce` package or the distribution's `docker.io` package. Those two behave differently, as covered below.

To see which case you're in, ask apt:

```bash
apt-cache policy docker-ce docker.io containerd.io nginx certbot
```

For each package, this prints the installed version and the repository it came from.

One more layer sits outside all of this: the software inside your container images. Host updates never touch it. It has its own section further down.

## Layer 1: OS security updates, unattended

This is the part you should automate without much hesitation. Security updates from a stable distribution are small, targeted fixes, and they rarely change behavior.

Install and enable `unattended-upgrades`:

```bash
sudo apt-get update
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

This writes `/etc/apt/apt.conf.d/20auto-upgrades`, which turns on the daily run:

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

The policy, meaning what gets upgraded and what happens afterwards, lives in `/etc/apt/apt.conf.d/50unattended-upgrades`. On Ubuntu, the important parts look like this:

```
Unattended-Upgrade::Allowed-Origins {
        "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
```

Debian writes its sources as `Origins-Pattern` lines, but the idea is the same. Read the file on your own server instead of assuming the defaults. Whatever you find, a deployment server should only pull from security sources automatically. Do feature updates and distribution upgrades by hand, when you're watching.

Before you trust the setup, do a dry run:

```bash
sudo unattended-upgrade --dry-run --debug
```

This lists the origins it's allowed to use and the packages it would upgrade, without changing anything. If Nginx shows up there when a security fix is pending, and Docker doesn't (assuming you've decided it shouldn't), the policy is doing what you want.

## Layer 2: Docker, on your schedule

Docker is where unattended updates can really hurt. Upgrading Docker Engine restarts the daemon. By default, when the daemon stops, every running container stops with it. Containers only come back after the restart if they have a restart policy. Even when everything comes back, that's a short outage for every app on the server at once, and nobody is around to check.

What you do depends on the package you have:

- **`docker-ce` from Docker's repository.** Default unattended-upgrades origins don't include it, so it won't be upgraded on its own. That's the behavior you want, but it also means nothing will remind you. A Docker daemon that quietly falls years behind is how this setup usually goes wrong.
- **`docker.io` from the distribution.** It's in the distribution archive, so a security update can upgrade it automatically and restart the daemon. If you'd rather control when that happens, put it on the blocklist.

The blocklist goes in `50unattended-upgrades`:

```
Unattended-Upgrade::Package-Blacklist {
        "docker.io";
        "containerd";
        "runc";
};
```

List the Docker-related packages your server actually has, based on the `apt-cache policy` output from earlier. Unlike `apt-mark hold`, this only affects the unattended run. You can still upgrade those packages yourself with a normal `apt-get install`.

Then set a recurring reminder, monthly works, and upgrade Docker during a low-traffic window:

```bash
# What's pending?
apt list --upgradable 2>/dev/null | grep -Ei 'docker|containerd|runc'

# Upgrade (docker-ce from Docker's repository)
sudo apt-get install --only-upgrade docker-ce docker-ce-cli containerd.io

# Check the daemon and the apps afterwards
docker version
docker ps
```

Once `docker ps` shows your containers running again, load each app in a browser. Docker also has a `live-restore` daemon option that keeps containers running while the daemon is down. It has limits on which upgrades it covers, so read Docker's documentation on it before you rely on it.

If any of your apps keep data in Docker volumes, make sure those backups are recent before a planned Docker upgrade. [Backing up Docker volumes with alerts](/blog/docker-volume-backup-alerts) shows one way to set that up.

## Layer 3: Nginx and Certbot

Nginx security fixes arrive through the distribution's security pocket, so the unattended run picks them up. A package upgrade restarts or reloads the service, which is normally quick. A config that suddenly stops loading is a bigger risk than the restart itself. After any Nginx upgrade, run a config test:

```bash
sudo nginx -t
```

Certbot needs a different check. Pushify gets Let's Encrypt certificates using the HTTP-01 challenge, so Let's Encrypt has to reach your server over HTTP on port 80. Patching is a common moment for other hardening, and someone closing port 80 "because everything is HTTPS anyway" is a familiar way to break certificate renewal weeks later. After upgrades or firewall changes, confirm renewal still works:

```bash
sudo certbot renew --dry-run
```

For the wider hardening checklist, including firewalls and SSH, see [Securing a self-hosted PaaS](/blog/self-hosted-paas-security).

## Kernel updates and reboots

Some patches only take effect after a reboot, kernel updates above all. On Debian and Ubuntu, a file appears when a reboot is pending:

```bash
ls /var/run/reboot-required && cat /var/run/reboot-required.pkgs
```

Be honest with yourself about what a reboot means. Zero-downtime deploys protect you during a deploy. The new container starts next to the old one and has to pass a health check before it gets traffic, which [From git push to live](/blog/how-zero-downtime-deploys-work) walks through. Both containers still run on the same machine, though. If that machine reboots, every app on it is down until it comes back up.

That leaves two reasonable policies:

1. **Automatic reboots at a fixed time.** Set `Unattended-Upgrade::Automatic-Reboot "true";` and `Unattended-Upgrade::Automatic-Reboot-Time "04:00";`. The server only reboots when a reboot is required, at the time you set. This works well for side projects, staging servers, and anything where a couple of minutes of downtime at night is fine.
2. **Manual reboots after a notification.** Leave automatic reboots off, check for the `reboot-required` file as part of a routine, and reboot when you can watch it happen. Choose this for production apps where you want to be awake when the server goes down.

Whichever you choose, reboot by hand once first and confirm everything comes back without help:

```bash
systemctl is-enabled docker nginx
sudo reboot

# once it's back
docker ps
curl -sI https://your-domain.com
```

If a container doesn't come back after a manual reboot, an automatic one won't fix that. Better to find out on a Tuesday afternoon than on a Sunday at 4 a.m.

Libraries are a related, smaller issue. When something like OpenSSL is patched, services that are already running keep the old version loaded until they restart. Many Ubuntu installs include `needrestart`, which checks for this after upgrades. Run `sudo needrestart -r l` to list affected services without restarting anything.

## Layer 4: what's inside your containers

Host updates never reach inside your images. If your app is built on a `node`, `python`, or `ruby` base image, that image has its own OS libraries. The only way to get fixes for them is to rebuild and redeploy.

On Pushify, redeploying is the safe operation. The build runs on the target server, and a failed build leaves the running app alone. The new container has to pass a health check before it gets traffic, and a rollback reuses the previous image. A periodic rebuild therefore costs you very little.

Some habits that help:

- **Use a maintained base image tag** in your Dockerfile, and stay on a supported language version.
- **Pin a specific version and bump it on purpose**, for example `python:3.12-slim` moving to a newer patch tag. Changing the tag forces a fresh base image, so you don't have to guess whether the build reused an old local copy.
- **Rebuild on a schedule** even when the code hasn't changed, so base image fixes ship without waiting for the next feature.

## Fedora, Rocky, and other dnf-based systems

If your server uses `dnf` (Pushify falls back to `yum` when apt isn't there), `dnf-automatic` does the same job:

```bash
sudo dnf install dnf-automatic
```

In `/etc/dnf/automatic.conf`, set `upgrade_type = security` and `apply_updates = yes`, then enable the timer:

```bash
sudo systemctl enable --now dnf-automatic.timer
```

The reasoning from the rest of this guide still applies: automate security updates, upgrade Docker on your own schedule, and plan reboots on purpose.

## If you self-host the Pushify control plane

The host running a self-hosted control plane follows the same rules. The control plane runs on Docker Compose, so upgrading Docker on that host restarts the dashboard and API too, and you can't deploy while they're down. Plan it like any other Docker upgrade. Upgrading Pushify itself is a separate task from patching the host. [What it actually takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) covers both.

## Knowing what happened

Unattended upgrades only stay safe if you can see what they did. Check these:

- `/var/log/unattended-upgrades/unattended-upgrades.log` for what the unattended run did.
- `/var/log/apt/history.log` for every package change, whether it was automatic or manual.
- `Unattended-Upgrade::Mail "you@example.com";` to get a report by email. This only works if the server can send mail, so test it.

A five-minute weekly check covers most of it: read the log, look for `reboot-required`, run `apt list --upgradable` to spot a Docker version that's falling behind, and `sudo certbot renew --dry-run` now and then.

## The short version

- Turn on `unattended-upgrades` for security updates only, and do a dry run before you trust it.
- Keep Docker out of the unattended run. Upgrade it monthly during a quiet window, and set a reminder so it doesn't fall behind.
- After Nginx upgrades, run `nginx -t`. Keep port 80 open, because Certbot's HTTP-01 renewal depends on it.
- Pick a reboot policy on purpose. A zero-downtime deploy doesn't protect against a host reboot.
- Rebuild your images regularly. Host patches never reach inside containers.

If something in this setup doesn't fit how Pushify manages your servers, [open an issue](https://github.com/pushifydev/pushify_backend/issues). We're a small team, so that feedback reaches the roadmap quickly.
