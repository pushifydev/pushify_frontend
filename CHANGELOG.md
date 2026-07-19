# Changelog

## [0.2.0-beta.62] - 2026-07-19

### Added
- **In-app cancellation with a one-question exit survey** (pairs with backend beta.58). Paid plans get a quiet "Cancel subscription" link under the Current Plan card; the dialog asks a single honest question (too expensive / missing features / bugs / switched / project ended / other + optional comment, "a human reads these"), records it best-effort, then cancels at period end with a clear "your data is not deleted" note. EN/TR i18n.

## [0.2.0-beta.61] - 2026-07-19

### Added
- **Three SEO growth pages, built on verified data only** (competitor facts checked against live public sources, July 2026 — no invented benchmarks, stars or testimonials; every page carries a "spot an error? email us" correction note):
  - **`/vs/heroku`** — the existing honest-comparison template applied to Heroku: real pricing (free tier removed Nov 2022; $5 Eco sleeps after 30 min; $7 Basic dyno + $5 smallest Postgres ≈ $12/mo minimum), give-them-their-due rows (zero-ops, 10+ year add-on ecosystem), migration FAQ, FAQPage schema. EN/TR.
  - **`/alternatives`** — the roundup-format hub the "coolify alternative / self-hosted heroku" SERPs actually reward: at-a-glance matrices (license, self-host, cloud, real starting prices, pricing model) for Coolify, Dokploy, CapRover, Dokku, Heroku, Railway, Render, plus honest per-tool reviews with "best for" verdicts — including Pushify's own weaknesses (younger ecosystem, smaller community) stated in its card. EN/TR, CollectionPage schema.
  - **`/guides/deploy-nextjs`** — a genuine step-by-step tutorial for the 100%-tutorial "deploy nextjs own server" SERP: Node 22 via NodeSource, swap for 1 GB builds, PM2 with systemd startup, full nginx reverse-proxy config, certbot SSL and a redeploy script with its downtime trade-off explained — then the automated Pushify route. Fully static SSR, TechArticle schema.
  - All three added to the sitemap and the footer's Resources column.

## [0.2.0-beta.60] - 2026-07-19

### Changed
- **Ship only the active language — the Turkish dictionary is now a lazy chunk.** Both full translation dictionaries (~4,400 lines each) were statically bundled into every page for every visitor. The bundle now contains only English; the Turkish dictionary loads on demand (once, then cached) when the locale is `tr`, with English fallback during the brief fetch and an automatic re-render when it lands. Homepage JS drops **1,518 → 1,408 KB raw** and the TR chunk is no longer referenced by any page's initial load — the same saving applies to every route, including the dashboard. Verified on a production build: EN default renders English, a stored `tr` preference renders Turkish end-to-end.
- **Google Analytics moved fully off the critical path** (`lazyOnload` instead of `afterInteractive`) — it no longer competes with hydration for main-thread time during the INP-sensitive window.

## [0.2.0-beta.59] - 2026-07-19

### Changed
- **All settings tab contents brought into the quiet design language.** **Appearance**: the theme picker is now three miniature dashboard previews rendered in each theme's own colors (System = half dark / half light) with a small check badge — the option shows itself instead of an icon; language options became calm pills. **Sessions**: session rows match the settings row pattern (small icon plate, wrapped meta line), "This device" is a green chip instead of an accent-tinted card, and the "you're only signed in here" copy no longer shows above a list of other sessions. **API Keys**: rows get the same treatment plus a green **Active** chip, the duplicated card header was deduped ("Your keys"), and meta wraps properly on mobile.
- **Settings navigation redesigned.** The tab rail is now grouped the way the content actually splits — **Account** (Profile, Appearance, Notifications) and **Access & security** (Security, Sessions, API Keys) with quiet uppercase eyebrows. The loud accent-tinted active state and rotating chevrons are gone: active is a calm neutral pill with the icon as the only accent. On mobile the rail becomes a horizontally scrollable chip strip that auto-centers the active tab (deep links like `?tab=security` land correctly). Verified in dark + light, desktop + 390px mobile.
- **Security settings visual refresh.** The 2FA card grew a proper status header (shield icon plate — green when protected, muted when off) with plain-language state copy, and when 2FA is off, a quiet checklist of what enabling gets you (any authenticator app, 10 backup codes, every-device protection); when on, the footer hints how backup-code regeneration behaves. New **Sign-in method** card below shows how the account authenticates — password accounts see "Password is set · Active", Google/GitHub accounts see their social sign-in row plus a one-click **Set a password** shortcut to the Profile tab. Verified in both dark and Clean Pro light themes. EN/TR i18n.

