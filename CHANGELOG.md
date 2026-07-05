# Changelog

## [0.2.0-beta.47] - 2026-07-05

### Added
- **Product showcase — the dashboard, shown big.** New full-width section right under the hero: a high-fidelity, code-built replica of the actual dashboard in a browser frame (sidebar with active nav, ⌘K search pill, stat cards with mono numerals, a recent-deployments list with Live/Building chips, and a CPU/memory metrics panel with an area chart). Pure CSS/SVG — crisp on any display, adapts to light/dark automatically, no image assets to go stale. This is the Cal.com move the page was missing: show the product, don't describe it. EN/TR i18n.

## [0.2.0-beta.46] - 2026-07-05

### Changed
- **Cal.com-grade design-system refinement across the landing.** Token-level polish so the whole page shifts together: eyebrow labels became bordered **pill badges**; cards moved to a softer 16px radius with a quiet base shadow; section vertical rhythm widened (`clamp(5rem…7.5rem)`); headline tracking tightened and the lead size refined for a calmer hierarchy; primary CTA gains depth (shadow + hover lift) and the ghost CTA sits on a surfaced background. Colors and fonts untouched — the same palette, rendered with more precision.

## [0.2.0-beta.45] - 2026-07-05

### Changed
- **Frameworks, Marketplace, Site Builder and Security sections professionalized.** Frameworks: marquee pauses on hover and the weak footer line became a bordered strip with a mono `$ git push → ✓ framework auto-detected — zero config` chip (EN/TR). Marketplace: six recognizable apps (Supabase, WordPress, n8n, Cal.com, Ghost, PostgreSQL) promoted to larger featured tiles with icon plates above the compact grid — a curated bento feel. Site Builder: editor mockup gains browser traffic-dots (chrome consistency with the hero) and reveals; value cards stagger in with equal heights. Security: cards switch to a denser horizontal layout — black icon chip beside the title — matching the page's monochrome language. Also removed the provider name from the How-it-works server vignette (`2 vCPU · 4 GB RAM`).

## [0.2.0-beta.44] - 2026-07-05

### Changed
- **Homepage sections redesigned in the hero's visual language.** The stats row became a single divided spec-strip (bordered card, mono tabular numerals). Each **How-it-works step now carries a mini product vignette**: a GitHub repo row with a `main` branch chip, a server row (`fra1 · Hetzner · 2 vCPU`) with a green status dot, and a two-line dark mini-terminal ending in `● Live at my-app.pushify.dev — 47s` — the steps show the product instead of describing it. Security cards get staggered reveals and equal heights. All monochrome, derived from existing tokens; colors and fonts untouched.

## [0.2.0-beta.43] - 2026-07-05

### Changed
- **Landing lower sections polished to match the new hero.** "What is Pushify" pillars became icon cards with staggered reveals (matching How-it-works); the comparison table gained a **spotlight on the Pushify column** (tint + borders, bolder checks); the closing CTA sits on the dot-grid backdrop and now ends with the **real one-command self-host install** in a terminal-styled chip with a copy button (EN/TR i18n). Marketplace/Security/Site-builder cards inherit the new hover-lift automatically.

## [0.2.0-beta.42] - 2026-07-05

### Changed
- **Landing redesign — motion and depth, same palette and type.** The hero is now a two-column "deploy theater": a live terminal that replays a real Pushify deploy line by line (`git push` → framework detection → Docker build → blue-green switch → **Live at your URL**, with the status pill flipping to Live) on a continuous loop, layered over a dashboard card for depth, on a faint dot-grid backdrop. Site-wide scroll-reveal system (every section header + staggered card grids via a reusable `<Reveal>`), quiet hover-lift on all `lp-card`s, and a dashed pipeline connector between the How-it-works steps. All motion respects `prefers-reduced-motion` (terminal renders the full transcript statically); colors and fonts untouched — the new atmosphere is derived entirely from existing tokens. Verified with before/after screenshots in light, dark and mobile.

