---
title: Zero-downtime deployment for Docker apps: blue-green vs rolling updates
description: How zero-downtime deployment works for self-hosted Docker apps: blue-green vs rolling updates, health checks, and which one fits a single server.
date: 2026-10-30
tags: docker, deployments, self-hosting, nginx, guides
---

Most self-hosted Docker apps go down for a few seconds on every deploy, and most of the time nobody planned it that way. The old container stops, the new one starts, and anything that arrives in between gets an error. Zero-downtime deployment with Docker fixes that gap. The two strategies you'll see most often are **blue-green** and **rolling updates**. They solve the same problem in different ways, and on one VPS that difference matters more than it does in a large cluster.

This post covers where deploy downtime actually comes from, how each strategy removes it, what both of them still need from your app, and which one fits a typical self-hosted setup. If you want a step-by-step walkthrough of the exact pipeline Pushify runs, that's in [From git push to live](/blog/how-zero-downtime-deploys-work). This post is about the strategies behind it.

## Where deploy downtime comes from

Before choosing a strategy, it helps to know which gaps you're closing. On a self-hosted Docker server, downtime during a deploy usually comes from one of these:

- **Stop-then-start.** The old container is removed before the new one is ready. A plain `docker compose up -d` with a changed image does this: Compose recreates the container, so the old one stops before the replacement starts.
- **Slow boot.** The new container is running, but the app inside is still loading config, warming caches, or connecting to the database. The proxy sends traffic anyway and gets connection errors or 502s.
- **Port conflicts.** Two containers can't publish the same host port, so the old one has to go before the new one can bind. People hit this the first time they try to run old and new side by side.
- **Dropped in-flight requests.** The old container gets killed while it's still answering requests, or the proxy is restarted instead of reloaded.
- **A broken release.** The new version crashes on start or fails on its first real request. If the old version is already gone, you're down until you roll back.

A zero-downtime strategy has to handle all five. Starting the new container before stopping the old one only fixes the first.

## Blue-green deployments

Blue-green means running two copies of your app, traditionally called blue and green. One is live. You deploy the new version to the idle one, check that it's healthy, and then switch traffic over in a single step. The old copy stays around, at least for a while, so going back is just another switch.

On a single Docker host, that looks like this:

1. The current version runs in a container, say `myapp-blue`, published on `127.0.0.1:3001`. Nginx proxies to it.
2. You start the new version as `myapp-green` on `127.0.0.1:3002`. Different names and ports, so there's no conflict.
3. You poll a health endpoint on the green container until it answers successfully, or give up after a timeout.
4. If it's healthy, you point Nginx's upstream at port 3002 and reload Nginx. If it isn't, you remove green and blue keeps serving as if nothing happened.
5. After a short grace period, you stop blue.

The switch in step 4 depends on how Nginx handles a reload. When you run `nginx -s reload` or `systemctl reload nginx`, the master process checks the new config, starts new worker processes with it, and tells the old workers to stop accepting new connections and finish the requests they already have. Nothing gets cut off mid-response. A full `restart` doesn't work that way, so use reload.

Here's a minimal sketch. It's meant to show the moving parts, not to be a production deploy tool:

```bash
#!/usr/bin/env bash
set -euo pipefail

IMAGE="myapp:$1"
CURRENT=$(cat /etc/myapp/active 2>/dev/null || echo blue)

if [ "$CURRENT" = blue ]; then NEXT=green; PORT=3002; else NEXT=blue; PORT=3001; fi

# Start the new version next to the old one
docker rm -f "myapp-$NEXT" 2>/dev/null || true
docker run -d --name "myapp-$NEXT" --restart unless-stopped \
  -p "127.0.0.1:${PORT}:3000" "$IMAGE"

# Wait for it to become healthy
healthy=false
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${PORT}/health" > /dev/null; then
    healthy=true
    break
  fi
  sleep 2
done

if [ "$healthy" != true ]; then
  echo "New version never became healthy; keeping $CURRENT"
  docker rm -f "myapp-$NEXT"
  exit 1
fi

# Switch traffic with a graceful reload
echo "server 127.0.0.1:${PORT};" > /etc/nginx/myapp-upstream.inc
nginx -t
systemctl reload nginx
echo "$NEXT" > /etc/myapp/active

# Let the old version finish its in-flight requests, then stop it
sleep 15
docker stop "myapp-$CURRENT" || true
```

The matching Nginx config includes the generated upstream file:

```nginx
upstream myapp {
    include /etc/nginx/myapp-upstream.inc;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://myapp;
    }
}
```

Look at what the script leaves out: build caching, logs, cleaning up old images, HTTPS, deploy history, rollback to anything older than the previous container, and what happens if two deploys run at once. That gap is the reason deploy platforms exist. [What it actually takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) goes through the rest of the list.

### Strengths and costs of blue-green

- **The switch is atomic.** At any moment, all traffic goes to one version. You don't have users bouncing between old and new.
- **Rollback is fast.** If the old container still exists, going back is another proxy reload. If it's been stopped, you start it again from the previous image without rebuilding anything.
- **It works with a single instance.** You don't need replicas or an orchestrator. One server, Docker, and Nginx are enough.
- **It needs headroom.** For a short window, two full copies of the app run at once. If your app uses 1.5 GB of RAM on a 2 GB server, a blue-green deploy will run out of memory. Size the server for two copies, or at least know how much headroom you have.

## Rolling updates