## [0.2.0-beta.58] - 2026-07-19

### Fixed
- **Settings adapt to Google/GitHub accounts without a password** (pairs with backend beta.57). The 2FA disable and backup-code-regenerate dialogs now ask for a **6-digit authenticator code (or backup code)** instead of a password when the account has none, with an explanatory hint. The Profile tab's password card becomes **"Set password"** for these accounts — no current-password field — and flips back to the normal change-password form once one is set. EN/TR i18n.

## [0.2.0-beta.57] - 2026-07-19

### Fixed
- **Post-auth redirect now works end-to-end (professional `?redirect=` structure).** Buying a domain from the public `/domains` page previously dumped users on the dashboard, losing the domain they picked — on both the login and logged-in paths. Now: the buy CTA is session-aware (logged-in users go straight to `/dashboard/domains?domain=<name>`; others to `/register?redirect=…`), registration finally **consumes** the saved redirect instead of hard-coding `/dashboard`, the login↔register cross-links carry the redirect along, and the dashboard auth guard captures the attempted URL so any deep link survives a login round-trip. A central `sanitizeRedirectPath` guard hardens every consumer against open redirects (absolute URLs, `//host`, backslash tricks, auth-page loops) — including the previously unsanitized login query param. The domains page pre-fills and auto-runs the search from `?domain=` (kept in the URL as a shareable deep link). Verified with an end-to-end browser test: register with a picked domain → land on the domains page, search pre-filled and running.

## [0.2.0-beta.56] - 2026-07-19

### Fixed (SEO audit follow-up)
- **`/domains` was invisible to Google.** The page had no layout of its own, so it inherited the homepage's title, description and — critically — its canonical URL, telling Google it was a duplicate of `/`. It now has unique metadata, a self-referencing canonical, WebPage+Breadcrumb structured data, a sitemap entry, and nav + footer links (it was an orphan page reachable from nowhere).
- **Prices are now in the server-rendered HTML on `/pricing`.** Plan prices previously existed only in the client-side data payload — AI crawlers and non-JS fetchers saw a pricing page with no prices. The page now fetches plans server-side (ISR, 1h) and seeds the client cache, so real dollar amounts render into the HTML; the interactive toggle still works as before. Title upgraded from generic "Pricing".
- **`/docs` had 10 `<h1>` tags** — the 9 section headers are now `<h2>`, restoring a proper document outline for crawlers and AI section-extraction. Also: og:title separator aligned, TechArticle schema gains `image`/`datePublished`/`dateModified`.
- **`/changelog` split for Core Web Vitals**: the page rendered 92 releases (~2,000 DOM nodes) in one document. It now shows the latest 30 with a link to the new `/changelog/archive`; CollectionPage + Breadcrumb structured data added.
- **Sitemap `lastmod` was one identical build timestamp for all 19 URLs** — now per-route content dates (changelog keeps the build date, which is accurate for it).
- **Titles/metas**: `/features` and `/about` got descriptive titles; `/about`'s meta no longer promises "team" content the page doesn't have.
- **CSP was blocking Cloudflare Web Analytics** (`static.cloudflareinsights.com` beacon 100% of loads) — now allowlisted. `/vs/*` schema gains `datePublished`/`dateModified`; global AggregateOffer gains `highPrice`; footer links got larger tap targets (WCAG).

## [0.2.0-beta.55] - 2026-07-19

