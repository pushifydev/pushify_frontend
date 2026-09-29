---
title: Databases & backups
description: PostgreSQL, MySQL, Redis and MongoDB on your server, with scheduled and tested backups.
updated: 2026-09-30
---

## Create a database

**Databases → New database**, then choose the engine and the server it runs on. The default versions are PostgreSQL 16, MySQL 8.0, Redis 7 and MongoDB 7; you can set another version tag. How many databases you can have depends on your plan ([limits](/docs/billing#limits-per-plan)). Owners and admins create and manage databases.

A database runs as a container on the server you picked, with its data in `/opt/pushify/databases/<name>` on that server.

## Connect it to an app

Link the database to a project and its connection string is set as `DATABASE_URL` (or a name you choose) on the next deploy.

- If the app and the database are on the same server, the app connects over a private Docker network. By default the database is not reachable from outside the server.
- Turn on **external access** to reach it from elsewhere; this opens its port in the server's firewall. Turning it off closes the port again.
- Link it **read-only** to give an app a user that can read but not write (PostgreSQL, MySQL and MongoDB).

A variable you set yourself on the project always takes precedence.

## Browse the data

The database page has a data browser: tables, queries, import and export for PostgreSQL and MySQL; collections and documents for MongoDB; keys for Redis. Owners and admins have full access; give other members read or write access in **Team**.

## Backups

- Backups run on a schedule you choose, from every hour to once a week. The most frequent schedule depends on your plan: every 24 hours on Free, 12 on Hobby, 6 on Pro, 1 on Business.
- Each backup is kept for 7 days by default.
- Backups are standard files — `pg_dump` and `mysqldump` (gzip), a `mongodump` archive, or a Redis `dump.rdb` — stored on the database's server. **Download** any of them from the database page.
- **Restore** replaces the database with a backup.
- **Verify** restores a backup into a throwaway container and counts its tables and rows, without touching the live database. This also runs weekly on its own.
- When the platform has off-site storage configured, each backup is also copied off the server.

## Password reset

**Reset password** generates a new one and updates the connection string. Redeploy linked apps so they pick it up.
