---
title: Connect your VPS to a self-hosted PaaS: SSH keys, firewalls and a zero-downtime deploy
description: Connect a VPS to a self-hosted PaaS safely: a dedicated SSH key, a firewall Docker can't bypass, and a first zero-downtime deploy you can watch.
date: 2026-11-13
tags: self-hosting, vps, ssh, security, guides
---

Connecting a VPS to a self-hosted PaaS only takes a few minutes. The setup around it takes a little longer. You need to decide which key the platform uses and which ports the server exposes, and you need a way to check that a deploy doesn't drop traffic. This guide covers those three things in order, using Pushify as the example. Most of it applies to any platform that manages servers over SSH.

It's written for a fresh Debian or Ubuntu VPS from any provider. If you haven't decided between your own server and a managed one yet, read [BYOS vs managed](/blog/byos-vs-managed-servers) first. This post assumes you're using your own.

## What the platform needs from your server

It helps to know exactly what you're granting before you grant it.

Pushify connects to servers over plain SSH, as root, using either a password or a private key. No agent runs on the server. When you add a server, Pushify checks for Docker, Nginx, and Certbot and installs whichever ones are missing. Docker comes from the official convenience script. Nginx and Certbot come from `apt-get`, or from `yum` on distributions without apt. If Docker is already installed, Pushify leaves that install alone.

So before you connect it, the server needs three things:

- A root SSH login that accepts the credential you'll give Pushify.
- An open SSH port that the control plane can reach.
- Outbound internet access, so the missing packages can be downloaded.

Root access over SSH is a lot of trust, because whoever holds the credential can do anything on the machine. The next two steps make that credential dedicated, key-based, and easy to revoke.

## Step 1: Create a dedicated SSH key

Don't give the platform the key you use from your laptop. Create a separate key pair just for this. Then, if you ever need to cut off access, you remove one line on the server and nothing else breaks.

