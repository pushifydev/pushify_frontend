# Contributing to Pushify

Thanks for your interest in contributing to Pushify! This guide will help you get started.

## Development Setup

1. Fork and clone the repository
2. Follow the [Getting Started](README.md#getting-started) guide
3. Create a new branch for your feature or fix

## Branch Naming

- `feat/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes
- `refactor/description` — Code refactoring

## Commit Messages

Use clear, concise commit messages:

```
feat: add webhook notification support
fix: resolve database connection timeout
docs: update API endpoint documentation
refactor: extract modal into shared component
```

## Pull Request Process

1. Ensure your code passes linting and type checks
2. Update documentation if you've changed APIs or added features
3. Raise the version in `package.json` and add a `CHANGELOG.md` section (see [Versioning](#versioning))
4. Write a clear PR description explaining what changed and why
5. Link any related issues

## Versioning

Every PR raises `version` in `package.json` and adds a section for that version to the top of
`CHANGELOG.md`, under `## [Unreleased]`:

```
## [0.2.1-beta.111] - 2026-10-20

### Fixed
- ...
```

The `/changelog` page reads these `## [version] - YYYY-MM-DD` headings, so keep the format.

Which number goes up:

| Change | Bump | Example |
|--------|------|---------|
| Bug fix (`fix:`) | patch | 0.2.0 → 0.2.1 |
| New feature (`feat:`) | minor | 0.2.1 → 0.3.0 |
| Breaking change | major | 0.3.0 → 1.0.0 |

Changes that are none of these (docs, refactoring, tests, blog posts) raise the patch number.

While Pushify is in beta, keep the `-beta.N` suffix and raise `N` by one on every PR. The rule above
applies to the numbers before it, e.g. from `0.2.0-beta.110` a fix gives `0.2.1-beta.111` and a
feature gives `0.3.0-beta.111`. The `/changelog` page orders releases from the same day by `N`,
and changelog entries refer to releases as "beta.N".

Do not edit `package-lock.json` in the PR. Its `version` field is brought in line by running
`npm install` after the merge.

## Code Style

- **TypeScript** — All code must be typed, avoid `any`
- **Components** — Use shared components from `components/` when possible
- **Constants** — Use `lib/constants.ts` for colors and status mappings
- **Utilities** — Use `lib/formatters.ts` for shared formatting functions
- **CSS** — Use CSS variables from `globals.css`, no hardcoded colors
- **i18n** — All user-facing strings must use the translation system

## Project Architecture

```
Frontend:  Page → Hook (React Query) → Service (API call) → Backend
Backend:   Route → Service → Repository → Database (Drizzle ORM)
```

## Reporting Issues

- Use the GitHub issue templates
- Include steps to reproduce for bugs
- Include screenshots for UI issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
