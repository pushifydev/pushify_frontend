---
title: Preview deployments
description: A live copy of your app for every pull request, removed when the pull request closes.
updated: 2026-09-30
---

## Turn them on

Preview deployments are included from the Hobby plan up. Turn them on in the project's settings.

## How they work

- **Opening or updating a pull request** (GitHub) or merge request (GitLab) deploys that branch as its own app, next to production.
- The preview gets its own address, `https://pr-<number>-<project>.pushify.dev`, and Pushify comments on the pull request with the link. The comment is updated when the preview is.
- Previews use the **Preview** set of [environment variables](/docs/environment#environments), which starts from production.
- **Closing or merging** the pull request removes the preview: the container, its image and its address.