## [0.2.0-beta.41] - 2026-07-05

### Changed
- **⌘K now searches your actual resources.** The command palette was a static page list; typing now also searches **projects** (name/slug/framework), **servers** (name/IP/region) and **databases** (name/engine) and jumps straight to the matching detail page. Entity data loads only while the palette is open and shares the app's query cache; results are grouped (Projects / Servers / Databases / Actions / Pages) and capped at 6 per group.

## [0.2.0-beta.40] - 2026-07-05

### Added
- **Auto-Sleep (scale to zero) UI** (pairs with backend beta.46). Project Settings gains an "Auto-Sleep" card: enable per project and set the idle window (5–1440 minutes). The Overview tab shows a **sleeping/waking banner** with a **Wake now** button when the app has been put to sleep. EN/TR i18n (`sleep` namespace).

## [0.2.0-beta.39] - 2026-07-05

### Added
- **App Shell — web terminal into the running app container** (pairs with backend beta.45). New `/dashboard/projects/:id/shell` page (xterm.js, same terminal chrome as the server terminal) attaching an interactive shell inside the project's container over the runner-aware SSH path; opens via the **Shell** button in the Logs tab. `ServerTerminalView` now accepts `projectId` for the app-shell socket alongside `serverId`.

## [0.2.0-beta.38] - 2026-07-03

### Added
- **Logs tab — full-page logs explorer** (pairs with backend beta.44). Logs escape the modals: a dedicated project tab with two modes. **Live** — real-time container tail (SSE) with follow/pause auto-scroll, client-side filtering, reconnect, clear and download. **History** — server-side search over the last 7 days of persisted logs with stdout/stderr filter and chunk-level timestamps, downloadable. EN/TR i18n (`logs` namespace).

## [0.2.0-beta.37] - 2026-07-03

### Added
- **Persistent Volumes section** in project Settings (pairs with backend beta.43): attach named volumes at a container path so SQLite files, uploads and caches survive redeploys. Add/delete with client-side name/path validation; copy notes that changes apply on the next deploy and volumes are removed with the project. EN/TR i18n (`volumes` namespace).

## [0.2.0-beta.36] - 2026-07-03

### Added
- **Cron Jobs tab.** New per-project tab (pairs with backend beta.42): schedule **commands that run inside the app container** or **periodic HTTP calls**. Schedule presets (every 5/30 min, hourly, daily, weekly) plus raw 5-field cron input with timezone and timeout; per-task pause/resume, **Run now**, edit and delete; expandable run history showing status, trigger (manual/schedule), duration, exit code / HTTP status and captured output. EN/TR i18n (`cron` namespace).

## [0.2.0-beta.35] - 2026-07-02

### Added
- **Public `/changelog` page.** Every release across the platform, API and dashboard on one timeline — parsed from both repos' `CHANGELOG.md` (local checkout first, GitHub raw as fallback once the repos are public), ISR-refreshed hourly so new releases appear without a redeploy. Footer link now points here instead of GitHub; added to the sitemap.
- **Discord notification channel UI.** Fourth channel type in the project Notifications tab (webhook-URL field, embeds preview parity with backend beta.41); Discord icon wired into the alerts center and header alerts menu. EN/TR i18n.
- **Copy env vars between environments.** New "Copy Between Environments" action in the Environment tab — pick source/target (production/staging/development/preview) and optionally overwrite; uses the existing `/env/clone` endpoint that previously had no UI.

### Changed
- **Live metrics and health-check updates.** The project page now subscribes to the `metrics:update` and `healthcheck:result` WebSocket events (hooks existed but were never mounted): charts and health logs refresh on push instead of waiting for the 15–30s polling intervals; time-series chart invalidation added for every hours-window.

## [0.2.0-beta.34] - 2026-07-02

