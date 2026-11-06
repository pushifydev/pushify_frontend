---
title: Ship Docker logs to Loki with Vector (or Datadog) on a self-hosted server
description: Ship Docker logs to Loki with Vector on a self-hosted server, or send them to Datadog instead: one small config, JSON parsing, and buffering.
date: 2026-11-06
tags: self-hosting, docker, logging, observability, guides
---

If your apps run as Docker containers on a server you manage, their logs sit on that server until you go and read them. That works when you have one app and plenty of time. It stops working when something breaks at night, or when the container that had the error has already been replaced by a new deploy. This guide shows how to ship Docker logs to Loki with Vector. Vector is a small, open-source log agent that reads container output from Docker and forwards it. It also shows how to send the same logs to Datadog by swapping one block of config.

It's written for servers you have shell access to, such as a VPS you've connected to Pushify as [your own server](/blog/byos-vs-managed-servers). Nothing in it is specific to Pushify, so it works on any Docker host.

## Why Vector, and where it fits

On a Pushify server, your app is built into a Docker image on the target server and runs there as a container. Whatever it writes to stdout and stderr ends up with the Docker daemon, which is what `docker logs` reads. Pushify connects over plain SSH and installs no agent, so it doesn't collect or forward those logs anywhere for you. Shipping them off the machine is a choice you make for your own server, the same as backups and OS updates.

Vector suits this setup for a few reasons:

- It reads container logs straight from the Docker API, so you don't need to change how your apps log.
- It has sinks for Loki, Datadog, and many other destinations. Switching destinations is a config change, not a new agent.
- It runs as a single container with one config file.
- It only makes outbound connections, so you don't open any new ports on the server.

The rest of this guide sets Vector up in three parts. First a source that reads Docker logs, then a transform that tidies them up, then a sink that sends them somewhere.

## Step 1: Check what Docker is doing with logs today

Before adding anything, see how your containers log now:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}'
docker inspect --format '{{.Name}} {{.HostConfig.LogConfig}}' $(docker ps -q)
```

The first command shows container names as they really appear on your server. You'll use them later for filtering and labels, so look at them now instead of guessing. The second command shows each container's logging driver and options.

A simple test covers most cases. If `docker logs <container>` shows output for a container, Vector's Docker source can read that container too, because both use the same Docker API.

While you're here, check whether the logs are rotated. With the default `json-file` driver and no `max-size` option, a chatty container can slowly fill the disk. Shipping logs elsewhere doesn't fix that, because Docker still keeps its own copy. If you want rotation by default, set it in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

There are two things to know about this change. It only applies to containers created after it, and it needs a Docker daemon restart. A daemon restart stops running containers, as [Automatic security updates on a self-hosted server](/blog/automatic-security-updates-self-hosted-server) explains, so do it in a quiet window.

## Step 2: Write the Vector config

Create a directory for the config and for Vector's local data:

```bash
sudo mkdir -p /etc/vector /var/lib/vector
```

Here's a starting `/etc/vector/vector.yaml` with a source and a transform. The sink comes in the next step.

```yaml
data_dir: /var/lib/vector

sources:
  docker:
    type: docker_logs
    exclude_containers:
      - vector

transforms:
  app_logs:
    type: remap
    inputs:
      - docker
    source: |
      structured, err = parse_json(.message)
      if err == null && is_object(structured) {
        . = merge(., object!(structured))
      }
      del(.label)
```

What each part does:

- **`docker_logs` source.** It connects to the Docker socket and reads the output of every running container, plus new containers as they start. Each event carries fields like `message`, `container_name`, `container_id`, `image`, `stream` (stdout or stderr), and `host`. `exclude_containers` matches on name prefixes, and leaving out Vector's own container keeps it from shipping its own output in a loop.
- **`remap` transform.** It's written in VRL, Vector's small transformation language. If a line is JSON, which is what most structured loggers produce, its fields get merged into the event so you can filter on them later. Plain-text lines pass through unchanged. `del(.label)` drops the map of Docker labels, which is usually noise. Remove that line if you rely on labels.

If you want to cut volume, this is also the place to drop noisy lines. For example, if your app logs every health check request, you can filter those out before they cost you anything:

```yaml
  drop_health_checks:
    type: filter
    inputs:
      - app_logs
    condition: '!contains(string!(.message), "/health")'
```

Change the path to whatever your app's health endpoint is, and point the sink at `drop_health_checks` instead of `app_logs`.

## Step 3a: Send logs to Grafana Loki

Add a `loki` sink to the same file:

```yaml
sinks:
  loki:
    type: loki
    inputs:
      - app_logs
    endpoint: "${LOKI_ENDPOINT}"
    auth:
      strategy: basic
      user: "${LOKI_USER}"
      password: "${LOKI_PASSWORD}"
    encoding:
      codec: json
    labels:
      host: "{{ host }}"
      container: "{{ container_name }}"
      stream: "{{ stream }}"
    buffer:
      type: disk
      max_size: 268435488
      when_full: block
