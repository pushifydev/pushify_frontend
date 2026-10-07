---
title: Servers
description: Bring your own server over SSH, or rent a managed Hetzner server billed by the hour.
updated: 2026-09-30
---

## Your own server

Connected over SSH as `root` — see [Getting started](/docs/getting-started#connect-your-own-server). Free includes one; paid plans more ([limits](/docs/billing#limits-per-plan)). Pushify never charges for a server you own.

## Managed servers

On a paid plan, **Servers → New server** can create a Hetzner server for you. You do not need a Hetzner account: the server is billed hourly from your [prepaid balance](/docs/billing#managed-servers-and-the-balance).

- **Regions** are the Hetzner locations with stock for your plan's sizes, read live from Hetzner.
- **Sizes** go up to 2 vCPU / 4 GB on Hobby, 4 vCPU / 8 GB on Pro and 8 vCPU / 16 GB on Business. The exact prices are on the [pricing page](/pricing).
- **Nano** (1 vCPU / 1 GB) is offered on every paid plan when Hetzner has no cheaper 2 GB server in stock. It comes with 2 GB of swap, since apps are built on the server; large builds can be slow.
- A managed server comes with a firewall that allows SSH, HTTP and HTTPS, plus Docker, nginx and certbot.

## Power, resize and snapshots

For managed servers:

- **Start, stop and reboot** from the server page. Starting needs 72 hours of the server's price in your balance.
- **Resize** to a larger type; the disk grows with it.
- **Snapshots:** take one by hand while the server runs, or turn on weekly automatic snapshots. Hobby keeps 2 per server, Pro 5, Business 10. At the limit, a new snapshot is refused until you delete one; automatic snapshots replace the oldest automatic one. Restore puts the server back to a snapshot.

## Access

- **Terminal:** the server page has a web terminal (owners and admins, while the server runs).
- **SSH key:** owners and admins can download the private key and connect with `ssh -i pushify_<name>.pem root@<ip>`.

## Deleting a server

- **Managed:** the server is deleted at Hetzner, with its snapshots.
- **Your own:** Pushify removes its SSH key from the server. If the server cannot be reached, the dashboard shows a one-line command to run yourself. Your apps keep running. To remove everything else Pushify added, use the [uninstall script](/security).
