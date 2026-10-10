---
title: Cloudflare proxy for a self-hosted app: DNS, SSL modes, and common pitfalls
description: Put a Cloudflare proxy in front of your self-hosted app without redirect loops or broken certificates: DNS records, SSL modes, and fixes.
date: 2026-10-10
tags: cloudflare, dns, ssl, self-hosting, guides
---

Putting a Cloudflare proxy in front of a self-hosted app is one of the most common things people do once their first deploy works. You get a CDN for static assets and DDoS protection, and your server's IP no longer shows up in public DNS. You also get a second layer of TLS and a second set of redirects, and that's where most of the problems start.

This guide goes through the setup in order: DNS records, which SSL mode to pick, certificates on the origin, and the pitfalls that usually show up in the first week. The examples assume a typical self-hosted setup, where Nginx on your server terminates HTTPS and proxies requests to your app's container. That's how Pushify deploys apps, whether the server is [your own VPS or a managed Hetzner box](/blog/byos-vs-managed-servers). Most of the guide applies to any reverse proxy on any VPS.

## How the request path changes

Without Cloudflare, a browser resolves your domain to your server's IP and talks to Nginx directly:

```
browser  --HTTPS-->  your server (Nginx)  -->  app container
```

With the proxy on (the orange cloud in the Cloudflare dashboard), DNS returns Cloudflare's IPs instead. The browser connects to Cloudflare, and Cloudflare opens its own connection to your server:

```
browser  --HTTPS-->  Cloudflare edge  --HTTP or HTTPS-->  your server (Nginx)  -->  app container
```

That gives you two connections, each with its own TLS settings. The browser-to-Cloudflare leg uses Cloudflare's certificate, which Cloudflare manages for you. The Cloudflare-to-origin leg depends on the **SSL/TLS encryption mode** you choose and on the certificate your server has. Nearly every Cloudflare problem on a self-hosted app happens because these two legs don't agree.

## Step 1: Get the app working without the proxy first

Before you turn on the orange cloud, make sure the app works over plain DNS:

1. Add your domain to Cloudflare and switch your registrar's nameservers to the ones Cloudflare gives you.
2. Create an `A` record pointing to your server's IPv4 address, and set it to **DNS only** (grey cloud). If you'll use both `www` and the apex domain, create both records the same way.
3. Add the domain to your app on the server side. On Pushify, that means adding the custom domain to the project.
4. Wait until the origin has a valid certificate and `https://your-domain` loads in a browser.

With a grey cloud, Cloudflare is only your DNS provider. Traffic goes straight to your server, so anything broken at this stage is a server problem, not a Cloudflare one. Keeping the two layers apart makes debugging much easier.

### Why the grey cloud matters for certificates on Pushify

On Pushify this order is required, for two reasons.

First, Pushify gets Let's Encrypt certificates with Certbot using the **HTTP-01 challenge** only. It tries the Certbot Nginx plugin first, then webroot (every port-80 block Pushify generates serves `/var/www/letsencrypt` for this), and then Certbot's standalone mode. There's no DNS-01 path for custom-domain certificates. That means Let's Encrypt has to reach your server over HTTP on port 80 to validate the domain.

Second, before requesting a certificate, Pushify checks that the domain's `A` record resolves to the server's public IPv4 address. If it doesn't, Pushify skips SSL for that domain and logs a message like this:

```
your-domain.com does not point to this server yet (A record → <ip>) — SSL skipped
```

The `www` or apex counterpart gets the same check before it's added to the certificate.

A proxied record resolves to Cloudflare's IPs, not your server's, so this check fails when the record is orange-clouded. No certificate gets requested. If that log line shows a Cloudflare IP, the record is proxied. Switch it to grey and move on only once HTTPS works on the origin.

## Step 2: Pick the right SSL mode

Under **SSL/TLS > Overview**, Cloudflare offers these modes for the Cloudflare-to-origin leg:

- **Off**: no HTTPS at all. Don't use it.
- **Flexible**: HTTPS from the browser to Cloudflare, plain HTTP on port 80 from Cloudflare to the origin.
- **Full**: Cloudflare connects to the origin over HTTPS but accepts any certificate, including self-signed or expired ones.
- **Full (strict)**: Cloudflare connects over HTTPS and requires a valid certificate that matches the hostname. That can be one from a public CA such as Let's Encrypt, or a Cloudflare Origin CA certificate.

