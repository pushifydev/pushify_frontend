---
title: Scheduled tasks and background jobs on a self-hosted server
description: How to run scheduled tasks and background jobs on a self-hosted server: cron, worker containers, queues, and jobs that survive deploys.
date: 2026-11-09
tags: self-hosting, docker, background-jobs, cron, guides
---

Most web apps eventually need work that happens outside a request: a nightly report, a cleanup of expired sessions, a welcome email after signup, a slow export. On a self-hosted server, you set up scheduled tasks and background jobs yourself, and the setup has to fit how you deploy. A cron job that works fine with one long-running process can fire twice when a new container starts next to the old one. A worker killed mid-job can leave half-written data behind.

This guide covers the main patterns for both kinds of work on a Docker-based server, the ways each one fails, and how to tell when a job has quietly stopped running. Most of it applies to any VPS. The last section covers Pushify's built-in scheduled tasks and worker processes.

## Two different problems

These two often get lumped together, but different things trigger them:

- **Scheduled tasks** run on a clock. "Every night at 03:15, rebuild the report."
- **Background jobs** run because something happened. A request comes in, the app records a job and returns, and something else runs the job.

In practice the two work together. The scheduler only decides that it's time and enqueues the work, and the worker does it. A scheduler that only enqueues is fast and easy to make safe, and all the slow, retryable work happens in one place.

## Where scheduled tasks can live

There are three common places to put the schedule. Each one is reasonable, and each one fails in its own way.

### Option 1: host cron calling your app over HTTP

The server already has cron. Instead of reaching into a container, cron calls an endpoint on your app:

```bash
#!/bin/sh
# /usr/local/bin/myapp-cron
set -eu
TOKEN=$(cat /etc/myapp/cron-token)
curl -fsS --max-time 30 -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "https://app.example.com/internal/cron/$1"
```

```
# /etc/cron.d/myapp
15 3 * * * root /usr/local/bin/myapp-cron nightly-report
*/5 * * * * root /usr/local/bin/myapp-cron expire-sessions
```

The schedule lives outside the app, so a deploy can't duplicate it, and the name of the current container doesn't matter. `curl -f` exits non-zero on an HTTP error, so failures show up in cron's output.

Get three things right:

- **Protect the endpoint.** It's reachable from the internet, so check the token on every call and compare it in constant time. Keep the token in a root-only file on the host and in the app's environment, never in the crontab. [Managing environment variables and secrets](/blog/environment-variables-secrets-management) covers the app side.
- **Return fast.** Nginx's default `proxy_read_timeout` is 60 seconds. Have the endpoint enqueue a job and return `202` instead of doing the work inside the request.
- **Check the timezone.** Cron uses the server's timezone. Run `timedatectl` once so you know whether 03:15 means UTC.

### Option 2: a scheduler inside the app process

Most frameworks have a library that runs a cron-style scheduler inside your web process. It takes the least setup, and it works until more than one copy of your app is running.

That happens more often than people expect. During a zero-downtime deploy, the new container passes its health check while the old one still serves traffic. For that window, two schedulers are running, and a task that comes due during the overlap can run twice. With several replicas, every task runs once per replica.

If you keep the scheduler in-process, have each run claim its time slot in the database first:

```sql
CREATE TABLE scheduled_runs (
  job_name   text        NOT NULL,
  slot       timestamptz NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (job_name, slot)
);

INSERT INTO scheduled_runs (job_name, slot)
VALUES ('nightly-report', date_trunc('day', now()))
ON CONFLICT DO NOTHING
RETURNING job_name;
```

If the insert returns a row, this process won the slot and runs the task. If it returns nothing, another process already claimed it. You also get a record of when each task actually ran. Postgres advisory locks work too, but with a connection pool they're easier to get wrong.

### Option 3: a dedicated scheduler container

The third option is a small container that runs only a scheduler, built from the same image as your app. Tools like supercronic read a crontab, run commands in the foreground, and log to stdout. That suits containers better than the classic cron daemon does. This keeps scheduling out of the web process, but the catch from option 2 still applies: exactly one of these should be running, deploys included. Keep the slot table as a safety net. It costs one query per run.

