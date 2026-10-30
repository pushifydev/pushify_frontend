---
title: Admin panel security for self-hosted Pushify: a network isolation guide
description: Admin panel security for a self-hosted Pushify control plane: keep the dashboard off the internet, expose only webhooks, and lock down SSH.
date: 2026-10-30
tags: self-hosting, security, networking, docker, guides
---

When you self-host Pushify, admin panel security is mostly a network question. Every deploy starts in the dashboard and API, and they connect to every server you've added. Strong passwords help. A login page that strangers on the internet can't reach at all helps more. This guide shows how to set that up. You keep the control plane on a private network, open only the one path that has to be public, and limit SSH on your deploy servers to the machines that actually need it.

It's written for people who run the control plane themselves with the [open-source install](/blog/pushify-is-now-open-source), which is built on Docker Compose. If you use the hosted version at [pushify.dev](https://pushify.dev), we run the dashboard, so the first sections don't apply to you. The server-side sections still do.

## Why the control plane is the thing to protect

Pushify connects to servers over plain SSH, as root, with either a password or a private key. No agent runs on the servers. That keeps the servers simple, but it also means the control plane can open a root shell on every machine you've connected. Whoever controls the control plane effectively controls all of your servers.

That makes the control plane a different kind of target from the apps you deploy. Your apps have to be public, because that's the point of them. The dashboard only has to be reachable by you and your team. Most of this guide follows from taking that difference seriously.

For the broader picture, including secrets, updates, and access control, see [Securing a self-hosted PaaS](/blog/self-hosted-paas-security). This post covers only the network layer.

## Step 1: Find out what's actually exposed

Don't assume. Check what's listening on the control plane machine:

