---
title: Docker volume backup alerts: how to back up volumes and know when a backup fails
description: Docker volume backup alerts that catch silent failures: back up volumes safely, copy them off-site, and know when a run fails or never starts.
date: 2026-10-08
tags: docker, backups, self-hosting, monitoring, guides
---

Most backup setups on a self-hosted server fail quietly. A cron job runs for months, then one day the disk fills up, a password rotates, or the timer gets disabled during an upgrade, and nobody notices until they need a restore. This guide covers Docker volume backup alerts as part of the backup itself: how to back up volumes so the data is consistent, how to get copies off the machine, and how to get alerted both when a backup fails and when it doesn't run at all.

Everything here runs on the host with standard tools: `docker`, `tar`, [restic](https://restic.net), systemd, and an HTTP ping to a monitoring service. It doesn't depend on any particular deploy tool.

## What actually needs backing up

Containers are disposable. Images can be rebuilt from your repo. The state that matters lives in volumes: database files, user uploads, and whatever else your apps write to disk.

Start by listing what's there:

```bash
docker volume ls
docker ps --format '{{.Names}}: {{.Mounts}}'
```

To see where a volume lives on disk and which containers use it:

```bash
docker volume inspect app-uploads
docker ps -a --filter volume=app-uploads
```

Sort what you find into two groups, because they're backed up differently:

- **Database volumes** (Postgres, MySQL, MongoDB, Redis with persistence). Copying their files while the database is running can give you a backup that won't start.
- **Plain file volumes** (uploads, generated files, config). A file-level archive is fine for these.

Also check for bind mounts, such as `-v /srv/app/data:/data`. They don't show up in `docker volume ls`, but they're just as important.

## Back up databases with a dump, not a file copy

A database writes to several files at once and keeps some state in memory. If you tar its data directory mid-write, the archive can contain files from different moments. Sometimes that restores fine and sometimes it doesn't, and you won't know which until you try.

The reliable option is a logical dump using the database's own tool, run inside the container:

```bash
# Postgres: custom format, compressed, restorable with pg_restore
docker exec app-db pg_dump -U postgres -Fc appdb > /var/backups/docker/appdb.dump

# MySQL / MariaDB
docker exec app-mysql sh -c 'exec mysqldump --single-transaction -uroot -p"$MYSQL_ROOT_PASSWORD" appdb' \
  > /var/backups/docker/appdb.sql
```

Two details that cause trouble:

- Don't pass `-t` to `docker exec` when you redirect output. A TTY can change line endings and corrupt binary dump formats.
- The redirect creates the file even when the dump fails. A zero-byte dump with a timestamp from last night looks like a backup until you try to restore it. The script below checks for that.

If you'd rather copy the raw data directory, stop the database container first, archive the volume, then start it again. That's consistent, but it means downtime on every run, so dumps are usually the better trade.

## Back up file volumes with a throwaway container

For plain file volumes, you don't need to know where Docker keeps them on disk. Mount the volume read-only into a short-lived container and archive it:

```bash
docker run --rm \
  -v app-uploads:/data:ro \
  -v /var/backups/docker:/backup \
  alpine tar czf /backup/app-uploads.tar.gz -C /data .
```

The `:ro` flag means the backup can't change the data. If an app writes to the volume while tar is reading, you may get a file in a half-written state. For uploads that's usually acceptable. For anything that needs a strict point in time, stop the writing container briefly or use a dump-style export if the app has one.

## Get the backups off the server

A backup on the same disk protects you from a bad deploy or an accidental `rm`. It doesn't protect you from losing the server, a provider account problem, or ransomware. You want a copy somewhere else.

restic works well for this. It encrypts on the client, deduplicates between runs so daily backups stay small, and supports S3-compatible storage, SFTP, and other backends. Set up a repository once:

```bash
export RESTIC_REPOSITORY="s3:https://s3.example.com/my-server-backups"
export RESTIC_PASSWORD_FILE=/root/.restic-password
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...

restic init
```

Keep a copy of the restic password somewhere other than the server, such as your password manager. The repository is encrypted with it. If the server is gone and the password was only on the server, so are your backups.

Some practical choices for the storage side:

- Use credentials that can only reach the backup bucket, not your whole storage account.
- If your provider supports object lock or versioning, turn it on, so a compromised server can't delete its own history.
- Put the bucket in a different provider or region from the server if you can.

## The backup script

Here's a script that ties it together. It dumps the database, archives the file volumes, sends everything to restic, applies a retention policy, and reports to a monitoring service at each stage.

```bash
#!/usr/bin/env bash
# /usr/local/bin/docker-backup.sh
set -Eeuo pipefail

PING_URL="${PING_URL:?set PING_URL in the env file}"
STAGING=/var/backups/docker
FILE_VOLUMES=(app-uploads)

ping() {
  curl -fsS -m 10 --retry 3 "$@" >/dev/null || true
}

on_error() {
  ping --data-raw "backup failed at line $1" "$PING_URL/fail"
}
trap 'on_error $LINENO' ERR

ping "$PING_URL/start"
mkdir -p "$STAGING"

# 1. Database: logical dump, then make sure it isn't empty
docker exec app-db pg_dump -U postgres -Fc appdb > "$STAGING/appdb.dump"
[ -s "$STAGING/appdb.dump" ]

# 2. File volumes: read-only archives
for vol in "${FILE_VOLUMES[@]}"; do
  docker run --rm -v "$vol":/data:ro -v "$STAGING":/backup alpine \
    tar czf "/backup/$vol.tar.gz" -C /data .
done

# 3. Off-site copy and retention
restic backup "$STAGING" --tag docker-volumes
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune

# 4. Report success only once everything above worked
ping "$PING_URL"
```

The secrets go in a separate file that only root can read:

```bash
# /root/.backup.env  (chmod 600)
PING_URL=https://hc-ping.com/your-check-uuid
RESTIC_REPOSITORY=s3:https://s3.example.com/my-server-backups
RESTIC_PASSWORD_FILE=/root/.restic-password
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

A few things the script does on purpose:

- `set -Eeuo pipefail` stops at the first failing command, including failures inside pipes and functions, and the `ERR` trap reports which line failed.
- The success ping is the last line. If anything before it fails, the success ping never goes out.
- The `ping` helper never fails the script. A flaky network call to the monitoring service shouldn't be reported as a failed backup, and the missing ping gets caught anyway, as the next section explains.

## Docker volume backup alerts: alert on silence, not only on failure

The `/fail` ping covers the case where the script runs and something breaks. That's only some of the ways backups stop. Plenty of failures never reach your error handler:

- The server is down or out of disk at 3 a.m.
- The timer was disabled, or the cron entry was lost during a rebuild.
- The script hangs on a network call and gets killed, so the `ERR` trap never runs.
- Someone renamed the database container and the job now exits before it starts.

The fix is a dead man's switch: a monitor that expects a success ping on a schedule and alerts you when one doesn't arrive. You don't have to detect every failure mode. You only have to notice that the good news stopped.

[Healthchecks.io](https://healthchecks.io) works this way and is open source, so you can use the hosted service or run it yourself. Uptime Kuma's push monitors follow the same idea. In Healthchecks.io terms:

- Create a check with a period of one day and a grace time of an hour or two. If no success ping arrives within that window, you get an alert.
- The `/start` ping lets it measure how long each run takes, and flag runs that start but never finish.
- The `/fail` ping alerts you right away instead of waiting for the grace period to run out.

Send alerts somewhere you'll actually see them: email, a team chat channel, or your phone. An alert that goes to an inbox nobody reads won't help.

One caveat if you self-host the monitor: don't run it on the server it's watching. If that machine goes down, the monitor goes with it and you hear nothing.

## Schedule it with a systemd timer

Cron works, but a systemd timer gives you logs in the journal, a timeout, and catch-up runs after downtime. Create a service and a timer:

```ini
# /etc/systemd/system/docker-backup.service
[Unit]
Description=Back up Docker volumes
Wants=network-online.target
After=network-online.target docker.service

[Service]
Type=oneshot
EnvironmentFile=/root/.backup.env
ExecStart=/usr/local/bin/docker-backup.sh
TimeoutStartSec=2h
```

```ini
# /etc/systemd/system/docker-backup.timer
[Unit]
Description=Nightly Docker volume backup

[Timer]
OnCalendar=*-*-* 03:30:00
RandomizedDelaySec=15m
Persistent=true

[Install]
WantedBy=timers.target
```

Then enable it and trigger a first run by hand:

```bash
chmod 700 /usr/local/bin/docker-backup.sh
systemctl daemon-reload
systemctl enable --now docker-backup.timer
systemctl start docker-backup.service
journalctl -u docker-backup.service -n 50
```

`Persistent=true` runs a missed backup when the server comes back up. `TimeoutStartSec` makes sure a hung run gets killed instead of blocking the next one. Because the kill skips the `ERR` trap, the missing success ping is what alerts you, which is why that monitor matters.

## Test restores, not just backups

A backup you haven't restored is a guess. Put a restore test on your calendar, monthly is a reasonable start, and make it concrete:

```bash
# Check repository integrity, reading a sample of the actual data
restic check --read-data-subset=5%

# Pull the latest snapshot into a scratch directory
restic restore latest --target /tmp/restore-test

# Restore the dump into a throwaway Postgres container
docker run -d --name restore-test -e POSTGRES_PASSWORD=test postgres:16
sleep 5
docker exec -i restore-test createdb -U postgres appdb
docker exec -i restore-test pg_restore -U postgres -d appdb \
  < /tmp/restore-test/var/backups/docker/appdb.dump
docker exec restore-test psql -U postgres -d appdb -c 'select count(*) from users;'
docker rm -f restore-test
```

Use the same major Postgres version as production, and query a table you know well. You're checking that the data is there and recent, not only that the command exited cleanly. Write down the steps the first time you do this. During a real incident, you'll be glad you don't have to figure them out again.

## Where Pushify fits

Pushify deploys your apps as Docker containers on servers it reaches over SSH. When you [bring your own server](/blog/byos-vs-managed-servers), the machine and its upkeep are yours, and a backup job like this one is part of that upkeep. It runs on the host next to your apps and doesn't interfere with deploys.

If you [self-host the Pushify control plane](/blog/pushify-is-now-open-source), it runs on Docker Compose, so it has state of its own that needs backing up. The same approach works there: dump the databases, archive the file volumes, copy them off-site, and alert on silence. [What it actually takes to self-host a PaaS](/blog/what-it-takes-to-self-host-a-paas) covers the rest of that job.

Backups aren't the only secrets on the box, either. The restic password and storage keys deserve the same care as your app's credentials. [Self-hosted secrets management](/blog/self-hosted-secrets-management-doppler-infisical-vault) covers options for keeping them out of plain files.

## The short version

- Back up databases with their own dump tools, and file volumes with a read-only throwaway container.
- Get copies off the server with an encrypted tool like restic, and keep the password somewhere other than the server.
- Send a success ping only at the very end, a fail ping on errors, and alert when the success ping doesn't arrive.
- Run the job from a systemd timer with a timeout and catch-up runs.
- Test a real restore on a schedule. That's the only way to know the backups work.
