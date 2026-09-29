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

## Logs

The project's **Logs** tab shows build output and the app's output. How long app logs are kept depends on your plan: 3 days on Free, 7 on Hobby, 14 on Pro, 30 on Business. **Download** exports up to 50,000 lines as a text file.

Build and deploy output is kept for 90 days; the latest 10 deployments of each project keep theirs regardless of age.

## Metrics

CPU, memory and network are sampled every 15 seconds and kept for 7 days.