A common shortcut is to put `docker exec myapp-web ./manage.py nightly_report` in the host crontab. It works until the container name changes. Some platforms change it on every deploy, and from then on the job fails silently. If you use this pattern, look up the container by label when the job runs, and alert when nothing matches.

## Background jobs: a queue and a worker

For work triggered by events, the pattern is nearly the same everywhere. The request handler writes a job to a queue and returns, and a separate worker takes jobs off the queue and runs them. The web process stays fast, and slow or flaky work like sending email or calling third-party APIs can be retried without anyone waiting on it.

Pushify's own control plane works this way. The open-source install runs an `api` service and a separate `worker` service, with Postgres and Redis alongside them. When a `git push` fires a webhook, the deployment goes into a queue. The webhook request doesn't build it.

### Picking a queue

- **A Redis-backed queue library** such as Sidekiq, BullMQ, RQ, or Celery. These are mature and come with retries and dashboards. The cost is one more stateful service to run and back up.
- **A jobs table in the Postgres you already have.** At modest volumes this is often enough, and your jobs share backups and transactions with the rest of your data.

The core of a Postgres queue is one statement that lets several workers claim jobs without stepping on each other:

```sql
UPDATE jobs
SET status = 'running', started_at = now(), attempts = attempts + 1
WHERE id = (
  SELECT id FROM jobs
  WHERE status = 'queued' AND run_at <= now()
  ORDER BY run_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
RETURNING id, kind, payload;
```

`SKIP LOCKED` makes each worker skip rows that another worker is already claiming. Most languages have libraries that wrap this pattern, so check those before you write your own. There's another benefit: if you insert the job in the same transaction as the data it relates to, you can't end up with an order saved and its confirmation email lost.

### Run the worker as its own container

Build workers from the same image as the web app and start them with a different command. Then you can restart or scale one without touching the other, and a stuck job can't eat memory the web process needs. Workers usually don't serve HTTP, so give them a different health signal. One option is a heartbeat file that the worker touches after each poll, checked by a Docker `HEALTHCHECK`.

## Making jobs survive deploys and restarts

Every deploy stops the old worker, and how it stops decides whether you lose work. Docker sends `SIGTERM` to the main process, waits 10 seconds by default, and then sends `SIGKILL`. A worker should catch `SIGTERM`, stop taking new jobs, finish the current one if it can, and exit:

```js
let shuttingDown = false;
process.on('SIGTERM', () => { shuttingDown = true; });

while (!shuttingDown) {
  const job = await claimNextJob();
  if (!job) { await sleep(1000); continue; }
  await runJob(job);
}
await db.end();
```

Two details often get missed:

- **The signal has to reach your process.** With the shell form (`CMD node worker.js`), the main process is a shell, and it may not forward `SIGTERM`. Use the exec form, `CMD ["node", "worker.js"]`, or a small init such as `tini`.
- **Some jobs won't finish in time.** A job that was claimed but never finished should become available again. Run a periodic sweep that resets `running` jobs whose `started_at` is older than your longest expected run.

That leads to the most important rule: **assume every job can run more than once.** Most queues deliver at least once, and a crash between doing the work and marking it done will repeat the work. Use idempotency keys when you call payment or email APIs, write results with upserts, and check whether the work is already done before you do it.

Schema changes need care too. During a deploy, old workers can briefly run against a migrated database, and new workers can pick up jobs that old code enqueued. Keep job payloads small and versioned, and keep migrations backward-compatible for at least one release.

## Knowing when jobs stop running

Loud failures aren't the main risk. The bigger risk is a task that stops running and nobody notices for three weeks, because a job that never starts logs nothing.

