---
title: Domains & HTTPS
description: Custom domains with automatic HTTPS, pushify.dev addresses, and buying domains through Pushify.
updated: 2026-09-30
---

## Add a custom domain

1. In the project's **Domains** tab, add the domain.
2. At your DNS provider, create an **A record** pointing to the server's IP address (shown in the dashboard).
3. Press **Verify**. Once the record resolves to the server, Pushify requests a Let's Encrypt certificate and serves the site over HTTPS. Certificates renew on their own.

If `www.example.com` (or the bare domain) also points to the server, it is added alongside. How many custom domains you can add depends on your plan ([limits](/docs/billing#limits-per-plan)).

## pushify.dev addresses

Apps and static sites on Pushify's shared hosting get `https://<name>.pushify.dev` automatically. On your own server, an app without a domain is served at `http://<server-ip>:<port>` until you add one.

## Buy a domain

**Domains → Buy** searches and registers domains through Pushify (registrar: Name.com), for 1 to 5 years, paid from your balance or by card. The price is shown before you buy.

- **Auto-renew** is on by default and renews a year at a time from your balance, within 30 days of expiry. With it off, you get a reminder before the domain expires.
- **DNS:** manage A, AAAA, CNAME, MX, TXT, SRV and NS records, or change nameservers.
- **Email forwarding:** forward `you@yourdomain` to another address.
- **Attach to a project:** creates the records that point the domain at the project's server.

## Transfers

- **In:** start a transfer with the domain's auth code from your current registrar. It is paid from your balance.
- **Out:** get the auth code from the domain's page and give it to the new registrar.
