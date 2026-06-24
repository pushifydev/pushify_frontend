# Changelog

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
