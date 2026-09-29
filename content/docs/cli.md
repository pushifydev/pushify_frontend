---
title: CLI
description: Deploy, follow logs and sync environment variables from your terminal.
updated: 2026-09-30
---

## Install

```bash
npm install -g pushify-cli
```

The command is `pushify`. You can also run it without installing: `npx pushify-cli <command>`.

The commands on this page are in **1.2.1**, the version on npm today. Commands marked **1.3** are in the next release and not on npm yet.

## Sign in

```bash
pushify login
```

This opens the dashboard in your browser; approve the request there and the CLI receives an API key. The code shown in the terminal is valid for 10 minutes.

To use an existing key instead (for CI), pass it or set it in the environment:

```bash
pushify login --key pk_live_…
export PUSHIFY_API_KEY=pk_live_…   # overrides the stored key
```

`PUSHIFY_API_URL` points the CLI at a self-hosted Pushify (default `https://api.pushify.dev/api/v1`). `pushify logout` removes the stored key; `pushify whoami` shows who you are signed in as.

## Link a directory to a project

```bash
pushify link my-app
```

This writes a `.pushify` file (and adds it to `.gitignore`). Commands run anywhere below that directory use the linked project, the same way git finds its repository. A command picks its project from, in order: the argument you pass, the `.pushify` file, then your default project. `pushify unlink` removes the link.

## Commands

| Command | What it does |
|---|---|
| `pushify projects` (`ps`) | List projects. `--json` for machine-readable output |
| `pushify deploy [project]` (`d`) | Deploy the latest commit. `--branch <name>`, `--wait` to wait for the result |
| `pushify logs [project]` (`l`) | Show logs. `--follow` to stream them |
| `pushify status [project]` (`s`) | Current deployment and its state |
| `pushify env pull [project]` | Write the project's variables to `.env` (`--file`, `--force`) |
| `pushify env push [project]` | Upload a `.env` file (`--file`, `--yes`) |
| `pushify open [project]` (`o`) | Open the project in the dashboard |

`env pull` writes values marked secret in masked form (`ab****yz`); keep your own copy of secrets.

## Coming in 1.3

- `pushify init`: create or link a project from the current directory (`--project`, `--name`, `--yes`).
- `pushify deploy ./folder`: publish a static site from a folder, up to 50 MB. Hidden files, `node_modules` and OS clutter are skipped. `--project`, `--name`.
- `pushify deploy --prod`.
- `pushify config set|get|unset|list`.
- `pushify logs --follow` follows the build log and then the running container.
