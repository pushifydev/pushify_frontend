# Changelog

## [Unreleased]

### Added
- **The Domains page says what happens after the search box.** It was a heading, a search field and then the footer — a page in the main navigation with ninety-five words on it. It now lists the ten TLDs one keyword search covers, and what the registrar integration actually does: registration for up to five years with WHOIS privacy on from the start and auto-renew under your control, the records and the certificate written in the same step when you point it at a project, A/AAAA/CNAME/MX/TXT/SRV/NS editable in the dashboard, transfers in that include a year of renewal, and transferring out by unlocking the domain and reading your own auth code.
- **Real screenshots of the product, on the landing page.** The marketplace and Site Studio sections were illustrated with drawn mockups only. They are good mockups, but they prove the design, not the product — a visitor cannot tell a screenshot from a picture of one. Both sections now carry a shot of the running app, with its real app names, versions, memory figures and template counts. One file per theme, swapped in CSS because dark mode here is a class on `<html>` rather than a media query; the hidden one is never downloaded.
- **The changelog archive is paged.** It rendered every older release in one 463 KB document, some ninety entries deep. Thirty releases a page now, the same size as the front page, with newer/older links above and below the list and every page listed in the sitemap — a page a crawler can only reach by clicking through a pager is a page it mostly does not reach.
- **See what autoscaling decided before you trust it.** Project settings gained "Only report what it would do" — the decision runs and is recorded, nothing changes — and a list of recent decisions underneath, each with the CPU reading behind it and marked when it was not applied. Watch for a few days, then decide whether the thresholds suit your traffic.
- **Autoscaling documented.** The Monitoring & alerts page now explains what makes the count move: one container at a time, up above 70% average CPU after three minutes, down below 30% after ten, never on fewer than three readings — and why changing the bounds applies at once while the thresholds wait.
- **Autoscaling in project settings.** A checkbox and a minimum/maximum, next to the replica count — which then shows what is running right now rather than what someone typed, and says so. Available on Pro and above.
- **Documented what Pushify watches, and what it keeps.** A Monitoring & alerts page in `/docs`: every condition that sends an email and the exact threshold behind it (three failed checks before "not answering", 90% memory for five minutes, 90% CPU for fifteen, disk checked hourly, certificates at 14 and 3 days), why those windows exist rather than alerting on the first reading, who receives them, how many days of logs each plan keeps, and what a backup interval actually costs you.
- **A guide for private images and compose stacks.** `/docs` now explains the three ways code reaches a server and the credentials each needs: which scope a registry token actually requires (`read:packages` on GitHub and nothing else; a read-only token on Docker Hub; `read_registry` on GitLab — a token that can also write is one that can replace your images if it leaks), what deploying a ready image does and does not change, and how a compose stack behaves — including that only the served service is published, so a file mapping `5432:5432` for its database does not end up putting that database on the internet.
- **A single sign-on setup guide.** `/docs` gained a Single sign-on page, because the hard part of SSO is entirely on the provider's side and nobody can guess it: what to create in Okta, Entra ID and Google Workspace, which field is the issuer for each, where the client secret hides (Entra shows the Value once and the ID next to it, which is the wrong one), and why the redirect URI has to match character for character — a mismatch fails at the very end of sign-in with a message from the provider, so it reads like their problem. It also says to test the connection *before* turning on "require single sign-on", since a wrong connection plus enforcement locks the owner out too, and lists the five errors people actually hit with what each one means.
- **Choose how much data you are willing to lose.** A database's backup panel takes an interval — hourly, 6 hours, 12, daily, 2 days, weekly — instead of the fixed daily backup, and says plainly what it costs: *"If the server is lost, you lose up to 6 hours of writes."* Shorter intervals are a paid plan's; asking for one below your plan's floor is refused with what to upgrade to.
- **Servers show how full their disk actually is.** The server list and detail page report the real usage from the hourly check (`45% / 80 GB`), not just the size, and the list turns the figure amber past 85%. A full disk takes every container on the box down together, databases included, so it is worth seeing before the email arrives.
- **Backups say whether a copy exists off the server.** A finished backup now carries a badge: *Off-site* when a copy is kept somewhere other than the server the database runs on, *On this server only* when it is not — because a dump beside the data survives a dropped table and nothing else.
- **Single sign-on, and the audit log as a file.** Settings → Single sign-on configures the organization's identity provider (issuer, client ID and secret, the email domains it signs in) and shows the redirect URI to paste at the provider. "Require single sign-on" turns off passwords, GitHub and Google for those domains. On the login page, typing an address in such a domain replaces the password field with one button; where SSO is available but not required, it appears beside the password form. The activity page gained **Export CSV** — the filtered log as a file, with the IP each action came from.
- **Deploy a repository as a Docker Compose stack.** Project settings take the path of a compose file in the repository; the project then deploys that stack instead of being built. A second field names the service nginx serves when more than one publishes a port. Left empty — the default — nothing changes: most repositories carry a compose file meant for local development, so one is never picked up on its own.
- **Private registries, and deploying from an image.** Settings → Private registries stores a registry host, username and token for the organization (the token is write-only — it is never shown again, only replaced). Project settings gained a **Docker image** field: fill it in and the project deploys that image instead of building the repository, and the rest of the build settings are marked as unused.
- **Logs explorer: filters and a real download.** History mode filters by time range (last hour / 6h / 24h / 7 days / everything) and, when a project runs more than one container, by container — replicas, workers and the staging copy each show up by name, and lines are labelled with the container they came from. Download now asks the server for the whole result as a `.log` file instead of saving the 500 lines on screen, and the retention line states the days your plan actually keeps instead of a fixed "7 days".
- **Replicas setting.** Project settings take the number of containers to run behind nginx (1–10); nginx spreads requests across them.
- **Staging on the project page.** Settings take a staging branch; the overview then shows a staging card with its URL, a "Deploy staging" button and "Promote to production" (the commit staging runs, rebuilt with production's variables).
- **Monitoring line on the project overview.** Says whether the app is answering (with its response time) or not (with the status code or error, and since when). Every deployed project is watched now, so it shows without configuring anything.
- **Zero-downtime deploys: `scripts/jenkins-deploy.sh`.** The Jenkins job deleted `node_modules` and `.next` where the live site ran, so the dashboard answered "Internal Server Error" for the whole install + build. The script builds in the workspace, assembles the standalone build as a release under `/var/www/pushify-frontend/releases/<time>`, tries it on a spare port (a release that doesn't answer never goes live), switches `current` to it atomically and has pm2 restart the two cluster instances one after the other. The first run takes over the app from `ecosystem.config.js` (name, port and env kept); the last 3 releases stay for rollback. Verified in a container: 202 requests during a full redeploy, 202 answered.
- **Connect a database read-only.** The connect form on the database page has a Read & write / Read only choice (not offered for Redis); read-only connections carry a badge. The backend gives them a database user that can only read.
- **After a password reset, the connected projects are named.** The new-credentials dialog lists the projects connected read & write — they keep the old password until they redeploy — with a "Redeploy them now" button that starts their deploys.
- **Database → Connected projects.** Connect a project to a database (and choose the variable, `DATABASE_URL` by default) or disconnect it, right on the database page — the API existed but nothing in the dashboard used it. Projects on another server without external access are flagged. Applies on the project's next deploy.
- **Database connection details show the address apps use** ("From your apps on this server", the container address injected into connected projects) above the external one.
- **Project → Settings → GitHub access.** Shows the repository, whether Pushify can read it and through what (GitHub App on @account, or a GitHub account), and — when it can't — fixes it in place: **Install GitHub App on @owner** and **Connect / Reconnect GitHub account**, both returning to this tab when GitHub is done. Warns when only your own account can read the repo (deploys you start work, pushes don't) and when your connection can only see public repositories. English + Turkish.
- **"Repository access" deploy failure category** with a hint pointing at Settings → GitHub access (deploy summary and admin histogram).
- **Admin panel at `/admin`** for platform operators (accounts listed in the backend's `ADMIN_EMAILS`, 2FA required). Four views: **Overview** — headline numbers, the sign-up → verified → project → deploy → live → server → paid funnel, deployments by status, resources, plans, and 30-day sign-up/sign-in strips; **Users** — searchable, sortable list with plan, projects · deploys (failed) · servers · DBs, last seen and joined; **User detail** — organisations, projects, servers, databases, active sessions, and a single day-grouped **timeline** that interleaves sign-ins, deploys (with the error inline when one failed), created resources and dashboard actions; **Activity** and **Sign-ins** — platform-wide, paged. The sidebar shows the link only when `/auth/me` reports `isPlatformAdmin`; a non-operator opening the URL gets the normal 404 page, and an operator without 2FA is told exactly what to turn on. English + Turkish.
- **Dashboard-styled 404** (`app/(dashboard)/not-found.tsx`) for `notFound()` thrown inside the dashboard — previously the marketing 404, header and all, rendered inside the dashboard shell.
- **Admin: "Why deploys fail"** panel on the overview — last 30 days of failed deploys by cause, share, projects affected and the latest message; causes blamed on Pushify are highlighted.
- **Admin: stuck-user filters** on the users list — never verified email, no project yet, only failed deploys.
- **Team → Invite member modal redone.** The email field no longer overlaps its icon (`.input` overrode the padding utility; now `pl-10!` like the other icon inputs). Roles are three cards with icon + description instead of a native select, the note is clearly optional, errors use the shared alert box, Enter submits, and the button stays disabled until the address looks like an email. Description says the link works for 7 days.
- **Marketing copy only claims what the code does.** Removed or reworded every unbacked item: Laravel "automatic migrations / Horizon / scheduled tasks / Redis", Node "PM2", Python "Celery / migrations / virtualenv", Next.js "automatic ISR", managed-database "connection pooling", the unmeasured "<60s" deploy claims (hero stat, how-it-works, Next.js page), and the three anonymous testimonials (section deleted). Docs now list `hetzner` as the only managed provider.
- **Billing: resume a scheduled cancellation.** When a subscription is set to end at the period end, the plan card says so with the date and offers "Keep my subscription" instead of the cancel link (the API and hook existed; no UI called them).
- **Settings → Notifications tells the truth.** "Deployment alerts" now does what it says (backend emails on a failed production deploy and on the recovery after it); the "Product updates" toggle, which nothing ever read, is gone.
- **No personal name on the site.** Blog posts no longer carry a named author (they're published as Pushify, and the BlogPosting schema points at the organization); the About page's Founder row and note and the Organization schema's `founder` are gone.
- **Misc.** Google Analytics loads only for builds that talk to Pushify's own API (`NEXT_PUBLIC_API_URL` on `api.pushify.dev`) or when `NEXT_PUBLIC_GA_ID` is set, so a self-hosted instance never reports to Pushify's property; Bitbucket is no longer offered as a git provider (the API refuses it and nothing ever integrated it).

### Fixed
- **Most of the site's descriptive text was too faint to read comfortably.** Measured across fourteen pages in both themes: the muted grey that carries nearly every card description, caption and footer line sat at **2.61:1** on the dark canvas, against the 4.5:1 floor for body text. It is 5.2:1 now, still a step below the secondary tone so the hierarchy survives. The light theme never overrode the status colours at all, so it used the ones picked for a near-black background — the green "Live" and "Healthy" labels measured 2.2:1 on white. Same hues, dark enough to read. 190 elements fixed; what remains are 8–14px labels drawn inside the mockups.
- **Nine feature cards in a four-column grid.** The last one stood alone on a row of its own on /features. Three columns, three rows.
- **The pricing page was a spinner in an empty third of a screen** until the API answered — and stayed that way if it never did. Three card outlines in the shape of the real plans now hold the layout while the numbers arrive.
- **The site claimed an app it does not have.** The marketplace was advertised with Grafana in five places (Partners, the apps page's description, and the Site Studio banner inside the product) — there is no Grafana template. Replaced with Uptime Kuma, which there is.
- **"24+" and "20+" outlived the pass that removed them.** Eleven more places still said "24+ apps" (there are exactly 24) and "20+ frameworks" (the Frameworks section says 26 and cites where it counted), including the homepage's structured data.
- **Every page but the homepage shared without a preview image.** Next.js replaces `openGraph` wholesale when a page declares one — it does not merge into the root layout's — so the twenty-six pages that set their own title and url had silently dropped the image along with it. Sharing Pricing, Features, a comparison or a blog post on LinkedIn, Slack, WhatsApp or Discord produced a bare grey card. The image is now spelled out per page, `twitter` included.
- **The Open Source page named a repository that does not exist.** The card read `pushifydev/pushify`, which is a 404 — on the one page whose job is to prove the project is open source. It lists the two repositories that do exist, each linking to itself. The Star and Fork row went with it: neither carried a number, so it read as something that had failed to load.
- **The Open Source page had no `h1` at all.** Its only heading was the section's `h2`, so the page had no title for a screen reader or a crawler to take. A section header can be the page title when the page is that one section.
- **The changelog scrolled sideways on a phone.** A release note mentioning `GET /integrations/github/app/installations[/:id/repositories]` is one unbreakable token 402 pixels wide; on a 390-pixel screen it dragged the whole page with it. Code spans break anywhere now, so no future entry can do it either.
- **Three meta descriptions were cut off in search results** (Sites, the Heroku comparison, pushify.yaml ran to 189, 215 and 172 characters against Google's ~160), and the app pages built theirs by putting the catalogue blurb first — the half that is identical on every site that lists the app. The Pushify sentence comes first now and the blurb is what gets trimmed.
- **"Under 60 seconds" survived in five places.** The unmeasured deploy-time claim was removed from the marketing copy earlier but stayed in the Features description and its structured data, in the Next.js deploy page's metadata, and in the Vue page's steps in both languages.
- **Marketing site: fixes found by actually looking at it.** The footer read *"Built with for developers"* on every page — the heart the string was named after had never been added, and the Turkish version (*"Sevgiyle geliştiriciler için"*) was a sentence with no verb. Between 768px and roughly 1100px the navbar wrapped "Open Source" onto a second line and bent the bar out of shape; the menu now waits for the width it needs and no label wraps. In the hero, the dashboard card behind the terminal was sliced down the middle, leaving orphaned fragments ("47s", "39s") floating beside it — it now peeks upward only, as two stacked windows, with a single row that nothing can cut in half. The footer's Resources column had grown to eleven links and stood twice as tall as its neighbours; the five comparisons are their own column now and the row is even. "0 vendor lock-in" read as a broken sentence inline and is now "No vendor lock-in" (and was untranslated in Turkish). About printed the same tagline the site footer already carries, a few hundred pixels above it.
- **Two claims corrected — both understated.** The site said "20+ frameworks" while the buildpacks detect **26** across 8 languages, and "24+ marketplace apps" when there are exactly 24. An exact number reads as more credible than a vague plus, and claiming a plus that is not there is the kind of small inaccuracy that costs trust when someone counts.
- **Builds no longer depend on reaching Google Fonts.** `next/font/google` downloads Inter and JetBrains Mono at build time, so a build without a working connection to fonts.googleapis.com failed outright — the likely cause of CI's intermittent Build failures (the same commit passed and failed). Both fonts are now in `app/fonts` (from google/fonts, SIL OFL, licences included), variable weight 400–700, Latin + Latin Extended-A so Turkish renders in the font, via `next/font/local` (still self-hosted, preloaded, with fallback metrics). Inter 62 KB, JetBrains Mono 34 KB. Verified: builds with networking off; the previous version fails the same way.
- **CI runs again.** The workflow only triggered on `main` (the default branch is `master`) and its dashboard-e2e job read `secrets` in a job-level `if`, which GitHub rejects — so nothing ever ran. It now runs on master, main and `release/**`; the credentials check moved to a small job whose output gates the dashboard e2e; unit tests (`npm test`) joined the pipeline. Lint passes with 0 errors: the new React Compiler rules (`set-state-in-effect`, `static-components`, `refs`) and `no-explicit-any` report as warnings for now (125 left to burn down), and MetricsSection's `require('recharts')` became a normal import.
- **Brand assets match the logo again.** The favicon set (`app/icon.svg`, PNGs, `favicon.ico`, apple / maskable icons) was still the retired indigo mark, the Organization schema's logo was an even older cyan "arrow" SVG, and `og-image.png` showed a third, long-gone identity (diamond mark, cyan) with an unmeasured "Deployed in 12s" line. All now follow `components/logo.tsx`: a neutral-900 tile with a white P — the SVG favicon flips to light-on-dark in dark mode like the site logo. New `og-image.png` (monochrome, the site's own headline, no speed claims) is generated by `scripts/gen-og-image.mjs` with Inter + JetBrains Mono; `scripts/gen-favicons.mjs` also writes `logo-512.png`, now the schema logo. Favicon URLs carry `?v=2` so browsers drop the cached purple icon; manifest theme colour follows. Meta, Open Graph, Twitter and SoftwareApplication descriptions no longer claim "under 60 seconds" / "zero config".
- **Nginx settings: errors are shown, and Custom location blocks explain themselves.** Saving showed nothing when the server refused (the modal just stayed open); the reason is now a toast. The Custom location blocks help text says what they are — the server's own Nginx in front of the app, own servers only — and that a block without `proxy_pass` / `return` serves the server's files, not the app (EN/TR).
- **Clearing a field in a domain's Nginx settings now removes it.** The modal sent cleared or switched-off fields as `undefined`, which never reaches the server, so emptying Custom location blocks, the proxy port or the headers, or turning rate limiting / caching off, kept the old value. They are sent as `null` now (backend removes them).
- **DNS instructions named the wrong record for an apex domain.** For `example.com` the "Name" column said `example` (the first label) instead of `@`, so following it created `example.example.com` and the apex never resolved. Names are now computed from the registrable domain, including two-part suffixes like `.com.tr` and `.co.uk`. The panel also lists the www / apex twin's record ("add this one too so www.example.com works — it redirects to example.com"), is translated (EN/TR), and can be opened on verified domains too.
- **Re-check SSL on a verified domain.** Verified domains get a button that re-runs Nginx + SSL — for a www record added later or a certificate that failed — instead of needing a redeploy.
- **Switching GitHub accounts actually switches.** GitHub now shows its account picker when connecting (backend), "Change account" no longer disconnects first (cancelling the picker keeps the current connection), and New Project opens on the list you chose last — right after connecting an account, that account's repositories instead of the App's.
- **Connecting GitHub without the App is possible again.** Once a GitHub App was configured, New Project only offered "Install GitHub App" and hid "Connect to GitHub" when no account was connected; the OAuth connection is back as the secondary option (and from the App picker). A connection that can only see public repositories now offers **Reconnect** first and no longer hides the repository list.
- **GitHub sends you back where you started.** After the OAuth screen or the App installation the dashboard always went to New Project; it now returns to the page that started it (e.g. a project's Settings tab). Only dashboard paths are accepted.
- **First visit ignored the browser language.** The locale store checked for a saved preference *after* creating the store, but zustand's persist writes the default (`en`) to localStorage the moment it hydrates — so the check always found a value and browser detection never ran; every new visitor got English regardless of their OS language. The check now happens before the store is created. A Turkish browser opens in Turkish; anything else still gets English. (Theme was already right: it follows the OS until you toggle it.)
- **/pricing came up dark for Turkish visitors.** Two things stacked: `toLocaleString()` without a locale printed `3,000` on the server and `3.000` in a tr-TR browser, so React reported a hydration text mismatch and regenerated the page on the client — and when it does that it rewrites `<html class>` from its own props, which never included the `light`/`dark` class the boot script had added, so the page fell back to the dark defaults. Fixed at both ends: pricing numbers are pinned to `en-US`; the first client render is forced to the default dictionary so it always matches the server HTML (the real locale shows after hydration, via the new `AfterHydration` component, which also re-applies the theme class as a guard against any future mismatch). Reproduced and re-verified with a fresh Turkish light-mode browser on /pricing, / and /login.

## [0.2.0-beta.66] - 2026-08-21

### Added
- **Data Browser for PostgreSQL/MySQL databases** (`/dashboard/databases/[id]/studio`, linked from the database detail header while the database is running). A table list with search, row estimates and size; a data grid with column sorting, paging and per-column filters (equals, contains, starts/ends with, comparisons, is null); add / edit / delete rows through a type-aware editor that respects nullability, defaults and binary columns; and a **SQL console** that is read-only by default, with write mode behind an explicit confirmation. Views and primary-key-less tables are clearly marked read-only. EN/TR i18n.
- **Install the Pushify GitHub App** from the new-project screen when the platform has one configured — offered above the OAuth connect, with the plain reason next to it. GitHub sends the browser to `/auth/github/app-setup`, which links the installation to the organisation and hands the person back to what they were doing.
- **Per-member data-browser permissions.** The team page gains a data-access selector for members and viewers — no access (the default), read, or edit — beside the existing project-access chip. A read-only user gets the same browser without the actions that would fail: no new table, no add/edit/delete row, no CSV import, no row selection.
- **Cancel a running query** from the Performance tab's running-queries list.
- **MongoDB and Redis get their own browsers.** Mongo: collection list with document counts, a paged document view with JSON filter and sort inputs, a JSON editor for adding and editing documents, multi-select delete, create/drop collection. Redis: pattern search over a cursor-paged SCAN, type badges and TTL per key, a type-aware value view (string editor, list items, hash/zset field tables), TTL editing and bulk delete. The Data Browser link now appears for all four engines.
- **Index management and a Performance tab.** The structure panel lists a table's indexes with their columns, uniqueness and size, and creates or drops them (click columns in order to compose a composite index). The new Performance tab shows the slowest statements and what is running right now, and a slow query opens straight into the SQL console.
- **CSV import.** Pick a file, confirm the header and delimiter (auto-detected), map each CSV column to a table column, preview the first rows, then import in batches with a progress bar. Empty cells become NULL by default. The CSV reader is RFC 4180 (quotes, embedded commas and newlines, CRLF, BOM) and ships with the frontend's first unit test suite — `npm test`, 11 tests.
- **A professional SQL console.** CodeMirror 6 editor with SQL syntax highlighting, line numbers, bracket matching and **autocomplete fed by the live schema** (tables, qualified names, columns) — the editor is lazy-loaded and themed from the dashboard's own CSS variables, so it follows light/dark. Around it: a schema explorer that inserts names at the cursor, ⌘↵ to run, **run just the selected text**, an EXPLAIN button, one-click SQL formatting, tabbed Result / Messages / History panes, query history kept per database (timing, row count, click to reload), a full-value cell viewer with JSON pretty-printing, and CSV/JSON export of the complete result — not just the page on screen. The same cell viewer now opens from the data grid.
- **Data Browser feels interactive now.** Row counts above 10k are shown as estimates (`~1.2M rows (estimated)`) instead of blocking the page on a scan, paging stays enabled while pages come back full, and a revisited table is served from cache for 10s rather than re-crossing the network.
- **Schema editing in the Data Browser.** "New table" opens a column builder (name, type from the engine's own type list, length/scale, nullable, unique, primary key, auto-increment, default) and a **Structure** panel per table adds or drops columns, renames the table, and holds a danger zone for emptying or deleting it — each destructive step behind its own confirmation.

## [0.2.0-beta.64] - 2026-07-19

### Changed
- **Notification preferences moved from localStorage to the account** (pairs with backend beta.59). The Notifications tab now reads and saves through the API with optimistic toggles — settings finally follow you across browsers and devices, and the backend actually honors them (security alerts gate the new-sign-in email; Weekly Digest opts you into the new Monday summary). New **"Getting-started emails"** toggle controls the onboarding sequence from the same screen (same switch as the email unsubscribe link). EN/TR i18n.

## [0.2.0-beta.63] - 2026-07-19

### Changed
- **Real company identity across the site.** The global Organization schema now carries `legalName: Pushify LLC` and the registered US address (30 N Gould St Ste N, Sheridan, WY) as structured data on every page. The About page's company card shows the legal entity and address, and the footer copyright reads Pushify LLC. Closes the audit's gap of no legal entity anywhere on the site.

## [0.2.0-beta.62] - 2026-07-19

### Fixed
- **Modals now render through the global portal.** The cancellation dialog and the two domain dialogs (purchase, transfer-in) drew their own overlay inside the page tree, so an ancestor with a transform trapped the backdrop to one card instead of the whole screen. All three now use the shared portal-based `Modal` (renders to `document.body`, full-page blurred backdrop, ESC to close, scroll lock).

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