### Added
- **Docker image for self-hosting.** New multi-stage `Dockerfile` producing a Next.js standalone build (enabled `output: 'standalone'` in `next.config.ts` — no effect on `next dev`). The backend's `selfhost/docker-compose.yml` + `install.sh` use it to run the dashboard as part of the one-command self-host stack. Note: `NEXT_PUBLIC_API_URL` is inlined at build time, so it's a build arg — changing the API URL requires rebuilding the image.

## [0.2.0-beta.33] - 2026-06-27

### Added
- **Multi-line environment variable values.** The add-variable and edit-value fields are now resizable textareas, so you can paste a value that spans multiple lines — e.g. a Firebase / service-account **PEM private key** — and it's stored and injected with real newlines intact (the whole pipeline already preserved them; only the single-line input was the limit). No code-side `\n` juggling needed. In the inline editor, plain Enter inserts a newline and **Cmd/Ctrl+Enter saves** (Esc cancels). The `.env` bulk-paste parser is unchanged.

## [0.2.0-beta.32] - 2026-06-27

### Added
- **Edit environment variable values inline.** The Environment tab only let you reveal/delete a variable, so changing a value meant deleting and re-adding it. Each variable now has an **Edit** (pencil) action that turns the value into an inline input with Save/Cancel (Enter saves, Esc cancels). Wired to the existing `useUpdateEnvVar` hook / backend `PATCH /:envVarId` — the value is updated and applied on the next deploy. (Renaming a key is still delete + add.)

## [0.2.0-beta.31] - 2026-06-25

### Security
- The Google and GitHub OAuth callbacks now honor two-factor authentication. When the backend returns a `requiresTwoFactor` challenge (for an account with 2FA enabled), the callback stores the challenge token and hands off to the existing 2FA form on `/login` instead of trying to read tokens that aren't there — so OAuth sign-in goes through the same second-factor step as password login. (Pairs with backend 0.2.0-beta.21.)

## [0.2.0-beta.30] - 2026-06-24

### Changed
- Redesigned the Settings tabs to a clean, airy Cal.com-style layout using a new reusable `SettingsCard` primitive (quiet bordered panel: title + muted description header, body, and an optional tinted footer bar that right-aligns the primary action). Applied consistently across Profile, Appearance, Notifications, Security, Sessions, and API Keys — all on the existing design tokens. Presentational only: hooks, handlers, and sonner toasts are unchanged; typecheck clean.

## [0.2.0-beta.29] - 2026-06-24

### Changed
- Settings tabs (Profile, Appearance, Notifications, Sessions) now use the app-wide sonner toast for save/validation feedback instead of inline `AlertBox` "saved" banners — consistent with the rest of the app. Removed the local `saved`/`error` state + timeouts; added the matching `toasts` i18n keys (EN + TR). Server/mutation errors flow through the existing global error toast.

## [0.2.0-beta.28] - 2026-06-24

### Changed
- Finished the new-project page refactor: the Step 1 "import source" block (GitHub/GitLab connect, repo/branch selection, framework detection) was moved into a `useImportSource` hook plus a presentational `ImportSourceStep` component. `page.tsx` is now 462 lines (down from the original 1,489). The step's props are typed via `Pick<ReturnType<typeof useImportSource>>` so the compiler enforces complete prop threading. Pure refactor — state/effects moved verbatim, typecheck clean.

## [0.2.0-beta.27] - 2026-06-24

### Changed
- Continued component extraction across four more large files (pure refactors, no behavior change, typecheck clean):
  - **Monitoring page**: 687 → 212 lines — helpers + chart/table sections into `monitoring/components/`.
  - **Server detail page**: 650 → 396 lines — status banners + provider/network sections into `servers/components/`.
  - **Database detail sections**: split the 670-line `DatabaseDetailSections.tsx` into one file per component under `components/databases/detail/`; the original file is now a thin re-export so import sites are unchanged.
  - **Site editor**: extracted the `ToolbarToggle`/`SectionHeading`/`Field` helpers into `site-editor/parts/`; the stateful editor panels were intentionally left in the parent to avoid risky prop threading.