If your server already has a valid Let's Encrypt certificate, use **Full (strict)**. It's the only mode where both legs are encrypted and verified.

**Flexible** looks convenient because it works without any certificate on the server, but it has two problems. Traffic between Cloudflare and your server crosses the public internet unencrypted, even though the browser shows a padlock. It's also the most common cause of redirect loops, which are covered below.

**Full** is better than Flexible, but it still doesn't verify who Cloudflare is talking to. Use it as a short step while you sort out a certificate, not as the final setting.

The mode applies to the whole zone by default. A Configuration Rule can override it for a single hostname.

## Step 3: Turn on the proxy

Once the site works with a grey cloud and the SSL mode is **Full (strict)**, switch the record to **Proxied**. Give it a few minutes, then check:

```bash
# Should now return Cloudflare IPs, not your server's IP
dig +short your-domain.com

# Response headers should include "server: cloudflare" and a "cf-ray" header
curl -sI https://your-domain.com
```

If both look right, the proxy is in place. Then push a new deploy and check again that the site still loads over HTTPS, so you know the setup survives a deploy too.

## Common pitfalls

### Redirect loops (ERR_TOO_MANY_REDIRECTS)

This is the classic one. It happens when the SSL mode is **Flexible** and the origin redirects HTTP to HTTPS:

1. The browser requests `https://your-domain.com` from Cloudflare.
2. In Flexible mode, Cloudflare asks your origin for `http://your-domain.com`.
3. Nginx on the origin sees a plain HTTP request and redirects to `https://`.
4. Cloudflare passes that redirect to the browser, which requests the HTTPS URL again, and you're back at step 1.

On Pushify, step 3 is the default once a custom domain has a certificate. The generated port-80 block returns a `301` to `https://<domain>` for the domain and its `www`/apex alias, and still answers ACME challenges. So a Pushify app with a certificate will loop in Flexible mode. The fix is to stop using Flexible. Switch to **Full (strict)** so Cloudflare talks to the origin over HTTPS and the origin has no reason to redirect.

There's a subtler version of this trap. If you turn on the proxy before the certificate exists, Pushify's DNS check fails, no certificate is issued, and the app is served over plain HTTP on port 80 with no redirect. Flexible then seems to work, and Full (strict) fails because the origin has no certificate. Don't stop there. Go back to Step 1, get the certificate with a grey cloud, then switch to Full (strict).

Loops can also come from the app itself. Some frameworks force HTTPS based on the scheme they see, and the request reaches the container from Nginx over plain HTTP. If you see loops in Full (strict), check whether your app issues its own redirects.

### Certificate renewal behind the proxy

Let's Encrypt certificates last 90 days, and a successful first issuance with a grey cloud tells you nothing about renewal behind the proxy. Once the proxy is on, the HTTP-01 validation request goes through Cloudflare before it reaches the challenge path on your origin. Cloudflare settings such as **Always Use HTTPS**, or a firewall rule that blocks unknown bots, can get in the way.

Don't wait two months to find out. Run a dry run on the server:

```bash
certbot renew --dry-run
```

If it passes with the proxy on, renewal will work too. If it fails, the error message usually points to the cause: a redirect, a block, or a challenge file that wasn't found.

### Let's Encrypt or an Origin CA certificate

Cloudflare can issue an **Origin CA certificate** for your origin (SSL/TLS > Origin Server). It can be valid for up to 15 years and works with Full (strict). The catch is that only Cloudflare trusts it. If you ever turn the proxy off, browsers will reject it.

For most self-hosted setups, a Let's Encrypt certificate that renews automatically is the better default, because the site keeps working whether the proxy is on or off. An Origin CA certificate is a manual install outside your platform's own certificate handling, so you have to keep track of how it's wired into Nginx yourself.

### Every visitor has the same IP

Behind the proxy, every request to your origin comes from a Cloudflare IP. Your logs, your rate limiter, and any "last login from" feature will see Cloudflare instead of the real visitor.

Cloudflare puts the visitor's IP in the `CF-Connecting-IP` request header and also appends it to `X-Forwarded-For`. Nginx forwards request headers to the upstream by default, so your app can usually read the header directly. For example, in an Express app:

```js
app.get('/whoami', (req, res) => {
  const ip = req.headers['cf-connecting-ip'] || req.ip;
  res.json({ ip });
});
```

