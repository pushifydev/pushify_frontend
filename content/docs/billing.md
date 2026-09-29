---
title: Billing & credits
description: Two separate charges — the platform plan, and a prepaid balance for managed servers.
updated: 2026-09-30
---

## Two bills

- **The platform plan** sets your limits (projects, deploys, team, domains). It is billed monthly or yearly through Stripe; yearly is 20% cheaper. Current prices are on the [pricing page](/pricing).
- **Infrastructure credits** are a prepaid USD balance for managed Hetzner servers. Servers you connect over SSH never touch it.

## Limits per plan

These are the limits Pushify enforces:

| | Free | Hobby | Pro | Business |
|---|---|---|---|---|
| Projects | 2 | 5 | 15 | 50 |
| Servers | 1 (your own) | 1 | 3 | 8 |
| Databases | 1 | 1 | 3 | 10 |
| Deploys per month | 30 | 150 | 750 | 3,000 |
| Team members | 1 | 2 | 5 | 15 |
| Custom domains | 1 | 2 | 10 | 25 |
| Log retention | 3 days | 7 days | 14 days | 30 days |
| Most frequent database backup | 24 h | 12 h | 6 h | 1 h |
| Preview deployments | — | Yes | Yes | Yes |
| Custom health checks | — | Yes | Yes | Yes |
| Autoscaling | — | — | Yes | Yes |
| API requests per minute | 60 | 120 | 300 | 600 |

Enterprise has no fixed limits; log retention is 90 days.

## Managed servers and the balance

- Managed servers are available on paid plans. The largest size per plan: Hobby 2 vCPU / 4 GB, Pro 4 vCPU / 8 GB, Business 8 vCPU / 16 GB.
- Top up in **Billing** with $25, $50, $100, $250 or $500.
- A server is charged hourly from the balance, prorated from its monthly price, while it runs.
- Creating a server needs about one month of its price in the balance; starting a stopped one needs 72 hours.
- You get an email when the balance runs low. When it cannot cover the next hour, the server is powered off. Topping up does not start it again — press **Start**.
- A server left off for non-payment is deleted after 30 days, with warning emails on day 14 and day 27.

## Included credit

Paid plans include monthly credit for managed servers: **$9** on Hobby, **$18** on Pro, **$45** on Business.

- It is spent before your balance, on servers only (not domains).
- It does not roll over. Yearly plans get it every month, from the renewal day.
- Upgrading adds the difference, prorated for the rest of the period. Downgrading takes nothing back.
- It ends when the subscription ends.

## Changing and cancelling a plan

- **Upgrades** apply immediately; the difference is charged prorated.
- **Downgrades** and switching between monthly and yearly take effect at the end of the period, with no proration. You can cancel a scheduled change in Billing.
- **Cancelling** keeps the plan until the period ends. Then the organization moves to Free: managed servers are powered off and projects are paused. Nothing is deleted.
- **A failed payment** blocks creating and deploying until the card is updated; it clears on its own once Stripe collects the payment.

Invoices, with PDFs, are in **Billing → Invoices**. The [refund policy](/refund) covers refunds.
