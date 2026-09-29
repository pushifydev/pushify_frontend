---
title: Scaling & sleep
description: Run more copies of an app, let CPU load decide how many, or let an idle app sleep.
updated: 2026-09-30
---

## Replicas

Set how many copies of the app run, from 1 to 10, in the project's settings. Traffic is spread across them.

## Autoscaling

On Pro and above, Pushify can choose the number of copies for you, between a minimum and a maximum you set (up to 10):

- It adds a copy when the average CPU across copies stays at or above 70%, and removes one when it stays at or below 30%.
- The average is taken over 5 minutes and checked every minute; nothing changes before there are three readings.
- It changes one copy at a time, and waits 3 minutes after adding and 10 minutes after removing before changing again.

Memory does not drive scaling. A memory alert tells you when an app is short of it. The project's **Scaling** history shows every change.

## Sleep

Turn on **Sleep when idle** to stop an app that nobody uses, and start it again on the next request.

- An app is idle when it has had almost no network traffic for the period you choose, from 5 minutes to a day (30 minutes by default).
- The first request to a sleeping app shows a short "waking up" page that reloads itself; the app is usually back within a few seconds, and Pushify waits up to 30 seconds for it to start.
- A sleeping app is not checked for uptime and is not autoscaled.

Sleep suits demos, staging and side projects. Keep it off for an app that must answer the first request quickly.
