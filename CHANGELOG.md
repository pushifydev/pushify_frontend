# Changelog

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