### Added
- **Domain management console** (pairs with backend beta.56). Every purchased domain now has a **Manage** page with three tabs: **DNS records** (add/delete A, AAAA, CNAME, MX, TXT, SRV, NS with TTL/priority), **Email forwarding** (`info@yourdomain → your inbox` aliases), and **Settings** — transfer-lock toggle, custom nameservers (point at Cloudflare etc.), and an ICANN-compliant **transfer-out** section that reveals the EPP/auth code (with copy button and security warning).
- **Transfer a domain in.** New dialog on the Domains page: enter the domain, get the live price (includes 1-year renewal), paste the auth code from your current registrar, and start — paid from credits, auto-refunded if the transfer is rejected. Pending/failed transfers show as status chips on the list.
- **Public `/domains` search page.** Marketing-site domain search (rate-limited, no login needed) showing live availability and prices, with a "Sign up to buy" CTA — a Vercel-style acquisition funnel. EN/TR i18n throughout.

## [0.2.0-beta.54] - 2026-07-19

### Added
- **Multi-year domain terms + pay by card** (pairs with backend beta.55). The purchase dialog now has a 1/2/3/5-year term selector with a live total (year 1 at registration price, later years at renewal price) and two payment options: **buy with credits** as before, or **Pay with card** — a Stripe Checkout redirect that registers the domain automatically after payment (returning to the Domains page shows a "being registered" toast and refreshes the list). EN/TR i18n.

## [0.2.0-beta.53] - 2026-07-18

### Added
- **Domains page** (`/dashboard/domains`, pairs with backend beta.54): search a name or keyword and see availability + prices across 10 popular TLDs, buy in one click (paid from infrastructure credits), and optionally **connect the domain to a project during checkout** — DNS records and SSL are set up automatically. Purchased domains list shows expiry, attached project, renewal problems, and a per-domain **auto-renew** toggle. New Domains item in the sidebar (Globe icon). When the platform has no registrar configured, the page shows a quiet "not enabled" note instead. EN/TR i18n.

## [0.2.0-beta.52] - 2026-07-06

### Added
- **Invoices in Billing.** New section on the Billing page (pairs with backend beta.50): your Stripe invoice history with number, date, status chip, amount, a hosted **View** link and **PDF** download. Hidden until the organization has invoices. EN/TR i18n.

## [0.2.0-beta.51] - 2026-07-06

### Added
- **SECURITY.md** — vulnerability disclosure policy (matching the backend's).
- **Real product screenshots in the README** — the redesigned landing hero and the dashboard preview, captured at 2× from the live page, stored under `.github/assets/`.

## [0.2.0-beta.50] - 2026-07-06

### Changed
- **Navbar scroll animation + mobile audit.** The capsule navbar now reacts to scroll: quiet and airy at the top (h-14, soft shadow), it condenses smoothly on scroll (h-12, closer to the edge, more opaque, deeper shadow) with a 300ms transition — the rAF-throttled listener is passive, so scrolling stays smooth. A full 390px-wide sweep of the homepage (8 scroll depths, plus footer/CTA) confirmed the responsive layout is clean end-to-end; no fixes were needed.

## [0.2.0-beta.49] - 2026-07-05

### Changed
- **Floating capsule navbar.** The landing header is no longer a full-width bar: it now floats slightly inset from the top as a rounded-full capsule — hairline border, backdrop blur, soft shadow — matching the page's pill language. Verified at top, scrolled (blurring over content) and on mobile.

## [0.2.0-beta.48] - 2026-07-05

### Changed
- **Marketing pages brought into the landing's design language.** `/about` redesigned: eyebrow pill on the hero, correctly-scaled section headings (the giant `lp-section-title` clamp no longer leaks into subsections), black icon chips on the What-We-Do grid, values as a three-column card row with staggered reveals. Both `/vs/*` comparison tables gain the same **Pushify-column spotlight** as the homepage table. `/features`, `/pricing`, `/open-source` and `/deploy/*` inherit the earlier token refinements (pill labels, card radius/shadows, CTA polish) automatically.

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
