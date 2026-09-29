---
title: Environment variables
description: Configuration and secrets for your app, per environment.
updated: 2026-09-30
---

## Adding variables

In the project's **Environment** tab, add variables one by one or paste a `.env` file. Names are uppercase letters, digits and underscores, starting with a letter (`DATABASE_URL`).

Every value is encrypted at rest. Mark a variable **secret** to have its value masked everywhere it is shown afterwards (`ab****yz`): the dashboard, the API and `pushify env pull`. Build and container logs are masked separately, by name and value.

## Environments

A variable belongs to one environment:

- **Production** is the base set.
- **Staging** and **Preview** start from production and override it.
- **Development** is for local use and is never sent to a deploy.

Variables are available both while the app builds and while it runs.

## From the terminal

```bash
pushify env pull            # write the variables to .env
pushify env push            # upload .env
```

`env pull` writes secrets masked, so keep your own copy of them. `env push` adds and updates keys and leaves keys that are not in the file alone. See [CLI](/docs/cli).