```bash
sudo ss -tlnp
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

In the `ss` output, anything bound to `0.0.0.0` or `[::]` accepts connections on every interface, public ones included. In the `docker ps` output, a mapping like `0.0.0.0:3000->3000/tcp` means Docker has published that container port to the world.

On a default install, you'll see two published ports, and both are bound to all interfaces:

- **3000**, the `frontend` service. This is the Next.js dashboard.
- **4000**, the `api` service. This is the Node backend, which serves the REST API and WebSockets, including webhooks and the health check.

The other services in the stack are `postgres`, `redis`, `worker`, and the one-shot `migrate` service. None of them publishes a port, so they're only reachable on the internal Compose network. Keep it that way.

If you've changed anything since installing, trust the output on your own machine over this list. The goal is simple: nothing on the public interface except SSH and, as covered below, a narrow path for webhooks.

## Step 2: Don't rely on ufw alone

A lot of people expect this step to just work, and it doesn't. When Docker publishes a port, it writes its own iptables rules, and those rules are evaluated before ufw's. So `sudo ufw deny 3000` won't block a port Docker published. The port stays open, and `ufw status` won't tell you.

You can deal with this at two levels. Use both.

- **Bind published ports to a specific address.** If a port is published on `127.0.0.1` or on a VPN interface address, it never reaches the public interface, so there's nothing to block.
- **Use a firewall at your provider.** Most VPS providers, Hetzner included, offer a network firewall that filters traffic before it reaches the machine. Docker's iptables rules can't get around it, so it's a good backstop if a port gets published by mistake.

You don't need to edit the Compose file to change the bindings. The installer writes the published ports into `.env` as `PUSHIFY_API_PORT=4000` and `PUSHIFY_FRONTEND_PORT=3000`, and those values can include a bind address. To keep both off the public interface, set:

```bash
PUSHIFY_API_PORT=127.0.0.1:4000
PUSHIFY_FRONTEND_PORT=127.0.0.1:3000
```

Then recreate the containers from the install directory:

```bash
docker compose up -d
```

Write down what you changed. After every control plane upgrade, run the Step 1 check again to make sure your bindings are still in place.

If you'd rather use firewall rules than address bindings, Docker gives you a `DOCKER-USER` iptables chain for filtering traffic to published ports. It works, but it's easier to get wrong than a binding, so start with the binding.

## Step 3: Reach the dashboard over a private path

Once the dashboard is off the public interface, you need a way in. There are three common options, starting with the simplest.

The dashboard (`frontend`, port 3000) and the API (`api`, port 4000) are separate containers. Whatever path you choose, plan for both. Before you remove public access, check which API URL your dashboard was configured with. If browsers call the API directly, that URL has to work over the private path too.

### SSH tunnel

If you're the only admin, this is enough:

```bash
ssh -L 3000:127.0.0.1:3000 -L 4000:127.0.0.1:4000 you@control-plane.example.com
```

While that session is open, the dashboard and API ports on your laptop forward to the control plane. You don't install anything new, and the only exposed surface is SSH, which is already open. The drawback is that everyone who needs the dashboard needs a shell account on the control plane machine.

### A private network: WireGuard or Tailscale

For a team, a private network is cleaner. Put the control plane on a tailnet if you use Tailscale, or on a WireGuard network, and bind the dashboard to that interface's address instead of localhost:

```bash
PUSHIFY_FRONTEND_PORT=100.x.y.z:3000
```

Here `100.x.y.z` stands for the control plane's Tailscale address. With WireGuard, use its address on your WireGuard network. If your team's browsers call the API directly, give them a private route to it as well. For example, add an Nginx server block that listens only on the private address and proxies to `127.0.0.1:4000`. Team members connect to the private network before they open the dashboard, and adding or removing someone becomes a key change.

### An identity-aware proxy

If you already put apps behind Cloudflare's proxy, as described in [Putting a self-hosted app behind Cloudflare](/blog/cloudflare-proxy-self-hosted-app), Cloudflare Access can put a login in front of the dashboard hostname before any request reaches your server. Other identity-aware proxies work the same way. This keeps the dashboard reachable from a normal browser without a VPN. The tradeoff is that your access control now depends on an outside service and on how you've configured it.

### Pushify's own IP allowlist

The API also has an IP allowlist setting, `ADMIN_ALLOWED_CIDRS`. Webhook paths are exempt from it, because Git hosts have to reach them from the internet. It's a useful extra layer, but it doesn't replace the bindings and firewall above. If you use it, check the self-hosting docs for the exact format.

Whichever option you choose, the dashboard's own login is still there. Network isolation sits on top of it. It doesn't replace it.

## Step 4: The one thing that must stay public: webhooks

Full isolation has a catch. Pushify deploys when a `git push` to your production branch fires a webhook, and that webhook is an inbound HTTP request from your Git provider. Your Git provider isn't on your VPN. If you lock everything down, pushes stop triggering deploys.

The fix is to expose the webhook paths and nothing else. They're served by the `api` container on port 4000, not by the dashboard, and they all live under `/api/v1/webhooks`:

- `POST /api/v1/webhooks/github/{projectId}` for per-project GitHub webhooks
- `POST /api/v1/webhooks/github/app` for the GitHub App, one endpoint for all repositories
- `POST /api/v1/webhooks/gitlab/{projectId}` for GitLab

With the API bound to `127.0.0.1:4000` as in Step 2, a small Nginx server block on the control plane can pass those paths through and refuse everything else:

```nginx
server {
    listen 443 ssl;
    server_name hooks.example.com;

    # ssl_certificate and ssl_certificate_key, e.g. from Certbot

    location /api/v1/webhooks/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        return 404;
    }
}
```

If you only use one provider, narrow the location further, for example to `/api/v1/webhooks/github/`. Point your repository's webhook at `https://hooks.example.com/api/v1/webhooks/github/<project-id>` (or the GitLab or GitHub App path), and run `sudo nginx -t` before you reload.

Two things make that public path safer.

**Signature checks.** Pushify rejects forged webhook requests before it does any work with them:

- On the per-project GitHub endpoint, Pushify computes an HMAC-SHA256 of the raw request body and compares it with the `X-Hub-Signature-256` header in constant time. A missing or wrong signature gets a 400. If the project has no webhook secret, every event except `ping` is refused with a 401. An unsigned `ping` is accepted while no secret is set, but a ping never triggers a deploy.
- The GitHub App endpoint checks the signature on every event, ping included. It needs `GITHUB_APP_WEBHOOK_SECRET` to be set and returns a 503 without it.
- GitLab doesn't sign requests with an HMAC. Pushify compares the `X-Gitlab-Token` header with the project's secret in constant time before processing anything.

All of these checks happen before the payload is parsed and before a deployment is created. A random request to the endpoint can't start a deploy. Make sure every project has a webhook secret set. Since the check runs on the raw body, don't add any Nginx directive that rewrites the request body.