## [0.2.0-beta.26] - 2026-06-24

### Changed
- Continued the component-extraction cleanup on the two next-largest pages (pure refactors, no behavior change, typecheck clean):
  - **Docs page** (`app/docs/page.tsx`): 1,445 → 247 lines. Extracted the 10 API-reference sections into `app/docs/sections/` with a shared `shared.ts` (types + param defs).
  - **New project page** (`projects/new/page.tsx`): 1,489 → 1,067 lines. Extracted the step panels (`ProgressSteps`, `ConfigureStep`, `EnvironmentStep`, `ReviewStep`), `EnvVariableRow`, and `WebhookSecretModal` into `projects/new/components/`. The Step 1 "import source" block (deeply entangled with 25+ state values) was intentionally left in the parent for now.

## [0.2.0-beta.25] - 2026-06-24

### Changed
- Refactored the project detail page from a single 3,546-line file into a thin orchestrator (492 lines) plus 12 extracted components under `projects/[id]/components/` (OverviewTab, DeploymentsTab, EnvironmentTab, DomainsTab, DomainCard, NginxSettingsModal, ToggleOption, SettingsTab, NotificationsTab, HealthCheckSection, PreviewDeploymentsSection, MetricsSection). Pure refactor — no behavior change; typecheck clean.

## [0.2.0-beta.24] - 2026-06-24

### Fixed
- Project detail data (status, production URL, last-deployed time) now refreshes automatically when a deployment finishes. The `deployment:status` realtime handler previously invalidated only the deployment queries; it now also invalidates the project detail query (and the domains list on first success), so the page no longer shows stale info after a deploy.

## [0.2.0-beta.23] - 2026-06-24

### Added
- Supabase marketplace projects show an info note on the Environment tab explaining how to enable social login (OAuth): set `GOOGLE_ENABLED`/`GOOGLE_CLIENT_ID`/`GOOGLE_SECRET` and Redeploy, with the exact provider callback URL (`<app-url>/auth/v1/callback`) for the project. No SSH needed — the existing env-edit + redeploy flow already applies it.

## [0.2.0-beta.22] - 2026-06-24

### Fixed
- Mobile sidebar: the page behind the drawer no longer scrolls while it's open — background scroll is now locked (`body` overflow) and the backdrop ignores touch gestures (`touch-none`, `overscroll-contain`). The sidebar also uses `h-dvh` so its full height (including the user row) fits the visible viewport on mobile browsers with dynamic chrome.

## [0.2.0-beta.21] - 2026-06-24

### Fixed
- Dark mode on the auth (login/register) and landing pages now follows the app theme toggle. Tailwind v4's `dark:` variant was defaulting to the OS `prefers-color-scheme` because no `@custom-variant dark` was defined — so when the app theme was dark but the OS was light, those pages stayed in light styles. Added `@custom-variant dark (&:where(.dark, .dark *))` so `dark:` utilities are driven by the `.dark` class set in `stores/theme.ts`, consistent with the rest of the app.

## [0.2.0-beta.20] - 2026-06-24

### Changed
- Language is no longer switchable from the public UI — removed the language toggle from the landing navbar, dashboard header, and auth screens. Language now auto-detects the device/browser language on first visit and is changed only from **Settings → Appearance**. (Browser auto-detection in `stores/locale.ts` and the Settings language control already existed; this removes the redundant public toggles.)

## [0.2.0-beta.19] - 2026-06-24

### Fixed
- Content-Security-Policy was blocking Google Analytics — `script-src` now allows `https://www.googletagmanager.com` and `https://www.google-analytics.com`, so GA4 (gtag.js) loads. (`connect-src`/`img-src` already permit `https:` for the analytics beacons.)

## [0.2.0-beta.18] - 2026-06-24