```

`endpoint` is the base URL of your Loki instance. Vector adds the push path itself. With Grafana Cloud, the user is your Loki instance ID and the password is an access token. If you run Loki yourself without authentication, remove the `auth` block, but only do that on a private network.

Labels are where most Loki setups go wrong. Loki indexes labels, not log content, and every unique combination of label values creates a separate stream. Keep labels to a small set of values that rarely change, such as host, container, and stream. Don't use container IDs, request IDs, user IDs, or anything else with many unique values as labels. Leave those in the log body, where LogQL can still filter on them.

Container names need a quick check of their own. During a zero-downtime deploy, the new container starts next to the old one and takes over traffic after its health check passes, as described in [From git push to live](/blog/how-zero-downtime-deploys-work). For a short time, two containers for the same app are both writing logs. That's expected. But if container names change from one deploy to the next, using `container_name` as a label creates a new stream on every deploy. Look at the names from Step 1 before and after a deploy. If they change, use something stable instead, such as `image` with the tag stripped, or a fixed value you set in the remap transform.

The disk buffer holds events locally if Loki is unreachable, and sends them when it comes back. `268435488` bytes, about 256 MB, is the smallest disk buffer Vector accepts. With `when_full: block`, Vector slows down instead of dropping events when the buffer fills up.

## Step 3b: Or send them to Datadog

To send logs to Datadog instead, replace the `loki` sink with a `datadog_logs` sink:

```yaml
sinks:
  datadog:
    type: datadog_logs
    inputs:
      - app_logs
    default_api_key: "${DD_API_KEY}"
    site: "${DD_SITE}"
    compression: gzip
    buffer:
      type: disk
      max_size: 268435488
      when_full: block
```

Set `DD_SITE` to the site your Datadog account is on, for example `datadoghq.com` or `datadoghq.eu`. If it's wrong, the API key is rejected.

Datadog treats a few attributes as reserved, including `host`, `service`, and `status`. Setting `service` makes the log explorer much more useful, so add this to the end of the remap transform:

```
.service = .container_name
```

Check the same thing as with Loki labels. If container names change across deploys, set `service` to a fixed name for each app.

You can also keep both sinks in the same file. Vector sends every event to every sink that lists it as an input, which is handy when you're moving from one backend to the other.

## Step 4: Keep the credentials out of the config

The config above reads credentials from environment variables, so the YAML file has no secrets in it. Put the values in a separate file that only root can read:

```bash
sudo tee /etc/vector/vector.env > /dev/null <<'EOF'
LOKI_ENDPOINT=https://your-loki-host.example.com
LOKI_USER=123456
LOKI_PASSWORD=replace-me
EOF
sudo chmod 600 /etc/vector/vector.env
```

For Datadog, use `DD_API_KEY` and `DD_SITE` instead. Treat this key like any other production secret. [Managing environment variables and secrets](/blog/environment-variables-secrets-management) covers the general approach.

## Step 5: Run Vector as a container

First check that the config parses. Use a specific Vector version from the official `timberio/vector` image and keep it pinned, so the agent doesn't change underneath you:

```bash
VECTOR_IMAGE=timberio/vector:<version>-debian

docker run --rm \
  --env-file /etc/vector/vector.env \
  -v /etc/vector/vector.yaml:/etc/vector/vector.yaml:ro \
  "$VECTOR_IMAGE" validate /etc/vector/vector.yaml
```

Then start it:

```bash
docker run -d --name vector --restart unless-stopped \
  --env-file /etc/vector/vector.env \
  -v /etc/vector/vector.yaml:/etc/vector/vector.yaml:ro \
  -v /var/lib/vector:/var/lib/vector \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  "$VECTOR_IMAGE" --config /etc/vector/vector.yaml
```

Check that it's running and not reporting errors:

```bash
docker logs --tail 50 vector
```

Then look in Grafana Explore with a query like `{host="your-server"}`, or in the Datadog log explorer, and you should see lines from your app containers. If nothing shows up, the most common causes are a wrong endpoint or site, bad credentials, and an exclude rule that matches more containers than you meant. Vector logs sink errors to its own output, so `docker logs vector` is the first place to look.

`--restart unless-stopped` brings Vector back after a reboot or a Docker restart. Lines that containers write while Vector is down may not be picked up when it comes back, so treat any stretch where Vector wasn't running as a possible gap in your logs.

## A note on the Docker socket

Mounting `/var/run/docker.sock` is what lets Vector read container logs. It also gives that container full control of the Docker daemon, which on most setups is equivalent to root on the host. The `:ro` flag on the mount doesn't change this. It stops the socket file from being modified, not API calls through it.

That's an accepted tradeoff for log agents, but treat it as one:

- Use the official image and pin its version.
- Don't expose Vector's API or add sources that listen on a public port unless you need them. The config above makes only outbound connections.
- Keep the server patched. The [self-hosted PaaS security guide](/blog/self-hosted-paas-security) covers the rest of the host.

## Beyond app containers

The same Vector instance can pick up more than your apps:

- **Nginx.** Pushify installs Nginx on the host itself, not in a container, so its access and error logs are files, not Docker output. To ship them, mount the log directory into the Vector container and add a `file` source pointing at it. `/var/log/nginx/` is the usual location on Debian and Ubuntu, but check the `access_log` and `error_log` directives in your config to be sure.
- **A self-hosted control plane.** If you run Pushify itself with the [open-source install](/blog/pushify-is-now-open-source), its services are Docker Compose containers, so a Vector instance on that machine picks up the `api` and `worker` logs the same way it picks up your apps.

## The short version

- Vector reads container output from the Docker API. If `docker logs` works for a container, Vector can ship it.
- Use one source, one remap transform that parses JSON lines, and one sink. Switching between Loki and Datadog means swapping the sink.
- In Loki, keep labels to a few stable values, and check how container names behave across deploys before you use them as labels.
- Give each sink a disk buffer, and keep credentials in a root-only env file.
- Set Docker log rotation too, because shipping logs elsewhere doesn't stop them from piling up on the server.

If you run into something with logging on a Pushify server that this guide doesn't cover, [open an issue](https://github.com/pushifydev/pushify_backend/issues) and tell us what you needed.