- **A dead man's switch.** At the end of each successful run, ping a check URL on a service such as Healthchecks.io, which you can also self-host. If the ping doesn't arrive on schedule, you get an alert. Nothing else in this list catches a task that never ran.
- **Logs to stdout.** Log the job name, duration, and outcome, so the entries land wherever your container logs go. [Shipping Docker logs to Loki or Datadog](/blog/ship-docker-logs-loki-datadog-vector) covers that pipeline.
- **Queue age.** Alert when the oldest queued job is more than a few minutes old. A growing queue means workers are down or too slow.
- **Retries that give up.** Retry with backoff, then move the job to a visible `failed` state that you can replay by hand.

[Backing up Docker volumes with alerts](/blog/docker-volume-backup-alerts) applies the same idea to one particular scheduled task.

## Doing this with Pushify

Pushify deploys your app as Docker containers on a server it reaches over SSH, with Nginx in front. It has built-in support for both halves of this guide.

### Scheduled tasks

Each project can have scheduled tasks. A task uses a 5-field cron expression, so the smallest interval is one minute. Each task also has an IANA timezone, UTC by default, so you don't depend on the server's clock settings. There are two task types:

- **command** runs a shell command inside your app's container, over SSH on the project's server. It does the job of the `docker exec` pattern without a hardcoded container name.
- **http** sends a GET request to a URL. If you point it at your own app, that endpoint is still public and needs protecting as described in option 1.

Each task has a timeout, 120 seconds by default, and you can disable a task without deleting it. The schedule lives in Pushify, not in your app, so the deploy overlap doesn't create a second schedule. A background worker checks for due tasks every 30 seconds, so a task starts shortly after its scheduled minute, not on the exact second. Keep tasks short. For slow work, have the command enqueue a job and let a worker run it.

Every run is recorded with its status, the exit code or HTTP status, and its output, capped at 8 KB. Run history is kept for 7 days, which is enough to answer "did last night's run fail, and why?" If you want a longer record, or an alert when a task stops reporting, keep the dead man's switch.

Scheduled tasks are also available in the REST API under `/api/v1/projects/:projectId/scheduled-tasks`. It supports list, create, update, and delete. `POST /:taskId/run` runs a task right away, which helps when you're testing a new one, and `GET /:taskId/runs` returns its run history.

### Worker processes

Projects can also have worker processes. These are extra always-on containers built from the project's image and started with a different command. Typical examples are a queue consumer or a dedicated scheduler like the one in option 3. Workers run alongside the project's main app and share its environment variables, volumes, and network. They get no port mapping and no Nginx configuration. Each project has a limit on how many workers it can have.

On each deploy, Pushify starts every enabled worker from the new image as a container named `pushify-<slug>-worker-<name>`, with `--restart unless-stopped`. It also removes the containers of workers that were disabled or deleted. Three things follow from this:

- **Workers are replaced on every deploy.** The `SIGTERM` handling and requeue sweep described above keep a deploy from dropping jobs.
- **A worker failure doesn't fail the app deploy.** Your app can be live while a worker is down. Check `docker ps --filter name=pushify-<slug>-worker-` after a deploy, and let a queue-age alert catch problems the rest of the time.
- **The restart policy covers exits, not hangs.** Docker doesn't restart a container because its health check fails. If a worker can get stuck, have it detect that and exit so the restart policy can take over.

On a server you've [connected yourself](/blog/byos-vs-managed-servers), host cron (option 1) still works. Built-in tasks keep the schedule and its run history next to the project, which is usually simpler.

## A short checklist

1. Keep the schedule in exactly one place, and have it enqueue work instead of doing it.
2. If anything can run twice, whether because of a deploy overlap, replicas, or retries, guard it with a slot claim or an idempotency key.
3. Run workers as their own container, handle `SIGTERM`, and use the exec form of `CMD`.
4. Requeue jobs that were claimed but never finished.
5. Add a dead man's switch for every scheduled task that matters, and alert on queue age.

You don't need a big framework for any of this. A schedule, a jobs table, and a worker that shuts down cleanly will cover most apps for a long time. Plan from the start for any piece to sometimes run twice or not at all.