### SEO
- **FAQPage structured data** on the comparison pages (/vs/coolify, /vs/vercel), generated from the FAQ content already on each page — unlocks FAQ rich results in Google for "pushify vs coolify / vercel" queries.
- **Internal linking** for topical authority: comparison pages now cross-link to each other plus a deploy guide, pricing, and features; framework deploy pages link to the comparison pages and features.
- **AI-search (GEO)**: strengthened `llms.txt` with explicit "alternative to Coolify/Vercel/Heroku/Render/Railway" framing and links to the comparison guides; added `llms-full.txt` — a self-contained product overview (definition, comparisons, features, quick-start, FAQ) for AI assistants doing deep research.

## [0.2.0-beta.17] - 2026-06-24

### Added
- Google Analytics 4 integration (Measurement ID `G-SW4LNQEV9M`, overridable via `NEXT_PUBLIC_GA_ID`). Loads in production builds only — local dev stays tracking-free.

## [0.2.0-beta.16] - 2026-06-24

### Added
- **Workspace switcher** in the sidebar footer: users who belong to more than one organization can switch the active workspace from a dropdown (shows each org + the user's role, with the current one checked). Switching re-scopes the session and refetches all org data (projects, servers, billing, members…).
- Accepting a team invitation now **auto-switches** the member into that team's workspace, so they immediately land on the team's resources instead of their own (empty) personal workspace.

## [0.2.0-beta.15] - 2026-06-24

### Fixed
- Team invite links now work for already-signed-in users. The `(auth)` layout used to redirect any authenticated visitor to the dashboard before `/accept-invitation` could render, so clicking an invite link from email appeared to "do nothing". The layout now makes an exception for the invite flow, letting logged-in invitees see and click "Accept".

### Added
- Server creation page now shows the plan's server quota ("{used} of {limit} servers used on your {plan} plan"). When the limit is reached it switches to an upgrade prompt (link to Compare Plans) and disables the Create button, instead of only surfacing a 403 after submit.

## [0.2.0-beta.14] - 2026-06-13

### Added
- Site Editor full-screen professional shell (WordPress-style): top toolbar (device/mode toggles, Save/Publish), left icon rail with contextual panels (pages, blocks, design, SEO, CMS, settings), center canvas, right inspector.
- Multi-page management (`PagesPanel`): add, rename, delete, and switch pages.
- Design gallery (`DesignGallery`) template picker for swapping the whole site design.
- Static-site stack option in Site Studio (launch without a CMS / without a domain).

### Fixed
- Editor canvas now scrolls vertically so the full page (down to the footer) is reachable in edit mode.

## [0.2.0-beta.13] - 2026-06-11

### Improved
- Site Editor: direct canvas drag-to-reorder with a hover/selected drag handle, floating `DragOverlay` preview, and animated insertion; contextual block insertion (after the selected block); polished layers-panel DnD.

### Security
- Sanitize block URLs and theme colors in the client site renderer; add a Content-Security-Policy header.

## [0.2.0-beta.12] - 2026-06-08

### Added
- **Site Editor** at `/dashboard/projects/[id]/site-editor`: drag-and-drop blocks (`@dnd-kit`), layers, palette, inspector.
- Canvas click-to-edit (inline `contentEditable`) and Preview iframe mode.
- Theme panel (colors, fonts) and image upload field (server assets or base64 fallback).
- New blocks UI: banner, stats, pricing, FAQ; Design | CMS & SEO | Headless CMS tabs.
- Server terminal view component (WebSocket shell).

### Improved
- Project detail: Site Editor entry link; server terminal page refactor; i18n (`en` / `tr`).

## [0.2.0-beta.11] - 2026-05-27

### Added
- Dashboard attention summary row opens a detail sheet (fix styles via `dash-app` scope).

### Improved
- Compact “needs attention” strip; clearer storage quota label and peak note.

## [0.2.0-beta.10] - 2026-05-27

### Added
- Server health panel (disk warnings, orphan containers).
- Deploy queue badge on pending deployments.
- GitHub one-click webhook install in project settings.
- Pause/resume and delete warnings when server cleanup fails.

### Improved
- Deployment failure toasts include classified hints from error messages.