On your own machine:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/pushify_deploy -C "pushify-deploy"
```

This creates two files. `~/.ssh/pushify_deploy` is the private key, which you'll give to Pushify. `~/.ssh/pushify_deploy.pub` is the public key, which goes on the server. Keys that machines use without a person present usually have no passphrase, which is one more reason to keep this one dedicated and easy to revoke.

Install the public key for root on the VPS:

```bash
ssh-copy-id -i ~/.ssh/pushify_deploy.pub root@203.0.113.10
```

Replace `203.0.113.10` with your server's address. Many providers also let you attach a public key when you create the server, which has the same effect.

Then test the key. You can check what's already installed in the same command:

```bash
ssh -i ~/.ssh/pushify_deploy root@203.0.113.10 'docker --version; nginx -v; certbot --version'
```

If you get in without a password prompt, the key works. Any tool that isn't installed shows up as "command not found". That's fine, because Pushify will install it.

## Step 2: Turn off password logins

A root account that accepts passwords starts getting brute-force attempts within minutes of going online. Once key login works, turn passwords off.

Keep your current SSH session open while you do this, so a mistake doesn't lock you out. Create a drop-in file:

```bash
sudo tee /etc/ssh/sshd_config.d/10-hardening.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
EOF
```

With `PermitRootLogin prohibit-password`, root can still log in with a key, which is what Pushify needs, but root passwords are refused. Test the config, then reload SSH:

```bash
sudo sshd -t && sudo systemctl reload ssh
```

On some distributions the service is called `sshd` instead of `ssh`. Open a second terminal and log in with the key again before you close the first session.

This has one consequence for the next steps. With passwords off, you need to choose private key authentication when you add the server to Pushify. The password option won't work on this server anymore, which is what you want.

To revoke the platform's access later, delete the line that ends in `pushify-deploy` from `/root/.ssh/authorized_keys`. The comment you set with `-C` makes it easy to find.

## Step 3: Firewall basics

A deployment server only needs a few open ports:

- **22** for SSH, from you and from the control plane.
- **80 and 443** for your apps, which Nginx serves. Port 80 also matters for certificates, because Certbot's most common challenge type is answered over plain HTTP.

Close every other inbound port.

### Start with the provider firewall

Most VPS providers, Hetzner included, offer a network firewall that filters traffic before it reaches the machine. Make it your main layer, because of how Docker works. When Docker publishes a container port, it writes its own iptables rules, and those rules are checked before ufw's. So `ufw deny` won't block a port that Docker has published, and `ufw status` won't show you the gap. A provider firewall sits outside the machine, so Docker can't get around it. The [admin panel network isolation guide](/blog/admin-panel-security-network-isolation) covers this in more detail.

A reasonable set of inbound rules:

1. Allow TCP 22 from your own IP address and from addresses you know the control plane connects from.
2. Allow TCP 80 and 443 from anywhere.
3. Drop everything else.

Leave outbound traffic open, at least during setup. The Docker convenience script and the package installs download from the internet. If you do restrict outbound traffic, allow HTTPS to the package sources, or the installs will fail.

### Restricting SSH to known addresses

Limiting port 22 to known addresses cuts out most of the noise on SSH. It also makes a leaked key much less useful to anyone else. The catch is that you have to know every address that legitimately connects.

If you [self-host Pushify](/blog/pushify-is-now-open-source), you know the control plane's address. Allow that and your own address, and nothing else.

If you aren't sure which addresses the control plane connects from, don't guess. If you limit port 22 to your own IP alone, you'll block the platform too. Keep port 22 open to the internet and rely on the key-only authentication from Step 2. That's a solid baseline on its own.

### ufw as a second layer

A host firewall is still useful for anything Docker doesn't manage. Allow SSH before you enable it, or you'll cut off your own session:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Check from the outside

Until you test your rules, you're only guessing. From a machine other than the server, check which ports answer:

```bash
nc -zv -w 3 203.0.113.10 22 80 443 3000 5432
```

You want 22, 80, and 443 to connect and everything else to time out. Ports 80 and 443 may refuse connections until Nginx is installed. Run the check again after you've deployed a few apps, in case something got published that shouldn't have.

## Step 4: Connect the server

Now add the server in Pushify. Give it the server's IP address, the user `root`, and the contents of `~/.ssh/pushify_deploy`, which is the private key file. Pushify connects, runs its checks, and installs Docker, Nginx, and Certbot if they're missing.

If the connection fails, the cause is almost always one of these:

- Your firewall rules don't allow port 22 from the address the control plane connects from.
- The public key isn't in `/root/.ssh/authorized_keys`, or you pasted the public key where the private key belongs.
- Outbound traffic is blocked, so the installs can't download anything.

Once it connects, SSH in yourself and run `docker --version` and `systemctl status nginx` to see what's on the machine now. Keeping those components patched is your job from here on. [Automatic security updates without breaking your apps](/blog/automatic-security-updates-self-hosted-server) shows which updates to run unattended and which to schedule.

## Step 5: Your first zero-downtime deploy

With the server connected, you follow the normal flow: connect the repository, choose this server, and push. [Deploy your first app](/blog/deploy-first-app-pushify) walks through it, and there are framework-specific guides for [Next.js](/blog/deploy-nextjs) and [Django](/blog/deploy-django).

Here's what happens on your VPS when you push:

1. A `git push` to your production branch fires a webhook and queues a deployment.
2. The app is built into a Docker image on the server, using framework detection or your own Dockerfile.
3. The new container starts next to the old one. It has to pass a health check before it gets any traffic.
4. Traffic switches over with a graceful Nginx reload.

On the first deploy there's no old container to keep serving, so it can't show you much. The second deploy is the one that tells you whether zero downtime actually works for your app. [From git push to live](/blog/how-zero-downtime-deploys-work) explains how it works in more depth.

### Watch it happen

Don't just trust the cutover. Once the first deploy is live, start a loop that requests the app twice a second:

```bash
while true; do
  curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" https://app.example.com/
  sleep 0.5
done
```

Leave it running, make a small visible change, and push it. While the new image builds and the new container starts, the loop should keep printing `200`, and after the switch the new version should answer. If you see `502` or connection errors partway through, the cause is usually in the app. Either it reports healthy before it can actually serve requests, or it does slow work like migrations or cache warm-up after it starts accepting connections. Fix the startup order in the app and run the test again.

While the loop is running, try a rollback the same way. A rollback replays the same steps with the previous image, so it should be just as smooth. Better to find out now than during an incident.

## A short checklist

- A dedicated ed25519 key for the platform, installed only for root on this server.
- Password authentication off and root login limited to keys.
- Provider firewall with 22 open only to known addresses where you can, 80 and 443 open to anywhere, and everything else dropped.
- ufw as a second layer, keeping in mind that ports Docker publishes bypass it.
- An outside port check after setup, and again after a few deploys.
- One deploy and one rollback done with a request loop running.

You now have a server you can give a deployment platform without wondering what it exposes. Next, set up [environment variables and secrets](/blog/environment-variables-secrets-management) and [backups for any Docker volumes](/blog/docker-volume-backup-alerts) your apps use.
