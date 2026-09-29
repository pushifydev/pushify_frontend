---
title: Monitoring & alerts
description: Uptime checks, health checks, alerts, logs and metrics.
updated: 2026-09-30
---

## Uptime checks

Every deployed app with an address is checked every minute, on every plan. After three failed checks in a row it is marked down, and the team gets an email; another when it recovers.

## Custom health checks

From the Hobby plan up, add a health check with your own endpoint (`/health` by default), interval and timeout. A 2xx or 3xx answer is healthy. With **Restart when down** on, Pushify restarts the app after the failures you set.

## Alerts

Add notification channels to a project — **email**, **Slack**, **Discord** or a **webhook** — for these events:

- a deployment starts, succeeds or fails;
- the app becomes unhealthy, or recovers.

Members with deployment alerts turned on also get emails when:

- memory stays at or above 90% for 5 minutes;
- CPU stays at or above 90% for 15 minutes;
- a server's disk is 85% full (and again at 95%).

## Verifying webhooks

Give a webhook channel a **secret** and every request carries an `X-Pushify-Signature` header: `sha256=` followed by the hex HMAC-SHA256 of the raw request body, keyed with that secret. The body is JSON: `{ "event", "timestamp", "data" }`.

Verify it against the body exactly as received — before parsing it — and compare in constant time. In Node.js (Express):

```js
import crypto from 'node:crypto';
import express from 'express';

const app = express();
const SECRET = process.env.PUSHIFY_WEBHOOK_SECRET;

// express.raw keeps the body as the exact bytes Pushify signed.
app.post('/pushify', express.raw({ type: 'application/json' }), (req, res) => {
  const header = req.get('X-Pushify-Signature') ?? '';
  const expected = 'sha256=' + crypto.createHmac('sha256', SECRET).update(req.body).digest('hex');
  const valid =
    header.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected));
  if (!valid) return res.status(401).end();

  const { event, timestamp, data } = JSON.parse(req.body.toString('utf8'));
  // …handle the event
  res.status(204).end();
});
```

Signing the parsed and re-serialised JSON instead of the raw body will not match.

## Logs

The project's **Logs** tab shows build output and the app's output. How long app logs are kept depends on your plan: 3 days on Free, 7 on Hobby, 14 on Pro, 30 on Business. **Download** exports up to 50,000 lines as a text file.

Build and deploy output is kept for 90 days; the latest 10 deployments of each project keep theirs regardless of age.

## Metrics

CPU, memory and network are sampled every 15 seconds and kept for 7 days.