Only trust this header if requests can't reach your origin without going through Cloudflare. Anyone who connects straight to your server's IP can set `CF-Connecting-IP` to whatever they want.

### The origin is still reachable directly

The orange cloud keeps your IP out of DNS, but that doesn't make it secret. Old DNS records, certificate transparency logs from before you turned on the proxy, and email headers can all give it away. Anyone with the IP can skip Cloudflare entirely.

To close that gap, allow ports 80 and 443 only from [Cloudflare's published IP ranges](https://www.cloudflare.com/ips/), either in your provider's firewall or with `ufw`/`iptables` on the server. Keep these in mind when you do:

- **Leave SSH open** to the IPs that need it. Pushify connects to servers over SSH to deploy, so blocking port 22 for the control plane blocks your deploys.
- **Every domain on that server has to go through Cloudflare afterwards.** If a domain on the same machine isn't proxied, it stops working once 80 and 443 are restricted.
- **New domains need a plan.** Pushify issues certificates over HTTP-01 after checking that the record points at the server, which requires a grey-cloud record that reaches port 80 directly. With 80 locked to Cloudflare, open it temporarily while you add a new domain, or validation can't reach the server.

### SSH, databases, and other non-HTTP traffic

The proxy only handles HTTP and HTTPS on a fixed set of ports. Port 22 isn't one of them, and neither are database ports. If you use a hostname like `server.your-domain.com` to SSH in, or to connect your server to a deploy platform, keep that record **DNS only**. A proxied record pointed at port 22 will just time out. The same goes for `MX` records and the hostnames they point to.

### Large uploads and long requests

Cloudflare limits request body size (100 MB on the Free and Pro plans). It also closes the connection when the origin takes too long to respond, and the browser gets a `524` error even though the request may still be running on your server. If your app accepts large uploads or has endpoints that run for minutes, move that work to a background job or serve it from a hostname that isn't proxied. Check Cloudflare's docs for the current limits on your plan.

### Caching the wrong things

By default, Cloudflare caches static files by extension (images, CSS, JavaScript, fonts) and doesn't cache HTML or API responses. That's a safe default for most apps.

The risk comes when you add a "cache everything" rule to speed things up. If a page differs per logged-in user and the response doesn't send `Cache-Control: private` or `no-store`, one user's page can get served to another. Only cache HTML on paths you know are the same for everyone, and keep API routes out of cache rules.

The opposite problem is stale assets after a deploy. Frameworks that put a content hash in asset filenames, as Next.js does, avoid this on their own. Otherwise, purge the cache after each deploy.

### Features that rewrite your pages

Some Cloudflare features change your HTML or JavaScript on the way through. Rocket Loader, for example, changes how scripts load, and it's a known cause of hydration errors and broken scripts in single-page apps. If something works with the proxy off and breaks with it on, and the SSL mode is correct, turn these optimizations off and test again.

### HSTS you can't take back

Cloudflare can send an HSTS header for you. Once a browser sees it, that browser refuses plain HTTP for your domain for as long as `max-age` says, even if you remove the header or turn the proxy off. Turn it on only after HTTPS works reliably on every subdomain it covers, and start with a short `max-age`.

## What doesn't change

On Pushify, a new container still boots next to the old one, passes a health check, and takes traffic through a graceful Nginx reload, as described in [From git push to live](/blog/how-zero-downtime-deploys-work). Cloudflare keeps talking to the same Nginx, so it never sees the cutover.

## A short checklist

1. Add the domain with a grey cloud and confirm HTTPS works on the origin. On Pushify, a "does not point to this server yet" log line means the record is wrong or proxied.
2. Set the SSL mode to **Full (strict)**. Flexible will loop on the origin's redirect.
3. Turn on the proxy, check for `cf-ray`, and recheck after your next deploy.
4. Run `certbot renew --dry-run` with the proxy on.
5. Read the visitor IP from `CF-Connecting-IP`, and restrict 80 and 443 to Cloudflare's ranges while leaving SSH open.
6. Keep SSH and other non-HTTP hostnames as DNS only.
7. Be deliberate about caching HTML, and test with Rocket Loader off if something breaks.

If you hit a Cloudflare setup that doesn't work well with Pushify, [open an issue](https://github.com/pushifydev/pushify_backend/issues). Real setups are the best way for us to find the edge cases.