**Source allowlisting.** If your repositories are on GitHub, GitHub publishes the address ranges it sends webhooks from under the `hooks` key at `https://api.github.com/meta`. You can turn those into Nginx `allow` lines followed by `deny all;` inside the webhook `location`. The ranges change from time to time, so refresh them with a script instead of pasting them in once.

## Step 5: Limit SSH on your deploy servers

The control plane connects to each server as root over SSH. You can't turn off root login on those servers without cutting Pushify off. What you can do is make sure only the control plane can log in as root, and only with a key.

First, make sure Pushify connects to the server with a private key, not a password. If you turn off password authentication while Pushify still uses a password, deploys to that server will stop.

Then, in `/etc/ssh/sshd_config` on each deploy server:

```
PermitRootLogin prohibit-password
PasswordAuthentication no
AllowUsers root@203.0.113.10 admin
```

Here `203.0.113.10` is your control plane's public address and `admin` is your own login user. `AllowUsers` accepts `user@host` patterns, so root can log in only from the control plane, while your personal account can still log in from anywhere. If your admin access goes through a VPN, you can limit that user to the VPN range too.

Change this carefully:

```bash
sudo sshd -t && sudo systemctl reload ssh
```

Keep your current SSH session open, and test a fresh login from a second terminal before you close it. On some distributions the service is called `sshd` instead of `ssh`.

Back this up at the provider level. Allow port 22 only from the control plane and your admin network. Keep ports 80 and 443 open, because your apps serve traffic on them and Certbot's usual HTTP challenge needs port 80.

## Step 6: Run the control plane on its own machine

It's tempting to run the control plane on the same VPS as your apps. On the network level, that puts every public app on the same host as the system that holds root access to all your servers. A vulnerability in any one of those apps then sits right next to it.

A small dedicated VPS for the control plane avoids that. It runs no public apps, and its only open ports are SSH and the webhook endpoint, so its firewall rules are short enough to read at a glance. If you started on a single machine, this split is easy to make once you have more than a couple of apps. [What it actually takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) covers what else that machine needs, such as backups and upgrades.

## Step 7: Test from the outside

You don't know your rules work until you've tested them. From a machine that isn't on your VPN, such as a phone hotspot or a throwaway VPS, scan the control plane:

```bash
nmap -Pn -p- control-plane.example.com
```

You should see SSH, 443 for the webhook proxy, 80 if you use Certbot's HTTP challenge for the hook hostname, and nothing else. Then check the details:

```bash
curl -I https://hooks.example.com/
curl -I http://control-plane.example.com:3000/
curl -I http://control-plane.example.com:4000/
```

The first should return a 404. The other two should time out or be refused. A POST to your project's webhook URL with no signature header should be rejected, and no deployment should show up in the dashboard. Finally, try SSH as root to a deploy server from the same outside machine. It should be refused.

Run these checks again after control plane upgrades, after Docker upgrades, and whenever you change `.env` or the Compose file. The most common way an isolated setup stops being isolated is a binding that quietly goes back to `0.0.0.0`.

## A short checklist

- Nothing on the control plane's public interface except SSH and the webhook proxy.
- `PUSHIFY_API_PORT` and `PUSHIFY_FRONTEND_PORT` bound to localhost or a private address, never left on all interfaces.
- Dashboard and API reachable only through an SSH tunnel, a VPN, or an identity-aware proxy.
- `postgres`, `redis`, and `worker` still with no published ports.
- A provider firewall in front of the host firewall, because Docker bypasses ufw.
- Only `/api/v1/webhooks/` exposed, every project with a webhook secret, and source allowlisting where you can.
- Deploy servers accept root SSH only with a key and only from the control plane.
- An outside scan after every upgrade.

None of this takes long, and most of it you only set up once. Keep host patching going alongside it, as covered in [Automatic security updates on a self-hosted server](/blog/automatic-security-updates-self-hosted-server), and handle app secrets as described in [Environment variables and secrets management](/blog/environment-variables-secrets-management). If some part of the self-hosted setup makes isolation harder than it should be, [open an issue](https://github.com/pushifydev/pushify_backend/issues). If you've found a security vulnerability, please report it privately instead of in a public issue.