A rolling update assumes you already run several identical replicas behind a load balancer. Instead of switching everything at once, you replace them a few at a time: start a new replica, wait for it to be healthy, take an old one out, and repeat until every replica runs the new version.

On Docker, the built-in way to do this is Swarm mode. A service update can be configured like this:

```bash
docker service update \
  --image myapp:v2 \
  --update-parallelism 1 \
  --update-delay 10s \
  --update-order start-first \
  --update-failure-action rollback \
  myapp
```

`--update-parallelism 1` replaces one replica at a time. `--update-order start-first` starts the new task before stopping the old one, so capacity never drops below the replica count. (The default, `stop-first`, does the opposite.) If the image defines a `HEALTHCHECK`, Swarm waits for the new task to report healthy before moving on. With `--update-failure-action rollback`, a failed update goes back to the previous version automatically.

Kubernetes Deployments use rolling updates by default, controlled by `maxSurge` (how many extra pods can exist during the rollout) and `maxUnavailable` (how many can be missing). It's the same idea with different knobs.

### Strengths and costs of rolling updates

- **Little extra capacity.** You only need room for one or a few extra replicas, not a whole second copy of the app. When you run many replicas, that adds up.
- **Problems surface gradually.** If the new version fails its health check on the first replica, the rollout stops before most users see it.
- **Mixed versions are normal.** For the length of the rollout, some requests go to the old version and some to the new one. Your app, API clients, and frontend assets all have to cope with that.
- **It needs replicas and a load balancer.** With a single instance, a rolling update is just a slower blue-green deploy, or a stop-then-start if the order is wrong.
- **Rollback takes as long as the rollout.** Going back means rolling the old version out across every replica again.

## What both strategies still need from your app

No deploy strategy can make up for an app that isn't ready to be swapped. These requirements apply to blue-green and rolling updates alike.

### A health check that means something

The whole approach depends on knowing when the new version is ready. An endpoint that returns 200 as soon as the HTTP server binds will happily report "healthy" while the app still can't reach its database. A useful health endpoint checks what the app needs to serve a real request, and stays cheap enough to call every couple of seconds. Don't make it depend on third-party APIs you don't control, though, or an outage somewhere else will block your deploys.

### Graceful shutdown

When Docker stops a container, it sends `SIGTERM` to the main process, waits (10 seconds by default), and then sends `SIGKILL`. If your app ignores `SIGTERM`, every stop is a hard kill, and any requests in flight are lost. Handle the signal: stop accepting new connections, finish the current ones, then exit. Also check that your app actually runs as PID 1 or that your entrypoint forwards signals. A shell-form `CMD` in a Dockerfile wraps the process in `/bin/sh -c`, and the shell doesn't pass `SIGTERM` along.

### Database migrations that tolerate two versions

This is the part that catches people. With both strategies, old and new code run at the same time against the same database: briefly with blue-green, for the whole rollout with rolling updates. A migration that renames or drops a column will break the old version while it's still serving.

The usual answer is the expand-and-contract pattern:

1. **Expand.** Add the new column or table, and leave the old one in place. Deploy code that writes to both and can read either.
2. **Migrate the data.** Backfill the new column.
3. **Contract.** Once no running version reads the old column, remove it in a later deploy.

It's more steps than a single migration, but it's the only way a schema change and a zero-downtime deploy can happen together.

### Stateless containers

If sessions, uploads, or job state live in the container's filesystem, a new container doesn't have them. Keep that state in a database, an object store, or a named volume shared between versions, and remember that two containers writing to the same volume at once have to be safe for your app. Long-lived connections such as WebSockets will also drop when the old container stops, so clients should reconnect on their own.

## Which strategy fits a self-hosted Docker app?

For most self-hosted apps, the honest answer is blue-green, or something very close to it.

Choose blue-green when:

- You run one instance of each app, which is the common case on a single VPS.
- You want rollbacks that don't depend on a rebuild.
- You'd rather not run Swarm or Kubernetes just to deploy.
- Your server has room for two copies of the app for a minute or so.

Choose rolling updates when:

- You already run several replicas behind a load balancer, often across more than one server.
- Running a full second copy of every replica would cost real money.
- You're already on Swarm or Kubernetes, where rolling updates come built in.

If you're running one container per app on one server, adding an orchestrator just to get rolling updates usually adds more moving parts than it removes. A single-instance blue-green switch behind a graceful Nginx reload already handles every source of downtime from the first section, as long as your app does its part.

## How Pushify handles it

Pushify follows the blue-green pattern on your server. When a deploy runs:

- The app is built into a Docker image on the target server, from framework detection or your own Dockerfile. A failed build doesn't touch the running app.
- The new container boots alongside the old one.
- It has to pass a health check before it gets any traffic.
- The switch happens through a graceful Nginx reload, so in-flight requests aren't cut off.
- A rollback replays the same steps with the previous image, so there's no rebuild.

This works the same way whether the server is [your own VPS or a managed Hetzner server](/blog/byos-vs-managed-servers). Pushify connects over plain SSH, with no agent, and installs Docker, Nginx, and Certbot if they're missing. Your part is what no platform can do for you: a health endpoint that tells the truth, clean shutdown on `SIGTERM`, migrations that two versions can live with, and enough memory for both containers during the switch.

For the full sequence, step by step, see [From git push to live](/blog/how-zero-downtime-deploys-work). If you want to try it on a real app, [Deploy your first app on Pushify](/blog/deploy-first-app-pushify) walks through the setup.
